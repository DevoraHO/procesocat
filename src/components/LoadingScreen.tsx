const LoadingScreen = ({ onDone }: { onDone: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center text-white transition-opacity duration-500"
      style={{ background: '#2D6A4F' }}
      onAnimationEnd={onDone}
    >
      <div className="text-5xl mb-4 animate-pulse">🌲</div>
      <h1 className="text-2xl font-bold tracking-tight">ProcesoCat</h1>
      <p className="text-white/60 text-sm mt-1">Protegint Catalunya</p>
    </div>
  );
};

export default LoadingScreen;
