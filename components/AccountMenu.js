"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useRouter } from "next/navigation";

export default function AccountMenu() {
  const { isLoggedIn, user, logout } = useAuth();
  const { openAuth } = useUI();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!isLoggedIn) {
    return (
      <button className="acc-login" onClick={() => openAuth("masuk")}>
        <span className="acc-login-ic">👤</span> Masuk/Daftar
      </button>
    );
  }

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  const items = [
    { label: "Profil", href: "/profil", icon: "👤" },
    { label: "Transaksi Anda", href: "/pesanan", icon: "🧾" },
    { label: "Toko Anda", href: "/toko", icon: "🏪" },
    { label: "Member Loyalty", href: "/member", icon: "🏅" },
  ];

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="acc" ref={ref}>
      <button className="acc-btn" onClick={() => setOpen((o) => !o)}>
        <span className="acc-avatar">{initial}</span>
        <span className="acc-name">{user?.name || "Akun"}</span>
        <span className={`acc-caret ${open ? "up" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="acc-menu">
          <div className="acc-head">
            <span className="acc-avatar acc-avatar--lg">{initial}</span>
            <div>
              <p className="acc-head-name">{user?.name || "Pengguna"}</p>
              <p className="acc-head-email">{user?.email}</p>
            </div>
          </div>

          {items.map((it) => (
            <Link
              key={it.label}
              href={it.href}
              className="acc-item"
              onClick={() => setOpen(false)}
            >
              <span className="acc-item-ic">{it.icon}</span> {it.label}
            </Link>
          ))}

          <button className="acc-item acc-logout" onClick={handleLogout}>
            <span className="acc-item-ic">↩</span> Keluar
          </button>
        </div>
      )}
    </div>
  );
}