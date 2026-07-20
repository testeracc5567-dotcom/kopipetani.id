"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useSellerOrders, updateOrderStatus, STATUS } from "@/lib/orders";
import AccountSidebar from "@/components/AccountSidebar";
import Icon from "@/components/Icon";

const rp = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");

const BADGE = {
  [STATUS.PENDING]: { bg: "#fff4e5", fg: "#b9701b", label: "Menunggu Pembayaran" },
  [STATUS.PROCESS]: { bg: "#e7f6ec", fg: "#1f8a4c", label: "Diproses" },
  [STATUS.SHIPPED]: { bg: "#e6f0fb", fg: "#1e6fd0", label: "Dikirim" },
  [STATUS.DONE]: { bg: "#eae7ff", fg: "#5b3fd6", label: "Selesai" },
  [STATUS.CANCELED]: { bg: "#fdeaea", fg: "#c0392b", label: "Dibatalkan" },
};

const btnStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "linear-gradient(120deg,#2d1107,#4a2613,#8a5a2e)",
  color: "#fff", border: "none", padding: "9px 16px", borderRadius: 10,
  fontWeight: 600, cursor: "pointer", fontSize: 13.5,
};

export default function PesananTokoPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const { openAuth } = useUI();
  const orders = useSellerOrders(user?.uid);

  if (isLoading) return null;

  if (!isLoggedIn) {
    return (
      <div className="prf__layout wrap">
        <AccountSidebar />
        <div className="prf__main">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Icon name="lock" size={40} strokeWidth={1.6} />
            <p style={{ margin: "14px 0" }}>Login dulu buat lihat pesanan masuk tokomu.</p>
            <button className="ord-empty-btn" onClick={() => openAuth("masuk")}>Masuk / Daftar</button>
          </div>
        </div>
      </div>
    );
  }

  const advance = (o) => {
    if (o.status === STATUS.PROCESS) updateOrderStatus(o.id, STATUS.SHIPPED);
    else if (o.status === STATUS.SHIPPED) updateOrderStatus(o.id, STATUS.DONE);
  };

  return (
    <div className="prf__layout wrap">
      <AccountSidebar />
      <div className="prf__main">
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--f-head)", color: "#2d1107" }}>
            <Icon name="inbox" size={22} /> Pesanan Masuk
          </h1>
          <p style={{ color: "#7b6a5c", marginTop: 4 }}>Pesanan dari pembeli untuk produk tokomu. Update otomatis (realtime).</p>
          <p style={{ color: "#c0392b", fontSize: 12, marginTop: 6 }}>Debug — UID kamu sekarang: {user?.uid || "(belum login)"}</p>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#7b6a5c" }}>
            <Icon name="inbox" size={40} strokeWidth={1.5} />
            <p style={{ marginTop: 12 }}>Belum ada pesanan masuk. Pesanan baru muncul otomatis di sini.</p>
            <Link href="/toko" style={{ color: "#a16d44", fontWeight: 600 }}>← Kembali ke Toko</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {orders.map((o) => {
              const badge = BADGE[o.status] || { bg: "#eee", fg: "#555", label: o.status };
              const mine = (o.items || []).filter((it) => it.sellerId === user.uid);
              const items = mine.length ? mine : (o.items || []);
              const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
              return (
                <div key={o.id} style={{ border: "1px solid #efe6da", borderRadius: 14, padding: 16, background: "#fffdfa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "#2d1107" }}>#{o.id}</span>
                      <span style={{ color: "#9b8a7c", fontSize: 12.5, marginLeft: 8 }}>{o.date}</span>
                    </div>
                    <span style={{ background: badge.bg, color: badge.fg, padding: "4px 10px", borderRadius: 20, fontSize: 12.5, fontWeight: 600 }}>{badge.label}</span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map((it, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span style={{ color: "#2d1107" }}>{it.name} <span style={{ color: "#9b8a7c" }}>x{it.qty}</span></span>
                        <span style={{ color: "#2d1107", fontWeight: 600 }}>{rp((it.price || 0) * (it.qty || 0))}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 12, padding: 12, background: "#f7f1e8", borderRadius: 10, fontSize: 13.5, color: "#5c4b3d" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#2d1107" }}>
                      <Icon name="user" size={14} /> {o.buyerName || o.buyer || "Pembeli"}
                    </div>
                    {o.address && (
                      <div style={{ marginTop: 4 }}>
                        <Icon name="map-pin" size={13} /> {o.address.name} · {o.address.phone}<br />
                        {o.address.detail}
                      </div>
                    )}
                    <div style={{ marginTop: 4 }}>
                      <Icon name="wallet" size={13} /> {o.payment?.label || "-"}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ fontWeight: 700, color: "#2d1107" }}>Total: {rp(subtotal)}</div>
                    {o.status === STATUS.PROCESS && (
                      <button onClick={() => advance(o)} style={btnStyle}><Icon name="truck" size={15} /> Tandai Dikirim</button>
                    )}
                    {o.status === STATUS.SHIPPED && (
                      <button onClick={() => advance(o)} style={btnStyle}><Icon name="check-circle" size={15} /> Tandai Selesai</button>
                    )}
                    {o.status === STATUS.PENDING && (
                      <span style={{ color: "#b9701b", fontSize: 13 }}>Menunggu pembayaran pembeli…</span>
                    )}
                    {o.status === STATUS.DONE && (
                      <span style={{ color: "#5b3fd6", fontSize: 13, fontWeight: 600 }}>Pesanan selesai</span>
                    )}
                    {o.status === STATUS.CANCELED && (
                      <span style={{ color: "#c0392b", fontSize: 13 }}>{o.cancelReason || "Dibatalkan"}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}