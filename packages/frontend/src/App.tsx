import { RouterProvider } from 'react-router-dom';
import 'antd/dist/reset.css';
import { router } from './router';

export const App = () => {
  return <RouterProvider router={router} />;
};
