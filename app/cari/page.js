"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useStoreProducts } from "@/lib/storeProducts";

function CariContent() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim();
  const storeProducts = useStoreProducts();
  const all = [...storeProducts, ...products];

  const ql = q.toLowerCase();
  const results = q
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(ql) ||
          (p.cat || "").toLowerCase().includes(ql) ||
          (p.origin || "").toLowerCase().includes(ql)
      )
    : [];

  return (
    <main className="page-section">
      <div className="wrap">
        <div className="page-head">
          <p className="eyebrow">Pencarian</p>
          <h1>{q ? `Hasil untuk "${q}"` : "Cari Produk"}</h1>
          <p className="page-intro">
            {q
              ? `Ditemukan ${results.length} produk.`
              : "Ketik sesuatu di kolom pencarian untuk mencari produk."}
          </p>
        </div>
        {q && results.length === 0 ? (
          <div className="cari-empty">
            <span className="cari-empty-em">🔍</span>
            <h3>Produk nggak ditemukan</h3>
            <p>Coba kata kunci lain, atau lihat semua produk kami.</p>
            <Link href="/produk" className="btn btn-caramel">Lihat Semua Produk</Link>
          </div>
        ) : (
          <div className="grid grid-full">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CariPage() {
  return (
    <Suspense fallback={<main className="page-section"><div className="wrap"><p>Memuat pencarian...</p></div></main>}>
      <CariContent />
    </Suspense>
  );
}