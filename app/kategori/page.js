"use client";

import { useState } from "react";
import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useStoreProducts } from "@/lib/storeProducts";

const GROUPS = [
  {
    key: "A",
    label: "Sarana & Kebutuhan Tani",
    desc: "Semua kebutuhan dari hulu — bibit unggul, pupuk, hingga perlindungan tanaman.",
    cats: [
      { cat: "Bibit & Benih", em: "🌱", desc: "Bibit unggul & benih kopi siap tanam", open: true },
      { cat: "Pupuk", em: "🌿", desc: "Nutrisi organik & non-organik", open: false },
      { cat: "Pestisida", em: "🛡️", desc: "Perlindungan tanaman dari hama & penyakit", open: false },
    ],
  },
  {
    key: "B",
    label: "Hasil & Produk Kopi",
    desc: "Dari ceri segar hasil panen sampai kopi bubuk siap seduh.",
    cats: [
      { cat: "Ceri Kopi", em: "🍒", desc: "Buah kopi segar langsung dari kebun petani", open: true },
      { cat: "Green Bean", em: "🫘", desc: "Biji kopi mentah untuk di-roasting sendiri", open: false },
      { cat: "Roasted Bean", em: "🔥", desc: "Biji kopi sangrai siap giling", open: true },
      { cat: "Kopi Bubuk", em: "☕", desc: "Siap seduh — arabika, robusta & premium", open: true },
    ],
  },
];

// Samakan kategori toko -> kategori katalog
const CAT_MAP = {
  "Kopi Sangrai": "Roasted Bean",
  "Pupuk & Nutrisi": "Pupuk",
};

function Chevron({ open }) {
  return (
    <svg
      className={`kc-chevron ${open ? "up" : ""}`}
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function KategoriPage() {
  const storeProducts = useStoreProducts();
  // Normalisasi kategori produk toko biar masuk ke section yang cocok
  const normStore = storeProducts.map((p) => ({ ...p, cat: CAT_MAP[p.cat] || p.cat }));
  const allProducts = [...normStore, ...products];

  const groups = allProducts.reduce((acc, p) => {
    (acc[p.cat] = acc[p.cat] || []).push(p);
    return acc;
  }, {});

  // Kategori yang sudah punya section
  const knownCats = GROUPS.flatMap((g) => g.cats.map((c) => c.cat));
  // Produk toko yang kategorinya belum ada section-nya
  const leftoverStore = normStore.filter((p) => !knownCats.includes(p.cat));

  const [open, setOpen] = useState(() => {
    const init = {};
    GROUPS.forEach((g) => g.cats.forEach((c) => (init[c.cat] = c.open)));
    init["__mitra__"] = true;
    return init;
  });

  const toggle = (cat) => setOpen((o) => ({ ...o, [cat]: !o[cat] }));

  return (
    <main className="kat-page">
      <div className="kat-head">
        <span className="kat-eyebrow">KATEGORI</span>
        <h1 className="kat-title">Jelajahi Kategori Kopi Kami</h1>
        <p className="kat-sub">
          Pilih kopi dan perlengkapannya sesuai kebutuhan seduhmu — langsung
          dari petani lokal terbaik.
        </p>
      </div>

      {GROUPS.map((group) => (
        <div key={group.key} className="kc-group">
          <div className="kc-group-head">
            <span className="kc-group-tag">{group.key}</span>
            <div>
              <h2 className="kc-group-title">{group.label}</h2>
              <p className="kc-group-desc">{group.desc}</p>
            </div>
          </div>
          {group.cats.map((c) => {
            const items = groups[c.cat] || [];
            const isOpen = open[c.cat];
            return (
              <section key={c.cat} className="kc-sec">
                <button
                  className="kc-sec-head"
                  onClick={() => toggle(c.cat)}
                  aria-expanded={isOpen}
                >
                  <span className="kc-sec-em">{c.em}</span>
                  <span className="kc-sec-info">
                    <span className="kc-sec-title">{c.cat}</span>
                    <span className="kc-sec-desc">{c.desc}</span>
                  </span>
                  <span className="kc-sec-count">{items.length} produk</span>
                  <Chevron open={isOpen} />
                </button>
                {isOpen && (
                  <div className="kc-grid">
                    {items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ))}

      {leftoverStore.length > 0 && (
        <div className="kc-group">
          <div className="kc-group-head">
            <span className="kc-group-tag">★</span>
            <div>
              <h2 className="kc-group-title">Produk Mitra Lainnya</h2>
              <p className="kc-group-desc">Produk dari toko mitra KopiPetani.id</p>
            </div>
          </div>
          <section className="kc-sec">
            <button
              className="kc-sec-head"
              onClick={() => toggle("__mitra__")}
              aria-expanded={open["__mitra__"]}
            >
              <span className="kc-sec-em">🏪</span>
              <span className="kc-sec-info">
                <span className="kc-sec-title">Toko Mitra</span>
                <span className="kc-sec-desc">Produk lain dari penjual mitra</span>
              </span>
              <span className="kc-sec-count">{leftoverStore.length} produk</span>
              <Chevron open={open["__mitra__"]} />
            </button>
            {open["__mitra__"] && (
              <div className="kc-grid">
                {leftoverStore.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <section className="kc-edu">
        <div className="kc-edu-inner">
          <span className="kc-edu-tag">C · PENDUKUNG</span>
          <h2 className="kc-edu-title">Edukasi &amp; Artikel Tani</h2>
          <p className="kc-edu-desc">
            Panduan bertani kopi, tips pemupukan &amp; perawatan, sampai cara
            seduh terbaik biar hasil panenmu makin maksimal — semua ada di blog
            kami.
          </p>
          <Link href="/blog" className="kc-edu-btn">
            Baca Artikel Tani →
          </Link>
        </div>
        <div className="kc-edu-art">📚</div>
      </section>
    </main>
  );
}