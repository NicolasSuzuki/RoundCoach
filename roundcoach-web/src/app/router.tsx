import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/app-layout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from '../components/layout/route-guards';
import { AnalysisViewPage } from '../pages/analysis-view/analysis-view-page';
import { DashboardPage } from '../pages/dashboard/dashboard-page';
import { LoginPage } from '../pages/login/login-page';
import { MatchDetailPage } from '../pages/match-detail/match-detail-page';
import { MatchesPage } from '../pages/matches/matches-page';
import { ProfilePage } from '../pages/profile/profile-page';
import { RegisterPage } from '../pages/register/register-page';
import { VodUploadPage } from '../pages/vod-upload/vod-upload-page';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/matches', element: <MatchesPage /> },
          { path: '/matches/:matchId', element: <MatchDetailPage /> },
          { path: '/matches/:matchId/vod', element: <VodUploadPage /> },
          {
            path: '/matches/:matchId/analysis',
            element: <AnalysisViewPage />,
          },
        ],
      },
    ],
  },
]);
