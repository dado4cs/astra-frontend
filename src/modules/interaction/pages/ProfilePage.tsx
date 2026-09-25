import { useAuth } from "../../auth/hooks/useAuth";
import { useUserLikes, useUserWatchlist } from "../hooks/useInteraction";
import { Link } from "react-router-dom";

export function ProfilePage() {
  const { user } = useAuth();
  
  // Cast user.id to number as expected by the backend
  const userId = user?.id ? Number(user.id) : undefined;
  
  const { data: likes, isLoading: loadingLikes } = useUserLikes(userId);
  const { data: watchlist, isLoading: loadingWatchlist } = useUserWatchlist(userId);

  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <main className="page-shell" style={{ padding: "3rem 2rem", maxWidth: "1200px", margin: "0 auto", color: "white" }}>
      <header style={{ marginBottom: "3rem" }}>
        <p className="page-eyebrow" style={{ color: "#a8b2d1", fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>TU ESPACIO</p>
        <h1 style={{ marginTop: "0.5rem", fontSize: "3rem", fontWeight: "bold", background: "linear-gradient(90deg, #fff, #a8b2d1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mi perfil</h1>
      </header>
      
      <section style={{ 
        display: "flex", alignItems: "center", gap: "2rem", 
        background: "rgba(255, 255, 255, 0.05)", 
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        padding: "2.5rem", 
        borderRadius: "16px", 
        marginBottom: "3rem",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
      }}>
        <div style={{ 
          background: "linear-gradient(135deg, #00c6ff, #0072ff)", 
          color: "white", width: "100px", height: "100px", 
          borderRadius: "50%", display: "flex", alignItems: "center", 
          justifyContent: "center", fontSize: "2.5rem", fontWeight: "bold",
          boxShadow: "0 0 20px rgba(0, 198, 255, 0.4)"
        }}>
          {initials}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "600" }}>{user?.name || "Astra Explorer"}</h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#a8b2d1", fontSize: "1.1rem" }}>{user?.email}</p>
        </div>
      </section>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        
        {/* Watchlist Section */}
        <section style={{ flex: "1 1 400px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Mi Watchlist (Por Ver)
          </h2>
          {loadingWatchlist && <p style={{ color: "#a8b2d1" }}>Cargando constelaciones...</p>}
          {!loadingWatchlist && (!watchlist || watchlist.length === 0) ? (
            <div style={{ padding: "3rem", textAlign: "center", background: "rgba(255, 255, 255, 0.03)", border: "1px dashed rgba(255, 255, 255, 0.2)", borderRadius: "12px", color: "#8892b0" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: "1rem", opacity: 0.5 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path>
              </svg>
              <p style={{ fontSize: "1.1rem" }}>Tu próximo mundo está esperando ser descubierto.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1.5rem" }}>
              {watchlist?.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} style={{ textDecoration: "none" }}>
                  <div style={{ 
                    borderRadius: "12px", overflow: "hidden", 
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <img src={movie.poster_url} alt={movie.title} style={{ width: "100%", height: "210px", objectFit: "cover" }} />
                    <p style={{ padding: "0.75rem", margin: 0, fontSize: "0.95rem", color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "500" }}>{movie.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Likes Section */}
        <section style={{ flex: "1 1 400px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            Películas que me gustaron
          </h2>
          {loadingLikes && <p style={{ color: "#a8b2d1" }}>Cargando tus likes...</p>}
          {!loadingLikes && (!likes || likes.length === 0) ? (
            <div style={{ padding: "3rem", textAlign: "center", background: "rgba(255, 255, 255, 0.03)", border: "1px dashed rgba(255, 255, 255, 0.2)", borderRadius: "12px", color: "#8892b0" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: "1rem", opacity: 0.5 }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <p style={{ fontSize: "1.1rem" }}>Aún no has marcado ninguna película como favorita.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1.5rem" }}>
              {likes?.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} style={{ textDecoration: "none" }}>
                  <div style={{ 
                    borderRadius: "12px", overflow: "hidden", 
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <img src={movie.poster_url} alt={movie.title} style={{ width: "100%", height: "210px", objectFit: "cover" }} />
                    <p style={{ padding: "0.75rem", margin: 0, fontSize: "0.95rem", color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "500" }}>{movie.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
