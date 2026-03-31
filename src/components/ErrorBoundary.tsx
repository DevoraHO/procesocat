import React from 'react';

interface State { hasError: boolean; }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error('ErrorBoundary caught:', error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🐛</div>
            <h1 className="text-xl font-bold mb-2 text-foreground">Algo no ha ido bien</h1>
            <p className="text-muted-foreground mb-6">No te preocupes, puedes volver a intentarlo.</p>
            <div className="space-y-3">
              <button onClick={() => { this.setState({ hasError: false }); window.history.back(); }} className="w-full px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
                Volver atrás
              </button>
              <button onClick={() => window.location.reload()} className="w-full px-6 py-2 rounded-lg border border-border text-foreground font-medium">
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
