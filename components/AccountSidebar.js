"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Dashboard", href: "/profil", icon: "📊" },
  { label: "Pesanan Saya", href: "/pesanan", icon: "📦" },
  { label: "Toko Anda", href: "/toko", icon: "🏪" },
  { label: "Hadiah Member", href: "/member", icon: "🎁" },
  { label: "Pengaturan Akun", href: "/profil", icon: "⚙️" },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="prf__sidebar">
      <div className="prf__sidebar-brand">
        <div>
          <p className="prf__sidebar-title">Jejak Kopi</p>
          <p className="prf__sidebar-sub">Sebuah jejak yang membantu kamu menjelajahi kopi.</p>
        </div>
      </div>
      <nav className="prf__sidebar-nav">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`prf__sidebar-link${active ? " active" : ""}`}
            >
              <span className="prf__sidebar-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button className="prf__sidebar-logout" onClick={handleLogout}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </aside>
  );
}