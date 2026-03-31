import { useState, useEffect } from 'react';
import logo from '@/assets/logoprocesocat.png';

const LoadingScreen = ({ onDone }: { onDone: () => void }) => {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center text-white transition-opacity duration-500"
      style={{ background: '#1B4332' }}
      onAnimationEnd={onDone}
    >
      <img src={logo} alt="ProcesoCat" className="w-24 h-24 mb-4 animate-pulse rounded-2xl" />
      <h1 className="text-2xl font-bold tracking-tight">ProcesoCat</h1>
      <div className="mt-4 flex flex-col items-center gap-2">
        <div
          className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"
        />
        <p className="text-white/60 text-sm mt-1">
          {showRetry ? 'Tarda més del normal...' : 'Carregant... / Cargando...'}
        </p>
      </div>
      {showRetry && (
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
        >
          Recarregar / Recargar
        </button>
      )}
    </div>
  );
};

export default LoadingScreen;
