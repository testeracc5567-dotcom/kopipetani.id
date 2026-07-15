"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { products, rp } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders, STATUS } from "@/lib/orders";
import { useProductReviews, addReview } from "@/lib/reviews";
import { getStoreProductById } from "@/lib/storeProducts";

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
  const { user } = useAuth();
  const orders = useOrders();
  const reviews = useProductReviews(id);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("desc");
  const [rStar, setRStar] = useState(5);
  const [rText, setRText] = useState("");

  // Kalau bukan produk bawaan, cari di produk toko (localStorage)
  const [storeProduct, setStoreProduct] = useState(null);
  const [resolved, setResolved] = useState(false);
  useEffect(() => {
    if (!dataProduct) setStoreProduct(getStoreProductById(id));
    setResolved(true);
  }, [id, dataProduct]);

  const product = dataProduct || storeProduct;

  if (!product) {
    // Masih ngecek localStorage → jangan buru-buru bilang "tidak ditemukan"
    if (!resolved) return null;
    return (
      <main className="pd-wrap">
        <div className="pd-empty">
          <h1>Produk tidak ditemukan 😕</h1>
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
  const already = !!user && reviews.some((r) => r.user === user.name);

  const addQty = () => {
    addToCart(product.id);
    if (qty > 1) changeQty(product.id, qty - 1);
  };

  const handleBuy = () => {
    addQty();
    router.push("/keranjang");
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!rText.trim()) return;
    addReview(product.id, {
      user: user?.name || "Pengguna",
      rating: rStar,
      text: rText.trim(),
    });
    setRText("");
    setRStar(5);
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
                <span>{product.ph.em}</span>
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
          <p className="pd-origin">📍 {product.origin}</p>
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
              <button
                className="pd-qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="pd-qty-val">{qty}</span>
              <button
                className="pd-qty-btn"
                onClick={() => setQty((q) => Math.min(stock, q + 1))}
              >
                +
              </button>
            </div>
            <span className="pd-stock">tersisa {stock} stok</span>
          </div>
          <div className="pd-actions">
            <button className="pd-btn-cart" onClick={addQty}>
              🛒 Masukkan Keranjang
            </button>
            <button className="pd-btn-buy" onClick={handleBuy}>
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
      <div className="pd-tabs">
        <button
          className={`pd-tab ${tab === "desc" ? "active" : ""}`}
          onClick={() => setTab("desc")}
        >
          Deskripsi
        </button>
        <button
          className={`pd-tab ${tab === "rev" ? "active" : ""}`}
          onClick={() => setTab("rev")}
        >
          Ulasan ({reviews.length})
        </button>
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
              ✅ Kamu sudah memberi ulasan untuk produk ini. Terima kasih!
            </div>
          ) : canReview ? (
            <form className="pd-form" onSubmit={submitReview}>
              <div className="pd-form-title">Tulis ulasanmu</div>
              <div className="pd-form-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`pd-star ${s <= rStar ? "on" : ""}`}
                    onClick={() => setRStar(s)}
                    aria-label={`${s} bintang`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="pd-textarea"
                placeholder="Gimana kualitas produknya? Ceritain pengalamanmu..."
                value={rText}
                onChange={(e) => setRText(e.target.value)}
                rows={3}
              />
              <button type="submit" className="pd-submit">
                Kirim Ulasan
              </button>
            </form>
          ) : (
            <div className="pd-note pd-note-lock">
              🔒 Ulasan cuma bisa ditulis pembeli yang pesanannya udah{" "}
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
                    <span className="pd-rev-ava">
                      {(r.user || "P")[0].toUpperCase()}
                    </span>
                    <div>
                      <div className="pd-rev-user">
                        {r.user}{" "}
                        <span className="pd-verified">✓ Pembelian Terverifikasi</span>
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
    </main>
  );
}