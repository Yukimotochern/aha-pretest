import { UserProfile } from '@aha/prisma';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { trpc } from '../trpc/client';
import { apiErrorMsg } from '../utils/message';

export interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
};

export const getProfile = createAsyncThunk('userProfile/get', async () => {
  try {
    const profile = await trpc.userProfile.get.query();
    return profile;
  } catch (err) {
    apiErrorMsg();
    throw err;
  }
});

export const changeName = createAsyncThunk(
  'userProfile/changeName',
  async (name: string) => {
    try {
      const profile = await trpc.userProfile.patch.mutate({
        name,
      });
      return profile;
    } catch (err) {
      apiErrorMsg();
      throw err;
    }
  }
);

export const { reducer: userProfileReducer } = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, { payload }) => {
        state.profile = payload;
        state.loading = false;
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(changeName.pending, (state) => {
        state.loading = true;
      })
      .addCase(changeName.fulfilled, (state, { payload }) => {
        state.profile = payload;
        state.loading = false;
      })
      .addCase(changeName.rejected, (state) => {
        state.loading = false;
      }),
});
