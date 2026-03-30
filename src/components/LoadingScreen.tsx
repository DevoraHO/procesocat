import logo from '@/assets/logoprocesocat.png';

const LoadingScreen = ({ onDone }: { onDone: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center text-white transition-opacity duration-500"
      style={{ background: '#2D6A4F' }}
      onAnimationEnd={onDone}
    >
      <img src={logo} alt="ProcesoCat" className="w-24 h-24 mb-4 animate-pulse rounded-2xl" />
      <h1 className="text-2xl font-bold tracking-tight">ProcesoCat</h1>
      <p className="text-white/60 text-sm mt-1">Protegint Catalunya</p>
    </div>
  );
};

export default LoadingScreen;
