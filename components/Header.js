"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { products, rp } from "@/lib/data";
import { getStoreProducts } from "@/lib/storeProducts";
import AccountMenu from "@/components/AccountMenu";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";

export default function Header() {
  const { count } = useCart();
  const { openAuth } = useUI();
  const { setQuery } = useShop();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [suggest, setSuggest] = useState([]);
  const [focused, setFocused] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // 🔴 dropdown chat
  const [hasStore, setHasStore] = useState(false);  // 🔴 punya toko atau nggak

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 🔴 Cek apakah user punya toko -> buat munculin "Chat Toko"
  useEffect(() => {
    const uid = user?.uid || auth.currentUser?.uid;
    if (!isLoggedIn || !uid) { setHasStore(false); return; }
    const ref = doc(db, "users", uid, "store", "main");
    const unsub = onSnapshot(ref, (snap) => setHasStore(snap.exists()), () => setHasStore(false));
    return () => unsub();
  }, [isLoggedIn, user?.uid]);

  // 🔴 Tutup dropdown chat tiap pindah halaman
  useEffect(() => { setChatOpen(false); }, [pathname]);

  // Nama & inisial akun yang sedang login (aman kalau field-nya kosong)
  const accountName =
    user?.displayName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "Akun Saya";
  const accountInitial = accountName.charAt(0).toUpperCase();

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

  const dropItem = {
    display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
    color: "#2d1107", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap",
  };

  return (
    <>
      <header className={`hdr${scrolled ? " hdr--scrolled" : ""}`}>
        <div className="hdr__wrap wrap">
          <div className="hdr__inner" key={pathname}>
            {/* Brand */}
            <Link href="/" className="hdr__brand">
              <Logo tone="dark" size={40} />
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

              {/* 🔴 Ikon chat + dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className="hdr__icon-btn"
                  aria-label="Chat"
                  onClick={() => setChatOpen((v) => !v)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 0 1-.9-3.9A8.38 8.38 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5z" />
                  </svg>
                </button>
                {chatOpen && (
                  <>
                    <div onClick={() => setChatOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                    <div
                      style={{
                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                        background: "#fff", border: "1px solid #eee3d7", borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 190, zIndex: 50, overflow: "hidden",
                      }}
                    >
                      <Link href="/chat" onClick={() => setChatOpen(false)} style={dropItem}>
                        <Icon name="user" size={16} /> Chat Saya
                      </Link>
                      {hasStore && (
                        <Link href="/chat-toko" onClick={() => setChatOpen(false)} style={{ ...dropItem, borderTop: "1px solid #f0e9e1" }}>
                          <Icon name="store" size={16} /> Chat Toko
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>

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
            <Logo tone="light" size={36} />
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
            Keranjang {count > 0 && <span className="hdr__badge">{count}</span>}
          </Link>
          <Link href="/chat" className="hdr__mob-cart" onClick={() => setMobileOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 0 1-.9-3.9A8.38 8.38 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5z" />
            </svg>
            Chat Saya
          </Link>
          {hasStore && (
            <Link href="/chat-toko" className="hdr__mob-cart" onClick={() => setMobileOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18M5 9l1-4h12l1 4M5 9v11h14V9" />
              </svg>
              Chat Toko
            </Link>
          )}
          {isLoggedIn ? (
            <Link href="/profil" className="hdr__mob-auth" onClick={() => setMobileOpen(false)}>
              <span className="hdr__mob-auth-avatar">{accountInitial}</span>
              {accountName}
            </Link>
          ) : (
            <button className="hdr__mob-auth" onClick={() => { openAuth(); setMobileOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>
    </>
  );
}