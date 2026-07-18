"use client";
import { useEffect, useState } from "react";
import { collectionGroup, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const FALLBACK_IMG =
  "https://images.pexels.com/photos/4820773/pexels-photo-4820773.jpeg?auto=compress&cs=tinysrgb&w=600";
const ICON_CHOICES = ["coffee", "sprout", "leaf", "package", "gift", "star"];
const prodIcon = (val) => (ICON_CHOICES.includes(val) ? val : "coffee");
const CAT_MAP = { "Kopi Sangrai": "Roasted Bean", "Pupuk & Nutrisi": "Pupuk" };

function mapStoreProduct(p, store, uid) {
  const hasPhoto = !!(p.image && p.image.length > 0);
  const rawCat = p.category || "Lainnya";
  const cat = CAT_MAP[rawCat] || rawCat;
  return {
    id: p.id,
    name: p.name,
    cat,
    origin: store?.name || "Toko Mitra",
    price: Number(p.price) || 0,
    old: null,
    unit: "",
    image: hasPhoto ? p.image : FALLBACK_IMG,
    hasPhoto,
    icon: prodIcon(p.emoji),
    ph: { em: prodIcon(p.emoji), c: "#e7d8c9" },
    group: cat,
    fromStore: true,
    storeId: uid,          // UID penjual (buat nyambungin pesanan)
    storeName: store?.name || "Toko Mitra",
storeAddress: store?.address || null,
    stock: Number(p.stock) || 0,
    desc: p.desc || "",
  };
}

// Cache + realtime sync semua toko (collection group "store")
let _cache = [];
let _started = false;
const _listeners = new Set();

function startSync() {
  if (_started || typeof window === "undefined") return;
  _started = true;
  try {
    const q = collectionGroup(db, "store");
    onSnapshot(
      q,
      (snap) => {
        const all = [];
        snap.forEach((d) => {
          if (d.id !== "main") return;
          const store = d.data() || {};
          const uid = d.ref.parent.parent?.id || null;
          (store.products || []).forEach((p) => all.push(mapStoreProduct(p, store, uid)));
        });
        _cache = all;
        _listeners.forEach((fn) => fn(_cache));
      },
      () => {}
    );
  } catch (e) {}
}

export function getStoreProducts() {
  startSync();
  return _cache;
}

export function getStoreProductById(id) {
  return getStoreProducts().find((p) => String(p.id) === String(id)) || null;
}

export function useStoreProducts() {
  const [items, setItems] = useState(_cache);
  useEffect(() => {
    startSync();
    const fn = (list) => setItems(list);
    _listeners.add(fn);
    setItems(_cache);
    return () => { _listeners.delete(fn); };
  }, []);
  return items;
}