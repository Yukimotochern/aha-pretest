import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  return (
    <>
      <Button
        onClick={() => {
          loginWithRedirect({
            appState: {
              redirect: true,
            },
          });
        }}
      >
        Log in
      </Button>
      <Button
        onClick={() => {
          loginWithRedirect({
            authorizationParams: {
              screen_hint: 'signup',
            },
            appState: {
              redirect: true,
            },
          });
        }}
      >
        Sign up
      </Button>
      <Button
        onClick={() => {
          getAccessTokenSilently().then((data) => {
            console.log(`token: ${data}`);
          });
        }}
      >
        getAccessTokenSilently
      </Button>

      <Button onClick={() => logout()}>Log out</Button>
      <Button onClick={() => navigate('/app/dashboard')}>
        Go to /app/dashboard
      </Button>
    </>
  );
};
