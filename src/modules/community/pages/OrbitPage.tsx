import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import { CatalogState } from "../../catalog/components/CatalogState";
import { useMovie, useMovieSession } from "../../catalog/hooks/useMovies";
import { CinemaControls } from "../../cinema-room/components/CinemaControls";
import { LiveChat } from "../../cinema-room/components/LiveChat";
import Participants from "../../cinema-room/components/Participants";
import { VideoPlayer } from "../../cinema-room/components/VideoPlayer";
import { useCinemaRoom } from "../../cinema-room/hooks/useCinemaRoom";
import { useUpdatePlayback, useWatchRoom } from "../hooks/useWatchRooms";

export function OrbitPage() {
  const { code } = useParams();
  const { data: watchRoom, isLoading: isRoomLoading, isError: isRoomError } = useWatchRoom(code);
  const { data: movie, isLoading: isMovieLoading, isError: isMovieError } = useMovie(watchRoom?.movieId);
  const { data: session, isLoading: isSessionLoading, isError: isSessionError } = useMovieSession(watchRoom?.movieId);
  const room = useCinemaRoom(watchRoom?.sessionId || watchRoom?.id, movie?.id);
  const updatePlayback = useUpdatePlayback();
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayingChange = (isPlaying: boolean) => {
    room.setIsPlaying(isPlaying);
    if (watchRoom) {
      void updatePlayback.mutateAsync({ roomId: watchRoom.id, input: { state: isPlaying ? "PLAYING" : "PAUSED", positionSeconds: 0 } }).catch(() => undefined);
    }
  };

  const handleLeaveOrbit = () => {
    navigate("/");
  };

  if (isRoomLoading || isMovieLoading) return <main className="loading-page"><CatalogState status="loading" /></main>;
  if (isRoomError || isMovieError || !watchRoom || !movie) return <main className="loading-page"><CatalogState status="error" /></main>;

  return <main className="cinema-page"><div className="cinema-topbar"><Link to={`/movie/${movie.id}`}>← Volver a la película</Link><p><i /> Órbita conectada · {watchRoom.status}</p><button onClick={handleCopyLink}>{copied ? "¡Enlace copiado!" : "Invitar tripulación"}</button></div><div className="cinema-layout"><div className="cinema-stage"><VideoPlayer movie={movie} streamUrl={session?.stream?.url} streamType={session?.stream?.type} isPlaying={room.isPlaying} onPlayingChange={handlePlayingChange} sessionLoading={isSessionLoading} sessionError={isSessionError}/><CinemaControls isPlaying={room.isPlaying} onTogglePlayback={room.togglePlayback} onReaction={room.sendMessage} onLeave={handleLeaveOrbit}/></div><aside className="social-panel"><Participants participants={watchRoom.participants} /><LiveChat messages={room.messages} onSend={room.sendMessage}/></aside></div></main>;
}
