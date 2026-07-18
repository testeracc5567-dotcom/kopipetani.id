"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function mapAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "Email ini udah terdaftar. Coba Masuk aja ya.";
  if (code.includes("invalid-email")) return "Format email-nya salah.";
  if (code.includes("weak-password")) return "Password minimal 6 karakter.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Email atau password salah.";
  if (code.includes("too-many-requests")) return "Kebanyakan percobaan. Tunggu sebentar ya.";
  return "Ada masalah, coba lagi ya.";
}

export default function AuthModal() {
  const { authOpen, authTab, setAuthTab, closeAuth, showOk } = useUI();
  const { login, register, resetPassword, loginWithGoogle } = useAuth();
  const router = useRouter();
  const isMasuk = authTab === "masuk";
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAuth]);

  // Reset pesan error & mode lupa-password tiap ganti tab
  useEffect(() => {
    setError("");
    setForgot(false);
    setResetSent(false);
  }, [authTab]);

  if (!authOpen) return null;

  const finishSuccess = (masuk) => {
    closeAuth();
    showOk(
      "Berhasil!",
      masuk
        ? "Selamat datang kembali di KopiPetani."
        : "Akun kamu berhasil dibuat. Selamat bergabung di KopiPetani!"
    );
    router.push("/profil");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const el = e.target.elements;
    const email = el.email.value.trim();
    const password = el.password.value;
    if (!isMasuk) {
      const name = el.fullname?.value?.trim();
      const confirm = el.confirm?.value;
      if (password.length < 6) { setError("Password minimal 6 karakter ya."); return; }
      if (password !== confirm) { setError("Konfirmasi password nggak sama."); return; }
      setBusy(true);
      try {
        await register({ name, email, password });
        finishSuccess(false);
      } catch (err) {
        setError(mapAuthError(err));
      }
      setBusy(false);
    } else {
      setBusy(true);
      try {
        await login({ email, password });
        finishSuccess(true);
      } catch (err) {
        setError(mapAuthError(err));
      }
      setBusy(false);
    }
  };

  // === RESET PASSWORD (Firebase) ===
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (typeof resetPassword !== "function") {
      setError("Fitur reset belum aktif. Update dulu file AuthContext.js ya.");
      return;
    }
    const email = e.target.elements.email.value.trim();
    if (!email) { setError("Isi email kamu dulu ya."); return; }
    setBusy(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("user-not-found")) setError("Email ini belum terdaftar. Daftar dulu yuk.");
      else if (code.includes("invalid-email")) setError("Format email-nya salah.");
      else setError(mapAuthError(err));
    }
    setBusy(false);
  };

  // === LOGIN DENGAN GOOGLE ===
  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      finishSuccess(true);
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
        setError("Login Google dibatalkan.");
      } else if (code.includes("popup-blocked")) {
        setError("Popup diblokir browser. Izinkan popup-nya lalu coba lagi.");
      } else if (code.includes("account-exists-with-different-credential")) {
        setError("Email ini sudah terdaftar dengan cara lain. Masuk pakai email & password ya.");
      } else if (code.includes("operation-not-allowed")) {
        setError("Google Sign-in belum diaktifkan di Firebase Console.");
      } else {
        setError("Gagal login dengan Google. Coba lagi ya.");
      }
      setBusy(false);
    }
  };

  const openForgot = (e) => {
    e.preventDefault();
    setError("");
    setResetSent(false);
    setForgot(true);
  };

  const backToLogin = () => {
    setForgot(false);
    setResetSent(false);
    setError("");
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
                <span className="auth-brand-logo" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
                    <path d="M16 9h2.2a2.4 2.4 0 0 1 0 4.8H16" />
                    <path d="M7 2.6c-.5.7-.5 1.5 0 2.2M10.5 2.6c-.5.7-.5 1.5 0 2.2M14 2.6c-.5.7-.5 1.5 0 2.2" />
                  </svg>
                </span>
                <span className="auth-brand-name">KopiPetani</span>
              </div>
              <p className="auth-side-tag">Platform kopi petani lokal terpercaya.</p>
              <p className="auth-side-desc">
                Belanja biji kopi terbaik langsung dari petani — mudah, aman, dan
                terjangkau, cuma di KopiPetani.
              </p>
              <ul className="auth-feats">
                <li>
                  <span className="auth-feat-ic" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </span> Proses checkout cepat &amp; mudah
                </li>
                <li>
                  <span className="auth-feat-ic" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span> Transaksi aman &amp; terpercaya
                </li>
                <li>
                  <span className="auth-feat-ic" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
                    </svg>
                  </span> Kopi berkualitas dari petani terbaik
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
          {forgot ? (
            <>
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-sub">
                Masukkan email akunmu. Kami akan kirim link untuk bikin password baru ke email itu.
              </p>
              {resetSent ? (
                <div className="auth-reset-done">
                  <p className="auth-sub">
                    ✅ Link reset udah dikirim! Cek <b>inbox</b> (atau folder <b>spam</b>) email kamu, lalu klik tautannya buat bikin password baru.
                  </p>
                  <button type="button" className="auth-submit" onClick={backToLogin} style={{ marginTop: 16 }}>
                    Kembali ke Masuk
                  </button>
                </div>
              ) : (
                <form className="auth-form" onSubmit={handleReset}>
                  <div className="auth-field">
                    <label>Email</label>
                    <input name="email" type="email" placeholder="nama@email.com" required />
                  </div>
                  {error && <div className="auth-error">{error}</div>}
                  <button type="submit" className="auth-submit" disabled={busy}>
                    {busy ? "Mengirim..." : "Kirim Link Reset"}
                  </button>
                </form>
              )}
              <p className="auth-switch">
                Ingat passwordmu?{" "}
                <button type="button" onClick={backToLogin}>
                  Kembali ke Masuk
                </button>
              </p>
            </>
          ) : (
            <>
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
                  <label>Email</label>
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
                    <a href="#" className="auth-forgot" onClick={openForgot}>
                      Lupa Password?
                    </a>
                  </div>
                ) : (
                  <label className="auth-check auth-check--full">
                    <input type="checkbox" required /> Saya setuju dengan{" "}
                    <b>Syarat &amp; Ketentuan</b> serta <b>Kebijakan Privasi</b> KopiPetani.
                  </label>
                )}
                {error && <div className="auth-error">{error}</div>}
                <button type="submit" className="auth-submit" disabled={busy}>
                  {busy ? "Memproses..." : isMasuk ? "Masuk Sekarang" : "Daftar Sekarang"}
                </button>
              </form>
              <div className="auth-divider">
                <span>atau lanjut dengan</span>
              </div>
              <button type="button" className="auth-google" onClick={handleGoogle} disabled={busy}>
                <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10, verticalAlign: "middle", flexShrink: 0 }} aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Lanjut dengan Google
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}