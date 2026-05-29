import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { SnackbarProvider } from 'notistack';
import theme from './utils/theme.ts';

import './index.css';

const getClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: '/graphql',
      // uri: 'http://localhost:4000/graphql',
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
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </BrowserRouter>
        </ApolloProvider>
      </StrictMode>
    </SnackbarProvider>
  );
};

bootstrap();
