import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { SnackbarProvider } from 'notistack';

const getClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'http://localhost:4000/graphql',
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
  });
};

const bootstrap = () => {
  const client = getClient();
  createRoot(document.getElementById('root')!).render(
    <SnackbarProvider
      maxSnack={1}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      autoHideDuration={2000}
    >
      <StrictMode>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ApolloProvider>
      </StrictMode>
    </SnackbarProvider>
  );
};

bootstrap();
