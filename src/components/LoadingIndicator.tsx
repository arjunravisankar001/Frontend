// src/components/LoadingIndicator.tsx
import { useEffect } from "react";
import NProgress from "nprogress";

interface LoadingIndicatorProps {
  isLoading: boolean;
}

export default function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  // NProgress is already handled in useGlobalLoading
  useEffect(() => {
    if (!isLoading) {
      NProgress.done();
    }
  }, [isLoading]);

  return null;
};