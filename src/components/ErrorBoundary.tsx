import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-gold-500/10 border border-gold-400/30 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-2xl text-gold-400 font-bold">!</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-wide">
            MERIS E-SHOP Restored
          </h1>
          <p className="text-navy-300 max-w-md text-sm mb-6">
            A temporary display sync state was recovered. Click below to refresh your catalog.
          </p>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('meris_products');
              } catch (e) {}
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-amber-600 text-navy-950 font-bold rounded-xl shadow-lg hover:brightness-110 transition-all text-sm uppercase tracking-wider"
          >
            Reload Store Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
