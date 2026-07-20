"use client";
import { useEffect, useState } from "react";
import {
  collection, doc, setDoc, updateDoc, onSnapshot, query, where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export const PAY_WINDOW_MS = 30 * 60 * 1000; // 30 menit

export const STATUS = {
  PENDING: "Menunggu Pembayaran",
  PROCESS: "Diproses",
  SHIPPED: "Dikirim",
  DONE: "Selesai",
  CANCELED: "Dibatalkan",
};

export async function addOrder(order) {
  const now = new Date();
  const isCod = order.payment?.method === "cod";
  const id = "KP" + now.getTime();
  const items = (order.items || []).map((it) => ({
    id: it.id,
    name: it.name,
    qty: it.qty,
    price: it.price,
    emoji: it.emoji || "coffee",
    sellerId: it.sellerId || null,
    sellerName: it.sellerName || null,
  }));
  const sellerIds = Array.from(new Set(items.map((it) => it.sellerId).filter(Boolean)));
  const full = {
    ...order,
    items,
    sellerIds,
    id,
    createdAt: Date.now(),
    date: now.toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    status: isCod ? STATUS.PROCESS : STATUS.PENDING,
    deadline: isCod ? null : Date.now() + PAY_WINDOW_MS,
    pointsEarned: Math.floor((order.total || 0) / 10000) * 1000,
    pointsAwarded: false,
  };
  await setDoc(doc(db, "orders", id), full);
  return full;
}

export async function payOrder(id) {
  try { await updateDoc(doc(db, "orders", id), { status: STATUS.PROCESS, paidAt: Date.now(), deadline: null }); } catch (e) {}
}

export async function cancelOrder(id, reason) {
  try { await updateDoc(doc(db, "orders", id), { status: STATUS.CANCELED, cancelReason: reason || "Dibatalkan pembeli", deadline: null }); } catch (e) {}
}

export async function updateOrderStatus(id, status, reason) {
  const patch = { status, deadline: null };
  if (reason) patch.cancelReason = reason;
  try { await updateDoc(doc(db, "orders", id), patch); } catch (e) {}
}

export async function markPointsAwarded(id) {
  try { await updateDoc(doc(db, "orders", id), { pointsAwarded: true }); } catch (e) {}
}

async function expireOne(id) {
  try { await updateDoc(doc(db, "orders", id), { status: STATUS.CANCELED, cancelReason: "Waktu pembayaran habis (30 menit)", deadline: null }); } catch (e) {}
}

function useOrdersQuery(field, value, op, autoExpire) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (!value) { setOrders([]); return; }
    const q = query(collection(db, "orders"), where(field, op, value));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data());
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(list);
      },
      (err) => { console.error("🔴 useOrdersQuery error:", field, value, op, err); setOrders([]); }
    );
    return () => unsub();
  }, [field, value, op]);

  const [, force] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      force((n) => n + 1);
      if (autoExpire) {
        orders.forEach((o) => {
          if (o.status === STATUS.PENDING && o.deadline && Date.now() > o.deadline) expireOne(o.id);
        });
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [orders, autoExpire]);

  return orders;
}

function useAuthUid(uidArg) {
  const [uid, setUid] = useState(uidArg || null);
  useEffect(() => {
    if (uidArg) { setUid(uidArg); return; }
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, [uidArg]);
  return uid;
}

// Pesanan si pembeli
export function useOrders(uidArg) {
  const uid = useAuthUid(uidArg);
  return useOrdersQuery("buyerId", uid, "==", true);
}

// Pesanan masuk buat penjual
export function useSellerOrders(uidArg) {
  const uid = useAuthUid(uidArg);
  return useOrdersQuery("sellerIds", uid, "array-contains", false);
}

// stub biar import lama nggak error
export function getOrders() { return []; }
export function expireOverdue() {}