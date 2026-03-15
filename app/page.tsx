import SearchBlock from '@/components/SearchBlock';

export default function Home() {
  return (
    <div className="flex-grow flex items-center justify-center bg-brand-bg relative overflow-hidden py-20">
      {/* Gradiente radial sutil para profundidade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] opacity-60 pointer-events-none"></div>
      
      <div className="relative z-10 w-full px-4">
        <SearchBlock />
      </div>
    </div>
  );
}
