import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import AuthPage from './pages/AuthPage';
import GeneratorPage from './pages/GeneratorPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PublicGalleryPage from './pages/PublicGalleryPage';
import SupportPage from './pages/SupportPage';
import FavoritesPage from './pages/FavoritesPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <AuthPage />,
      },
      {
        path: 'gallery',
        element: <PublicGalleryPage />,
      },
      {
        path: 'support',
        element: <SupportPage />,
      },
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'generate',
            element: <GeneratorPage />,
          },
          {
            path: 'favorites',
            element: <FavoritesPage />,
          },
        ],
      },
      // Admin Routes
      {
        element: <ProtectedRoute adminOnly />,
        children: [
          {
            path: 'admin-dashboard',
            element: <AdminDashboardPage />,
          },
        ],
      },
    ],
  },
]);
