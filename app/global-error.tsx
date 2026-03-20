'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased flex flex-col min-h-screen items-center justify-center px-4 text-center">
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#EC5B13', marginBottom: '1rem' }}>
          Ops!
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Algo deu errado
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '28rem' }}>
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: '#EC5B13',
            color: 'white',
            fontWeight: 600,
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Tentar Novamente
        </button>
      </body>
    </html>
  );
}
