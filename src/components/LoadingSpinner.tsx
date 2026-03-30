const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div
      className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }}
    />
  </div>
);

export default LoadingSpinner;
