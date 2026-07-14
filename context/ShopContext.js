"use client";

import { createContext, useContext, useState } from "react";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("rel");
  const [activeCat, setActiveCat] = useState("Semua");

  return (
    <ShopContext.Provider
      value={{ query, setQuery, sort, setSort, activeCat, setActiveCat }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within a ShopProvider");
  return ctx;
}
