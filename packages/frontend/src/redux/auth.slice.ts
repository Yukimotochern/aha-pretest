import type React from 'react';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import auth0 from 'auth0-js';
import { env } from '../environments/environment';
import { trpc } from '../trpc/client';
import { z } from 'zod';
import { getRouter } from '../router.alias';
import { handleError } from '../trpc/handleError';
import { apiErrorMsg, getMessageApi } from '../utils/message';

const webAuth = new auth0.WebAuth({
  domain: env.auth0Domain,
  clientID: env.auth0ClientID,
  redirectUri: `${window.location.origin}/auth-callback`,
  responseType: 'id_token',
  leeway: 10,
});

const PASSWORD_DB = 'Username-Password-Authentication';

const authResultSchema = z.object({
  idToken: z.string(),
});

export interface AuthState {
  session: string;
  sub: string;
  verified: boolean;
  loading: boolean;
}

export type AuthFlows = 'login' | 'signup';

export interface EmailPasswordFormValues {
  email: string;
  password: string;
}

export interface PasswordSubmitRequest {
  data: EmailPasswordFormValues;
  setSubmitError: React.Dispatch<React.SetStateAction<string>>;
}

const initialState: AuthState = {
  session: '',
  sub: '',
  verified: false,
  loading: false,
};

export const {
  actions: { logout, login },
  reducer: authSliceReducer,
} = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state = initialState;
    },
    login(
      state,
      {
        payload: { session, verified, sub },
      }: PayloadAction<Pick<AuthState, 'session' | 'verified' | 'sub'>>
    ) {
      state.sub = sub;
      state.session = session;
      state.verified = verified;
      state.loading = false;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(auth0PasswordLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(auth0PasswordLogin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(auth0PasswordSignup.pending, (state) => {
        state.loading = true;
      })
      .addCase(auth0PasswordSignup.rejected, (state) => {
        state.loading = false;
      })
      .addCase(socialContinue.pending, (state) => {
        state.loading = true;
      })
      .addCase(appLogin.rejected, (state) => {
        state.loading = false;
      }),
});

export const auth0PasswordSignup = createAsyncThunk(
  'auth/auth0_password_signup',
  (passwordSubmitRequest: PasswordSubmitRequest, { dispatch }) =>
    new Promise((resolve, reject) =>
      webAuth.signup(
        {
          ...passwordSubmitRequest.data,
          connection: PASSWORD_DB,
        },
        (err, result) => {
          if (err) {
            console.log(err);
            apiErrorMsg();
            reject(err);
          }
          dispatch(auth0PasswordLogin(passwordSubmitRequest));
          resolve(result);
        }
      )
    )
);

export const auth0PasswordLogin = createAsyncThunk(
  'auth/auth0_password_login',
  ({ data: { email, password }, setSubmitError }: PasswordSubmitRequest) =>
    new Promise((resolve, reject) =>
      webAuth.login(
        {
          email,
          password,
          realm: PASSWORD_DB,
        },
        (err, result) => {
          if (err) {
            setSubmitError(err.description || 'Unable to login.');
            reject(err);
          }
          resolve(result);
        }
      )
    )
);

export const appLogin = createAsyncThunk(
  'auth/app_login',
  async (_, { dispatch }) => {
    try {
      const authRawResult = await new Promise((resolve, reject) =>
        webAuth.parseHash(
          { hash: window.location.hash },
          (err, authRawResult) => {
            if (err) {
              return reject(err);
            }
            window.location.hash = '';
            resolve(authRawResult);
          }
        )
      );
      const { idToken } = authResultSchema.parse(authRawResult);
      const { session, verified, sub } = await trpc.auth.loginOrSignup.mutate({
        auth0Token: idToken,
      });
      dispatch(login({ session, verified, sub }));
      getRouter().navigate('/app/dashboard');
    } catch (err) {
      apiErrorMsg();
      throw err;
    }
  }
);

export const appAuth0Logout = createAsyncThunk('auth/logout', async () => {
  try {
    await trpc.auth.logout.mutate();
    webAuth.logout({
      returnTo: `${window.location.origin}/landing`,
    });
  } catch (err) {
    console.log(err);
    apiErrorMsg();
  }
});

export const startSession = createAsyncThunk(
  'auth/startSession',
  async (_, { dispatch }) => {
    try {
      const { session, verified, sub } = await trpc.auth.startSession.mutate();
      dispatch(login({ session, verified, sub }));
    } catch (err) {
      handleError(err)
        .onStatusLayerError('auth.startSession', '401', () =>
          getMessageApi().info('Please login again.')
        )
        .onOtherCondition(apiErrorMsg)
        .onOtherCondition(() => getRouter().navigate('/landing?flow=login'), {
          shouldRunCallbackIfAlreadyHandled: true,
        });
    }
  }
);

export const socialContinue = createAsyncThunk(
  'auth/social_continue',
  (socialType: 'facebook' | 'google-oauth2') =>
    webAuth.authorize({
      connection: socialType,
    })
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (_, { dispatch }) => {
    const nonce = window.location.hash.replace('#', '');
    window.location.hash = '';
    try {
      const { session, verified, sub } = await trpc.auth.validateEmail.mutate({
        nonce,
      });
      dispatch(login({ session, verified, sub }));
      getRouter().navigate('/app/dashboard');
    } catch (err) {
      handleError(err)
        .onStatusLayerError('auth.validateEmail', '401', () =>
          apiErrorMsg(
            'This link may have expired. You may need to login to resend the verification email.'
          )
        )
        .onOtherCondition(apiErrorMsg)
        .onOtherCondition(() => getRouter().navigate('/landing?flow=login'), {
          shouldRunCallbackIfAlreadyHandled: true,
        });
    }
  }
);
