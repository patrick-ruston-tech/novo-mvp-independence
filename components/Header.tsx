'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Comprar', href: '/comprar' },
    { name: 'Alugar', href: '/alugar' },
    { name: 'Lançamentos', href: '/lancamentos' },
    { name: 'Descobrir', href: '/descobrir' },
    { name: 'Blog', href: '/blog' },
    { name: 'Sobre nós', href: '/sobre' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  const openMenu = () => {
    setIsMounted(true);
    setTimeout(() => setIsOpen(true), 10);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setTimeout(() => setIsMounted(false), 300);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" onClick={closeMenu}>
            <Image src="/logo.png" alt="Independence Negócios Imobiliários" width={140} height={48} className="h-10 w-auto" priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
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

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/anunciar"
              className="bg-brand-red hover:bg-brand-dark-red text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Anunciar
            </Link>
            <a
              href="https://independenceimoveis.sicadiweb.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 font-medium hover:text-black transition-colors flex items-center gap-1"
            >
              Área do Cliente
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-black"
            onClick={openMenu}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMounted && (
        <div className="lg:hidden fixed inset-0 z-[100] flex justify-end">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMenu}
          />

          <div
            className={`relative h-full w-[320px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Top */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
              <button className="p-2 text-gray-600 hover:text-black" onClick={closeMenu}>
                <X size={24} />
              </button>
              <Link href="/" className="flex items-center" onClick={closeMenu}>
                <Image src="/logo.png" alt="Independence" width={120} height={40} className="h-8 w-auto" />
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
              <a
                href="https://independenceimoveis.sicadiweb.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-4 border-b border-gray-100 text-base text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                onClick={closeMenu}
              >
                Área do Cliente
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </nav>

            {/* Anunciar button */}
            <div className="p-6 mt-auto w-full border-t border-gray-100">
              <Link
                href="/anunciar"
                className="block w-full bg-brand-red hover:bg-brand-dark-red text-white font-semibold py-3.5 rounded-lg transition-colors text-center"
                onClick={closeMenu}
              >
                Anunciar meu imóvel
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
