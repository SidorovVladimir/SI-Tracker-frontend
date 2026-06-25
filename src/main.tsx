import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  ServerError,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ApolloProvider } from '@apollo/client/react';
import { SnackbarProvider } from 'notistack';
import theme from './utils/theme.ts';

import './index.css';
import { SocketProvider } from './context/SocketContext.tsx';
import { GetMeDocument } from './graphql/types/__generated__/graphql.ts';

const getClient = () => {
  let clientInstance: any;

  const errorLink = new ErrorLink(({ error }) => {
    let isUnauthorized = false;

    if (CombinedGraphQLErrors.is(error)) {
      for (const err of error.errors) {
        if (
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.message?.toLowerCase().includes('unauthorized')
        ) {
          isUnauthorized = true;
          break;
        }
      }
    } else if (ServerError.is(error) && error.statusCode === 401) {
      isUnauthorized = true;
    }

    if (isUnauthorized && !window.location.pathname.includes('/login')) {
      clientInstance.clearStore().catch(() => {});
      clientInstance.writeQuery({
        query: GetMeDocument,
        data: { me: null },
      });
    }
  });

  const httpLink = new HttpLink({
    // uri: '/graphql',
    uri: 'http://localhost:4000/graphql',
    credentials: 'include',
  });

  clientInstance = new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Исправляет предупреждение о потере данных списка черновиков партий
            getDraftBatchesByMonth: {
              keyArgs: ['plannedMonth'], // Группируем кэш изолированно по месяцам
              merge(_existing, incoming) {
                return incoming; // Просто заменяем массив на свежий без паники кэша
              },
            },
            // Защищает пул приборов от ложного склеивания при смене вкладок контроля и страниц
            getPlanningPoolByMonth: {
              keyArgs: ['targetMonth', 'limit', 'offset', 'controlTypeId'],
              merge(_existing, incoming) {
                return incoming;
              },
            },

            // getChatHistory: {
            //   keyArgs: ['recipientId'],
            //   merge(existing = [], incoming = []) {
            //     const messageMap = new Map();

            //     existing.forEach((msg: any) => {
            //       if (msg && msg.__ref) {
            //         messageMap.set(msg.__ref, msg);
            //       } else if (msg && msg.id) {
            //         messageMap.set(msg.id, msg);
            //       }
            //     });

            //     incoming.forEach((msg: any) => {
            //       if (msg && msg.__ref) {
            //         messageMap.set(msg.__ref, msg);
            //       } else if (msg && msg.id) {
            //         messageMap.set(msg.id, msg);
            //       }
            //     });

            //     return Array.from(messageMap.values());
            //   },
            // },

            getChatHistory: {
              keyArgs: ['recipientId'],
              merge(existing = [], incoming = [], { readField }) {
                const messageMap = new Map();
                const getMessageId = (msg: any) =>
                  readField<string>('id', msg) || msg.id || msg.__ref;

                // Складываем существующие сообщения
                existing.forEach((msg: any) => {
                  if (msg) {
                    const id = getMessageId(msg);
                    if (id) messageMap.set(id, msg);
                  }
                });

                // Добавляем новые (из сокетов или пагинации)
                incoming.forEach((msg: any) => {
                  if (msg) {
                    const id = getMessageId(msg);
                    if (id) messageMap.set(id, msg);
                  }
                });

                // 🔥 Просто возвращаем объединенный массив! База данных уже все отсортировала за нас.
                return Array.from(messageMap.values());
              },
            },
          },
        },
      },
    }),
  });
  return clientInstance;
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
              <SocketProvider>
                <App />
              </SocketProvider>
            </ThemeProvider>
          </BrowserRouter>
        </ApolloProvider>
      </StrictMode>
    </SnackbarProvider>
  );
};

bootstrap();
