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
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [toast, setToast] = useState(null);

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
    window.addEventListener("store-updated", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("store-updated", load);
    };
  }, []);

  // 🔧 FIX BUG: buang otomatis produk yang udah gak ada (mis. produk toko dihapus penjual)
  useEffect(() => {
    if (!loaded) return;
    const all = [...products, ...storeProducts];
    setCart((prev) => {
      const next = {};
      let changed = false;
      Object.keys(prev).forEach((id) => {
        if (all.some((x) => String(x.id) === String(id))) next[id] = prev[id];
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [storeProducts, loaded]);

  // Simpan keranjang otomatis
  useEffect(() => {
    if (loaded) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, loaded]);

  // Simpan voucher otomatis
  useEffect(() => {
    if (loaded) localStorage.setItem(VOUCHER_KEY, JSON.stringify(vouchers));
  }, [vouchers, loaded]);

  // Sembunyikan notif otomatis
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const findProduct = (id) =>
    [...products, ...storeProducts].find((x) => String(x.id) === String(id));

  const addToCart = (id) => {
    const fresh = getStoreProducts();
    setStoreProducts(fresh);
    const p = [...products, ...fresh].find((x) => String(x.id) === String(id));
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setToast({
      msg: p ? `${p.name} ditambahkan ke keranjang` : "Produk ditambahkan ke keranjang",
      n: Date.now(),
    });
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
      if (prev.some((x) => x.code === v.code)) return prev;
      return [...prev, v];
    });
  };

  const selectVoucher = (id) => {
    setSelectedVoucherId((prev) => (prev === id ? null : id));
  };

  const removeVoucher = (id) => {
    setVouchers((prev) => prev.filter((x) => x.id !== id));
    setSelectedVoucherId((prev) => (prev === id ? null : prev));
  };

  const checkout = () => {
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

    const groups = {};
    let count = 0;
    let subtotal = 0;
    let saved = 0;
    ids.forEach((id) => {
      const p = find(id);
      if (!p) return; // produk udah gak ada → jangan dihitung
      const qty = cart[id];
      count += qty;
      (groups[p.group] = groups[p.group] || []).push(p);
      subtotal += p.price * qty;
      saved += ((p.old || p.price) - p.price) * qty;
    });

    const logistik = subtotal > 0 ? 15000 : 0;
    const promoDisc = promoOn ? Math.round(subtotal * 0.1) : 0;

    const selectedVoucher = vouchers.find((v) => v.id === selectedVoucherId) || null;
    let voucherDisc = 0;
    if (selectedVoucher && subtotal > 0) {
      const pct = parseFloat(String(selectedVoucher.off).replace("%", "")) || 0;
      if (String(selectedVoucher.title).toLowerCase().includes("ongkir")) {
        voucherDisc = logistik;
      } else {
        voucherDisc = Math.round(subtotal * (pct / 100));
      }
    }
    const disc = promoDisc + voucherDisc;
    const total = Math.max(0, subtotal + logistik - disc);
    const saveMsg =
      saved + disc > 0
        ? `Anda hemat ${rp(saved + disc)} dibanding harga pasar biasa`
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

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="cart-toast" key={toast.n}>
          <span className="cart-toast-ic">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span>{toast.msg}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}