import { type RouteObject, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UploadPage } from './pages/UploadPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { VideoDetailPage } from './pages/VideoDetailPage';
import NotFound from './pages/NotFound';
import { MainLayout } from './components/layouts/MainLayout';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <MainLayout>
        <HomePage />
      </MainLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <MainLayout>
        <LoginPage />
      </MainLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <MainLayout>
        <RegisterPage />
      </MainLayout>
    ),
  },
  {
    path: '/upload',
    element: (
      <MainLayout>
        <UploadPage />
      </MainLayout>
    ),
  },
  {
    path: '/profile/:username',
    element: (
      <MainLayout>
        <ProfilePage />
      </MainLayout>
    ),
  },
  {
    path: '/search',
    element: (
      <MainLayout>
        <SearchPage />
      </MainLayout>
    ),
  },
  {
    path: '/video/:videoId',
    element: (
      <MainLayout>
        <VideoDetailPage />
      </MainLayout>
    ),
  },
  {
    path: '/trending',
    element: (
      <MainLayout>
        <SearchPage />
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
