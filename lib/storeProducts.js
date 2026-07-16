"use client";
import { useEffect, useState } from "react";

const STORE_KEY = "kopipetani_store";

// Foto cadangan untuk halaman detail kalau produk toko belum di-upload fotonya
const FALLBACK_IMG =
  "https://images.pexels.com/photos/4820773/pexels-photo-4820773.jpeg?auto=compress&cs=tinysrgb&w=600";

// Pilihan ikon produk (SVG). Kalau nilai lama masih emoji, otomatis jadi "coffee".
const ICON_CHOICES = ["coffee", "sprout", "leaf", "package", "gift", "star"];
const prodIcon = (val) => (ICON_CHOICES.includes(val) ? val : "coffee");

// Samain nama kategori biar konsisten dengan halaman /kategori
const CAT_MAP = {
  "Kopi Sangrai": "Roasted Bean",
  "Pupuk & Nutrisi": "Pupuk",
};

// Ubah 1 produk toko -> bentuk produk katalog (sama seperti lib/data)
function mapStoreProduct(p, store) {
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
    stock: Number(p.stock) || 0,
    desc: p.desc || "",
  };
}

export function getStoreProducts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw);
    const list = store?.products || [];
    return list.map((p) => mapStoreProduct(p, store));
  } catch (e) {
    return [];
  }
}

export function getStoreProductById(id) {
  return getStoreProducts().find((p) => String(p.id) === String(id)) || null;
}

// Hook reaktif (SSR-safe): kosong saat render awal, terisi setelah mount
export function useStoreProducts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const load = () => setItems(getStoreProducts());
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);
  return items;
}