'use client';

import { MessageCircle } from 'lucide-react';

// Número e mensagem padrão do botão flutuante. O número é um WhatsApp
// dedicado de captação (não muda entre os celulares dos corretores).
const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=5512991968810' +
  '&text=' +
  encodeURIComponent('Olá, vim pelo site e tenho interesse em um imóvel.') +
  '&type=phone_number&app_absent=0';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-colors group"
      aria-label="Falar pelo WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-green-500 animate-[ping_5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
      <MessageCircle className="text-white w-7 h-7 relative z-10" />
    </a>
  );
}
