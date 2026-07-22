import { useEffect, useState } from 'react';

/**
 * Like useState, but hydrates from localStorage on first render and persists
 * every change back to it. This is a pure client SPA (no SSR), so it's safe
 * to read localStorage synchronously in the initializer.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (private mode, quota, etc.) — degrade silently,
      // in-memory state still works for the rest of the session.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
