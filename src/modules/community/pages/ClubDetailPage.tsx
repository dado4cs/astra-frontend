import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { CatalogState } from "../../catalog/components/CatalogState";
import { useClub, useClubMembers, useJoinClub, useLeaveClub } from "../hooks/useClubs";
import { useCreateWatchRoom } from "../hooks/useWatchRooms";

const cardStyle: React.CSSProperties = {
  background: "rgba(20, 20, 30, 0.6)",
  backdropFilter: "blur(12px)",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: "1.5rem",
  marginBottom: "1.5rem",
};

const memberCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.06)",
};

const avatarStyle = (color: string): React.CSSProperties => ({
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "0.85rem",
  color: "#fff",
  flexShrink: 0,
});

const roleColors: Record<string, string> = {
  OWNER: "#f59e0b",
  ADMIN: "#3b82f6",
  MEMBER: "#6b7280",
};

const roleBadgeStyle = (role: string): React.CSSProperties => ({
  fontSize: "0.7rem",
  fontWeight: "bold",
  padding: "0.15rem 0.5rem",
  borderRadius: "10px",
  background: `${roleColors[role] || "#6b7280"}22`,
  color: roleColors[role] || "#6b7280",
  border: `1px solid ${roleColors[role] || "#6b7280"}44`,
  textTransform: "uppercase" as const,
});

import { useUser } from "../hooks/useClubs";

function MemberCard({ member, clubId, canRemove, onRemove }: { member: any, clubId: number, canRemove: boolean, onRemove: (id: number) => void }) {
  const { data: user } = useUser(member.user_id);
  const colors = ["#6558e8", "#e85858", "#58c4e8", "#e8a858", "#58e87a", "#e858c4"];
  const color = colors[member.user_id % colors.length];
  
  const displayName = user?.display_name || user?.username || `Usuario #${member.user_id}`;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={memberCardStyle}>
      <div style={avatarStyle(color)}>{initial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: "bold", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </span>
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: 0 }}>
          Desde {new Date(member.joined_at).toLocaleDateString("es")}
        </p>
      </div>
      {canRemove && (
        <button 
          onClick={() => onRemove(member.user_id)}
          style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "4px", padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}
        >
          Eliminar
        </button>
      )}
    </div>
  );
}

export function ClubDetailPage() {
  const { id } = useParams();
  const clubId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const { user } = useAuth();


  const { data: club, isLoading: clubLoading, isError: clubError } = useClub(clubId);
  const { data: members = [], isLoading: membersLoading } = useClubMembers(clubId);
  const joinClub = useJoinClub();
  const leaveClub = useLeaveClub();
  const createWatchRoom = useCreateWatchRoom();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if current user is a member
  const currentUserId = user ? Number(user.id) : null;
  const currentMembership = members.find((m) => m.user_id === currentUserId);
  const isMember = Boolean(currentMembership);
  const isOwner = currentMembership?.role === "OWNER";

  if (clubLoading) return <main className="page-shell"><CatalogState status="loading" /></main>;
  if (clubError || !club) return <main className="page-shell"><CatalogState status="error" /></main>;

  const handleJoin = async () => {
    setError(null);
    setSuccess(null);
    try {
      await joinClub.mutateAsync(club.id);
      setSuccess("¡Te has unido al club!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo unir al club.");
    }
  };

  const handleLeave = async () => {
    if (!currentUserId) return;
    if (!window.confirm("¿Estás seguro de que quieres salir del club?")) return;
    setError(null);
    setSuccess(null);
    try {
      await leaveClub.mutateAsync({ clubId: club.id, userId: currentUserId });
      setSuccess("Has salido del club.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo salir del club.");
    }
  };

  const handleCreateOrbit = async () => {
    const movieId = window.prompt("Ingresa el ID (UUID) de la película para crear una órbita:");
    if (!movieId?.trim()) return;
    setError(null);
    try {
      const room = await createWatchRoom.mutateAsync({ movieId: movieId.trim(), clubId: club.id });
      navigate(`/orbit/${room.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la órbita.");
    }
  };

  const handleRemoveMember = async (userIdToRemove: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar a este miembro del club?")) return;
    setError(null);
    setSuccess(null);
    try {
      await leaveClub.mutateAsync({ clubId: club.id, userId: userIdToRemove });
      setSuccess("Miembro eliminado del club.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar al miembro.");
    }
  };

  return (
    <main className="page-shell">
      <Link to="/clubs" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1rem", display: "inline-block" }}>
        ← Volver a clubes
      </Link>

      {/* ── Club header ── */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ color: "#00e5ff", fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>CLUB</p>
            <h1 style={{ margin: 0 }}>{club.name}</h1>
            <p style={{ color: "#9ca3af", marginTop: "0.5rem" }}>{club.description || "Sin descripción"}</p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", fontSize: "0.85rem", color: "#6b7280" }}>
              <span>👥 {members.length} miembro{members.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span style={{ ...roleBadgeStyle(club.visibility === "PUBLIC" ? "MEMBER" : "ADMIN") }}>
                {club.visibility === "PUBLIC" ? "🌐 Público" : "🔒 Privado"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {isMember ? (
              <>
                <button className="button button-primary" onClick={handleCreateOrbit} disabled={createWatchRoom.isPending}>
                  🚀 {createWatchRoom.isPending ? "Creando…" : "Crear Órbita"}
                </button>
                {!isOwner && (
                  <button className="button button-secondary" onClick={handleLeave} disabled={leaveClub.isPending} style={{ color: "#ef4444" }}>
                    {leaveClub.isPending ? "Saliendo…" : "Salir del club"}
                  </button>
                )}
              </>
            ) : (
              <button className="button button-primary" onClick={handleJoin} disabled={joinClub.isPending}>
                ✦ {joinClub.isPending ? "Uniéndose…" : "Unirse al club"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</p>}
      {success && <p style={{ color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>{success}</p>}

      {/* ── Members ── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Miembros</h2>
        {membersLoading ? (
          <p style={{ color: "#6b7280" }}>Cargando miembros…</p>
        ) : members.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Este club aún no tiene miembros.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.75rem" }}>
            {members.map((member) => {
              const canRemove = (isOwner || currentMembership?.role === "ADMIN") && member.user_id !== currentUserId;
              return (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  clubId={club.id} 
                  canRemove={canRemove} 
                  onRemove={handleRemoveMember} 
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
