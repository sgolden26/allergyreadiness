"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AllergyContextValue {
  selectedAllergies: Record<string, string>;
  setSelectedAllergies: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const AllergyContext = createContext<AllergyContextValue>({
  selectedAllergies: {},
  setSelectedAllergies: () => {},
});

export function AllergyProvider({ children }: { children: ReactNode }) {
  const [selectedAllergies, setSelectedAllergies] = useState<Record<string, string>>({});
  return (
    <AllergyContext.Provider value={{ selectedAllergies, setSelectedAllergies }}>
      {children}
    </AllergyContext.Provider>
  );
}

export function useAllergies() {
  return useContext(AllergyContext);
}
