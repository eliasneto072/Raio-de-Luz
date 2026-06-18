import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductPage } from '@/pages/ProductPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'produtos', element: <CatalogPage /> },
      { path: 'produto/:slug', element: <ProductPage /> },
      { path: 'categorias', element: <CategoriesPage /> },
      // Próximos passos adicionarão: /checkout, /entrar, /conta/*, /admin/* etc.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
