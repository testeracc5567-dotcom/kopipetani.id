"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { products, rp } from "@/lib/data";
import { getStoreProducts } from "@/lib/storeProducts";
import AccountMenu from "@/components/AccountMenu";

export default function Header() {
  const { count } = useCart();
  const { openAuth } = useUI();
  const { setQuery } = useShop();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [suggest, setSuggest] = useState([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Gabungan produk toko + produk bawaan untuk pencarian
  const allForSearch = () => {
    let store = [];
    try { store = getStoreProducts(); } catch (e) {}
    return [...store, ...products];
  };

  const runSuggest = (value) => {
    const q = value.trim().toLowerCase();
    if (!q) { setSuggest([]); return; }
    const matches = allForSearch()
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.cat || "").toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSuggest(matches);
  };

  const onSearchChange = (e) => {
    const v = e.target.value;
    setTerm(v);
    setQuery?.(v);
    runSuggest(v);
  };

  const submitSearch = (e) => {
    if (e) e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setFocused(false);
    setSuggest([]);
    router.push(`/cari?q=${encodeURIComponent(q)}`);
  };

  const closeSuggest = () => { setFocused(false); setSuggest([]); };

  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/produk", label: "Belanja" },
    { href: "/kategori", label: "Kategori" },
    { href: "/blog", label: "Blog" },
    { href: "/tentang-kami", label: "Tentang Kami" },
  ];

  return (
    <>
      <header className={`hdr${scrolled ? " hdr--scrolled" : ""}`}>
        <div className="hdr__wrap wrap">
          <div className="hdr__inner">
            {/* Brand */}
            <Link href="/" className="hdr__brand">
              <span className="hdr__logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <line x1="6" y1="2" x2="6" y2="4" />
                  <line x1="10" y1="2" x2="10" y2="4" />
                  <line x1="14" y1="2" x2="14" y2="4" />
                </svg>
              </span>
              <span className="hdr__name">
                <span className="hdr__name-kopi">Kopi</span>
                <span className="hdr__name-petani">Petani<span className="brand-id">.id</span></span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hdr__nav">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hdr__link">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hdr__actions">
              <form className="hdr__search" onSubmit={submitSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4-4" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={term}
                  onChange={onSearchChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                />
                {focused && term.trim() && (
                  <div className="hdr__search-drop">
                    {suggest.length === 0 ? (
                      <div className="hdr__search-empty">Nggak ada produk "{term}"</div>
                    ) : (
                      <>
                        {suggest.map((p) => (
                          <Link
                            key={p.id}
                            href={`/produk/${p.id}`}
                            className="hdr__search-item"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={closeSuggest}
                          >
                            <span className="hdr__search-item-img">
                              {p.image ? <img src={p.image} alt={p.name} /> : <span>{p.ph?.em || "☕"}</span>}
                            </span>
                            <span className="hdr__search-item-info">
                              <span className="hdr__search-item-name">{p.name}</span>
                              <span className="hdr__search-item-cat">{p.cat}</span>
                            </span>
                            <span className="hdr__search-item-price">{rp(p.price)}</span>
                          </Link>
                        ))}
                        <button type="submit" className="hdr__search-all">
                          Lihat semua hasil untuk "{term}" →
                        </button>
                      </>
                    )}
                  </div>
                )}
              </form>
              <Link href="/keranjang" className="hdr__icon-btn" aria-label="Keranjang">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6h15l-1.5 9h-12z" />
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="18" cy="20" r="1.4" />
                  <path d="M6 6 5 3H2" />
                </svg>
                {count > 0 && <span className="hdr__badge">{count}</span>}
              </Link>
              <AccountMenu />
            </div>

            {/* Hamburger */}
            <button
              className={`hdr__hamburger${mobileOpen ? " open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay & drawer */}
      <div
        className={`hdr__mob-overlay${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`hdr__mob-drawer${mobileOpen ? " open" : ""}`}>
        <div className="hdr__mob-head">
          <Link href="/" className="hdr__brand" onClick={() => setMobileOpen(false)}>
            <span className="hdr__logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            </span>
            <span className="hdr__name">
              <span className="hdr__name-kopi">Kopi</span>
              <span className="hdr__name-petani">Petani<span className="brand-id">.id</span></span>
            </span>
          </Link>
          <button className="hdr__mob-close" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">✕</button>
        </div>
        <form
          className="hdr__mob-search"
          onSubmit={(e) => { submitSearch(e); setMobileOpen(false); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4-4" />
          </svg>
          <input
            type="text"
            placeholder="Cari produk..."
            value={term}
            onChange={onSearchChange}
          />
        </form>
        <nav className="hdr__mob-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hdr__mob-link" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hdr__mob-actions">
          <Link href="/keranjang" className="hdr__mob-cart" onClick={() => setMobileOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M6 6 5 3H2" />
            </svg>
            Keranjang
            {count > 0 && <span className="hdr__badge">{count}</span>}
          </Link>
          {isLoggedIn ? (
            <Link href="/profil" className="hdr__mob-auth" onClick={() => setMobileOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              Akun Saya
            </Link>
          ) : (
            <button className="hdr__mob-auth" onClick={() => { openAuth(); setMobileOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              Masuk/Daftar
            </button>
          )}
        </div>
      </div>
    </>
  );
}