"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Currency } from "@/lib/i18n";

const CurrencyContext = createContext<Currency | null>(null);

export function CurrencyProvider({
  initial,
  children,
}: {
  initial: Currency | null;
  children: ReactNode;
}) {
  return (
    <CurrencyContext.Provider value={initial}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useDetectedCurrency(): Currency | null {
  return useContext(CurrencyContext);
}
