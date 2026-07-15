"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useOrders, updateOrderStatus, STATUS } from "@/lib/orders";
import { rp } from "@/lib/data";

const STATUS_STYLE = {
  [STATUS.PENDING]: { bg: "#fff4e5", fg: "#b26a00" },
  [STATUS.PROCESS]: { bg: "#e6f0ff", fg: "#1856b3" },
  [STATUS.SHIPPED]: { bg: "#e9e2ff", fg: "#5b34c2" },
  [STATUS.DONE]: { bg: "#e4f7e8", fg: "#1c8a3b" },
  [STATUS.CANCELED]: { bg: "#fdeaea", fg: "#c23b3b" },
};

function Badge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE[STATUS.PROCESS];
  return (
    <span className="ord-badge" style={{ background: s.bg, color: s.fg }}>
      {status}
    </span>
  );
}

function Items({ order }) {
  return (
    <div className="ord-items">
      {order.items.map((it) => (
        <div key={it.id} className="ord-item">
          <span className="ord-item-em">{it.emoji}</span>
          <span className="ord-item-name">{it.name}</span>
          <span className="ord-item-qty">x{it.qty}</span>
          <span className="ord-item-price">{rp(it.price * it.qty)}</span>
        </div>
      ))}
    </div>
  );
}

export default function KelolaPesananPage() {
  const orders = useOrders();

  const [hasStore, setHasStore] = useState(null);
  useEffect(() => {
    try {
      setHasStore(!!localStorage.getItem("kopipetani_store"));
    } catch {
      setHasStore(false);
    }
  }, []);

  if (hasStore === null) return null;

  if (!hasStore) {
    return (
      <main className="ord-page">
        <div className="ord-empty">
          <span className="ord-empty-em">🏪</span>
          <p>
            Kamu belum punya toko. Buka toko dulu buat mengelola pesanan yang
            masuk.
          </p>
          <Link href="/toko" className="ord-empty-btn">
            Buka Toko
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ord-page">
      <div className="ord-head">
        <h1 className="ord-title">Kelola Pesanan</h1>
        <p className="ord-sub">
          Panel penjual — atur status pesanan yang masuk ke toko kamu. 🏪
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="ord-empty">
          <span className="ord-empty-em">📭</span>
          <p>Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div className="ord-list">
          {orders.map((o) => (
            <div key={o.id} className="ord-card">
              <div className="ord-card-top">
                <div>
                  <span className="ord-id">#{o.id}</span>
                  <span className="ord-date">{o.date}</span>
                  <span className="ord-buyer">👤 {o.buyer}</span>
                </div>
                <Badge status={o.status} />
              </div>
              <Items order={o} />
              <div className="ord-card-foot">
                <span className="ord-pay-label">{o.payment?.label || "-"}</span>
                <span className="ord-total">
                  Total: <b>{rp(o.total)}</b>
                </span>
              </div>
              <div className="ord-actions">
                {o.status === STATUS.PENDING && (
                  <span className="ord-wait">Menunggu pembeli bayar…</span>
                )}
                {o.status === STATUS.PROCESS && (
                  <>
                    <button
                      className="ord-btn-pay"
                      onClick={() => updateOrderStatus(o.id, STATUS.SHIPPED)}
                    >
                      🚚 Kirim Pesanan
                    </button>
                    <button
                      className="ord-btn-cancel"
                      onClick={() => {
                        if (confirm("Batalkan pesanan ini?"))
                          updateOrderStatus(
                            o.id,
                            STATUS.CANCELED,
                            "Dibatalkan penjual"
                          );
                      }}
                    >
                      Batalkan
                    </button>
                  </>
                )}
                {o.status === STATUS.SHIPPED && (
                  <span className="ord-wait">
                    📦 Menunggu konfirmasi penerimaan dari pembeli…
                  </span>
                )}
                {(o.status === STATUS.DONE || o.status === STATUS.CANCELED) && (
                  <span className="ord-wait">Tidak ada aksi lagi.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}