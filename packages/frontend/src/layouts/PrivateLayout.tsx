import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setUser, startSession } from '../redux/auth.slice';
import { AppLoading } from '../components/AppLoading';

export const PrivateLayout = () => {
  const dispatch = useAppDispatch();
  const isAppLoading = useAppSelector((state) => !!state.auth.sessionId);
  const navigate = useNavigate();
  const { state } = useLocation();
  /* start session after authenticated */
  useEffect(() => {
    dispatch(startSession());
  }, [dispatch]);

  return isAppLoading ? <AppLoading /> : <Outlet />;
};
