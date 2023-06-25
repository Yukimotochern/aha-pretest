import { createBrowserRouter } from 'react-router-dom';

export type Router = ReturnType<typeof createBrowserRouter>;

let router: Router;

export const getRouter = () => router;

export const injectRouter = (_router: Router) => {
  router = _router;
};
