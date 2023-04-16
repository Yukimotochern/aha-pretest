import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Typography, Form, Divider } from 'antd';

import { useAppDispatch } from '../../redux/hooks';
import {
  AuthFlows,
  EmailPasswordFormValues,
  socialContinue,
} from '../../redux/auth.slice';
import { EmailPasswordForm } from './EmailPasswordForm';
import { SocialButton } from '../../components/SocialButton';
import { trpc } from '../../trpc/client';

export const LandingPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loginWithRedirect, logout } = useAuth0();
  const [authFlow, setAuthFlow] = useState<AuthFlows>('signup');

  const [loginForm] = Form.useForm<EmailPasswordFormValues>();
  const [signupForm] = Form.useForm<EmailPasswordFormValues>();
  const loginFormClassName = authFlow === 'login' ? '' : 'hidden';
  const signupFormClassName = authFlow === 'login' ? 'hidden' : '';

  const handleChangeFlow = useCallback(() => {
    setAuthFlow((prev) => (prev === 'login' ? 'signup' : 'login'));
    /* Bring values to another form */
    const formToCopyFrom = authFlow === 'login' ? loginForm : signupForm;
    const formToCopyTo = authFlow === 'login' ? signupForm : loginForm;
    const values = formToCopyFrom.getFieldsValue();
    Object.entries(values).forEach(([name, value]: [string, unknown]) => {
      formToCopyTo.setFieldValue(name, value);
      /* validate non-empty values from another form */
      if (value) {
        formToCopyTo.validateFields([name]);
      }
    });
  }, [authFlow, loginForm, signupForm]);

  const handleGoogleContinue = useCallback(
    () => dispatch(socialContinue('google')),
    [dispatch]
  );
  const handleFacebookContinue = useCallback(
    () => dispatch(socialContinue('facebook')),
    [dispatch]
  );

  return (
    <>
      <div className="text-center">
        <Typography.Title level={2}>Welcome</Typography.Title>
        <Typography.Text>
          {`${
            authFlow === 'login' ? 'Log in' : 'Sign up'
          } to get-aha-job to continue to Aha pretest.`}
        </Typography.Text>
      </div>
      <SocialButton
        name="Facebook"
        onClick={handleFacebookContinue}
        imgSrc="/facebook_logo.png"
      />
      <SocialButton
        name="Google"
        onClick={handleGoogleContinue}
        imgSrc="/google_logo.png"
      />
      <Divider plain>or</Divider>
      <EmailPasswordForm
        className={loginFormClassName}
        form={loginForm}
        authFlow="login"
      />
      <EmailPasswordForm
        className={signupFormClassName}
        form={signupForm}
        authFlow="signup"
      />
      <div className="text-center">
        <Typography.Text>
          {authFlow === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}
          <Button type="link" className="px-2" onClick={handleChangeFlow}>
            {authFlow === 'login' ? 'Sign up' : 'Log in'}
          </Button>
        </Typography.Text>
      </div>
      {/* @TODO delete below */}
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
        onClick={() =>
          trpc.auth.postAuthNonce.mutate({ method: '', email: '' })
        }
      >
        set error
      </Button>

      <Button onClick={() => logout()}>Log out</Button>
      <Button onClick={() => navigate('/app/dashboard')}>
        Go to /app/dashboard
      </Button>
    </>
  );
};
