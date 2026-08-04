"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Boundary caught:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
            <h2 className="text-xl font-normal text-ink">Something went wrong</h2>
            <p className="max-w-sm text-sm text-muted">
              We could not render this section. Please refresh the page to try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 border border-ink/20 px-6 py-3 text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-background"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
