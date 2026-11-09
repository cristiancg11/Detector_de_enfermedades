/**
 * AgroScan AI - React Error Boundary Component.
 *
 * Catches unhandled React component tree rendering exceptions and displays
 * a resilient error recovery banner with a "Retry" button instead of crashing
 * or turning the entire screen blank/black.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Leaf, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[AgroScan ErrorBoundary] Uncaught rendering exception:', error, errorInfo);
  }

  public handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full my-6 p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-rose-500/30 backdrop-blur-xl shadow-2xl text-slate-100 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/40">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Diagnostic Rendering Alert</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold uppercase">
                    UI Recovered
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  A rendering discrepancy occurred while formatting the phytosanitary data.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry / Recover View</span>
            </button>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-rose-300/90 break-words">
            <p className="text-[11px] text-slate-500 mb-1 font-sans font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Exception Details:</span>
            </p>
            <span>{this.state.error?.message || 'Unexpected application render exception caught.'}</span>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>AgroScan AI Resilient Recovery System</span>
            </span>
            <span>Error Boundary Protection Active</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
