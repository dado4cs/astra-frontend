import { Link } from "react-router-dom";
import type { Movie } from "../../modules/catalog/types/Movie";
import { MovieCard } from "./MovieCard";

type MovieCarouselProps = { title: string; eyebrow?: string; movies: Movie[]; linkTo?: string };

export function MovieCarousel({ title, eyebrow, movies, linkTo = "/explore" }: MovieCarouselProps) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>{eyebrow ? <p>{eyebrow}</p> : null}<h2>{title}</h2></div>
        <Link to={linkTo} className="see-all">Ver todo →</Link>
      </div>
      <div className="movie-carousel">
        {movies.map((movie, index) => <MovieCard key={movie.id} movie={movie} rank={index + 1} />)}
      </div>
    </section>
  );
}

