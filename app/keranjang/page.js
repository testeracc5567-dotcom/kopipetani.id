"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { addOrder } from "@/lib/orders";
import { useAddresses } from "@/lib/addresses";
import { PAYMENTS, findPayment } from "@/lib/payments";
import { products, rp } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import AddressBook from "@/components/AddressBook";
import Icon from "@/components/Icon";

export default function KeranjangPage() {
  const {
    cart, groups, changeQty, removeItem, promoOn, applyPromo, subtotal, logistik,
    promoDisc, voucherDisc, vouchers, selectedVoucherId, selectVoucher,
    paymentMethod, setPaymentMethod, total, saveMsg, checkout,
  } = useCart();
  const { user, updateUser, isLoggedIn } = useAuth();
  const { openAuth } = useUI();
  const addresses = useAddresses();
  const router = useRouter();
  const [promoInput, setPromoInput] = useState("");
  const [promoPlaceholder, setPromoPlaceholder] = useState("Kode promo");
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  const handleApplyPromo = () => {
    const ok = applyPromo(promoInput);
    if (!ok) {
      setPromoInput("");
      setPromoPlaceholder("Kode tidak valid");
    }
  };

  const handleCheckout = async () => {
  if (Object.keys(groups).length === 0) return;
  if (!isLoggedIn) {
    alert("Kamu harus punya akun & login dulu buat belanja ya.");
    openAuth("daftar");
    return;
  }
  const addr = addresses.find((a) => a.id === selectedAddrId);
  if (!addr) {
    alert("Pilih atau tambahkan alamat pengiriman dulu ya.");
    return;
  }
  if (!paymentMethod) {
    alert("Pilih metode pembayaran dulu ya sebelum lanjut.");
    return;
  }
  const pay = findPayment(paymentMethod);
  const items = [];
  Object.values(groups).forEach((arr) =>
    arr.forEach((p) =>
      items.push({
        id: p.id, name: p.name, qty: cart[p.id] || 0, price: p.price,
        emoji: p.ph?.em || "coffee",
        sellerId: p.storeId || null,
        sellerName: p.origin || null,
      })
    )
  );
  try {
    await addOrder({
      items, subtotal, logistik,
      discount: promoDisc + voucherDisc,
      total,
      payment: { method: paymentMethod, label: pay ? pay.label : "-" },
      address: { name: addr.name, phone: addr.phone, detail: addr.detail },
      buyer: user?.name || "Pelanggan",
      buyerId: user?.uid || null,
      buyerName: user?.name || "Pelanggan",
      buyerEmail: user?.email || null,
    });
    updateUser?.({ phone: addr.phone, address: addr.detail });
    checkout();
    router.push("/pesanan");
  } catch (e) {
    alert("Gagal membuat pesanan. Cek koneksi internet ya, lalu coba lagi.");
  }
};

  const groupNames = Object.keys(groups);
  const recommendations = products.filter((p) => !cart[p.id]).slice(0, 3);
  const selectedPay = findPayment(paymentMethod);

  return (
    <main className="cart-page">
      <div className="cart-head">
        <h1 className="cart-title">Keranjang Belanja Anda</h1>
        <p className="cart-sub">
          Tinjau pilihanmu, lalu lanjut ke pembayaran. Semua langsung dari petani lokal terbaik.
        </p>
      </div>
      {groupNames.length === 0 ? (
        <div className="cart-empty">
          <span className="cart-empty-em">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </span>
          <p>Keranjang masih kosong. Yuk pilih produk dulu!</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-address">
              <p className="cart-address-title"><Icon name="map-pin" size={16} /> Alamat Pengiriman</p>
              <AddressBook
                selectedId={selectedAddrId}
                onSelect={setSelectedAddrId}
                defaultForm={{ name: user?.name || "", phone: user?.phone || "", detail: user?.address || "" }}
              />
            </div>
            {groupNames.map((gname) => (
              <div key={gname} className="cart-group">
                <h2 className="cart-group-title">{gname}</h2>
                {groups[gname].map((p) => (
                  <div key={p.id} className="cart-item">
                    <div className="cart-item-img" style={{ background: p.ph.c }}>
                      {p.image ? <img src={p.image} alt={p.name} /> : <Icon name="coffee" size={28} />}
                    </div>
                    <div className="cart-item-info">
                      <span className="cart-item-cat">{p.cat}</span>
                      <h3 className="cart-item-name">{p.name}</h3>
                      <p className="cart-item-origin">{p.origin}</p>
                      <div className="cart-qty">
                        <button onClick={() => changeQty(p.id, -1)}>−</button>
                        <span>{cart[p.id] || 0}</span>
                        <button onClick={() => changeQty(p.id, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <button className="cart-item-del" onClick={() => removeItem(p.id)} aria-label="Hapus"><Icon name="trash" size={16} /></button>
                      <div className="cart-item-price">
                        {rp(p.price * (cart[p.id] || 0))}
                        <span className="cart-item-unit">{p.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <aside className="cart-summary">
            <h2 className="cart-summary-title">Ringkasan Pesanan</h2>
            <div className="cart-summary-row"><span>Subtotal</span><span>{rp(subtotal)}</span></div>
            <div className="cart-summary-row"><span>Ongkos Logistik</span><span>{rp(logistik)}</span></div>
            {promoOn && (
              <div className="cart-summary-row cart-summary-disc"><span>Diskon Promo</span><span>−{rp(promoDisc)}</span></div>
            )}
            {voucherDisc > 0 && (
              <div className="cart-summary-row cart-summary-disc"><span>Diskon Voucher</span><span>−{rp(voucherDisc)}</span></div>
            )}
            <div className="cart-summary-total"><span>Total</span><span>{rp(total)}</span></div>
            <div className="cart-divider" />
            <div className="cart-vouchers">
              <p className="cart-vouchers-label"><Icon name="ticket" size={16} /> Pilih Voucher</p>
              {vouchers && vouchers.length > 0 ? (
                <div className="cart-voucher-list">
                  {vouchers.map((v) => (
                    <button
                      key={v.id}
                      className={`cart-voucher-chip${selectedVoucherId === v.id ? " active" : ""}`}
                      onClick={() => selectVoucher(v.id)}
                    >
                      <span className="cart-voucher-off">{v.off} OFF</span>
                      <span className="cart-voucher-name">{v.title}</span>
                        <span className="cart-voucher-code">{v.code}</span>
  {v.expiresAt && (
    <span className="cart-voucher-exp">
      Berlaku s/d {new Date(v.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
    </span>
  )}
</button>
                  ))}
                </div>
              ) : (
                <p className="cart-voucher-empty">Belum ada voucher. Tukar poin di Hadiah Member dulu ya!</p>
              )}
            </div>
            <div className="cart-promo">
              <input type="text" value={promoInput} placeholder={promoPlaceholder} onChange={(e) => setPromoInput(e.target.value)} />
              <button onClick={handleApplyPromo}>Pakai</button>
            </div>
            <div className="cart-divider" />
            <div className="cart-pay">
              <p className="cart-pay-label"><Icon name="wallet" size={16} /> Metode Pembayaran</p>
              <div className="cart-pay-list">
                {PAYMENTS.map((p) => (
                  <button
                    key={p.id}
                    className={`cart-pay-opt${paymentMethod === p.id ? " active" : ""}`}
                    onClick={() => setPaymentMethod(p.id)}
                  >
                    <span className="cart-pay-ic"><Icon name={p.icon} size={18} /></span>
                    <span>{p.label}</span>
                    {paymentMethod === p.id && <span className="cart-pay-check"><Icon name="check" size={14} /></span>}
                  </button>
                ))}
              </div>
              {selectedPay && (
                <div className="cart-pay-detail">
                  {selectedPay.id === "qris" && (
                    <>
                      <p className="cart-pay-detail-title">Scan QRIS untuk bayar</p>
                      <div className="cart-qris"><img src="/qris.png" alt="QRIS KopiPetani" /></div>
                      <p className="cart-pay-acc-note">Scan pakai aplikasi bank / e-wallet apa aja — a.n. KopiPetani</p>
                    </>
                  )}
                  {(selectedPay.id === "ewallet" || selectedPay.id === "bank") && (
                    <>
                      <p className="cart-pay-detail-title">
                        {selectedPay.id === "bank" ? "Transfer ke salah satu rekening:" : "Kirim ke salah satu nomor e-wallet:"}
                      </p>
                      {selectedPay.accounts.map((a) => (
                        <div key={a.name} className="cart-pay-acc">
                          <div className="cart-pay-acc-top">
                            <span className="cart-pay-acc-name">{a.name}</span>
                            <span className="cart-pay-acc-val">{a.value}</span>
                          </div>
                          <span className="cart-pay-acc-note">{a.note}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {selectedPay.id === "cod" && (
                    <p className="cart-pay-detail-title">Bayar tunai saat barang sampai. Siapkan uang pas ya!</p>
                  )}
                </div>
              )}
            </div>
            <button className="cart-checkout" onClick={handleCheckout}>Lanjut ke Pembayaran →</button>
            {saveMsg && <p className="cart-save-msg">{saveMsg}</p>}
          </aside>
        </div>
      )}
      {recommendations.length > 0 && (
        <section className="cart-recos">
          <h2 className="cart-recos-title">Rekomendasi untuk Anda</h2>
          <p className="cart-recos-sub">Biji dan perlengkapan pilihan buat nemenin harimu.</p>
          <div className="grid">
            {recommendations.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}
    </main>
  );
}