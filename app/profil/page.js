"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// Beautiful SVG Anime Girl Avatar matching the Waguri character design
function WaguriAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="prf__avatar-svg" style={{ width: "100%", height: "100%", borderRadius: "50%" }}>
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="#E8DCD1" />
      
      {/* Soft shadow under neck */}
      <path d="M40 70 L60 70 L55 58 L45 58 Z" fill="#D3C0B0" />
      
      {/* Neck */}
      <rect x="44" y="55" width="12" height="15" fill="#FFE2D1" />
      
      {/* Skin Face */}
      <circle cx="50" cy="45" r="22" fill="#FFE2D1" />
      
      {/* Blush on cheeks */}
      <circle cx="36" cy="49" r="3" fill="#FFA5A5" opacity="0.6" />
      <circle cx="64" cy="49" r="3" fill="#FFA5A5" opacity="0.6" />
      
      {/* Anime Eyes */}
      {/* Left eye */}
      <ellipse cx="40" cy="44" rx="4" ry="6" fill="#4B3B63" />
      <ellipse cx="39" cy="42" rx="1.5" ry="2.5" fill="#FFFFFF" />
      {/* Right eye */}
      <ellipse cx="60" cy="44" rx="4" ry="6" fill="#4B3B63" />
      <ellipse cx="59" cy="42" rx="1.5" ry="2.5" fill="#FFFFFF" />
      {/* Eyebrows */}
      <path d="M35 37 Q40 35 44 37" stroke="#3D291C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M56 37 Q60 35 65 37" stroke="#3D291C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      
      {/* Smiling Mouth */}
      <path d="M47 50 Q50 53 53 50" stroke="#E07A5F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      
      {/* Clothes */}
      <path d="M22 85 C32 72, 68 72, 78 85 L78 100 L22 100 Z" fill="#422E22" />
      <path d="M44 70 L50 78 L56 70 Z" fill="#FFE2D1" /> {/* V-neck opening */}
      
      {/* Hair (Short dark-blue/purple anime hair with bangs and cute locks) */}
      {/* Back hair */}
      <path d="M25 50 C20 30, 80 30, 75 50 C75 60, 78 70, 78 75 C70 70, 30 70, 22 75 C22 70, 25 60, 25 50 Z" fill="#3D405B" />
      {/* Bangs */}
      <path d="M28 40 C35 30, 42 34, 45 42 C45 42, 50 30, 55 42 C58 34, 65 30, 72 40 C75 45, 76 52, 76 55 C70 50, 68 45, 66 48 C63 42, 58 45, 57 48 C54 42, 46 45, 43 48 C42 45, 38 50, 30 55 C24 52, 28 45, 28 40 Z" fill="#474A6B" />
      {/* Side locks */}
      <path d="M25 45 C23 55, 25 68, 28 72 C30 68, 29 55, 29 45 Z" fill="#3D405B" />
      {/* Right side lock */}
      <path d="M75 45 C77 55, 75 68, 72 72 C70 68, 71 55, 71 45 Z" fill="#3D405B" />
      {/* Hair Highlight */}
      <path d="M35 32 C45 28, 55 28, 65 32 C60 30, 40 30, 35 32 Z" fill="#8185A8" opacity="0.6" />
    </svg>
  );
}

const sidebarLinks = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "pesanan", label: "Pesanan Saya", icon: "📦" },
  { key: "hadiah", label: "Hadiah Member", icon: "🎁" },
  { key: "pengaturan", label: "Pengaturan Akun", icon: "⚙️" },
];

export default function ProfilPage() {
  const { user, isLoggedIn, isLoading, logout, memberInfo, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTiers, setShowTiers] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

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
          <span className="prf-guest-icon">🔒</span>
          <h2>Anda belum masuk</h2>
          <p>Silakan masuk atau daftar terlebih dahulu untuk mengakses profil Anda.</p>
          <Link href="/" className="btn btn-caramel">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const currentTier = memberInfo[user.memberLevel] || memberInfo.bronze;
  const pointsNeeded = currentTier.pointsNeeded;
  const progress = Math.min((user.points / pointsNeeded) * 100, 100);

  const startEdit = () => {
    setEditForm({ name: user.name, email: user.email, phone: user.phone || "", address: user.address || "" });
    setEditMode(true);
  };

  const saveEdit = () => {
    updateUser(editForm);
    setEditMode(false);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
                  setActiveTab(link.key);
                  setShowTiers(false);
                }}
              >
                <span className="prf__sidebar-link-icon">{link.icon}</span>
                {link.label}
              </button>
            ))}
          </nav>

          <button className="prf__sidebar-logout" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <div className="prf__main">
          {showTiers ? (
            /* Member Tiers View (Right Screen of Mockup) */
            <div className="prf__tiers">
              <h2 className="prf__section-title prf__section-title--centered">Tahap Level Member</h2>
              
              <div className="prf__tiers-grid">
                {/* Bronze Member Card */}
                <div className={`prf__tier-card${user.memberLevel === "bronze" ? " active" : ""}`}>
                  <div className="prf__tier-badge-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
                    </svg>
                  </div>
                  <h3 className="prf__tier-name">Bronze Member</h3>
                  <p className="prf__tier-label">Benefit:</p>
                  <ul className="prf__tier-benefits">
                    <li>Mendapatkan 1 voucher diskon 12% jika belanja 10x dalam waktu sebulan.</li>
                    <li>Bonus poin kelipatan 10%</li>
                  </ul>
                </div>

                {/* Silver Member Card */}
                <div className={`prf__tier-card${user.memberLevel === "silver" ? " active" : ""}`}>
                  <div className="prf__tier-badge-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
                    </svg>
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
                <div className={`prf__tier-card${user.memberLevel === "gold" ? " active" : ""}`}>
                  <div className="prf__tier-badge-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
                    </svg>
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
            /* Dashboard View (Left Screen of Mockup) */
            <>
              <h2 className="prf__section-title">Dashboard</h2>

              {/* User profile card */}
              <div className="prf__user-card">
                <div className="prf__user-info">
                  <div className="prf__avatar">
                    {user.name === "Waguri" ? (
                      <WaguriAvatar />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="prf__user-details">
                    <h3 className="prf__user-name">{user.name}</h3>
                    <span className="prf__user-badge">
                      {currentTier.label}
                    </span>
                  </div>
                </div>
                <button className="btn prf__edit-btn" onClick={startEdit}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
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
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="prf__edit-field">
                      <label>Telepon</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="prf__edit-field">
                      <label>Alamat</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
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
                    <span>👑</span> Poin Kopi
                  </div>
                  <p className="prf__points-value">
                    {user.points.toLocaleString("id-ID")}
                    <span> Poin</span>
                  </p>
                  <p className="prf__points-sub">
                    Anda dapat menukarkan 1 hadiah!
                  </p>
                  <button className="btn prf__points-btn" onClick={() => setActiveTab("hadiah")}>
                    Tukar Poin
                  </button>
                </div>
                
                <div className="prf__points-right">
                  <div className="prf__exp-box">
                    <div className="prf__exp-header">
                      <span className="prf__exp-medal">🏅</span>
                      <span className="prf__exp-title">Member Baru</span>
                    </div>
                    <p className="prf__exp-text">
                      Tingkatkan {(pointsNeeded - user.points).toLocaleString("id-ID")} exp untuk meningkatkan level member.
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
                  <span className="prf__stat-icon">📦</span>
                  <div>
                    <p className="prf__stat-value">12</p>
                    <p className="prf__stat-label">Total Pesanan</p>
                  </div>
                </div>
                <div className="prf__stat">
                  <span className="prf__stat-icon">☕</span>
                  <div>
                    <p className="prf__stat-value">8</p>
                    <p className="prf__stat-label">Produk Favorit</p>
                  </div>
                </div>
                <div className="prf__stat">
                  <span className="prf__stat-icon">⭐</span>
                  <div>
                    <p className="prf__stat-value">5</p>
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
                <span className="prf__empty-icon">📦</span>
                <h3>Belum ada pesanan</h3>
                <p>Anda belum memiliki riwayat pesanan. Mulai belanja sekarang!</p>
                <Link href="/produk" className="btn btn-caramel">
                  Belanja Sekarang
                </Link>
              </div>
            </>
          ) : activeTab === "hadiah" ? (
            /* Hadiah View */
            <>
              <h2 className="prf__section-title">Hadiah Member</h2>
              <div className="prf__rewards-grid">
                <div className="prf__reward-card">
                  <span className="prf__reward-icon">🎫</span>
                  <h4>Voucher Diskon 10%</h4>
                  <p>Tukarkan 500 poin untuk voucher diskon 10%</p>
                  <button className="btn btn-ghost" disabled={user.points < 500}>
                    500 Poin
                  </button>
                </div>
                <div className="prf__reward-card">
                  <span className="prf__reward-icon">🚚</span>
                  <h4>Gratis Ongkir</h4>
                  <p>Tukarkan 300 poin untuk gratis ongkir</p>
                  <button className="btn btn-ghost" disabled={user.points < 300}>
                    300 Poin
                  </button>
                </div>
                <div className="prf__reward-card">
                  <span className="prf__reward-icon">☕</span>
                  <h4>Sample Kopi Gratis</h4>
                  <p>Tukarkan 1000 poin untuk sample kopi premium</p>
                  <button className="btn btn-ghost" disabled={user.points < 1000}>
                    1000 Poin
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Pengaturan View */
            <>
              <h2 className="prf__section-title">Pengaturan Akun</h2>
              <div className="prf__settings">
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
                  <div className="prf__setting-row">
                    <span className="prf__setting-label">Alamat</span>
                    <span className="prf__setting-value">{user.address || "-"}</span>
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
                  <button className="btn btn-ghost">Ubah Kata Sandi</button>
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
