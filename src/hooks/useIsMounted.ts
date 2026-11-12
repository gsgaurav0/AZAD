import { useState, useEffect } from 'react';

/**
 * Hydration-safe mount status hook.
 * Returns false during SSR and initial client hydration render,
 * then flips to true in useEffect so client-only state (localStorage,
 * cart badges, auth session) cannot cause React hydration mismatches.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}


