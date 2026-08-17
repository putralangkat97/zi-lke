import React from 'react';
import { RouterProvider, createRouter, createHashHistory } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree';
import { AuthProvider } from './context/AuthContext';

// Standard Query Client
const queryClient = new QueryClient();

// Configure the HashRouter equivalent using hash history in TanStack Router
const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
  context: { queryClient },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
