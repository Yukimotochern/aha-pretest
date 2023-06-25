import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { startSession } from '../redux/auth.slice';
import { AppLoading } from '../components/AppLoading';
import { ResendVerificationPage } from '../pages/ResendVerificationPage';

export const PrivateLayout = () => {
  const dispatch = useAppDispatch();
  const hasSession = useAppSelector((state) => !!state.auth.session);
  const isVerified = useAppSelector((state) => state.auth.verified);

  /* start session if not existed */
  useEffect(() => {
    if (!hasSession) {
      dispatch(startSession());
    }
  }, [dispatch, hasSession]);

  return hasSession ? (
    isVerified ? (
      <div className="m-auto mt-12 max-w-5xl">
        <Outlet />
      </div>
    ) : (
      <ResendVerificationPage />
    )
  ) : (
    <AppLoading />
  );
};
