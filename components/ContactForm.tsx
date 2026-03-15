'use client';

import { useState } from 'react';
import { submitLeadAction } from '@/lib/actions';
import { MessageCircle } from 'lucide-react';

export default function ContactForm({ 
  propertyId, 
  pageUrl 
}: { 
  propertyId: string; 
  pageUrl: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('property_id', propertyId);
    formData.append('page_url', pageUrl);
    
    try {
      const result = await submitLeadAction(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Ocorreu um erro ao enviar.');
      }
    } catch (err) {
      setError('Falha na conexão.');
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center mt-6">
        <h3 className="font-bold mb-1">Mensagem enviada com sucesso!</h3>
        <p className="text-sm">Em breve um de nossos corretores entrará em contato com você.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-4 text-green-700 hover:text-green-900 text-sm font-semibold underline"
        >
          Enviar nova mensagem
        </button>
      </div>
    );
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}
        
        <div>
          <input 
            type="text" 
            name="name"
            required
            placeholder="Nome completo" 
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
          />
        </div>
        <div>
          <input 
            type="tel" 
            name="phone"
            required
            placeholder="Telefone / WhatsApp" 
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
          />
        </div>
        <div>
          <input 
            type="email" 
            name="email"
            placeholder="E-mail (opcional)" 
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all text-black"
          />
        </div>
        <div>
          <textarea 
            name="message"
            placeholder="Olá, gostaria de mais informações sobre este imóvel..." 
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all resize-none text-black"
          ></textarea>
        </div>
        
        <button 
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-red hover:bg-brand-dark-red disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
        >
          {isPending ? 'Enviando...' : 'Enviar mensagem'}
        </button>
      </form>

      <div className="mt-4">
        <a 
          href="https://wa.me/551239000000" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Falar pelo WhatsApp
        </a>
      </div>
    </>
  );
}
