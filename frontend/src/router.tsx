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
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCoupons } from '@/pages/admin/AdminCoupons';
import { AdminShipping } from '@/pages/admin/AdminShipping';
import { AdminAppearance } from '@/pages/admin/AdminAppearance';
import { AdminReports } from '@/pages/admin/AdminReports';
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
      { path: 'conta/pedidos', element: <AccountPage initialTab="pedidos" /> },
      { path: 'conta/favoritos', element: <AccountPage initialTab="favoritos" /> },
      { path: 'conta/perfil', element: <AccountPage initialTab="perfil" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'pedidos', element: <AdminOrders /> },
      { path: 'produtos', element: <AdminProducts /> },
      { path: 'cupons', element: <AdminCoupons /> },
      { path: 'frete', element: <AdminShipping /> },
      { path: 'personalizar', element: <AdminAppearance /> },
      { path: 'relatorios', element: <AdminReports /> },
    ],
  },
]);
