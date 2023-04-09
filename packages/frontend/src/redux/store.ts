import { configureStore } from '@reduxjs/toolkit';
import { appSliceReducer } from './app.slice';

export const store = configureStore({
  reducer: {
    app: appSliceReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type
export type AppDispatch = typeof store.dispatch;
