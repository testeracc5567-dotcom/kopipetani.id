"use client";
import { useState, useEffect } from "react";
import Icon from "@/components/Icon";
import {
  useAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
} from "@/lib/addresses";

export default function AddressBook({ selectedId, onSelect, defaultForm = {} }) {
  const addresses = useAddresses();
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", detail: "" });
  const [makeDefault, setMakeDefault] = useState(false);

  useEffect(() => {
    if (!selectedId && addresses.length) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      onSelect?.(def.id);
    }
  }, [addresses, selectedId]);

  const selected = addresses.find((a) => a.id === selectedId) || null;

  const startAdd = () => {
    setForm({ name: defaultForm.name || "", phone: defaultForm.phone || "", detail: defaultForm.detail || "" });
    setMakeDefault(addresses.length === 0);
    setEditingId("new");
    setExpanded(true);
  };

  const startEdit = (a) => {
    setForm({ name: a.name, phone: a.phone, detail: a.detail });
    setMakeDefault(!!a.isDefault);
    setEditingId(a.id);
    setExpanded(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm({ name: "", phone: "", detail: "" });
    setMakeDefault(false);
  };

  const saveForm = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.detail.trim()) {
      alert("Isi nama penerima, nomor HP, dan alamat lengkap dulu ya.");
      return;
    }
    let targetId;
    if (editingId === "new") {
      const item = await addAddress(form);
      if (!item) { alert("Gagal simpan alamat. Coba login ulang ya."); return; }
      targetId = item.id;
      onSelect?.(item.id);
    } else {
      await updateAddress(editingId, form);
      targetId = editingId;
    }
    if (makeDefault) await setDefaultAddress(targetId);
    cancelForm();
  };

  const handleDelete = (id) => {
    if (!confirm("Hapus alamat ini?")) return;
    deleteAddress(id);
    if (selectedId === id) onSelect?.(null);
  };

  const AddrForm = (
    <div className="ab-form">
      <div className="ab-form-title">{editingId === "new" ? "Tambah Alamat Baru" : "Edit Alamat"}</div>
      <div className="buy-field">
        <label>Nama Penerima</label>
        <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="cth: Awok" />
      </div>
      <div className="buy-field">
        <label>Nomor HP</label>
        <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} placeholder="cth: 08123456789" />
      </div>
      <div className="buy-field">
        <label>Alamat Lengkap</label>
        <textarea rows={2} value={form.detail} onChange={(e) => setForm((s) => ({ ...s, detail: e.target.value }))} placeholder="Jalan, No rumah, kelurahan, kecamatan, kota, kode pos" />
      </div>
      <label className="ab-default-toggle">
        <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} />
        <span>Jadikan alamat utama</span>
      </label>
      <div className="buy-form-actions">
        <button type="button" className="buy-form-save" onClick={saveForm}>Simpan Alamat</button>
        {addresses.length > 0 && (
          <button type="button" className="buy-form-cancel" onClick={cancelForm}>Batal</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="ab">
      {editingId ? (
        AddrForm
      ) : addresses.length === 0 ? (
        <div className="ab-empty">
          <p>Belum ada alamat tersimpan.</p>
          <button type="button" className="ab-add" onClick={startAdd}><Icon name="plus" size={14} /> Tambah Alamat</button>
        </div>
      ) : !expanded ? (
        <div className="ab-selected">
          {selected ? (
            <div className="buy-addr active" style={{ cursor: "default" }}>
              <div className="buy-addr-top">
                <span className="buy-addr-name">{selected.name}</span>
                {selected.isDefault && <span className="buy-addr-badge">Utama</span>}
                <span className="ab-phone">· {selected.phone}</span>
              </div>
              <div className="buy-addr-detail">{selected.detail}</div>
            </div>
          ) : (
            <p className="ab-hint">Belum ada alamat dipilih.</p>
          )}
          <button type="button" className="ab-change" onClick={() => setExpanded(true)}>
            <Icon name="edit" size={13} /> Ganti / Kelola Alamat
          </button>
        </div>
      ) : (
        <div className="ab-list">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`buy-addr${selectedId === a.id ? " active" : ""}`}
              onClick={() => onSelect?.(a.id)}
            >
              <div className="buy-addr-top">
                <span className="buy-addr-name">{a.name}</span>
                {a.isDefault && <span className="buy-addr-badge">Utama</span>}
                <span className="ab-phone">· {a.phone}</span>
              </div>
              <div className="buy-addr-detail">{a.detail}</div>
              <div className="ab-actions">
                <button type="button" onClick={(e) => { e.stopPropagation(); startEdit(a); }}><Icon name="edit" size={13} /> Edit</button>
                {!a.isDefault && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setDefaultAddress(a.id); }}><Icon name="star" size={13} /> Jadikan Utama</button>
                )}
                <button type="button" className="ab-del" onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}><Icon name="trash" size={13} /> Hapus</button>
              </div>
            </div>
          ))}
          <div className="ab-foot">
            <button type="button" className="ab-add" onClick={startAdd}><Icon name="plus" size={14} /> Tambah Alamat</button>
            <button type="button" className="ab-done" onClick={() => setExpanded(false)}>Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
}