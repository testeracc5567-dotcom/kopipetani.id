"use client";

import { useEffect, useState } from "react";

const KEY = "kopipetani_orders";
export const PAY_WINDOW_MS = 30 * 60 * 1000; // 30 menit

export const STATUS = {
  PENDING: "Menunggu Pembayaran",
  PROCESS: "Diproses",
  SHIPPED: "Dikirim",
  DONE: "Selesai",
  CANCELED: "Dibatalkan",
};

export function getOrders() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function persist(orders) {
  localStorage.setItem(KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("orders-updated"));
}

export function addOrder(order) {
  const orders = getOrders();
  const now = new Date();
  const isCod = order.payment?.method === "cod";
  const full = {
    id: "KP" + now.getTime(),
    date: now.toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    status: isCod ? STATUS.PROCESS : STATUS.PENDING,
    deadline: isCod ? null : Date.now() + PAY_WINDOW_MS,
    pointsEarned: Math.floor((order.total || 0) / 10000) * 1000,
    ...order,
  };
  orders.unshift(full);
  persist(orders);
  return full;
}

export function payOrder(id) {
  const orders = getOrders().map((o) =>
    o.id === id && o.status === STATUS.PENDING
      ? { ...o, status: STATUS.PROCESS, paidAt: Date.now(), deadline: null }
      : o
  );
  persist(orders);
}

export function cancelOrder(id, reason) {
  const orders = getOrders().map((o) =>
    o.id === id && (o.status === STATUS.PENDING || o.status === STATUS.PROCESS)
      ? { ...o, status: STATUS.CANCELED, cancelReason: reason || "Dibatalkan pembeli", deadline: null }
      : o
  );
  persist(orders);
}

export function updateOrderStatus(id, status, reason) {
  const orders = getOrders().map((o) =>
    o.id === id ? { ...o, status, deadline: null, cancelReason: reason || o.cancelReason } : o
  );
  persist(orders);
}

export function expireOverdue() {
  const orders = getOrders();
  let changed = false;
  const now = Date.now();
  const updated = orders.map((o) => {
    if (o.status === STATUS.PENDING && o.deadline && now > o.deadline) {
      changed = true;
      return { ...o, status: STATUS.CANCELED, cancelReason: "Waktu pembayaran habis (30 menit)", deadline: null };
    }
    return o;
  });
  if (changed) persist(updated);
}

export function useOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const load = () => setOrders(getOrders());
    load();
    const interval = setInterval(() => {
      expireOverdue();
      load();
    }, 1000);
    window.addEventListener("orders-updated", load);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(interval);
      window.removeEventListener("orders-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return orders;
}
export function markPointsAwarded(id) {
  const orders = getOrders();
  const o = orders.find((x) => x.id === id);
  if (o) {
    o.pointsAwarded = true;
    persist(orders);
  }
}