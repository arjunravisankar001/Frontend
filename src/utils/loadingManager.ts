// src/utils/loadingManager.ts
import { useEffect, useState, useRef } from "react";
import NProgress from "nprogress";
import { useIsFetching } from "@tanstack/react-query";

export function useGlobalLoading(isRouteLoading: boolean) {
  const isFetching = useIsFetching();
  const [isLoading, setIsLoading] = useState(false);

  // Track timeout IDs to manage delays
  const startTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loading = isRouteLoading || isFetching > 0;

    if (loading) {
      // Start NProgress after a small delay to avoid flash
      if (doneTimeout.current) {
        clearTimeout(doneTimeout.current);
      }
      if (!isLoading && !startTimeout.current) {
        startTimeout.current = setTimeout(() => {
          NProgress.start();
          setIsLoading(true);
          startTimeout.current = null;
        }, 100); // 100ms delay before showing
      }
    } else {
      // Complete NProgress with a small minimum duration
      if (startTimeout.current) {
        clearTimeout(startTimeout.current);
        startTimeout.current = null;
      }
      if (isLoading) {
        doneTimeout.current = setTimeout(() => {
          NProgress.done();
          setIsLoading(false);
        }, 200); // 200ms minimum bar duration
      }
    }

    // Cleanup on unmount
    return () => {
      if (startTimeout.current) clearTimeout(startTimeout.current);
      if (doneTimeout.current) clearTimeout(doneTimeout.current);
    };
  }, [isRouteLoading, isFetching, isLoading]);

  return isLoading;
}