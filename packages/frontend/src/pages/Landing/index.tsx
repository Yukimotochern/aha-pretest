import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Typography, Form, Divider } from 'antd';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  AuthFlows,
  EmailPasswordFormValues,
  socialContinue,
} from '../../redux/auth.slice';
import { EmailPasswordForm } from './EmailPasswordForm';
import { SocialButton } from '../../components/SocialButton';

export const LandingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams({
    action: 'signup',
  });
  const dispatch = useAppDispatch();
  const isAuthLoading = useAppSelector((state) => state.auth.loading);
  const authFlow: AuthFlows =
    searchParams.get('flow') === 'login' ? 'login' : 'signup';

  const [loginForm] = Form.useForm<EmailPasswordFormValues>();
  const [signupForm] = Form.useForm<EmailPasswordFormValues>();
  const loginFormClassName = authFlow === 'login' ? '' : 'hidden';
  const signupFormClassName = authFlow === 'login' ? 'hidden' : '';

  const handleChangeFlow = useCallback(() => {
    setSearchParams((prev) => ({
      flow: prev.get('flow') === 'login' ? 'signup' : 'login',
    }));
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
  }, [authFlow, loginForm, signupForm, setSearchParams]);

  const handleGoogleContinue = useCallback(
    () => dispatch(socialContinue('google-oauth2')),
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
      <div className="mt-2">
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
      </div>
      <div className="text-center">
        <Typography.Text>
          {authFlow === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}
          <Button
            type="link"
            className="px-2"
            onClick={handleChangeFlow}
            disabled={isAuthLoading}
          >
            {authFlow === 'login' ? 'Sign up' : 'Log in'}
          </Button>
        </Typography.Text>
      </div>
    </>
  );
};
