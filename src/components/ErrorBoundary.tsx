import React from 'react';

interface State { hasError: boolean; }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error('ErrorBoundary caught:', error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
          <div className="text-center">
            <div className="text-5xl mb-4">😵</div>
            <h1 className="text-xl font-bold mb-2">Algo salió mal</h1>
            <p className="text-muted-foreground mb-6">Ha ocurrido un error inesperado</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
