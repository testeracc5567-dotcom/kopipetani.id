import Link from "next/link";
import Logo from "@/components/Logo";

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
              <Logo tone="dark" size={40} />
            </div>
            <p className="ftr__tagline">Dari Hulu ke Cangkir</p>
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
              <a href="#" className="ftr__social" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="ftr__social" aria-label="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
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