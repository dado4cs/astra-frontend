import { useState } from "react";
import { Link } from "react-router-dom";
import { useClubs, useCreateClub, useJoinClub } from "../hooks/useClubs";

export function ClubsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: paginatedData, isLoading, isError } = useClubs(page, searchQuery);
  const createClub = useCreateClub();
  const joinClub = useJoinClub();
  const [error, setError] = useState<string | null>(null);

  const clubs = paginatedData?.items || [];
  const totalPages = paginatedData?.pages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleCreateClub = async () => {
    const name = window.prompt("Nombre del club");
    if (!name?.trim()) return;
    const description = window.prompt("Descripción del club") ?? "";
    setError(null);
    try {
      await createClub.mutateAsync({ name: name.trim(), description: description.trim(), visibility: "PUBLIC" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo crear el club.");
    }
  };

  const handleJoinClub = async (clubId: number) => {
    setError(null);
    try {
      await joinClub.mutateAsync(clubId);
      window.alert("¡Te has unido al club exitosamente!");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo unir al club.");
    }
  };

  return (
    <main className="page-shell">
      <p className="page-eyebrow">COMUNIDAD</p>
      <h1>Clubes de cine</h1>
      <p className="page-lead">Conecta con comunidades que comparten tus historias favoritas.</p>
      
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center", flexWrap: "wrap" }}>
        <button className="button button-secondary" onClick={handleCreateClub} disabled={createClub.isPending}>
          ✦ {createClub.isPending ? "Creando club…" : "Crear club"}
        </button>
        
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flexGrow: 1, maxWidth: "400px" }}>
          <input 
            type="text" 
            placeholder="Buscar clubes..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flexGrow: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "white" }}
          />
          <button type="submit" className="button button-primary">Buscar</button>
        </form>
      </div>

      {error ? <p className="orbit-action-error" role="alert">{error}</p> : null}
      {isLoading ? <p className="page-lead">Cargando clubes…</p> : null}
      {isError ? <p className="orbit-action-error" role="alert">No se pudieron cargar los clubes.</p> : null}
      
      {!isLoading && !isError && clubs.length === 0 ? (
        <p className="page-lead">No se encontraron clubes.</p>
      ) : (
        <div className="simple-grid">
          {clubs.map((club) => (
            <article className="simple-card" key={club.id}>
              <span>{String(club.id).padStart(2, "0")}</span>
              <h2><Link to={`/clubs/${club.id}`} style={{ color: "inherit", textDecoration: "none" }}>{club.name}</Link></h2>
              <p>{club.description || "Sin descripción"}</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link to={`/clubs/${club.id}`} className="button button-primary" style={{ textDecoration: "none" }}>Ver club</Link>
                <button className="button button-secondary" onClick={() => handleJoinClub(club.id)} disabled={joinClub.isPending}>
                  Unirse
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center", alignItems: "center" }}>
          <button 
            className="button button-secondary" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button 
            className="button button-secondary" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </main>
  );
}
