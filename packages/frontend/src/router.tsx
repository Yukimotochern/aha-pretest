import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
    errorElement: <div>error</div>,
  },
]);
