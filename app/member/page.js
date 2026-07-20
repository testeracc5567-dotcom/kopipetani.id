"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRiwayat, addPointHistory, nowStr } from "@/lib/points";
import Icon from "@/components/Icon";
import { VOUCHERS } from "@/lib/vouchers";

const TIERS = [
  { name: "Member Baru", min: 0, icon: "sprout", perk: "Akses dasar & kumpulkan poin dari tiap pesanan" },
  { name: "Bronze", min: 15000, icon: "award", perk: "Voucher belanja hemat & promo khusus member" },
  { name: "Silver", min: 30000, icon: "award", perk: "Voucher lebih besar + gratis ongkir berkala" },
  { name: "Gold", min: 666666, icon: "award", perk: "Semua benefit + voucher eksklusif level tertinggi" },
];

export default function MemberPage() {
  const { user, isLoggedIn, isLoading, logout, updateUser } = useAuth();
  const { addVoucher } = useCart();
  const router = useRouter();
  const history = useRiwayat();
  const [tab, setTab] = useState("riwayat");
  const [selected, setSelected] = useState(null);
  const [redeemCode, setRedeemCode] = useState(null);
  const [copied, setCopied] = useState(false);

  if (isLoading) return null;

  if (!isLoggedIn) {
    return (
      <div className="mbr-guard">
        <p>Kamu harus masuk dulu untuk melihat halaman member.</p>
        <Link href="/" className="mbr-guard-btn">Kembali ke Beranda</Link>
      </div>
    );
  }

  const points = user?.points ?? 0;
  const name = user?.name || "Sahabat Kopi";
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

  const openRedeem = (v) => { setSelected(v); setRedeemCode(null); setCopied(false); };
  const confirmRedeem = () => {
    if (!selected || points < selected.cost) return;
    const code = "KOPI" + Math.random().toString(36).slice(2, 8).toUpperCase();
    updateUser?.({ points: points - selected.cost });
    addVoucher?.({ id: Date.now(), code, off: selected.off, title: selected.title, desc: selected.desc });
    addPointHistory({ type: "out", amount: selected.cost, note: `Tukar ${selected.title} (${selected.off})`, date: nowStr() });
    setRedeemCode(code);
  };
  const closeRedeem = () => { setSelected(null); setRedeemCode(null); setCopied(false); };
  const copyCode = () => {
    if (redeemCode) { navigator.clipboard?.writeText(redeemCode); setCopied(true); }
  };
  const handleLogout = () => { logout(); router.push("/"); };

  const navItems = [
    { label: "Dashboard", href: "/profil", icon: "dashboard" },
    { label: "Pesanan Saya", href: "/pesanan", icon: "package" },
    { label: "Toko Anda", href: "/toko", icon: "store" },
    { label: "Hadiah Member", href: "/member", icon: "gift", active: true },
    { label: "Pengaturan Akun", href: "/profil", icon: "settings" },
  ];

  return (
    <div className="mbr-page">
      <div className="mbr-shell">
        <aside className="mbr-side">
          <div className="mbr-side-brand">
            <span className="mbr-side-logo"><Icon name="coffee" size={18} /> KopiPetani.id</span>
<span className="mbr-side-tag">Kumpulkan poin & tukar hadiah member.</span>
          </div>
          <nav className="mbr-nav">
            {navItems.map((it) => (
              <Link key={it.label} href={it.href} className={`mbr-nav-item${it.active ? " active" : ""}`}>
                <span className="mbr-nav-ic"><Icon name={it.icon} size={18} /></span> {it.label}
              </Link>
            ))}
          </nav>
          <button className="mbr-logout" onClick={handleLogout}>
            <span className="mbr-nav-ic"><Icon name="logout" size={18} /></span> Logout
          </button>
        </aside>
        <main className="mbr-main">
          <section className="mbr-hero">
            <div className="mbr-hero-left">
              <h1 className="mbr-hero-title">Selamat Datang Kembali,<br />{name}</h1>
              <p className="mbr-hero-desc">
                Kamu telah memiliki riwayat pembelian 100 pemesanan dalam waktu 3 bulan terakhir.
              </p>
              <div className="mbr-points">
                <span className="mbr-points-num">{points.toLocaleString("id-ID")}</span> Poin
              </div>
              <p className="mbr-points-sub">Poin akan kadaluarsa pada tanggal 31/12/2026</p>
              <div className="mbr-progress">
                <p className="mbr-progress-label">Tingkatan level member kamu</p>
                <div className="mbr-progress-bar"><span style={{ width: `${progress}%` }} /></div>
                <p className="mbr-progress-hint">
                  {nextTier
                    ? `Belanja ${(nextTier.min - points).toLocaleString("id-ID")} poin lagi untuk naik ke level ${nextTier.name}`
                    : "Kamu sudah di level tertinggi!"}
                </p>
              </div>
            </div>
            <div className="mbr-hero-card">
              <div className="mbr-hero-badge"><Icon name="award" size={30} /></div>
              <p className="mbr-hero-card-title">{curTier.name}</p>
              <p className="mbr-hero-card-sub">
                Teruslah belanja dan tingkatkan level membermu agar berkesempatan dapat voucher dan benefit lainnya.
              </p>
              <button className="mbr-hero-card-btn" onClick={() => router.push("/profil?tiers=1")}>Lihat Level Lainnya</button>
            </div>
          </section>
          <div className="mbr-tabs">
            <button className={`mbr-tab${tab === "riwayat" ? " active" : ""}`} onClick={() => setTab("riwayat")}>Riwayat Poin</button>
            <button className={`mbr-tab${tab === "tukar" ? " active" : ""}`} onClick={() => setTab("tukar")}>Tukar Poin</button>
          </div>
          {tab === "riwayat" && (
            <div className="mbr-table-wrap">
              {history.length === 0 ? (
                <div className="mbr-empty">Belum ada riwayat poin.</div>
              ) : (
                <table className="mbr-table">
                  <thead>
                    <tr><th>Keterangan</th><th>Tanggal</th><th className="mbr-ta-r">Poin</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td>{h.note}</td>
                        <td>{h.date}</td>
                        <td className={`mbr-ta-r ${h.type === "in" ? "mbr-poin-plus" : "mbr-poin-minus"}`}>
                          {h.type === "in" ? "+" : "−"}{h.amount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {tab === "tukar" && (
            <div className="mbr-vouchers">
              {VOUCHERS.map((v) => (
                <button key={v.id} className="mbr-voucher" onClick={() => openRedeem(v)}>
                  <div className="mbr-voucher-left">
                    <span className="mbr-voucher-tag">VOUCHER</span>
                    <span className="mbr-voucher-off">{v.off} OFF</span>
                  </div>
                  <div className="mbr-voucher-right">
                    <p className="mbr-voucher-title">{v.title}</p>
                    <p className="mbr-voucher-desc">{v.desc}</p>
                    <p className="mbr-voucher-cost">{v.cost.toLocaleString("id-ID")} poin</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
      {selected && (
        <div className="mbr-modal-overlay" onClick={closeRedeem}>
          <div className="mbr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="mbr-modal-close" onClick={closeRedeem}><Icon name="x" size={16} /></button>
            <div className="mbr-modal-voucher">
              <span className="mbr-voucher-tag">VOUCHER</span>
              <span className="mbr-voucher-off">{selected.off} OFF</span>
            </div>
            {!redeemCode ? (
              <>
                <p className="mbr-modal-title">Apakah kamu ingin menukar?</p>
                <p className="mbr-modal-desc">{selected.title} — {selected.desc}</p>
                <p className="mbr-modal-cost">Dengan total <b>{selected.cost.toLocaleString("id-ID")} poin</b></p>
                {points < selected.cost && <p className="mbr-modal-warn">Poin kamu belum cukup</p>}
                <div className="mbr-modal-actions">
                  <button className="mbr-btn-ghost" onClick={closeRedeem}>Tidak</button>
                  <button className="mbr-btn-primary" onClick={confirmRedeem} disabled={points < selected.cost}>Iya</button>
                </div>
              </>
            ) : (
              <>
                <p className="mbr-modal-title mbr-modal-title--ok">
                  <Icon name="check-circle" size={18} /> Selamat! Voucher berhasil ditukar!
                </p>
                <p className="mbr-modal-desc">{selected.title} — {selected.desc}</p>
                <div className="mbr-code">
                  <span className="mbr-code-val">{redeemCode}</span>
                  <button className="mbr-code-copy" onClick={copyCode}>
                    {copied ? (<>Tersalin <Icon name="check" size={13} /></>) : "Salin"}
                  </button>
                </div>
                <p className="mbr-modal-hint">Kode ini otomatis masuk ke Keranjang di bagian "Pilih Voucher".</p>
                <div className="mbr-modal-actions">
                  <button className="mbr-btn-primary" onClick={closeRedeem}>Selesai</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}