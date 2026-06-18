import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductPage } from '@/pages/ProductPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { LoginPage } from '@/pages/LoginPage';
import { AccountPage } from '@/pages/AccountPage';
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
      { path: 'entrar', element: <LoginPage /> },
      { path: 'conta', element: <AccountPage /> },
      // Próximos passos adicionarão: /admin/* etc.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
