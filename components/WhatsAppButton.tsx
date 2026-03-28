'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/551239000000"
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
