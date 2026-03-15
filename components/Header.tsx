'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Comprar', href: '/comprar' },
    { name: 'Alugar', href: '/alugar' },
    { name: 'Anunciar', href: '/anunciar' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  const openMenu = () => {
    setIsMounted(true);
    // Pequeno delay para permitir que o DOM renderize antes de aplicar as classes de transição
    setTimeout(() => setIsOpen(true), 10);
  };

  const closeMenu = () => {
    setIsOpen(false);
    // Aguarda a animação terminar antes de remover do DOM
    setTimeout(() => setIsMounted(false), 300);
  };

  // Previne o scroll do body quando o menu está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" onClick={closeMenu}>
            <span className="text-2xl font-extrabold tracking-tighter font-heading text-black">IND</span>
            <div className="w-2 h-2 bg-brand-red group-hover:bg-brand-dark-red transition-colors"></div>
            <span className="text-sm tracking-widest font-semibold text-black hidden sm:block">INDEPENDENCE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? 'text-black font-semibold'
                    : 'text-gray-600 font-medium hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Action */}
          <div className="hidden md:block">
            <button className="border border-gray-200 rounded-full px-5 py-2 text-sm font-medium text-black hover:bg-gray-50 transition-colors">
              Entrar
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-black"
            onClick={openMenu}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMounted && (
        <div className="md:hidden fixed inset-0 z-[100] flex justify-end">
          {/* Fundo escurecido (Backdrop) */}
          <div 
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMenu}
          />
          
          {/* Drawer */}
          <div 
            className={`relative h-full w-[320px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Topo: Botão X e Logo */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
              <button
                className="p-2 text-gray-600 hover:text-black"
                onClick={closeMenu}
              >
                <X size={24} />
              </button>
              <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                <span className="text-xl font-extrabold tracking-tighter font-heading text-black">IND</span>
                <div className="w-1.5 h-1.5 bg-brand-red"></div>
                <span className="text-xs tracking-widest font-semibold text-black">INDEPENDENCE</span>
              </Link>
            </div>
            
            {/* Nav Links */}
            <nav className="flex-1 flex flex-col w-full pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-6 py-4 border-b border-gray-100 text-base transition-colors ${
                    isActive(link.href)
                      ? 'bg-gray-50 text-black font-medium'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {/* Botão Entrar na base */}
            <div className="p-6 mt-auto w-full border-t border-gray-100">
              <button className="w-full bg-brand-red hover:bg-brand-dark-red text-white font-semibold py-3.5 rounded-lg transition-colors">
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
