"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, posts, popularPosts } from "@/lib/blogData";

export default function BlogPage() {
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terbaru");

  const filteredPosts = posts.filter(
    (post) => selectedCat === "Semua" || post.cat === selectedCat
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "Terbaru") {
      return b.id - a.id;
    } else if (sortBy === "Terpopuler") {
      return b.views - a.views;
    }
    return 0;
  });

  return (
    <main className="blg">
      <div className="wrap">
        {/* Category Filters & Sorting Dropdown */}
        <div className="blg__filter-bar">
          <div className="blg__filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`blg__filter-btn${selectedCat === cat ? " active" : ""}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="blg__sort">
            <span>Urutan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="blg__sort-select"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terpopuler">Terpopuler</option>
            </select>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="blg__layout">
          {/* Left Column: Post List */}
          <div className="blg__posts">
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post) => (
                <article key={post.id} className="blg__card">
                  <div className="blg__card-imgwrap">
                    <Link href={`/blog/${post.id}`}>
                      <div className="blg__ph" style={{ background: post.ph.c }}>
                        <span className="blg__ph-em">{post.ph.em}</span>
                        <small className="blg__ph-cat">{post.cat}</small>
                      </div>
                    </Link>
                  </div>
                  <div className="blg__card-body">
                    <div className="blg__card-meta">
                      <span className="blg__card-cat">{post.cat}</span>
                      <span className="blg__card-dot">•</span>
                      <span>{post.date}</span>
                      <span className="blg__card-dot">•</span>
                      <span>{post.author}</span>
                    </div>
                    <h2 className="blg__card-title">
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </h2>
                    <p className="blg__card-excerpt">{post.excerpt}</p>
                    <Link href={`/blog/${post.id}`} className="blg__card-link">
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="blg__no-results">
                <h3>Belum ada artikel</h3>
                <p>Tidak ada artikel yang cocok dengan kategori yang dipilih.</p>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <aside className="blg__sidebar">
            {/* Widget: Artikel Populer */}
            <div className="blg__widget">
              <h3 className="blg__widget-title">
                <span className="blg__widget-title-icon">📈</span> Artikel Populer
              </h3>
              <div className="blg__popular-list">
                {popularPosts.map((pop) => (
                  <div key={pop.rank} className="blg__popular-item">
                    <div className="blg__popular-rank">{pop.rank}</div>
                    <div className="blg__popular-detail">
                      <h4 className="blg__popular-title">
                        <Link href={`/blog/${pop.id}`}>{pop.title}</Link>
                      </h4>
                      <p className="blg__popular-views">{pop.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget: Promo Banner */}
            <div className="blg__promo-banner">
              <h3 className="blg__promo-title">Gunakan Bibit Kopi Unggul</h3>
              <p className="blg__promo-text">
                Dapatkan diskon 20% untuk pembelian pertama sarana tani di Marketplace kami.
              </p>
              <Link href="/produk" className="btn blg__promo-btn">
                Cek Toko Sekarang
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
