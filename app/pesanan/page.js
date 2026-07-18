"use client";
import { useState } from "react";
import Link from "next/link";
import {
  useOrders,
  payOrder,
  cancelOrder,
  updateOrderStatus,
  markPointsAwarded,
  STATUS,
} from "@/lib/orders";
import { addPointHistory, nowStr } from "@/lib/points";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { findPayment } from "@/lib/payments";
import { products, rp } from "@/lib/data";
import { getStoreProducts } from "@/lib/storeProducts";
import AccountSidebar from "@/components/AccountSidebar";
import ChatSellerModal from "@/components/ChatSellerModal";
import InvoiceModal from "@/components/InvoiceModal";
import Icon from "@/components/Icon";

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

function Countdown({ deadline }) {
  const remain = Math.max(0, (deadline || 0) - Date.now());
  const mm = String(Math.floor(remain / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");
  return (
    <span className="ord-timer">
      {mm}:{ss}
    </span>
  );
}

function Items({ order }) {
  return (
    <div className="ord-items">
      {order.items.map((it) => (
        <div key={it.id} className="ord-item">
          <span className="ord-item-em">
            <Icon name="coffee" size={16} />
          </span>
          <span className="ord-item-name">{it.name}</span>
          <span className="ord-item-qty">x{it.qty}</span>
          <span className="ord-item-price">{rp(it.price * it.qty)}</span>
        </div>
      ))}
    </div>
  );
}

export default function PesananPage() {
  const { user, updateUser, isLoggedIn } = useAuth();
const { openAuth } = useUI();
const orders = useOrders(user?.uid);
const [chat, setChat] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Cari nama penjual dari produk pertama di pesanan
  const resolveSeller = (o) => {
    const first = (o.items || [])[0];
    if (!first) return "Penjual KopiPetani";
    const all = [...products, ...getStoreProducts()];
    const p = all.find((x) => String(x.id) === String(first.id));
    return p?.origin || "Penjual KopiPetani";
  };

  const handleReceived = (o) => {
    updateOrderStatus(o.id, STATUS.DONE);
    if (o.pointsEarned > 0 && !o.pointsAwarded) {
      updateUser({ points: (user?.points || 0) + o.pointsEarned });
      addPointHistory({
        type: "in",
        amount: o.pointsEarned,
        note: `Bonus pesanan #${o.id} selesai`,
        date: nowStr(),
      });
      markPointsAwarded(o.id);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="ord-page">
        <div className="ord-head">
          <h1 className="ord-title">Pesanan Saya</h1>
        </div>
        <div className="ord-empty">
          <span className="ord-empty-em">
            <Icon name="lock" size={40} strokeWidth={1.6} />
          </span>
          <p>Kamu harus login dulu buat lihat & melacak pesananmu.</p>
          <button className="ord-empty-btn" onClick={() => openAuth("masuk")}>
            Masuk / Daftar
          </button>
        </div>
      </main>
    );
  }

  const myOrders = orders;

  return (
    <div className="prf__layout wrap">
      <AccountSidebar />
      <div className="prf__main">
        <main className="ord-page">
          <div className="ord-head">
            <h1 className="ord-title">Pesanan Saya</h1>
            <p className="ord-sub">
              Selesaikan pembayaran & lacak status pesanan kamu di sini.
            </p>
          </div>
          {myOrders.length === 0 ? (
            <div className="ord-empty">
              <span className="ord-empty-em">
                <Icon name="inbox" size={40} strokeWidth={1.6} />
              </span>
              <p>Belum ada pesanan. Yuk belanja dulu!</p>
              <Link href="/produk" className="ord-empty-btn">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="ord-list">
              {myOrders.map((o) => {
                const pay = findPayment(o.payment?.method);
                return (
                  <div key={o.id} className="ord-card">
                    <div className="ord-card-top">
                      <div>
                        <span className="ord-id">#{o.id}</span>
                        <span className="ord-date">{o.date}</span>
                      </div>
                      <Badge status={o.status} />
                    </div>
                    <Items order={o} />
                    {o.address && (
                      <div className="ord-address">
                        <p className="ord-address-title"><Icon name="map-pin" size={15} /> Alamat Pengiriman</p>
                        <p className="ord-address-name">{o.address.name} · {o.address.phone}</p>
                        <p className="ord-address-detail">{o.address.detail}</p>
                      </div>
                    )}
                    <div className="ord-card-foot">
                      <span className="ord-pay-label">
                        {pay ? `${pay.label}` : "-"}
                      </span>
                      <span className="ord-total">
                        Total: <b>{rp(o.total)}</b>
                      </span>
                    </div>

                    <div className="ord-tools">
                      <button className="ord-tool-btn" onClick={() => setInvoiceOrder(o)}>
                        <Icon name="book-open" size={15} /> Invoice
                      </button>
                      {(o.status === STATUS.PROCESS || o.status === STATUS.SHIPPED) && (
                        <button className="ord-tool-btn ord-tool-chat" onClick={() => setChat({ sellerKey: resolveSeller(o), sellerName: resolveSeller(o), buyerKey: user?.email || user?.name || "guest", buyerName: user?.name || "Pembeli" })}>
                          <Icon name="send" size={15} /> Chat Seller
                        </button>
                      )}
                    </div>

                    {o.pointsEarned > 0 && o.status !== STATUS.CANCELED && (
                      <div className="ord-points">
                        <Icon name="gift" size={15} />
                        <span>
                          {o.status === STATUS.DONE
                            ? `+${o.pointsEarned.toLocaleString("id-ID")} poin sudah masuk!`
                            : `Dapat +${o.pointsEarned.toLocaleString("id-ID")} poin setelah pesanan selesai`}
                        </span>
                      </div>
                    )}
                    {o.status === STATUS.PENDING && (
                      <div className="ord-payment">
                        <div className="ord-pay-timer-row">
                          <span className="ord-pay-timer-label">
                            <Icon name="clock" size={15} /> Selesaikan pembayaran dalam
                          </span>
                          <Countdown deadline={o.deadline} />
                        </div>
                        {pay && pay.id === "qris" && (
                          <div className="ord-pay-info">
                            <p className="ord-pay-info-title">
                              <Icon name="qr" size={15} /> Scan QRIS ini:
                            </p>
                            <div className="ord-qris">
                              <img src="/qris.png" alt="QRIS" />
                            </div>
                          </div>
                        )}
                        {pay && (pay.id === "bank" || pay.id === "ewallet") && (
                          <div className="ord-pay-info">
                            <p className="ord-pay-info-title">
                              {pay.id === "bank" ? "Transfer ke:" : "Kirim ke:"}
                            </p>
                            {pay.accounts.map((a) => (
                              <div key={a.name} className="ord-acc">
                                <span className="ord-acc-name">{a.name}</span>
                                <span className="ord-acc-val">{a.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {pay && pay.id === "cod" && (
                          <p className="ord-pay-info-title">
                            <Icon name="wallet" size={15} /> Siapkan uang tunai saat barang datang.
                          </p>
                        )}
                        <div className="ord-actions">
                          <button className="ord-btn-pay" onClick={() => payOrder(o.id)}>
                            <Icon name="check" size={16} /> Saya Sudah Bayar
                          </button>
                          <button
                            className="ord-btn-cancel"
                            onClick={() => {
                              if (confirm("Batalkan pembayaran ini?")) cancelOrder(o.id);
                            }}
                          >
                            Batalkan
                          </button>
                        </div>
                      </div>
                    )}
                    {o.status !== STATUS.PENDING && o.status !== STATUS.CANCELED && (
                      <div className="ord-track">
                        {(() => {
                          const seq = [STATUS.PROCESS, STATUS.SHIPPED, STATUS.DONE];
                          const curIdx = seq.indexOf(o.status);
                          return seq.map((st, i) => (
                            <div key={st} className={`ord-track-step${i <= curIdx ? " done" : ""}`}>
                              <span className="ord-track-dot" />
                              <span className="ord-track-label">{st}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                    {o.status === STATUS.PROCESS && (
                      <div className="ord-actions ord-actions--process">
                        <button
                          className="ord-btn-cancel"
                          onClick={() => {
                            if (confirm("Batalkan pesanan ini? Pesanan yang dibatalkan tidak bisa dikembalikan."))
                              cancelOrder(o.id);
                          }}
                        >
                          Batalkan Pesanan
                        </button>
                      </div>
                    )}
                    {o.status === STATUS.SHIPPED && (
                      <div className="ord-receive">
                        <p className="ord-receive-hint">
                          <Icon name="package" size={16} /> Barang udah sampai? Konfirmasi biar bisa kasih ulasan & poin masuk.
                        </p>
                        <button
                          className="ord-btn-received"
                          onClick={() => {
                            if (confirm("Konfirmasi barang sudah kamu terima?")) handleReceived(o);
                          }}
                        >
                          <Icon name="check-circle" size={16} /> Pesanan Diterima
                        </button>
                      </div>
                    )}
                    {o.status === STATUS.CANCELED && o.cancelReason && (
                      <p className="ord-cancel-reason">
                        <Icon name="x-circle" size={15} /> {o.cancelReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {chat && <ChatSellerModal {...chat} onClose={() => setChat(null)} />}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}