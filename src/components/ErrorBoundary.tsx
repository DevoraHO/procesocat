import React from 'react';
import { toast } from 'sonner';

interface State { hasError: boolean; }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
    toast.error('Error cargando. Recargando...');
    setTimeout(() => window.location.reload(), 2000);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
