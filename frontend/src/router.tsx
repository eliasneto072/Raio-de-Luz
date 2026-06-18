import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductPage } from '@/pages/ProductPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
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
      { path: 'carrinho', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'pedido/:id', element: <OrderConfirmationPage /> },
      // Próximos passos adicionarão: /entrar, /conta/*, /admin/* etc.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
