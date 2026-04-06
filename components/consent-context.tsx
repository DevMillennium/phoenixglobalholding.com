"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "phoenix-cookie-consent";

type ConsentValue = "accepted" | "rejected" | null;

type ConsentContextType = {
  consent: ConsentValue;
  accept: () => void;
  reject: () => void;
};

const ConsentContext = createContext<ConsentContextType | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    startTransition(() => {
      try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === "accepted" || v === "rejected") setConsent(v);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setConsent("accepted");
  }, []);

  const reject = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "rejected");
    } catch {
      /* ignore */
    }
    setConsent("rejected");
  }, []);

  const value = useMemo(
    () => ({ consent, accept, reject }),
    [consent, accept, reject],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}
