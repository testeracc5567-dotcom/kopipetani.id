"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products, rp } from "@/lib/data";
import { getStoreProducts } from "@/lib/storeProducts";

const CartContext = createContext(null);
const CART_KEY = "kopipetani_cart";
const VOUCHER_KEY = "kopipetani_vouchers";

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}); // { [productId]: qty }
  const [promoOn, setPromoOn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]); // voucher hasil tukar poin
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]); // produk dari toko mitra

  // Muat data tersimpan dari browser
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedV = localStorage.getItem(VOUCHER_KEY);
      if (savedV) setVouchers(JSON.parse(savedV));
    } catch (e) {}
    setLoaded(true);
  }, []);

  // Muat + pantau produk toko dari localStorage
  useEffect(() => {
    const load = () => setStoreProducts(getStoreProducts());
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  // Simpan keranjang otomatis
  useEffect(() => {
    if (loaded) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, loaded]);

  // Simpan voucher otomatis
  useEffect(() => {
    if (loaded) localStorage.setItem(VOUCHER_KEY, JSON.stringify(vouchers));
  }, [vouchers, loaded]);

  // Gabungan produk bawaan + produk toko, cari by id (aman string/number)
  const findProduct = (id) =>
    [...products, ...storeProducts].find((x) => String(x.id) === String(id));

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setIsOpen(true);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] || 0) + delta;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const applyPromo = (code) => {
    if (code.trim().toUpperCase() === "JEJAK2024") {
      setPromoOn(true);
      return true;
    }
    return false;
  };

  // ===== Voucher =====
  const addVoucher = (v) => {
    setVouchers((prev) => {
      if (prev.some((x) => x.code === v.code)) return prev; // hindari dobel
      return [...prev, v];
    });
  };

  const selectVoucher = (id) => {
    setSelectedVoucherId((prev) => (prev === id ? null : id)); // klik lagi = batal pilih
  };

  const removeVoucher = (id) => {
    setVouchers((prev) => prev.filter((x) => x.id !== id));
    setSelectedVoucherId((prev) => (prev === id ? null : prev));
  };

  const checkout = () => {
    // voucher cuma bisa dipakai 1x — hangus setelah checkout
    if (selectedVoucherId) {
      setVouchers((prev) => prev.filter((v) => v.id !== selectedVoucherId));
    }
    setCart({});
    setPromoOn(false);
    setSelectedVoucherId(null);
    setPaymentMethod(null);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const derived = useMemo(() => {
    const all = [...products, ...storeProducts];
    const find = (id) => all.find((x) => String(x.id) === String(id));
    const ids = Object.keys(cart);
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    const groups = {};
    ids.forEach((id) => {
      const p = find(id);
      if (!p) return;
      (groups[p.group] = groups[p.group] || []).push(p);
    });
    let subtotal = 0;
    let saved = 0;
    ids.forEach((id) => {
      const p = find(id);
      if (!p) return;
      const qty = cart[id];
      subtotal += p.price * qty;
      saved += ((p.old || p.price) - p.price) * qty; // produk toko old=null → 0
    });
    const logistik = subtotal > 0 ? 15000 : 0;
    const promoDisc = promoOn ? Math.round(subtotal * 0.1) : 0;
    // Diskon dari voucher yang dipilih
    const selectedVoucher = vouchers.find((v) => v.id === selectedVoucherId) || null;
    let voucherDisc = 0;
    if (selectedVoucher && subtotal > 0) {
      const pct = parseFloat(String(selectedVoucher.off).replace("%", "")) || 0;
      if (String(selectedVoucher.title).toLowerCase().includes("ongkir")) {
        voucherDisc = logistik; // gratis ongkir
      } else {
        voucherDisc = Math.round(subtotal * (pct / 100));
      }
    }
    const disc = promoDisc + voucherDisc;
    const total = Math.max(0, subtotal + logistik - disc);
    const saveMsg =
      saved + disc > 0
        ? `☕ Anda hemat ${rp(saved + disc)} dibanding harga pasar biasa`
        : "";
    return { groups, count, subtotal, logistik, promoDisc, voucherDisc, disc, total, saveMsg, selectedVoucher };
  }, [cart, promoOn, vouchers, selectedVoucherId, storeProducts]);

  const value = {
    cart,
    promoOn,
    isOpen,
    vouchers,
    selectedVoucherId,
    paymentMethod,
    setPaymentMethod,
    addToCart,
    changeQty,
    removeItem,
    applyPromo,
    addVoucher,
    selectVoucher,
    removeVoucher,
    checkout,
    openCart,
    closeCart,
    findProduct,
    ...derived,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}