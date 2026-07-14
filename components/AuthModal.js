"use client";

import { useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthModal() {
  const { authOpen, authTab, setAuthTab, closeAuth, showOk } = useUI();
  const { login, register } = useAuth();
  const router = useRouter();
  const isMasuk = authTab === "masuk";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAuth]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const elements = e.target.elements;
    const email = elements.email.value;
    const name = isMasuk ? "Waguri" : (elements.fullname?.value || "Waguri");

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

  return (
    <div className={"modal" + (authOpen ? " open" : "")}> 
      <div className="mcardbox auth-modal">
        <button className="mclose" onClick={closeAuth} aria-label="Tutup">
          ×
        </button>

        <div className="auth-panel">
          <aside className="auth-side">
            <div className="auth-side-copy">
              <span className="eyebrow auth-eyebrow">Masa depan komoditas</span>
              <h2>Menghubungkan Bumi dengan Teknologi Finansial.</h2>
            </div>
          </aside>

          <section className="auth-form-card">
            <div className="auth-headline">
              <div>
                <p className="auth-label">{isMasuk ? "Masuk" : "Buat Akun Baru"}</p>
                <p className="auth-subtitle">
                  {isMasuk
                    ? "Masuk untuk melanjutkan ke KopiPetani dan temukan biji kopi terbaik."
                    : "Bergabunglah dengan ekosistem perdagangan komoditas terkini hari ini."}
                </p>
              </div>
              <div className="auth-tabs">
                <button
                  className={isMasuk ? "active" : ""}
                  onClick={() => setAuthTab("masuk")}
                  type="button"
                >
                  Masuk
                </button>
                <button
                  className={!isMasuk ? "active" : ""}
                  onClick={() => setAuthTab("daftar")}
                  type="button"
                >
                  Daftar
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isMasuk && (
                <div className="field">
                  <label>Nama Lengkap</label>
                  <input name="fullname" type="text" placeholder="John Doe" required />
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <input name="email" type="email" placeholder="nama@email.com" required />
              </div>

              <div className="field">
                <label>Kata Sandi</label>
                <input name="password" type="password" placeholder="••••••••" required />
              </div>

              {!isMasuk && (
                <div className="field">
                  <label>Konfirmasi Kata Sandi</label>
                  <input name="confirmPassword" type="password" placeholder="••••••••" required />
                </div>
              )}

              {!isMasuk && (
                <label className="checkbox-field">
                  <input type="checkbox" required />
                  <span>
                    Saya setuju dengan <strong>Syarat & Ketentuan</strong> serta <strong>Kebijakan Privasi</strong> KopiPetani.
                  </span>
                </label>
              )}

              <button className="btn auth-submit" type="submit">
                {isMasuk ? "Masuk" : "Daftar Sekarang"}
              </button>

              <div className="auth-social">
                <button className="social-btn" type="button">
                  Google
                </button>
                <button className="social-btn" type="button">
                  LinkedIn
                </button>
              </div>

              <p className="auth-bottom-text">
                {isMasuk ? "Belum punya akun? " : "Sudah punya akun? "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setAuthTab(isMasuk ? "daftar" : "masuk")}
                >
                  {isMasuk ? "Daftar" : "Masuk"}
                </button>
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

