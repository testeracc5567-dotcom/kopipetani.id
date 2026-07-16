"use client";
import { useEffect, useState } from "react";
import { rp } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import Icon from "@/components/Icon";

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    groups,
    changeQty,
    removeItem,
    promoOn,
    applyPromo,
    subtotal,
    logistik,
    disc,
    total,
    saveMsg,
    checkout,
  } = useCart();
  const { showOk } = useUI();
  const [promoInput, setPromoInput] = useState("");
  const [promoPlaceholder, setPromoPlaceholder] = useState("Kode promo");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  const handleApplyPromo = () => {
    const ok = applyPromo(promoInput);
    if (!ok) {
      setPromoInput("");
      setPromoPlaceholder("Kode tidak valid");
    }
  };

  const handleCheckout = () => {
    const hasItems = Object.keys(groups).length > 0;
    if (!hasItems) return;
    checkout();
    showOk(
      "Pesanan Diterima!",
      "Ini simulasi checkout untuk prototipe. Pesanan Anda akan diteruskan langsung ke petani & mitra terkait tanpa perantara."
    );
  };

  const groupNames = Object.keys(groups);

  return (
    <>
      <div className={"overlay" + (isOpen ? " open" : "")} onClick={closeCart} />
      <div className={"drawer" + (isOpen ? " open" : "")}>
        <div className="dhead">
          <h3>Keranjang Belanja</h3>
          <button className="dclose" onClick={closeCart} aria-label="Tutup">
            ×
          </button>
        </div>
        <div className="dbody">
          {groupNames.length === 0 ? (
            <div className="cart-empty">
              <div className="em">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              Keranjang masih kosong.
              <br />
              Yuk pilih kopi &amp; hasil bumi terbaik!
            </div>
          ) : (
            groupNames.map((gname) => (
              <div key={gname}>
                <div className="cgroup-t">▪ {gname}</div>
                {groups[gname].map((p) => (
                  <CartItem
                    key={p.id}
                    product={p}
                    onInc={() => changeQty(p.id, 1)}
                    onDec={() => changeQty(p.id, -1)}
                    onRemove={() => removeItem(p.id)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
        {groupNames.length > 0 && (
          <div className="dfoot">
            <div className="promo">
              <input
                type="text"
                placeholder={promoPlaceholder}
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button onClick={handleApplyPromo}>Pakai</button>
            </div>
            <div className="sumline">
              <span>Subtotal</span>
              <span>{rp(subtotal)}</span>
            </div>
            <div className="sumline">
              <span>Ongkos Logistik</span>
              <span>{rp(logistik)}</span>
            </div>
            {promoOn && (
              <div className="sumline disc">
                <span>Diskon Promo</span>
                <span>-{rp(disc)}</span>
              </div>
            )}
            <div className="totline">
              <span className="tl">Total</span>
              <span className="tv">{rp(total)}</span>
            </div>
            {saveMsg && <div className="savemsg">{saveMsg}</div>}
            <button className="btn" onClick={handleCheckout}>
              Checkout Sekarang
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartItem({ product, onInc, onDec, onRemove }) {
  const { cart } = useCart();
  const qty = cart[product.id] || 0;
  return (
    <div className="citem">
      <div className="ci-img">
        <div className="php" style={{ background: product.ph.c }}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <Icon name={typeof product.icon === "string" ? product.icon : "coffee"} size={22} />
          )}
        </div>
      </div>
      <div className="ci-main">
        <div className="ci-nm">{product.name}</div>
        <div className="ci-pr">
          {rp(product.price)} {product.unit}
        </div>
        <div className="stepper">
          <button onClick={onDec}>−</button>
          <span>{qty}</span>
          <button onClick={onInc}>+</button>
        </div>
      </div>
      <button className="ci-rm" onClick={onRemove}>
        Hapus
      </button>
    </div>
  );
}