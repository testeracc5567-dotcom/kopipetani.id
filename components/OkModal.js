"use client";

import { useEffect } from "react";
import { useUI } from "@/context/UIContext";

export default function OkModal() {
  const { okModal, closeOk } = useUI();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeOk();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeOk]);

  return (
    <div className={"modal" + (okModal.open ? " open" : "")}>
      <div className="mcardbox">
        <button className="mclose" onClick={closeOk} aria-label="Tutup">
          ×
        </button>
        <div className="mcheck">✓</div>
        <h3>{okModal.title}</h3>
        <p className="msub">{okModal.sub}</p>
        <button className="btn" onClick={closeOk}>
          Tutup
        </button>
      </div>
    </div>
  );
}
