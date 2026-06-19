import { MessageCircle } from 'lucide-react';
import { useConfig, whatsappLink } from '@/store/config';

export function WhatsAppFloat() {
  const { config } = useConfig();

  return (
    <a
      href={whatsappLink(config.whatsapp, 'Olá! Vim pela loja Raio de Luz ✦')}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  );
}
