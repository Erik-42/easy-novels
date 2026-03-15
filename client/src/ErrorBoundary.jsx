import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '600px',
          margin: '0 auto',
          fontFamily: 'system-ui, sans-serif',
          background: '#0f172a',
          color: '#e2e8f0',
          minHeight: '100vh',
        }}>
          <h1 style={{ color: '#f87171' }}>Erreur</h1>
          <pre style={{
            background: '#1e293b',
            padding: '1rem',
            overflow: 'auto',
            fontSize: '0.85rem',
            borderRadius: '0.5rem',
          }}>
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <p>Ouvre la console (F12) pour plus de détails.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
