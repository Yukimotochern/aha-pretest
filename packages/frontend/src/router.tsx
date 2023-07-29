import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/Landing';
import { DashboardPage } from './pages/Dashboard';
import { PrivateLayout } from './layouts/PrivateLayout';
import { AppLoading } from './components/AppLoading';
import { store } from './redux/store';
import { appLogin, verifyEmail } from './redux/auth.slice';
import { WithDidMountAction } from './components/WithDidMountAction';

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
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
  {
    path: '/auth-callback',
    element: (
      <WithDidMountAction action={() => store.dispatch(appLogin())}>
        <AppLoading />
      </WithDidMountAction>
    ),
    errorElement: <div>error</div>,
  },
  {
    path: '/verify-email',
    element: (
      <WithDidMountAction action={() => store.dispatch(verifyEmail())}>
        <AppLoading />
      </WithDidMountAction>
    ),
    errorElement: <div>error</div>,
  },
]);
