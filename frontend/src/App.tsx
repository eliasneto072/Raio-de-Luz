import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { useAuth } from './store/auth';
import { useCart } from './store/cart';
import { useFavorites } from './store/favorites';
import { useConfig } from './store/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, refetchOnWindowFocus: false },
  },
});

export function App() {
  const initAuth = useAuth((s) => s.init);
  const user = useAuth((s) => s.user);
  const fetchCart = useCart((s) => s.fetch);
  const fetchFavIds = useFavorites((s) => s.fetchIds);
  const clearFavs = useFavorites((s) => s.clear);
  const fetchConfig = useConfig((s) => s.fetch);

  useEffect(() => {
    initAuth();
    fetchCart();
    fetchConfig();
  }, [initAuth, fetchCart, fetchConfig]);

  // Carrega favoritos quando há usuário; limpa ao sair
  useEffect(() => {
    if (user) fetchFavIds();
    else clearFavs();
  }, [user, fetchFavIds, clearFavs]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
