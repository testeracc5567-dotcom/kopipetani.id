"use client";
import Icon from "@/components/Icon";
import { findPayment } from "@/lib/payments";
import { rp } from "@/lib/data";

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;
  const pay = findPayment(order.payment?.method);
  const subtotal = order.subtotal ?? 0;
  const logistik = order.logistik ?? 0;
  const discount = order.discount ?? 0;
  const print = () => window.print();

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-actions-top">
          <button className="inv-print" onClick={print}><Icon name="book-open" size={15} /> Cetak / Simpan PDF</button>
          <button className="inv-close" onClick={onClose} aria-label="Tutup"><Icon name="x" size={18} /></button>
        </div>
        <div className="inv-sheet" id="invoice-sheet">
          <div className="inv-header">
            <div>
              <p className="inv-brand">KopiPetani.id</p>
              <p className="inv-brand-sub">Marketplace Kopi Petani Lokal</p>
            </div>
            <div className="inv-title-box">
              <p className="inv-title">INVOICE</p>
              <p className="inv-no">#{order.id}</p>
              <p className="inv-date">{order.date}</p>
            </div>
          </div>
          <div className="inv-meta">
            <div>
              <p className="inv-meta-label">Ditagihkan kepada</p>
              <p className="inv-meta-val">{order.address?.name || order.buyer || "-"}</p>
              {order.address && <p className="inv-meta-sub">{order.address.phone}</p>}
              {order.address && <p className="inv-meta-sub">{order.address.detail}</p>}
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="inv-meta-label">Status</p>
              <p className="inv-meta-val">{order.status}</p>
              <p className="inv-meta-sub">{pay ? pay.label : "-"}</p>
            </div>
          </div>
          <table className="inv-table">
            <thead>
              <tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {(order.items || []).map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{it.qty}</td>
                  <td>{rp(it.price)}</td>
                  <td>{rp(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="inv-summary">
            <div className="inv-sum-row"><span>Subtotal</span><span>{rp(subtotal)}</span></div>
            <div className="inv-sum-row"><span>Ongkos Logistik</span><span>{rp(logistik)}</span></div>
            {discount > 0 && <div className="inv-sum-row"><span>Diskon</span><span>−{rp(discount)}</span></div>}
            <div className="inv-sum-total"><span>Total</span><span>{rp(order.total)}</span></div>
          </div>
          <p className="inv-foot">Terima kasih telah berbelanja di KopiPetani.id — Invoice ini sah tanpa tanda tangan.</p>
        </div>
      </div>
    </div>
  );
}