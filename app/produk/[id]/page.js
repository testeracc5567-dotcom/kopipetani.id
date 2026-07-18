"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { products, rp } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useOrders, addOrder, STATUS } from "@/lib/orders";
import { useProductReviews, addReview } from "@/lib/reviews";
import { useStoreProducts } from "@/lib/storeProducts";
import { PAYMENTS, findPayment } from "@/lib/payments";
import { useAddresses } from "@/lib/addresses";
import AddressBook from "@/components/AddressBook";
import SellerCard from "@/components/SellerCard";
import Icon from "@/components/Icon";

function isDone(status) {
  return status === STATUS?.DONE || status === "Selesai" || status === "DONE";
}

function Stars({ value = 5 }) {
  const full = Math.round(value);
  return (
    <span className="pd-stars">
      {"★★★★★".slice(0, full)}
      <span className="pd-stars-empty">{"★★★★★".slice(full)}</span>
    </span>
  );
}

export default function ProdukDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const dataProduct = products.find((p) => p.id === id);

  const { addToCart, changeQty } = useCart();
  const { user, isLoggedIn, updateUser } = useAuth();
  const { openAuth } = useUI();
  const orders = useOrders(user?.uid);
  const reviews = useProductReviews(id);
  const addresses = useAddresses();
  const storeProducts = useStoreProducts();

  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("desc");
  const [rStar, setRStar] = useState(5);
  const [rText, setRText] = useState("");

  // Beli Sekarang (checkout langsung)
  const [buyOpen, setBuyOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  const [storeProduct, setStoreProduct] = useState(null);
  const [resolved, setResolved] = useState(false);

  // Cari produk toko dari data Firestore (reaktif). Kasih waktu sync dulu
  // sebelum nyatain "tidak ditemukan".
  useEffect(() => {
    if (dataProduct) {
      setResolved(true);
      return;
    }
    const found = storeProducts.find((p) => String(p.id) === String(id));
    if (found) {
      setStoreProduct(found);
      setResolved(true);
      return;
    }
    const t = setTimeout(() => setResolved(true), 1500);
    return () => clearTimeout(t);
  }, [id, dataProduct, storeProducts]);

  const product = dataProduct || storeProduct;

  if (!product) {
    if (!resolved) return null;
    return (
      <main className="pd-wrap">
        <div className="pd-empty">
          <h1>Produk tidak ditemukan</h1>
          <Link href="/produk" className="pd-btn-buy">
            ← Kembali ke Produk
          </Link>
        </div>
      </main>
    );
  }

  const stock = product.fromStore
    ? (product.stock || 0)
    : 15 + ((product.id * 7) % 40);
  const sold = product.fromStore ? 0 : 50 + ((product.id * 37) % 400);

  const rAvg = reviews.length
    ? reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length
    : null;
  const rating = rAvg
    ? rAvg.toFixed(1)
    : (4.6 + ((product.id * 3) % 5) / 10).toFixed(1);

  const desc =
    product.desc ||
    `${product.name} adalah ${product.cat.toLowerCase()} pilihan dari ${product.origin}. ` +
      `Diproses dengan standar kualitas terbaik untuk menjaga kesegaran, mutu, dan cita rasa hingga sampai ke tangan Anda. ` +
      `Cocok untuk kebutuhan harian maupun skala usaha.`;

  const canReview = orders.some(
    (o) =>
      isDone(o.status) &&
      (o.items || []).some(
        (it) => Number(it.id ?? it.productId ?? it.pid) === product.id
      )
  );
  const already =
    !!user &&
    reviews.some((r) => r.userId === user.uid || r.user === user.name);

  const addQty = () => {
    addToCart(product.id);
    if (qty > 1) changeQty(product.id, qty - 1);
  };

  const openBuyNow = () => {
    if (!isLoggedIn) {
      alert("Kamu harus punya akun & login dulu buat belanja ya.");
      openAuth("daftar");
      return;
    }
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    setSelectedAddrId(def ? def.id : null);
    setPayMethod("");
    setBuyOpen(true);
  };

  const subtotal = product.price * qty;
  const logistik = 15000;
  const totalBuy = subtotal + logistik;

  const confirmBuy = async () => {
    const addr = addresses.find((a) => a.id === selectedAddrId);
    if (!addr) {
      alert("Pilih atau tambahkan alamat pengiriman dulu ya.");
      return;
    }
    if (!payMethod) {
      alert("Pilih metode pembayaran dulu ya.");
      return;
    }
    const pay = findPayment(payMethod);
    try {
      await addOrder({
        items: [
          {
            id: product.id,
            name: product.name,
            qty,
            price: product.price,
            emoji: product.ph?.em || "coffee",
            sellerId: product.storeId || null,
            sellerName: product.origin || null,
          },
        ],
        subtotal,
        logistik,
        discount: 0,
        total: totalBuy,
        payment: { method: payMethod, label: pay ? pay.label : "-" },
        address: { name: addr.name, phone: addr.phone, detail: addr.detail },
        buyer: user?.name || "Pelanggan",
        buyerId: user.uid,
        buyerName: user?.name || "Pelanggan",
        buyerEmail: user?.email || null,
      });
      updateUser?.({ phone: addr.phone, address: addr.detail });
      setBuyOpen(false);
      router.push("/pesanan");
    } catch (err) {
      alert("Gagal membuat pesanan: " + (err?.message || err));
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rText.trim()) return;
    try {
      await addReview(product.id, {
        user: user?.name || "Pengguna",
        rating: rStar,
        text: rText.trim(),
      });
      setRText("");
      setRStar(5);
    } catch (err) {
      alert("Gagal mengirim ulasan: " + (err?.message || err));
    }
  };

  return (
    <main className="pd-wrap">
      <button className="pd-back" onClick={() => router.back()}>
        ← Kembali
      </button>
      <div className="pd-crumb"></div>

      <div className="pd-top">
        <div className="pd-gallery">
          <div className="pd-main-img">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="pd-ph" style={{ background: product.ph.c }}>
                <Icon name="coffee" size={40} />
              </div>
            )}
          </div>
        </div>

        <div className="pd-info">
          <span className="pd-badge">{product.cat}</span>
          <h1 className="pd-title">{product.name}</h1>
          <div className="pd-rate">
            <Stars value={Number(rating)} />
            <strong>{rating}</strong>
            <span className="pd-rate-count">({reviews.length} ulasan)</span>
            <span className="pd-sold">· {sold} terjual</span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price-now">{rp(product.price)}</span>
            <span className="pd-unit">{product.unit}</span>
            {product.old && (
              <span className="pd-price-old">{rp(product.old)}</span>
            )}
          </div>

          <div className="pd-qty-row">
            <span className="pd-qty-label">Jumlah</span>
            <div className="pd-qty">
              <button className="pd-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="pd-qty-val">{qty}</span>
              <button className="pd-qty-btn" onClick={() => setQty((q) => Math.min(stock, q + 1))}>+</button>
            </div>
            <span className="pd-stock">tersisa {stock} stok</span>
          </div>

          <div className="pd-actions">
            <button className="pd-btn-cart" onClick={addQty}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              Masukkan Keranjang
            </button>
            <button className="pd-btn-buy" onClick={openBuyNow}>
              Beli Sekarang
            </button>
          </div>

          <div className="pd-seller">
            <SellerCard product={product} />
          </div>
        </div>
      </div>

      <div className="pd-tabs">
        <button className={`pd-tab ${tab === "desc" ? "active" : ""}`} onClick={() => setTab("desc")}>Deskripsi</button>
        <button className={`pd-tab ${tab === "rev" ? "active" : ""}`} onClick={() => setTab("rev")}>Ulasan ({reviews.length})</button>
      </div>

      {tab === "desc" && (
        <div className="pd-panel">
          <p className="pd-desc">{desc}</p>
        </div>
      )}

      {tab === "rev" && (
        <div className="pd-panel">
          <div className="pd-rev-summary">
            <div className="pd-rev-big">{rating}</div>
            <div>
              <Stars value={Number(rating)} />
              <div className="pd-rev-count">{reviews.length} ulasan</div>
            </div>
          </div>

          {already ? (
            <div className="pd-note pd-note-ok">
              <Icon name="check-circle" size={16} /> Kamu sudah memberi ulasan untuk produk ini. Terima kasih!
            </div>
          ) : canReview ? (
            <form className="pd-form" onSubmit={submitReview}>
              <div className="pd-form-title">Tulis ulasanmu</div>
              <div className="pd-form-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} className={`pd-star ${s <= rStar ? "on" : ""}`} onClick={() => setRStar(s)} aria-label={`${s} bintang`}>★</button>
                ))}
              </div>
              <textarea className="pd-textarea" placeholder="Gimana kualitas produknya? Ceritain pengalamanmu..." value={rText} onChange={(e) => setRText(e.target.value)} rows={3} />
              <button type="submit" className="pd-submit">Kirim Ulasan</button>
            </form>
          ) : (
            <div className="pd-note pd-note-lock">
              <Icon name="lock" size={16} /> Ulasan cuma bisa ditulis pembeli yang pesanannya udah{" "}
              <strong>Selesai</strong>. Selesaikan pesananmu dulu ya!
            </div>
          )}

          <div className="pd-rev-list">
            {reviews.length === 0 ? (
              <div className="pd-empty-rev">Belum ada ulasan untuk produk ini.</div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="pd-rev-item">
                  <div className="pd-rev-head">
                    <span className="pd-rev-ava">{(r.user || "P")[0].toUpperCase()}</span>
                    <div>
                      <div className="pd-rev-user">
                        {r.user}{" "}
                        <span className="pd-verified"><Icon name="check" size={12} /> Pembelian Terverifikasi</span>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <span className="pd-rev-date">{r.date}</span>
                  </div>
                  <p className="pd-rev-text">{r.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===== Modal Beli Sekarang ===== */}
      {buyOpen && (
        <div className="buy-overlay" onClick={() => setBuyOpen(false)}>
          <div className="buy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="buy-head">
              <h2>Beli Sekarang</h2>
              <button className="buy-close" onClick={() => setBuyOpen(false)} aria-label="Tutup"><Icon name="x" size={18} /></button>
            </div>

            <div className="buy-prod">
              <div className="buy-prod-img">
                {product.image ? <img src={product.image} alt={product.name} /> : <Icon name="coffee" size={24} />}
              </div>
              <div className="buy-prod-info">
                <p className="buy-prod-name">{product.name}</p>
                <span className="buy-prod-meta">{qty} x {rp(product.price)}</span>
              </div>
              <span className="buy-prod-price">{rp(subtotal)}</span>
            </div>

            <div className="buy-section-title"><span><Icon name="map-pin" size={15} /> Alamat Pengiriman</span></div>
            <div className="buy-addrbook">
              <AddressBook
                selectedId={selectedAddrId}
                onSelect={setSelectedAddrId}
                defaultForm={{ name: user?.name || "", phone: user?.phone || "", detail: user?.address || "" }}
              />
            </div>

            <div className="buy-section-title"><span><Icon name="wallet" size={15} /> Metode Pembayaran</span></div>
            <div className="buy-pay-list">
              {PAYMENTS.map((p) => (
                <button key={p.id} className={`buy-pay${payMethod === p.id ? " active" : ""}`} onClick={() => setPayMethod(p.id)}>
                  <Icon name={p.icon} size={18} />
                  <span>{p.label}</span>
                  {payMethod === p.id && <span className="buy-pay-check"><Icon name="check" size={16} /></span>}
                </button>
              ))}
            </div>

            <div className="buy-total">
              <div className="buy-total-rows">
                <div>Subtotal: {rp(subtotal)}</div>
                <div>Ongkir: {rp(logistik)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12.5px", color: "#7b6a5c" }}>Total</div>
                <div className="buy-total-big">{rp(totalBuy)}</div>
              </div>
            </div>

            <button className="buy-pay-now" onClick={confirmBuy}>Bayar Sekarang</button>
          </div>
        </div>
      )}
    </main>
  );
}