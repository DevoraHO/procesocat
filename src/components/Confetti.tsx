const COLORS = ['#2D6A4F', '#F4845F', '#CC0000', '#FCBF49', '#a855f7'];

interface ConfettiProps {
  count?: number;
  colors?: string[];
}

const Confetti = ({ count = 30, colors = COLORS }: ConfettiProps) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-sm"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: colors[i % colors.length],
          animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
          top: '-10px',
        }}
      />
    ))}
    <style>{`
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `}</style>
  </div>
);

export default Confetti;
