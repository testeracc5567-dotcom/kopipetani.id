"use client";

import { useEffect, useState } from "react";

const RIWAYAT_KEY = "kopipetani_riwayat";

const SEED = [
  { id: 1, type: "in", amount: 500, note: "Bonus pembelian Arabika Gayo", date: "10 Jul 2026, 09:12" },
  { id: 2, type: "in", amount: 250, note: "Bonus ulasan produk", date: "8 Jul 2026, 14:30" },
  { id: 3, type: "in", amount: 1000, note: "Bonus pembelian paket kopi", date: "2 Jul 2026, 11:05" },
];

export function calcPoints(total) {
  return Math.floor((total || 0) / 10000) * 1000;
}

export function getRiwayat() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RIWAYAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function persist(list) {
  localStorage.setItem(RIWAYAT_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("riwayat-updated"));
}

export function addPointHistory(entry) {
  const list = getRiwayat();
  list.unshift({ id: Date.now(), ...entry });
  persist(list);
}

export function nowStr() {
  return new Date().toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function useRiwayat() {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (getRiwayat().length === 0) persist(SEED);
    const load = () => setHistory(getRiwayat());
    load();
    window.addEventListener("riwayat-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("riwayat-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return history;
}