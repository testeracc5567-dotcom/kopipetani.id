"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useOrders, STATUS } from "@/lib/orders";
import { getReviews } from "@/lib/reviews";
import Icon from "@/components/Icon";
import { VOUCHERS } from "@/lib/vouchers";
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

// Tier disamakan persis dengan halaman Hadiah Member (/member)
const TIERS = [
  { name: "Member Baru", min: 0 },
  { name: "Bronze", min: 15000 },
  { name: "Silver", min: 30000 },
  { name: "Gold", min: 666666 },
];

// Ambil inisial dari nama untuk avatar default (mis. "Awok Awok" -> "AA")
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

const sidebarLinks = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "pesanan", label: "Pesanan Saya", icon: "package", href: "/pesanan" },
  { key: "toko", label: "Toko Anda", icon: "store", href: "/toko" },
  { key: "hadiah", label: "Hadiah Member", icon: "gift", href: "/member" },
  { key: "pengaturan", label: "Pengaturan Akun", icon: "settings" },
];

export default function ProfilPage() {
  const { user, isLoggedIn, isLoading, logout, updateUser } = useAuth();
  const orders = useOrders();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTiers, setShowTiers] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  // State untuk ubah kata sandi
  const [pwMode, setPwMode] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);

  // Hitung jumlah ulasan yang diberikan akun ini (dari lib/reviews)
  useEffect(() => {
    const raw = getReviews();
    const all = Array.isArray(raw) ? raw : Object.values(raw || {}).flat();
    const count = all.filter(
      (r) => r && (r.user === user?.name || r.user === user?.email)
    ).length;
    setReviewCount(count);
  }, [user?.name, user?.email]);

  // Buka langsung tampilan "Level Member" kalau datang dari tombol Lihat Level Lainnya (?tiers=1)
useEffect(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tiers") === "1") setShowTiers(true);
  }
}, []);

  if (isLoading) {
    return (
      <main className="prf-loading">
        <div className="prf-spinner" />
        <p>Memuat profil...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="prf-guest">
        <div className="prf-guest-card">
          <span className="prf-guest-icon">
            <Icon name="lock" size={44} strokeWidth={1.6} />
          </span>
          <h2>Anda belum masuk</h2>
          <p>Silakan masuk atau daftar terlebih dahulu untuk mengakses profil Anda.</p>
          <Link href="/" className="btn btn-caramel">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  // Tier dihitung dari poin (sama seperti /member)
  const points = user?.points ?? 0;
  let curTier = TIERS[0];
  let nextTier = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) {
      curTier = TIERS[i];
      nextTier = TIERS[i + 1] || null;
    }
  }
  const progress = nextTier
    ? Math.min(100, Math.round(((points - curTier.min) / (nextTier.min - curTier.min)) * 100))
    : 100;
  const tierLabel = curTier.name === "Member Baru" ? "Member Baru" : `${curTier.name} Member`;

  // Total pesanan = pesanan berstatus Selesai milik akun ini
  const myKey = user?.email || user?.name || null;
  const doneCount = orders.filter((o) => {
    const oKey = o.buyerId || o.buyer || null;
    return myKey && oKey && oKey === myKey && o.status === STATUS.DONE;
  }).length;

  const startEdit = () => {
    setEditForm({ name: user.name, email: user.email, phone: user.phone || "" });
    setEditMode(true);
  };

  const saveEdit = async () => {
    const { email, ...rest } = editForm; // email tidak diubah (dikelola akun login)
    await updateUser(rest);
    setEditMode(false);
  };

  // Upload / hapus foto profil
  const onAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateUser({ avatar: reader.result });
    reader.readAsDataURL(file);
  };
  const removeAvatar = () => updateUser({ avatar: null });

  // Ubah kata sandi (Firebase Auth)
  const savePassword = async () => {
    const oldPw = pwForm.old;
    const newPw = pwForm.new;
    const confirmPw = pwForm.confirm;
    if (newPw.length < 6) {
      setPwMsg({ type: "error", text: "Kata sandi baru minimal 6 karakter." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    try {
      const current = auth.currentUser;
      // Verifikasi sandi lama dulu
      const cred = EmailAuthProvider.credential(current.email, oldPw);
      await reauthenticateWithCredential(current, cred);
      // Ganti sandi baru di server
      await updatePassword(current, newPw);
      setPwForm({ old: "", new: "", confirm: "" });
      setPwMode(false);
      setPwMsg({ type: "ok", text: "Kata sandi berhasil diubah!" });
    } catch (err) {
      let text = "Gagal mengubah kata sandi.";
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        text = "Kata sandi lama salah.";
      } else if (err?.code === "auth/too-many-requests") {
        text = "Terlalu banyak percobaan. Coba lagi nanti.";
      } else if (err?.code === "auth/requires-recent-login") {
        text = "Sesi terlalu lama. Logout lalu login lagi, baru ubah sandi.";
      }
      setPwMsg({ type: "error", text });
    }
  };

  // Avatar: pakai foto kalau ada, kalau nggak tampilkan inisial nama
  const renderAvatar = () =>
    user.avatar ? (
      <img src={user.avatar} alt={user.name} className="prf__avatar-img" />
    ) : (
      getInitials(user.name)
    );

  return (
    <main className="prf">
      <div className="prf__layout wrap">
        {/* Sidebar */}
        <aside className="prf__sidebar">
          <div className="prf__sidebar-brand">
            <div>
              <p className="prf__sidebar-title">Jejak Kopi</p>
              <p className="prf__sidebar-sub">Sebuah jejak yang membantu kamu menjelajahi kopi.</p>
            </div>
          </div>
          <nav className="prf__sidebar-nav">
            {sidebarLinks.map((link) => (
              <button
                key={link.key}
                className={`prf__sidebar-link${activeTab === link.key ? " active" : ""}`}
                onClick={() => {
                  if (link.href) { window.location.href = link.href; return; }
                  setActiveTab(link.key);
                  setShowTiers(false);
                }}
              >
                <span className="prf__sidebar-link-icon">
                  <Icon name={link.icon} size={18} />
                </span>
                {link.label}
              </button>
            ))}
          </nav>
          <button className="prf__sidebar-logout" onClick={logout}>
            <Icon name="logout" size={16} />
            Logout
          </button>
        </aside>
        {/* Main Content */}
        <div className="prf__main">
          {showTiers ? (
            /* Member Tiers View */
            <div className="prf__tiers">
              <h2 className="prf__section-title prf__section-title--centered">Tahap Level Member</h2>
              <div className="prf__tiers-grid">
                {/* Bronze Member Card */}
                <div className={`prf__tier-card${curTier.name === "Bronze" ? " active" : ""}`}>
                  <div className="prf__tier-badge-icon">
                    <Icon name="award" size={36} />
                  </div>
                  <h3 className="prf__tier-name">Bronze Member</h3>
                  <p className="prf__tier-label">Benefit:</p>
                  <ul className="prf__tier-benefits">
                    <li>Mendapatkan 1 voucher diskon 12% jika belanja 10x dalam waktu sebulan.</li>
                    <li>Bonus poin kelipatan 10%</li>
                  </ul>
                </div>
                {/* Silver Member Card */}
                <div className={`prf__tier-card${curTier.name === "Silver" ? " active" : ""}`}>
                  <div className="prf__tier-badge-icon">
                    <Icon name="award" size={36} />
                  </div>
                  <h3 className="prf__tier-name">Silver Member</h3>
                  <p className="prf__tier-label">Benefit:</p>
                  <ul className="prf__tier-benefits">
                    <li>Mendapatkan 2 voucher diskon 20% jika belanja 20x dalam waktu sebulan.</li>
                    <li>Bonus poin kelipatan level member +20%</li>
                    <li>Dapatkan Promo Spesial tiap bulannya</li>
                  </ul>
                </div>
                {/* Gold Member Card */}
                <div className={`prf__tier-card${curTier.name === "Gold" ? " active" : ""}`}>
                  <div className="prf__tier-badge-icon">
                    <Icon name="award" size={36} />
                  </div>
                  <h3 className="prf__tier-name">Gold Member</h3>
                  <p className="prf__tier-label">Benefit:</p>
                  <ul className="prf__tier-benefits">
                    <li>Mendapatkan 3 voucher diskon 35% jika belanja 30x dalam waktu sebulan.</li>
                    <li>Bonus poin kelipatan level member +30%</li>
                    <li>Dapatkan Promo Spesial tiap minggunya</li>
                    <li>Spesial diskon ulang tahun</li>
                  </ul>
                </div>
              </div>
              <div className="prf__tier-actions">
                <button className="btn prf__tier-back-btn" onClick={() => setShowTiers(false)}>
                  Kembali
                </button>
              </div>
            </div>
          ) : activeTab === "dashboard" ? (
            /* Dashboard View */
            <>
              <h2 className="prf__section-title">Dashboard</h2>
              {/* User profile card */}
              <div className="prf__user-card">
                <div className="prf__user-info">
                  <div className="prf__avatar">
                    {renderAvatar()}
                  </div>
                  <div className="prf__user-details">
                    <h3 className="prf__user-name">{user.name}</h3>
                    <span className="prf__user-badge">{tierLabel}</span>
                  </div>
                </div>
                <button className="btn prf__edit-btn" onClick={startEdit}>
                  <Icon name="edit" size={14} />
                  Edit Profil
                </button>
              </div>
              {/* Edit form */}
              {editMode && (
                <div className="prf__edit-form">
                  <h3>Edit Profil</h3>
                  <div className="prf__edit-fields">
                    <div className="prf__edit-field">
                      <label>Nama Lengkap</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="prf__edit-field">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        disabled
                        title="Email tidak bisa diubah"
                        style={{ background: "#f4ece2", cursor: "not-allowed", opacity: 0.7 }}
                      />
                      <small style={{ color: "#7b6a5c", fontSize: "12px" }}>
                        Email tidak bisa diubah (terhubung ke akun login).
                      </small>
                    </div>
                    <div className="prf__edit-field">
                      <label>Telepon</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="prf__edit-actions">
                    <button className="btn btn-caramel" onClick={saveEdit}>Simpan</button>
                    <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Batal</button>
                  </div>
                </div>
              )}
              {/* Points card */}
              <div className="prf__points-card">
                <div className="prf__points-left">
                  <div className="prf__points-title">
                    <Icon name="coins" size={20} /> Poin Kopi
                  </div>
                  <p className="prf__points-value">
                    {user.points.toLocaleString("id-ID")}
                    <span> Poin</span>
                  </p>
                  <p className="prf__points-sub">
  Anda dapat menukarkan {VOUCHERS.filter((v) => points >= v.cost).length} hadiah!
</p>
                  <Link href="/member" className="btn prf__points-btn">
  Tukar Poin
</Link>
                </div>
                <div className="prf__points-right">
                  <div className="prf__exp-box">
                    <div className="prf__exp-header">
                      <span className="prf__exp-medal">
                        <Icon name="award" size={18} />
                      </span>
                      <span className="prf__exp-title">{curTier.name}</span>
                    </div>
                    <p className="prf__exp-text">
                      {nextTier
                        ? `Tingkatkan ${(nextTier.min - points).toLocaleString("id-ID")} exp untuk naik ke level ${nextTier.name}.`
                        : "Kamu sudah di level tertinggi!"}
                    </p>
                    <div className="prf__progress-bar">
                      <div className="prf__progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <button className="prf__level-link" onClick={() => setShowTiers(true)}>
                      Lihat Level Lainnya
                    </button>
                  </div>
                </div>
              </div>
              {/* Quick stats */}
              <div className="prf__stats">
                <div className="prf__stat">
                  <span className="prf__stat-icon">
                    <Icon name="package" size={24} />
                  </span>
                  <div>
                    <p className="prf__stat-value">{doneCount}</p>
                    <p className="prf__stat-label">Total Pesanan</p>
                  </div>
                </div>
                <div className="prf__stat">
                  <span className="prf__stat-icon">
                    <Icon name="star" size={24} />
                  </span>
                  <div>
                    <p className="prf__stat-value">{reviewCount}</p>
                    <p className="prf__stat-label">Ulasan Diberikan</p>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "pesanan" ? (
            /* Pesanan View */
            <>
              <h2 className="prf__section-title">Pesanan Saya</h2>
              <div className="prf__empty-state">
                <span className="prf__empty-icon">
                  <Icon name="package" size={40} strokeWidth={1.6} />
                </span>
                <h3>Belum ada pesanan</h3>
                <p>Anda belum memiliki riwayat pesanan. Mulai belanja sekarang!</p>
                <Link href="/produk" className="btn btn-caramel">
                  Belanja Sekarang
                </Link>
              </div>
            </>
          ) : (
            /* Pengaturan View */
            <>
              <h2 className="prf__section-title">Pengaturan Akun</h2>
              <div className="prf__settings">
                {/* Foto Profil */}
                <div className="prf__setting-group">
                  <h4>Foto Profil</h4>
                  <div className="prf__avatar-setting">
                    <div className="prf__avatar prf__avatar--sm">
                      {renderAvatar()}
                    </div>
                    <div className="prf__avatar-setting-actions">
                      <label className="btn btn-caramel prf__avatar-upload-btn">
                        <Icon name="edit" size={15} /> {user.avatar ? "Ganti Foto" : "Upload Foto"}
                        <input type="file" accept="image/*" onChange={onAvatarUpload} hidden />
                      </label>
                      {user.avatar && (
                        <button className="btn btn-ghost" onClick={removeAvatar}>Hapus Foto</button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="prf__setting-group">
                  <h4>Informasi Pribadi</h4>
                  <div className="prf__setting-row">
                    <span className="prf__setting-label">Nama</span>
                    <span className="prf__setting-value">{user.name}</span>
                  </div>
                  <div className="prf__setting-row">
                    <span className="prf__setting-label">Email</span>
                    <span className="prf__setting-value">{user.email}</span>
                  </div>
                  <div className="prf__setting-row">
                    <span className="prf__setting-label">Telepon</span>
                    <span className="prf__setting-value">{user.phone || "-"}</span>
                  </div>
                  <button className="btn btn-ghost" onClick={() => { setActiveTab("dashboard"); startEdit(); }}>
                    Edit Informasi
                  </button>
                </div>
                <div className="prf__setting-group">
                  <h4>Keamanan</h4>
                  <div className="prf__setting-row">
                    <span className="prf__setting-label">Kata Sandi</span>
                    <span className="prf__setting-value">••••••••</span>
                  </div>
                  {!pwMode ? (
                    <button className="btn btn-ghost" onClick={() => { setPwMode(true); setPwMsg(null); }}>
                      Ubah Kata Sandi
                    </button>
                  ) : (
                    <div className="prf__pw-form">
                      <div className="prf__edit-field">
                        <label>Kata Sandi Lama</label>
                        <input
                          type="password"
                          value={pwForm.old}
                          onChange={(e) => setPwForm({ ...pwForm, old: e.target.value })}
                          placeholder="Masukkan sandi lama"
                        />
                      </div>
                      <div className="prf__edit-field">
                        <label>Kata Sandi Baru</label>
                        <input
                          type="password"
                          value={pwForm.new}
                          onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                      <div className="prf__edit-field">
                        <label>Konfirmasi Kata Sandi Baru</label>
                        <input
                          type="password"
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                          placeholder="Ulangi sandi baru"
                        />
                      </div>
                      <div className="prf__edit-actions">
                        <button className="btn btn-caramel" onClick={savePassword}>Simpan Sandi</button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => { setPwMode(false); setPwMsg(null); setPwForm({ old: "", new: "", confirm: "" }); }}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                  {pwMsg && <p className={`prf__pw-msg ${pwMsg.type}`}>{pwMsg.text}</p>}
                </div>
                <div className="prf__setting-group prf__setting-danger">
                  <h4>Zona Berbahaya</h4>
                  <p>Tindakan ini tidak dapat dikembalikan.</p>
                  <button className="btn prf__delete-btn" onClick={logout}>
                    Hapus Akun
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}