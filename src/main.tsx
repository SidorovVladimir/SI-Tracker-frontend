import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

const getClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: "http://localhost:4000/graphql",
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });
};

const bootstrap = () => {
  const client = getClient();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </StrictMode>
  );
};

bootstrap();
