import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setUser, startSession } from '../redux/app.slice';
import { AppLoading } from '../components/AppLoading/AppLoading';

export const PrivateLayout = () => {
  const dispatch = useAppDispatch();
  const isAppLoading = useAppSelector((state) => state.app.loading);
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    getAccessTokenSilently,
  } = useAuth0();
  /* start session after authenticated */
  useEffect(() => {
    // TODO should not rerun is already have session
    (async () => {
      if (!isAuthLoading && isAuthenticated && !!user && !!user.sub) {
        const token = await getAccessTokenSilently();
        const isRedirect = _.get(state, 'isRedirect', false);
        dispatch(setUser(user));
        dispatch(
          startSession({
            token,
            isRedirect,
            sub: user.sub,
          })
        );
      }
    })();
  }, [
    user,
    // TODO: make sure whether the below `state` constantly changes and cause keep asking for new sessionId
    state,
    dispatch,
    navigate,
    isAuthLoading,
    isAuthenticated,
    getAccessTokenSilently,
  ]);

  return isAuthLoading ? (
    <AppLoading />
  ) : isAuthenticated && !!user && !!user.sub ? (
    isAppLoading ? (
      <AppLoading />
    ) : (
      <Outlet />
    )
  ) : (
    // TODO: user || user.sub empty => /landing with error
    <Navigate to="/landing" />
  );
};
