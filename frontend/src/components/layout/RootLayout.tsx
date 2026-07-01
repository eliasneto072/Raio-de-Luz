import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { WhatsAppFloat } from './WhatsAppFloat';

export function RootLayout() {
  const { pathname } = useLocation();

  // Sempre que muda de página, rola para o topo. Sem isto, ao clicar num
  // produto (ou outra página) a tela abria na mesma altura de scroll da
  // página anterior, obrigando o usuário a rolar para cima manualmente.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
}
