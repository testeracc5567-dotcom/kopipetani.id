"use client";
import { useRouter } from "next/navigation";
import { usePresence } from "@/lib/chat";
import Icon from "@/components/Icon";

export default function SellerCard({ product }) {
  const router = useRouter();

  const isStore = !!product?.fromStore;
  const sellerUid = product?.storeId || null;
  const sellerName = product?.origin || "Penjual KopiPetani";

  const { online, agoText, isStale, staleDays } = usePresence(
    isStore ? sellerUid : null
  );

  // 🔴 Chat pakai UID toko sebagai kunci (biar nyambung ke inbox penjual & presence)
  const openChat = () => {
    const key = encodeURIComponent(isStore && sellerUid ? sellerUid : sellerName);
    const nm = encodeURIComponent(sellerName);
    router.push(`/chat?seller=${key}&name=${nm}`);
  };

  return (
    <div className="sc-card">
      <p className="sc-label">Dijual oleh</p>
      <div className="sc-main">
        <div className="sc-avatar">{sellerName[0].toUpperCase()}</div>
        <div className="sc-info">
          <div className="sc-name-row">
            <span className="sc-name">{sellerName}</span>
            <span className="sc-verified" title="Penjual terverifikasi"><Icon name="shield" size={14} /></span>
          </div>
          {isStore ? (
            <span className={`sc-status${online ? " on" : ""}`}>
              <span className="sc-dot" /> {agoText}
            </span>
          ) : (
            <span className="sc-status on">
              <span className="sc-dot" /> Toko resmi KopiPetani
            </span>
          )}
        </div>
      </div>

      <div className="sc-meta">
        <div className="sc-meta-item"><Icon name="map-pin" size={14} /> <span>Indonesia</span></div>
        <div className="sc-meta-item"><Icon name="star" size={14} /> <span>4.9 · Terpercaya</span></div>
        <div className="sc-meta-item"><Icon name="package" size={14} /> <span>Respon cepat</span></div>
      </div>

      {isStore && isStale && (
        <div className="sc-stale">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            Toko {staleDays === Infinity ? "belum pernah terlihat online" : `sudah ${staleDays} hari tidak aktif`}.
            Belum bisa dipastikan sedang buka.
          </span>
        </div>
      )}

      <button className="sc-chat-btn" onClick={openChat}>
        <Icon name="send" size={16} /> Chat Penjual
      </button>
    </div>
  );
}