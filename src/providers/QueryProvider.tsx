'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto - los datos se consideran frescos por 1 minuto
            gcTime: 5 * 60 * 1000, // 5 minutos - tiempo de caché en memoria
            refetchOnWindowFocus: false, // No refetch automático al cambiar de ventana
            refetchOnReconnect: true, // Refetch cuando se reconecta internet
            retry: 1, // Solo reintentar 1 vez en caso de error
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

