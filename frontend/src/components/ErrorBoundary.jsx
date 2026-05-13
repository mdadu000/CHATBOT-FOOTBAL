import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }

  componentDidCatch(error, info) {
    console.error('[ui]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400" />
          <div>
            <p className="text-lg font-semibold">Something broke on the pitch</p>
            <p className="mt-2 max-w-md text-sm text-slate-400">{this.state.message}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-neon px-5 py-2 text-sm font-semibold text-pitch-bg"
            onClick={() => window.location.reload()}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
