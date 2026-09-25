import axios from "axios";
import { toApiError } from "../../../core/api/apiError";
import type { Movie, MovieDetailResponse, MovieHomeResponse, MovieSessionResponse } from "../types/Movie";


const catalogClient = axios.create({
  baseURL: import.meta.env.VITE_CATALOG_API_URL || "https://1cm4tcxy7a.execute-api.us-east-1.amazonaws.com",
  headers: {
    Accept: "application/json",
  },
});

async function fetchMovies(page = 0, size = 50): Promise<Movie[]> {
  try {
    const response = await catalogClient.get<unknown>(`/api/catalog/movies?page=${page}&size=${size}`);
    const body = response.data as Record<string, unknown> | Movie[];
    const movies = Array.isArray(body) ? body : body.data ?? body.content ?? body.movies ?? body.items;
    if (!Array.isArray(movies)) throw new Error("La respuesta del catálogo no contiene una lista de películas.");
    return movies.map(toMovie);
  } catch (error) { throw toApiError(error, "Catalog Service"); }
}

function toMovie(value: unknown): Movie {
  const movie = value as Record<string, unknown>;
  const id = movie.id ?? movie.publicId ?? movie.movieId;
  if ((typeof id !== "string" && typeof id !== "number") || !String(id)) throw new Error("El catálogo devolvió una película sin identificador.");
  return {
    id: String(id), title: typeof movie.title === "string" ? movie.title : typeof movie.name === "string" ? movie.name : "",
    description: typeof movie.description === "string" ? movie.description : typeof movie.synopsis === "string" ? movie.synopsis : null,
    posterUrl: typeof movie.posterUrl === "string" ? movie.posterUrl : typeof movie.poster === "string" ? movie.poster : null,
    backdropUrl: typeof movie.backdropUrl === "string" ? movie.backdropUrl : typeof movie.backdrop === "string" ? movie.backdrop : null,
    genres: Array.isArray(movie.genres) ? movie.genres.filter((genre): genre is string => typeof genre === "string") : [],
    rating: typeof movie.rating === "number" ? movie.rating : typeof movie.voteAverage === "number" ? movie.voteAverage : 0,
    durationMinutes: typeof movie.durationMinutes === "number" ? movie.durationMinutes : typeof movie.duration === "number" ? movie.duration : 0,
  };
}

function unwrapResponse<T>(value: T | { data?: T; result?: T }): T {
  const response = value as { data?: T; result?: T };
  return response.data ?? response.result ?? value as T;
}

export const catalogApi = {
  async getHome(): Promise<MovieHomeResponse> {
    const movies = await fetchMovies(0, 100);
    return {
      featuredMovie: movies[0] ?? null,
      sections: [
        { name: "Películas destacadas", movies: movies.slice(0, 8) },
        { name: "Mejor valoradas", movies: [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8) },
      ],
    };
  },

  async getMovies(page = 0, size = 20): Promise<Movie[]> {
    return fetchMovies(page, size);
  },

  async searchMovies(q: string, genre: string, page = 0, size = 20): Promise<{ content: Movie[]; totalPages: number; totalElements: number }> {
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (q.trim()) params.set("q", q.trim());
      if (genre.trim()) params.set("genre", genre.trim());
      const response = await catalogClient.get<unknown>(`/api/catalog/search?${params}`);
      const body = response.data as Record<string, unknown>;
      const raw = Array.isArray(body.content) ? body.content : Array.isArray(body) ? body as unknown[] : [];
      return {
        content: raw.map(toMovie),
        totalPages: typeof body.totalPages === "number" ? body.totalPages : 1,
        totalElements: typeof body.totalElements === "number" ? body.totalElements : raw.length,
      };
    } catch (error) { throw toApiError(error, "Catalog Service"); }
  },


  async getMovie(publicId: string): Promise<MovieDetailResponse> {
    try {
      const response = await catalogClient.get<MovieDetailResponse>(`/api/catalog/movies/${encodeURIComponent(publicId)}`);
      return unwrapResponse(response.data);
    } catch (error) { throw toApiError(error, "Catalog Service"); }
  },

  async getMovieSession(publicId: string): Promise<MovieSessionResponse> {
    try {
      const response = await catalogClient.get<MovieSessionResponse>(`/api/catalog/movies/${encodeURIComponent(publicId)}/session-info`);
      return unwrapResponse(response.data);
    } catch (error) { throw toApiError(error, "Catalog Service"); }
  },

};
