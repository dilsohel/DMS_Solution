import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'An unexpected error occurred.';
      const isDomainError = errorMsg.includes('unauthorized-domain') || errorMsg.includes('auth/unauthorized-domain');
      const isFirebaseConfigError = errorMsg.includes('Firebase') || errorMsg.includes('apiKey') || errorMsg.includes('projectId');
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-700/80 pb-5">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Application Startup Error</h1>
                <p className="text-sm text-slate-400 mt-1">
                  DMS Solution prevented a blank white screen and captured the error below.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-rose-300 break-words max-h-48 overflow-y-auto">
              <div className="text-slate-400 text-xs font-sans uppercase tracking-wider mb-1 font-semibold">Error Details:</div>
              {errorMsg}
            </div>

            {/* Contextual guidance */}
            {isDomainError && (
              <div className="bg-amber-950/30 border border-amber-600/30 rounded-xl p-4 text-xs sm:text-sm text-amber-200 space-y-2">
                <div className="font-semibold flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="w-4 h-4" /> Firebase Authorized Domain Notice
                </div>
                <p>
                  Domain <code className="bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300">{currentHost}</code> is not authorized in your Firebase Console.
                </p>
                <p>
                  To fix: Open Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains, and add <code className="bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300">{currentHost}</code>.
                </p>
              </div>
            )}

            {isFirebaseConfigError && (
              <div className="bg-sky-950/30 border border-sky-600/30 rounded-xl p-4 text-xs sm:text-sm text-sky-200 space-y-2">
                <div className="font-semibold flex items-center gap-2 text-sky-400">
                  <ExternalLink className="w-4 h-4" /> Firebase Configuration Notice
                </div>
                <p>
                  Please verify that your Firebase configuration has valid credentials (`apiKey`, `projectId`, `authDomain`).
                </p>
              </div>
            )}

            {/* Diagnostic Details */}
            <div className="text-xs text-slate-400 bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-1">
              <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : ''}</div>
              <div><strong>Host:</strong> {currentHost || 'unknown'}</div>
              <div><strong>Deployment:</strong> GitHub Pages / Static Hosting Ready</div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-950/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reset Cache &amp; Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
