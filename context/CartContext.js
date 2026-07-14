"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { products, rp } from "@/lib/data";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}); // { [productId]: qty }
  const [promoOn, setPromoOn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const checkout = () => {
    setCart({});
    setPromoOn(false);
    setIsOpen(false);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const derived = useMemo(() => {
    const ids = Object.keys(cart);
    const count = Object.values(cart).reduce((a, b) => a + b, 0);

    const groups = {};
    ids.forEach((id) => {
      const p = products.find((x) => x.id === Number(id));
      if (!p) return;
      (groups[p.group] = groups[p.group] || []).push(p);
    });

    let subtotal = 0;
    let saved = 0;
    ids.forEach((id) => {
      const p = products.find((x) => x.id === Number(id));
      if (!p) return;
      const qty = cart[id];
      subtotal += p.price * qty;
      saved += (p.old - p.price) * qty;
    });

    const logistik = subtotal > 0 ? 15000 : 0;
    const disc = promoOn ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + logistik - disc;
    const saveMsg =
      saved + disc > 0
        ? `☕ Anda hemat ${rp(saved + disc)} dibanding harga pasar biasa`
        : "";

    return { groups, count, subtotal, logistik, disc, total, saveMsg };
  }, [cart, promoOn]);

  const value = {
    cart,
    promoOn,
    isOpen,
    addToCart,
    changeQty,
    removeItem,
    applyPromo,
    checkout,
    openCart,
    closeCart,
    ...derived,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
