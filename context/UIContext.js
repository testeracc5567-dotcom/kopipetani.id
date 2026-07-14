"use client";

import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("masuk");
  const [okModal, setOkModal] = useState({ open: false, title: "", sub: "" });

  const openAuth = (tab) => {
    setAuthTab(tab || "masuk");
    setAuthOpen(true);
  };
  const closeAuth = () => setAuthOpen(false);

  const showOk = (title, sub) => setOkModal({ open: true, title, sub });
  const closeOk = () => setOkModal((s) => ({ ...s, open: false }));

  return (
    <UIContext.Provider
      value={{
        authOpen,
        authTab,
        setAuthTab,
        openAuth,
        closeAuth,
        okModal,
        showOk,
        closeOk,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within a UIProvider");
  return ctx;
}
