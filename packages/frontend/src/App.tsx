import 'antd/dist/reset.css';
import { message } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { env } from './environments/environment';
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
        <Auth0Provider
          domain={env.auth0Domain}
          clientId={env.auth0ClientID}
          authorizationParams={{
            redirect_uri: `${window.location.origin}/`,
            audience: env.auth0AuthAudience,
          }}
          onRedirectCallback={() =>
            router.navigate('/app/dashboard', {
              state: {
                isRedirect: true,
              },
            })
          }
        >
          <RouterProvider router={router} />
        </Auth0Provider>
      </Provider>
    </>
  );
};
