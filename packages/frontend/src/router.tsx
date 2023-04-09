import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrivateLayout } from './layouts/PrivateLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'landing',
        element: <LandingPage />,
      },
    ],
    errorElement: <div>error</div>,
  },
  {
    path: '/app',
    element: <PrivateLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
    ],
    errorElement: <div>error</div>,
  },
]);
