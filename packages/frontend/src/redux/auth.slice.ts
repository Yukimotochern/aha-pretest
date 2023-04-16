import type React from 'react';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { User } from '@auth0/auth0-react';
import auth0 from 'auth0-js';
import { env } from '../environments/environment';
import { trpc } from '../trpc/client';

const webAuth = new auth0.WebAuth({
  domain: env.auth0Domain,
  clientID: env.auth0ClientID,
  redirectUri: `${window.location.origin}/app/dashboard`,
  responseType: 'code',
  leeway: 10,
});

const PASSWORD_DB = 'Username-Password-Authentication';

export interface AuthState {
  sessionId: string;
  loading: boolean;
  user: {
    name: string;
    sub: string;
    picture?: string;
    email: string;
    email_verified: boolean;
    locale?: string;
  };
}

const initialState: AuthState = {
  sessionId: '',
  loading: false,
  user: {
    name: 'Unknown user',
    sub: '',
    email: '',
    email_verified: false,
  },
};

export type AuthFlows = 'login' | 'signup';

export interface EmailPasswordFormValues {
  email: string;
  password: string;
}

export interface PasswordSubmitRequest {
  data: EmailPasswordFormValues;
  setSubmitError: React.Dispatch<React.SetStateAction<string>>;
}

export const {
  actions: { logout, setUser },
  reducer: authSliceReducer,
} = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    logout(state) {
      state = initialState;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(passwordLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(passwordLogin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(passwordSignup.pending, (state) => {
        state.loading = true;
      })
      .addCase(passwordSignup.rejected, (state) => {
        state.loading = false;
      }),
});

export const passwordSignup = createAsyncThunk(
  'auth/password_signup',
  (passwordSubmitRequest: PasswordSubmitRequest, { dispatch }) =>
    new Promise((resolve, reject) =>
      webAuth.signup(
        {
          ...passwordSubmitRequest.data,
          connection: PASSWORD_DB,
        },
        (err, result) => {
          if (err) reject(err);
          dispatch(passwordLogin(passwordSubmitRequest));
          resolve(result);
        }
      )
    )
);

export const passwordLogin = createAsyncThunk(
  'auth/password_login',
  ({ data: { email, password }, setSubmitError }: PasswordSubmitRequest) =>
    new Promise((resolve, reject) =>
      webAuth.login(
        {
          email,
          password,
          realm: PASSWORD_DB,
        },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      )
    )
);

export const startSession = createAsyncThunk('auth/startSession', async () => {
  console.log(window.location.hash);
  webAuth.parseHash({ hash: window.location.hash }, (err, authResult) => {
    window.location.hash = '';
    console.log('authResult', authResult);
  });
});

export const socialContinue = createAsyncThunk(
  'auth/social_continue',
  (socialType: 'facebook' | 'google') =>
    new Promise<number>((resolve, reject) => {
      webAuth.authorize({});
      resolve(1);
    })
);
