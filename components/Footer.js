import Link from "next/link";

export default function Footer() {
  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/kategori", label: "Kategori" },
    { href: "/produk", label: "Produk" },
    { href: "/blog", label: "Blog" },
    { href: "/tentang-kami", label: "Tentang Kami" },
  ];

  const supportLinks = [
    "Kebijakan Privasi",
    "Syarat & Ketentuan",
    "Hubungi Kami",
  ];

  return (
    <footer className="ftr">
      <div className="wrap">
        {/* Main footer content */}
        <div className="ftr__grid">
          {/* Brand column */}
          <div className="ftr__brand-col">
            <div className="ftr__brand">
              <span className="ftr__logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                  <line x1="6" y1="2" x2="6" y2="4"/>
                  <line x1="10" y1="2" x2="10" y2="4"/>
                  <line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
              </span>
              <div>
                <p className="ftr__title">KopiPetani<span className="brand-id">.id</span></p>
                <p className="ftr__tagline">Dari Hulu ke Cangkir</p>
              </div>
            </div>
            <p className="ftr__desc">
              Menghargai setiap proses, memberdayakan setiap petani lokal dengan kualitas kopi artisanal terbaik dari seluruh Nusantara.
            </p>
            <div className="ftr__socials">
              <a href="#" className="ftr__social" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" className="ftr__social" aria-label="Twitter/X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4l16 16M20 4L4 20" />
                </svg>
              </a>
              <a href="#" className="ftr__social" aria-label="Email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="m2 7 10 6 10-6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation column */}
          <div className="ftr__col">
            <h4 className="ftr__col-title">Navigasi</h4>
            <div className="ftr__links">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="ftr__link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support column */}
          <div className="ftr__col">
            <h4 className="ftr__col-title">Dukungan</h4>
            <div className="ftr__links">
              {supportLinks.map((item) => (
                <a key={item} href="#" className="ftr__link">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Contact column */}
          <div className="ftr__col">
            <h4 className="ftr__col-title">Kontak</h4>
            <div className="ftr__contact-items">
              <div className="ftr__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Jl. Blang Pulo No.666, Kec. Muara Satu, Kota Lhokseumawe, Aceh, Indonesia.</span>
              </div>
              <div className="ftr__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="m2 7 10 6 10-6" />
                </svg>
                <span>kopipetaniid666@gmail.com</span>
              </div>
              <div className="ftr__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+628994598599</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ftr__bottom">
          <p className="ftr__copyright">© {new Date().getFullYear()} KopiPetani.id. Seluruh hak dilindungi.</p>
          <div className="ftr__bottom-links">
            <a href="#">Privasi</a>
            <span className="ftr__dot">·</span>
            <a href="#">Syarat</a>
            <span className="ftr__dot">·</span>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}