"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthModal() {
  const { authOpen, authTab, setAuthTab, closeAuth, showOk } = useUI();
  const { login, register } = useAuth();
  const router = useRouter();
  const isMasuk = authTab === "masuk";
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAuth]);

  if (!authOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const elements = e.target.elements;
    const email = elements.email.value;
    const name = isMasuk ? "Waguri" : elements.fullname?.value || "Waguri";

    if (isMasuk) {
      login({ name, email });
    } else {
      register({ name, email });
    }

    closeAuth();
    showOk(
      "Berhasil!",
      isMasuk
        ? "Selamat datang kembali di KopiPetani."
        : "Akun Anda berhasil dibuat. Selamat bergabung di KopiPetani!"
    );
    router.push("/profil");
  };

  const handleGoogle = () => {
    login({ name: "Waguri", email: "waguri@email.com" });
    closeAuth();
    showOk("Berhasil!", "Kamu masuk pakai akun Google.");
    router.push("/profil");
  };

  return (
    <div className="auth-overlay" onClick={closeAuth}>
      <div
        className={`auth-modal ${isMasuk ? "is-masuk" : "is-daftar"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-close" onClick={closeAuth} aria-label="Tutup">
          ×
        </button>

        <aside className="auth-side">
          {isMasuk ? (
            <div className="auth-side-inner">
              <div className="auth-brand">
                <span className="auth-brand-logo">☕</span>
                <span className="auth-brand-name">KopiPetani</span>
              </div>
              <p className="auth-side-tag">Platform kopi petani lokal terpercaya.</p>
              <p className="auth-side-desc">
                Belanja biji kopi terbaik langsung dari petani — mudah, aman, dan
                terjangkau, cuma di KopiPetani.
              </p>
              <ul className="auth-feats">
                <li>
                  <span className="auth-feat-ic">⚡</span> Proses checkout cepat &amp; mudah
                </li>
                <li>
                  <span className="auth-feat-ic">🛡️</span> Transaksi aman &amp; terpercaya
                </li>
                <li>
                  <span className="auth-feat-ic">🌱</span> Kopi berkualitas dari petani terbaik
                </li>
              </ul>
            </div>
          ) : (
            <div className="auth-side-inner">
              <span className="auth-side-eyebrow">DARI HULU KE CANGKIR</span>
              <h2 className="auth-side-title">
                Menghubungkan Petani Kopi dengan Penikmatnya.
              </h2>
            </div>
          )}
        </aside>

        <div className="auth-main">
          <h2 className="auth-title">
            {isMasuk ? "Selamat Datang Kembali" : "Buat Akun Baru"}
          </h2>
          <p className="auth-sub">
            {isMasuk
              ? "Masuk untuk melanjutkan ke KopiPetani dan temukan biji kopi terbaik."
              : "Bergabunglah dengan komunitas pecinta kopi Nusantara hari ini."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isMasuk && (
              <div className="auth-field">
                <label>Nama Lengkap</label>
                <input name="fullname" type="text" placeholder="Nama kamu" required />
              </div>
            )}

            <div className="auth-field">
              <label>{isMasuk ? "Email atau Username" : "Email"}</label>
              <input name="email" type="email" placeholder="nama@email.com" required />
            </div>

            {isMasuk ? (
              <div className="auth-field">
                <label>Password</label>
                <div className="auth-pass">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label="Lihat password"
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-row2">
                <div className="auth-field">
                  <label>Kata Sandi</label>
                  <input name="password" type="password" placeholder="••••••••" required />
                </div>
                <div className="auth-field">
                  <label>Konfirmasi</label>
                  <input name="confirm" type="password" placeholder="••••••••" required />
                </div>
              </div>
            )}

            {isMasuk ? (
              <div className="auth-inline">
                <label className="auth-check">
                  <input type="checkbox" /> Ingat saya
                </label>
                <a
                  href="#"
                  className="auth-forgot"
                  onClick={(e) => e.preventDefault()}
                >
                  Lupa Password?
                </a>
              </div>
            ) : (
              <label className="auth-check auth-check--full">
                <input type="checkbox" required /> Saya setuju dengan{" "}
                <b>Syarat &amp; Ketentuan</b> serta <b>Kebijakan Privasi</b> KopiPetani.
              </label>
            )}

            <button type="submit" className="auth-submit">
              {isMasuk ? "Masuk Sekarang" : "Daftar Sekarang"}
            </button>
          </form>

          <div className="auth-divider">
            <span>atau lanjut dengan</span>
          </div>

          <button type="button" className="auth-google" onClick={handleGoogle}>
            <span className="auth-google-g">G</span> Lanjut dengan Google
          </button>

          <p className="auth-switch">
            {isMasuk ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => setAuthTab(isMasuk ? "daftar" : "masuk")}
            >
              {isMasuk ? "Daftar" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}