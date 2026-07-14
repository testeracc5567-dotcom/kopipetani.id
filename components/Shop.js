"use client";

import { useMemo } from "react";
import { products } from "@/lib/data";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const { query, setQuery, sort, setSort, activeCat } = useShop();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = products.filter(
      (p) =>
        (activeCat === "Semua" || p.cat === activeCat) &&
        (p.name.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q))
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, sort, activeCat]);

  return (
    <section id="shop" style={{ paddingTop: 34 }}>
      <div className="wrap">
        <div className="head-row">
          <div>
            <span className="eyebrow">Pilihan Premium</span>
            <h2 className="sec-title" style={{ color: "var(--espresso)" }}>
              Produk Unggulan
            </h2>
          </div>
          <a className="view-all" href="#">
            Lihat Semua Koleksi →
          </a>
        </div>
        <div className="shop-controls">
          <div className="searchbig">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8A7F72"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4-4" />
            </svg>
            <input
              type="text"
              placeholder="Cari dalam kategori ini..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span className="count">
            Menampilkan {filtered.length} dari {products.length} produk
          </span>
          <select
            className="sortsel"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="rel">Urutkan: Relevansi</option>
            <option value="low">Harga Terendah</option>
            <option value="high">Harga Tertinggi</option>
          </select>
        </div>
        <div className="grid">
          {filtered.length ? (
            filtered.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="empty">Produk tidak ditemukan. Coba kata kunci lain.</div>
          )}
        </div>
      </div>
    </section>
  );
}
