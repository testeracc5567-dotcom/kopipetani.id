"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AccountSidebar from "@/components/AccountSidebar";

const STORE_KEY = "kopipetani_store";
const KATEGORI = ["Ceri Kopi", "Green Bean", "Kopi Sangrai", "Bibit & Benih", "Pupuk & Nutrisi", "Lainnya"];
const rp = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");
const emptyProd = { name: "", price: "", category: KATEGORI[0], stock: "", desc: "", emoji: "☕", image: "" };

export default function TokoPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    name: "", owner: "", phone: "", email: "", address: "", description: "", emoji: "🏪", profile: "",
  });
  const [prod, setProd] = useState(emptyProd);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) setStore(JSON.parse(saved));
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, owner: f.owner || user.name }));
  }, [user]);

  const persist = (next) => {
    setStore(next);
    if (next) localStorage.setItem(STORE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORE_KEY);
  };

  if (isLoading || !loaded) return null;

  if (!isLoggedIn) {
    return (
      <div className="toko-guard">
        <p>Kamu harus masuk dulu untuk membuka toko. ☕</p>
        <Link href="/" className="toko-guard-btn">Kembali ke Beranda</Link>
      </div>
    );
  }

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setP = (k, v) => setProd((p) => ({ ...p, [k]: v }));

  const onProfileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setF("profile", reader.result);
    reader.readAsDataURL(file);
  };

  const onProdImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setP("image", reader.result);
    reader.readAsDataURL(file);
  };

  const createStore = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    persist({ ...form, name: form.name.trim(), createdAt: new Date().toISOString().split("T")[0], products: [] });
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setProd({
      name: p.name,
      price: String(p.price ?? ""),
      category: p.category || KATEGORI[0],
      stock: String(p.stock ?? ""),
      desc: p.desc || "",
      emoji: p.emoji || "☕",
      image: p.image || "",
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProd(emptyProd);
  };

  const submitProduct = (e) => {
    e.preventDefault();
    if (!prod.name.trim() || !prod.price) return;

    if (editingId) {
      // Simpan perubahan produk yang ada
      const updated = (store.products || []).map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: prod.name.trim(),
              price: Number(prod.price) || 0,
              category: prod.category,
              stock: Number(prod.stock) || 0,
              desc: prod.desc.trim(),
              emoji: prod.emoji,
              image: prod.image,
            }
          : p
      );
      persist({ ...store, products: updated });
      cancelEdit();
    } else {
      // Tambah produk baru
      const newProduct = {
        id: Date.now(),
        name: prod.name.trim(),
        price: Number(prod.price) || 0,
        category: prod.category,
        stock: Number(prod.stock) || 0,
        desc: prod.desc.trim(),
        emoji: prod.emoji,
        image: prod.image,
      };
      persist({ ...store, products: [newProduct, ...(store.products || [])] });
      setProd(emptyProd);
    }
  };

  const deleteProduct = (id) => {
    if (!confirm("Hapus produk ini?")) return;
    if (editingId === id) cancelEdit();
    persist({ ...store, products: store.products.filter((p) => p.id !== id) });
  };

  // ===== Belum punya toko: form buka toko =====
  if (!store) {
    return (
      <div className="prf__layout wrap">
        <AccountSidebar />
        <div className="prf__main">
          <div className="toko-page">
            <div className="toko-intro">
              <span className="toko-intro-ic">🏪</span>
              <h1 className="toko-intro-title">Buka Toko Kamu</h1>
              <p className="toko-intro-sub">Punya kopi atau produk tani sendiri? Yuk buka toko dan mulai jualan di KopiPetani!</p>
            </div>
            <form className="toko-form" onSubmit={createStore}>
              <div className="toko-field">
                <label>Nama Toko *</label>
                <input value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="cth: Kopi Gayo Berkah" required />
              </div>
              <div className="toko-field">
                <label>Profil Toko</label>
                <div className="toko-profile-upload">
                  <div className="toko-profile-preview">
                    {form.profile ? <img src={form.profile} alt="Profil Toko" /> : <span>{form.emoji}</span>}
                  </div>
                  <label className="toko-profile-btn">
                    📷 Upload Foto
                    <input type="file" accept="image/*" onChange={onProfileUpload} hidden />
                  </label>
                  {form.profile && (
                    <button type="button" className="toko-profile-remove" onClick={() => setF("profile", "")}>Hapus</button>
                  )}
                </div>
              </div>
              <div className="toko-field">
                <label>Nama Pemilik</label>
                <input value={form.owner} onChange={(e) => setF("owner", e.target.value)} placeholder="Nama kamu" />
              </div>
              <div className="toko-row2">
                <div className="toko-field">
                  <label>No. WhatsApp</label>
                  <input value={form.phone} onChange={(e) => setF("phone", e.target.value)} placeholder="cth: 08123456789" />
                </div>
                <div className="toko-field">
                  <label>Email / Google</label>
                  <input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} placeholder="cth: tokokamu@gmail.com" />
                </div>
              </div>
              <div className="toko-field">
                <label>Alamat Toko</label>
                <input value={form.address} onChange={(e) => setF("address", e.target.value)} placeholder="cth: Takengon, Aceh Tengah" />
              </div>
              <div className="toko-field">
                <label>Deskripsi Toko</label>
                <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} rows={3} placeholder="Ceritakan tentang tokomu..." />
              </div>
              <button type="submit" className="toko-submit">Buka Toko Sekarang 🚀</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===== Sudah punya toko: dashboard =====
  const products = store.products || [];
  return (
    <div className="prf__layout wrap">
      <AccountSidebar />
      <div className="prf__main">
        <div className="toko-page">
          <div className="toko-header">
            <div className="toko-header-emoji">
              {store.profile ? <img src={store.profile} alt={store.name} className="toko-header-img" /> : store.emoji}
            </div>
            <div className="toko-header-info">
              <h1 className="toko-header-name">{store.name}</h1>
              <p className="toko-header-desc">{store.description || "Belum ada deskripsi toko."}</p>
              <div className="toko-meta">
                {store.owner && <span>👤 {store.owner}</span>}
                {store.phone && <span>📱 {store.phone}</span>}
                {store.email && <span>📧 {store.email}</span>}
                {store.address && <span>📍 {store.address}</span>}
              </div>
            </div>
          </div>
          <div className="toko-stats">
            <div className="toko-stat"><span className="toko-stat-num">{products.length}</span><span className="toko-stat-label">Produk</span></div>
            <div className="toko-stat"><span className="toko-stat-num">{products.reduce((s, p) => s + (p.stock || 0), 0)}</span><span className="toko-stat-label">Total Stok</span></div>
            <div className="toko-stat"><span className="toko-stat-num">{store.createdAt}</span><span className="toko-stat-label">Berdiri Sejak</span></div>
          </div>
          <div className="toko-body">
            <form className="toko-addprod" onSubmit={submitProduct}>
              <h2 className="toko-section-title">{editingId ? "✏️ Edit Produk" : "➕ Tambah Produk"}</h2>
              <div className="toko-field">
                <label>Nama Produk *</label>
                <input value={prod.name} onChange={(e) => setP("name", e.target.value)} placeholder="cth: Arabika Gayo 250g" required />
              </div>
              <div className="toko-field">
                <label>Foto Produk</label>
                <div className="toko-profile-upload">
                  <div className="toko-profile-preview">
                    {prod.image ? <img src={prod.image} alt="Foto Produk" /> : <span>{prod.emoji}</span>}
                  </div>
                  <label className="toko-profile-btn">
                    📷 Upload Foto
                    <input type="file" accept="image/*" onChange={onProdImageUpload} hidden />
                  </label>
                  {prod.image && (
                    <button type="button" className="toko-profile-remove" onClick={() => setP("image", "")}>Hapus</button>
                  )}
                </div>
              </div>
              <div className="toko-row2 toko-row2--price">
                <div className="toko-field">
                  <label>Harga (Rp) *</label>
                  <input type="number" value={prod.price} onChange={(e) => setP("price", e.target.value)} placeholder="cth: 85000" required />
                </div>
                <div className="toko-field">
                  <label>Stok</label>
                  <input type="number" value={prod.stock} onChange={(e) => setP("stock", e.target.value)} placeholder="cth: 50" />
                </div>
              </div>
              <div className="toko-row2">
                <div className="toko-field">
                  <label>Kategori</label>
                  <select value={prod.category} onChange={(e) => setP("category", e.target.value)}>
                    {KATEGORI.map((k) => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div className="toko-field">
                  <label>Ikon (kalau nggak upload foto)</label>
                  <div className="toko-emojis">
                    {["☕", "🫘", "🍒", "🌱", "🪴", "📦"].map((em) => (
                      <button type="button" key={em} className={`toko-emoji${prod.emoji === em ? " active" : ""}`} onClick={() => setP("emoji", em)}>{em}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="toko-field">
                <label>Deskripsi</label>
                <textarea value={prod.desc} onChange={(e) => setP("desc", e.target.value)} rows={2} placeholder="Deskripsi singkat produk..." />
              </div>
              <button type="submit" className="toko-submit">{editingId ? "💾 Simpan Perubahan" : "Tambah Produk"}</button>
              {editingId && (
                <button type="button" className="toko-cancel-edit" onClick={cancelEdit}>Batal Edit</button>
              )}
            </form>
            <div className="toko-products">
              <h2 className="toko-section-title">Produk Toko ({products.length})</h2>
              {products.length === 0 ? (
                <div className="toko-empty">Belum ada produk. Tambahkan produk pertamamu! 👈</div>
              ) : (
                <div className="toko-prod-grid">
                  {products.map((p) => (
                    <div className={`toko-prod-card${editingId === p.id ? " editing" : ""}`} key={p.id}>
                      <div className="toko-prod-emoji">
                        {p.image ? <img src={p.image} alt={p.name} className="toko-prod-img" /> : p.emoji}
                      </div>
                      <div className="toko-prod-info">
                        <span className="toko-prod-cat">{p.category}</span>
                        <p className="toko-prod-name">{p.name}</p>
                        {p.desc && <p className="toko-prod-desc">{p.desc}</p>}
                        <div className="toko-prod-foot">
                          <span className="toko-prod-price">{rp(p.price)}</span>
                          <span className="toko-prod-stock">Stok: {p.stock}</span>
                        </div>
                        <button className="toko-prod-edit-btn" onClick={() => startEdit(p)}>✏️ Edit</button>
                      </div>
                      <button className="toko-prod-del" onClick={() => deleteProduct(p.id)} aria-label="Hapus">🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}