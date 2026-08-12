import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Custom Error Boundary to catch runtime errors in the component tree.
 */
class AppErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "Fatal platform runtime crash intercepted:",
      error,
      errorInfo,
    );
  }

  public handleRecovery = () => {
    // Graceful recovery: keep the user in the app and re-mount the React subtree.
    try {
      const el = document.getElementById("root");
      if (el) el.innerHTML = "";
      import("../main");
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          title="Application Runtime Error"
          message={
            this.state.error?.message ?? "An unhandled exception occurred."
          }
          actionLabel="Reinitialize UI Layer"
          onAction={this.handleRecovery}
        />
      );
    }
    return this.props.children;
  }
}

export const ProvidersShell = ({ children }: { children: ReactNode }) => {
  return <AppErrorBoundary>{children}</AppErrorBoundary>;
};
