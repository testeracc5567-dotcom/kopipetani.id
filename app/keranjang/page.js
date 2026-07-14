"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { rp } from "@/lib/data";

export default function KeranjangPage() {
  const {
    cart,
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

  const [promoInput, setPromoInput] = useState("");
  const [promoPlaceholder, setPromoPlaceholder] = useState("Kode promo");

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
    alert("Checkout simulasi: pesanan diterima. Terima kasih.");
  };

  const groupNames = Object.keys(groups);

  return (
    <main className="container keranjang-page">
      <h1>Keranjang Belanja</h1>

      {groupNames.length === 0 ? (
        <div className="cart-empty">
          <div className="em">☕</div>
          Keranjang masih kosong. Yuk pilih produk!
        </div>
      ) : (
        <div className="cart-groups">
          {groupNames.map((gname) => (
            <section key={gname} className="cart-group">
              <h2>▪ {gname}</h2>
              {groups[gname].map((p) => (
                <div key={p.id} className="cart-row">
                  <div className="cr-left">
                    <div className="php" style={{ background: p.ph.c }}>
                      {p.ph.em}
                    </div>
                    <div className="cr-info">
                      <div className="cr-name">{p.name}</div>
                      <div className="cr-price">
                        {rp(p.price)} {p.unit}
                      </div>
                    </div>
                  </div>
                  <div className="cr-actions">
                    <div className="stepper">
                      <button onClick={() => changeQty(p.id, -1)}>−</button>
                      <span>{cart[p.id] || 0}</span>
                      <button onClick={() => changeQty(p.id, 1)}>+</button>
                    </div>
                    <button className="rm" onClick={() => removeItem(p.id)}>
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {groupNames.length > 0 && (
        <aside className="cart-summary">
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
        </aside>
      )}
    </main>
  );
}
