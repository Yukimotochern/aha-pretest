import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { User } from '@auth0/auth0-react';
import { trpc } from '../trpc/client';

export interface AppState {
  loading: boolean;
  sessionId: string;
  user: {
    name: string;
    sub: string;
    picture?: string;
    email: string;
    email_verified: boolean;
    locale?: string;
  };
}

const initialState: AppState = {
  loading: true,
  sessionId: '',
  user: {
    name: 'Unknown user',
    sub: '',
    email: '',
    email_verified: false,
  },
};

export const {
  actions: { appLogout, setUser },
  reducer: appSliceReducer,
} = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    appLogout(state) {
      state = initialState;
    },
  },
});

export const startSession = createAsyncThunk(
  'app/startSession',
  trpc.auth.startSession.mutate
);
