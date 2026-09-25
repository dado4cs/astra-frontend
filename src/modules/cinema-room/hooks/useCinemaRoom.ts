import { useState, useEffect, useRef } from "react";
import { getAccessToken } from "../../auth/services/authApi";
import { communityApi } from "../../community/services/communityApi";
import type { Participant } from "../../community/types/WatchRoom";

export type ChatMessage = { id: number; author: string; text: string; userId?: string };

const HTTP_URL = import.meta.env.VITE_CINEMA_API_URL || "http://localhost:8001";

export function useCinemaRoom(sessionId?: string, movieId?: string, participants: Participant[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true);
  const botMessageAdded = useRef(false);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!participants || participants.length === 0) return;
    
    Promise.all(
      participants.map(p => 
        communityApi.getUser(p.userId)
          .then(user => ({ id: user.identity_user_id, name: p.nickname }))
          .catch(() => null)
      )
    ).then(results => {
      setUsersMap(prev => {
        const map = { ...prev };
        results.forEach(res => {
          if (res && res.id) {
            map[res.id] = res.name;
          }
        });
        return map;
      });
    });
  }, [participants]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!sessionId || !movieId) return;
    
    // 1. Mensaje del Bot con Stats (Consumo de microservicios por HTTP)
    if (!botMessageAdded.current) {
      botMessageAdded.current = true;
      fetch(`${HTTP_URL}/api/v1/sessions/${sessionId}/stats?movie_id=${movieId}`)
        .then(res => res.json())
        .then(data => {
          if (data.likes !== undefined) {
            const avg = data.average_score || "N/A";
            setMessages(current => {
              // Evitar duplicados
              if (current.find(m => String(m.author).includes("Bot"))) return current;
              return [
                ...current,
                { id: -1, author: "🤖 Bot", text: `📊 (HTTP) Datos de la comunidad: Esta película tiene ${data.likes} likes y un rating de ${avg}/5.` }
              ];
            });
          }
        })
        .catch(console.error);
    }
      
    const token = getAccessToken();
    if (!token) return;

    // 2. Short Polling: En lugar de WebSocket, hacemos un GET cada 1.5s
    const pollInterval = setInterval(() => {
      fetch(`${HTTP_URL}/api/v1/sessions/${sessionId}/state`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error fetching state");
        return res.json();
      })
      .then(data => {
        // Sincronizar Video
        if (data.is_playing !== undefined && data.is_playing !== isPlayingRef.current) {
          setIsPlaying(data.is_playing);
        }
        
        // Sincronizar Chat
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(current => {
            // Unir mensajes del bot con los mensajes del servidor, evitando duplicados por ID
            const newMessages = [...current];
            let changed = false;
            
            data.messages.forEach((m: any) => {
              const msgId = Number(m.id) || new Date(m.sent_at).getTime();
              if (!newMessages.find(existing => existing.id === msgId)) {
                changed = true;
                
                let myUuid = "";
                try {
                  const t = getAccessToken();
                  if (t) myUuid = JSON.parse(atob(t.split('.')[1])).sub;
                } catch(e) {}
                
                let authorName = `Agente ${String(m.user_id).substring(0,4).toUpperCase()}`;
                if (String(m.user_id).includes("Bot")) authorName = m.user_id;
                else if (String(m.user_id) === myUuid) authorName = "Tú";
                // Defer dynamic mapping to render time
                
                newMessages.push({
                  id: msgId,
                  author: authorName,
                  text: m.message,
                  userId: String(m.user_id)
                });
              }
            });
            
            if (changed) {
              return newMessages.sort((a, b) => a.id - b.id);
            }
            return current;
          });
        }
      })
      .catch(err => console.debug("Polling error:", err));
    }, 1500);

    return () => {
      clearInterval(pollInterval);
    };
  }, [sessionId, movieId]);

  const sendMessage = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || !sessionId) return;
    
    const token = getAccessToken();
    
    // Se eliminó la inserción optimista para evitar duplicados
    
    fetch(`${HTTP_URL}/api/v1/sessions/${sessionId}/chat`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: cleanText })
    }).catch(err => {
      console.error("Error al enviar mensaje:", err);
      // Podríamos mostrar un error aquí
    });
  };

  const syncPlayback = (nextState: boolean) => {
    if (!sessionId) return;
    const token = getAccessToken();
    
    fetch(`${HTTP_URL}/api/v1/sessions/${sessionId}/playback`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ is_playing: nextState, position_seconds: 0 })
    }).catch(console.error);
  };

  const togglePlayback = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    syncPlayback(nextState);
  };

  const handleSetIsPlaying = (value: boolean | ((val: boolean) => boolean)) => {
    const nextState = typeof value === "function" ? value(isPlaying) : value;
    setIsPlaying(nextState);
    syncPlayback(nextState);
  };

  const mappedMessages = messages.map(m => {
    // Si ya está como "Tú" o "🤖 Bot", no lo sobreescribimos
    if (m.author === "Tú" || String(m.author).includes("Bot")) return m;
    
    // Si tenemos su nombre en el mapa, lo actualizamos dinámicamente
    if (m.userId && usersMap[m.userId]) {
      return { ...m, author: usersMap[m.userId] };
    }
    return m;
  });

  return { 
    messages: mappedMessages, 
    sendMessage, 
    isPlaying, 
    setIsPlaying: handleSetIsPlaying, 
    togglePlayback 
  };
}
