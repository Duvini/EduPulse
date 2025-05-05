import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnmount: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});