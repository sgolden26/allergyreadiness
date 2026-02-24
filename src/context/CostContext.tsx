"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface CostContextValue {
  factorCost: boolean;
  setFactorCost: (v: boolean) => void;
}

const CostContext = createContext<CostContextValue>({
  factorCost: false,
  setFactorCost: () => {},
});

export function CostProvider({ children }: { children: ReactNode }) {
  const [factorCost, setFactorCost] = useState(false);
  return (
    <CostContext.Provider value={{ factorCost, setFactorCost }}>
      {children}
    </CostContext.Provider>
  );
}

export function useCost() {
  return useContext(CostContext);
}
