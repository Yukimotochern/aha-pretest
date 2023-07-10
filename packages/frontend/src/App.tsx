import 'antd/dist/reset.css';
import { message } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { router } from './router';
import { store } from './redux/store';
import { injectStore } from './trpc/client';
import { injectRouter } from './router.alias';
import { injectMessageApi } from './utils/message';

/**
 * Prevent Circular Imports
 */
injectStore(store);
injectRouter(router);

export const App = () => {
  const [messageApi, messageContextHolder] = message.useMessage();
  injectMessageApi(messageApi);

  return (
    <>
      {messageContextHolder}
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </>
  );
};
