"use client";

import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useStoreProducts } from "@/lib/storeProducts";

export default function ProdukPage() {
  const storeProducts = useStoreProducts();
  // Produk toko ditaruh paling depan biar keliatan
  const all = [...storeProducts, ...products];

  return (
    <main className="page-section">
      <div className="wrap">
        <div className="page-head">
          <p className="eyebrow">Produk</p>
          <h1>Koleksi Produk KopiPetani</h1>
          <p className="page-intro">
            Lihat semua produk kopi dan perlengkapan yang tersedia untuk pemesanan.
          </p>
        </div>
        <div className="grid grid-full">
          {all.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}