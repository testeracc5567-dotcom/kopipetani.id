"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/Icon";

const links = [
  { label: "Dashboard", href: "/profil", icon: "dashboard" },
  { label: "Pesanan Saya", href: "/pesanan", icon: "package" },
  { label: "Toko Anda", href: "/toko", icon: "store" },
  { label: "Pesanan Masuk", href: "/pesanan-toko", icon: "inbox" },
  { label: "Chat Pembeli", href: "/chat-toko", icon: "send" },
  { label: "Hadiah Member", href: "/member", icon: "gift" },
  { label: "Pengaturan Akun", href: "/profil", icon: "settings" },
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
          <p className="prf__sidebar-title">KopiPetani.id</p>
          <p className="prf__sidebar-sub">Kelola akun, toko, dan pesananmu di satu tempat.</p>
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
              <span className="prf__sidebar-link-icon">
                <Icon name={link.icon} size={18} />
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button className="prf__sidebar-logout" onClick={handleLogout}>
        <Icon name="logout" size={16} />
        Logout
      </button>
    </aside>
  );
}