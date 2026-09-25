import { createBrowserRouter } from "react-router-dom";

import { ClubsPage } from "../modules/community/pages/ClubsPage";
import { ClubDetailPage } from "../modules/community/pages/ClubDetailPage";
import { ExplorePage } from "../modules/catalog/pages/ExplorePage";
import { HomePage } from "../modules/catalog/pages/HomePage";
import { MovieDetailPage } from "../modules/catalog/pages/MovieDetailPage";
import { CinemaRoomPage } from "../modules/cinema-room/pages/CinemaRoomPage";
import { OrbitPage } from "../modules/community/pages/OrbitPage";
import { ProfilePage } from "../modules/interaction/pages/ProfilePage";
import { MainLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "../modules/auth/components/ProtectedRoute";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { RegisterPage } from "../modules/auth/pages/RegisterPage";
import AdminDashboard from "../modules/analytics/pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/explore", element: <ExplorePage /> },
      { path: "/movie/:id", element: <MovieDetailPage /> },
      { element: <ProtectedRoute />, children: [
        { path: "/profile", element: <ProfilePage /> },
        { path: "/clubs", element: <ClubsPage /> },
        { path: "/clubs/:id", element: <ClubDetailPage /> },
        { path: "/orbit/:code", element: <OrbitPage /> },
      ] },
      { element: <ProtectedRoute requiredRole="ADMIN" />, children: [
        { path: "/analytics", element: <AdminDashboard /> },
      ] },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { element: <ProtectedRoute />, children: [{ path: "/cinema/:id", element: <CinemaRoomPage /> }] },
]);
