import React from 'react';

interface State { hasError: boolean; }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // No auto-reload — only manual reload via button
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#1B4332',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '60px' }}>🌲</div>
          <h2 style={{ margin: '16px 0 8px' }}>ProcesoCat</h2>
          <p style={{ opacity: 0.8 }}>Ha ocurrido un error. Recargando...</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'white',
              color: '#1B4332',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Recargar app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
