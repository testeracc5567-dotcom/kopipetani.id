"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AccountSidebar from "@/components/AccountSidebar";
import Icon from "@/components/Icon";

const KATEGORI = ["Ceri Kopi", "Green Bean", "Kopi Sangrai", "Bibit & Benih", "Pupuk & Nutrisi", "Lainnya"];
const rp = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");
const ICON_CHOICES = ["coffee", "sprout", "leaf", "package", "gift", "star"];
const prodIcon = (val) => (ICON_CHOICES.includes(val) ? val : "coffee");
const emptyProd = { name: "", price: "", category: KATEGORI[0], stock: "", desc: "", emoji: "coffee", image: "" };

// Resize + kompres foto biar hemat & muat di Firestore
function compressImage(file, maxSize = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TokoPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    name: "", owner: "", phone: "", email: "", address: "", description: "", emoji: "store", profile: "",
  });
  const [prod, setProd] = useState(emptyProd);
  const [editingId, setEditingId] = useState(null);
  const [editingStore, setEditingStore] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState({});

  // Bersihin sisa data toko lama yang global (dari sistem lama)
  useEffect(() => {
    try { localStorage.removeItem("kopipetani_store"); } catch (e) {}
  }, []);

  // Ambil toko milik akun yang login (Firestore, per-akun)
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.uid) {
        if (active) { setStore(null); setLoaded(true); }
        return;
      }
      setLoaded(false);
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "store", "main"));
        if (active) setStore(snap.exists() ? snap.data() : null);
      } catch (e) {
        if (active) setStore(null);
      }
      if (active) setLoaded(true);
    };
    load();
    return () => { active = false; };
  }, [user?.uid]);

  // Prefill nama & email pemilik dari akun
  useEffect(() => {
    if (user) setForm((f) => ({
      ...f,
      owner: f.owner || user.name || "",
      email: f.email || user.email || "",
    }));
  }, [user]);

  // Simpan / hapus toko ke Firestore (per-akun)
  const persist = async (next) => {
    if (!user?.uid) return false;
    try {
      const ref = doc(db, "users", user.uid, "store", "main");
      if (next) await setDoc(ref, next);
      else await deleteDoc(ref);
      setStore(next);
      window.dispatchEvent(new Event("store-updated"));
      return true;
    } catch (err) {
      alert("Gagal menyimpan toko ke server. Cek koneksi, atau foto produk mungkin kegedean — coba foto yang lebih kecil ya. 🙏");
      return false;
    }
  };

  if (isLoading || !loaded) return null;

  if (!isLoggedIn) {
    return (
      <div className="toko-guard">
        <p>Kamu harus masuk dulu untuk membuka toko.</p>
        <Link href="/" className="toko-guard-btn">Kembali ke Beranda</Link>
      </div>
    );
  }

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setP = (k, v) => setProd((p) => ({ ...p, [k]: v }));
  const toggleCat = (cat) => setCollapsedCats((s) => ({ ...s, [cat]: !s[cat] }));

  const onProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 0.7);
      setF("profile", compressed);
    } catch {
      alert("Gagal memproses foto. Coba foto lain ya.");
    }
  };
  const onProdImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 0.7);
      setP("image", compressed);
    } catch {
      alert("Gagal memproses foto. Coba foto lain ya.");
    }
  };

  const createStore = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await persist({ ...form, name: form.name.trim(), createdAt: new Date().toISOString().split("T")[0], products: [] });
  };

  const startEditStore = () => {
    setForm({
      name: store.name || "",
      owner: store.owner || "",
      phone: store.phone || "",
      email: store.email || "",
      address: store.address || "",
      description: store.description || "",
      emoji: store.emoji || "store",
      profile: store.profile || "",
    });
    setEditingStore(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveStoreProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const ok = await persist({
      ...store,
      name: form.name.trim(),
      owner: form.owner,
      phone: form.phone,
      email: form.email,
      address: form.address,
      description: form.description,
      profile: form.profile,
    });
    if (ok) setEditingStore(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setProd({
      name: p.name,
      price: String(p.price ?? ""),
      category: p.category || KATEGORI[0],
      stock: String(p.stock ?? ""),
      desc: p.desc || "",
      emoji: prodIcon(p.emoji),
      image: p.image || "",
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProd(emptyProd);
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!prod.name.trim() || !prod.price) return;
    if (editingId) {
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
      if (await persist({ ...store, products: updated })) cancelEdit();
    } else {
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
      if (await persist({ ...store, products: [newProduct, ...(store.products || [])] })) setProd(emptyProd);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    if (editingId === id) cancelEdit();
    await persist({ ...store, products: store.products.filter((p) => p.id !== id) });
  };

  // Field form toko (dipakai buat buka toko & edit profil)
  const storeFormFields = (
    <>
      <div className="toko-field">
        <label>Nama Toko *</label>
        <input value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="cth: Kopi Gayo Berkah" required />
      </div>
      <div className="toko-field">
        <label>Profil Toko</label>
        <div className="toko-profile-upload">
          <div className="toko-profile-preview">
            {form.profile ? <img src={form.profile} alt="Profil Toko" /> : <span><Icon name="store" size={30} /></span>}
          </div>
          <label className="toko-profile-btn">
            <Icon name="camera" size={15} /> Upload Foto
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
    </>
  );

  // ===== Belum punya toko: form buka toko =====
  if (!store) {
    return (
      <div className="prf__layout wrap">
        <AccountSidebar />
        <div className="prf__main">
          <div className="toko-page">
            <div className="toko-intro">
              <span className="toko-intro-ic"><Icon name="store" size={40} /></span>
              <h1 className="toko-intro-title">Buka Toko Kamu</h1>
              <p className="toko-intro-sub">Punya kopi atau produk tani sendiri? Yuk buka toko dan mulai jualan di KopiPetani!</p>
            </div>
            <form className="toko-form" onSubmit={createStore}>
              {storeFormFields}
              <button type="submit" className="toko-submit">Buka Toko Sekarang</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===== Mode edit profil toko =====
  if (editingStore) {
    return (
      <div className="prf__layout wrap">
        <AccountSidebar />
        <div className="prf__main">
          <div className="toko-page">
            <div className="toko-intro">
              <span className="toko-intro-ic"><Icon name="edit" size={36} /></span>
              <h1 className="toko-intro-title">Edit Profil Toko</h1>
              <p className="toko-intro-sub">Perbarui info tokomu biar makin dikenal pembeli.</p>
            </div>
            <form className="toko-form" onSubmit={saveStoreProfile}>
              {storeFormFields}
              <div className="toko-edit-actions">
                <button type="button" className="toko-cancel-edit" onClick={() => setEditingStore(false)}>Batal</button>
                <button type="submit" className="toko-submit"><Icon name="check" size={16} /> Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===== Sudah punya toko: dashboard =====
  const products = store.products || [];
  const groupedProducts = (() => {
    const map = {};
    products.forEach((p) => {
      const c = p.category || "Lainnya";
      (map[c] = map[c] || []).push(p);
    });
    const ordered = [];
    KATEGORI.forEach((c) => { if (map[c]) { ordered.push([c, map[c]]); delete map[c]; } });
    Object.keys(map).forEach((c) => ordered.push([c, map[c]]));
    return ordered;
  })();

  const renderCard = (p) => (
    <div className={`toko-prod-card${editingId === p.id ? " editing" : ""}`} key={p.id}>
      <div className="toko-prod-emoji">
        {p.image ? <img src={p.image} alt={p.name} className="toko-prod-img" /> : <Icon name={prodIcon(p.emoji)} size={30} />}
      </div>
      <div className="toko-prod-info">
        <span className="toko-prod-cat">{p.category}</span>
        <p className="toko-prod-name">{p.name}</p>
        {p.desc && <p className="toko-prod-desc">{p.desc}</p>}
        <div className="toko-prod-foot">
          <span className="toko-prod-price">{rp(p.price)}</span>
          <span className="toko-prod-stock">Stok: {p.stock}</span>
        </div>
        <button className="toko-prod-edit-btn" onClick={() => startEdit(p)}><Icon name="edit" size={13} /> Edit</button>
      </div>
      <button className="toko-prod-del" onClick={() => deleteProduct(p.id)} aria-label="Hapus"><Icon name="trash" size={16} /></button>
    </div>
  );

  return (
    <div className="prf__layout wrap">
      <AccountSidebar />
      <div className="prf__main">
        <div className="toko-page">
          <div className="toko-header">
            <div className="toko-header-emoji">
              {store.profile ? <img src={store.profile} alt={store.name} className="toko-header-img" /> : <Icon name="store" size={34} />}
            </div>
            <div className="toko-header-info">
              <h1 className="toko-header-name">{store.name}</h1>
              <p className="toko-header-desc">{store.description || "Belum ada deskripsi toko."}</p>
              <div className="toko-meta">
                {store.owner && <span><Icon name="user" size={14} /> {store.owner}</span>}
                {store.phone && <span><Icon name="phone" size={14} /> {store.phone}</span>}
                {store.email && <span><Icon name="mail" size={14} /> {store.email}</span>}
                {store.address && <span><Icon name="map-pin" size={14} /> {store.address}</span>}
              </div>
              <button className="toko-edit-profil-btn" onClick={startEditStore}><Icon name="edit" size={14} /> Edit Profil</button>
            </div>
          </div>
          <div className="toko-stats">
            <div className="toko-stat"><span className="toko-stat-num">{products.length}</span><span className="toko-stat-label">Produk</span></div>
            <div className="toko-stat"><span className="toko-stat-num">{products.reduce((s, p) => s + (p.stock || 0), 0)}</span><span className="toko-stat-label">Total Stok</span></div>
            <div className="toko-stat"><span className="toko-stat-num">{store.createdAt}</span><span className="toko-stat-label">Berdiri Sejak</span></div>
          </div>
          <div className="toko-body">
            <form className="toko-addprod" onSubmit={submitProduct}>
              <h2 className="toko-section-title">
                {editingId ? (<><Icon name="edit" size={18} /> Edit Produk</>) : (<><Icon name="plus" size={18} /> Tambah Produk</>)}
              </h2>
              <div className="toko-field">
                <label>Nama Produk *</label>
                <input value={prod.name} onChange={(e) => setP("name", e.target.value)} placeholder="cth: Arabika Gayo 250g" required />
              </div>
              <div className="toko-field">
                <label>Foto Produk</label>
                <div className="toko-profile-upload">
                  <div className="toko-profile-preview">
                    {prod.image ? <img src={prod.image} alt="Foto Produk" /> : <span><Icon name={prodIcon(prod.emoji)} size={30} /></span>}
                  </div>
                  <label className="toko-profile-btn">
                    <Icon name="camera" size={15} /> Upload Foto
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
                    {ICON_CHOICES.map((ic) => (
                      <button type="button" key={ic} className={`toko-emoji${prod.emoji === ic ? " active" : ""}`} onClick={() => setP("emoji", ic)}>
                        <Icon name={ic} size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="toko-field">
                <label>Deskripsi</label>
                <textarea value={prod.desc} onChange={(e) => setP("desc", e.target.value)} rows={2} placeholder="Deskripsi singkat produk..." />
              </div>
              <button type="submit" className="toko-submit">
                {editingId ? (<><Icon name="check" size={16} /> Simpan Perubahan</>) : "Tambah Produk"}
              </button>
              {editingId && (
                <button type="button" className="toko-cancel-edit" onClick={cancelEdit}>Batal Edit</button>
              )}
            </form>
            <div className="toko-products">
              <h2 className="toko-section-title">Produk Toko ({products.length})</h2>
              {products.length === 0 ? (
                <div className="toko-empty">Belum ada produk. Tambahkan produk pertamamu!</div>
              ) : (
                groupedProducts.map(([cat, items]) => (
                  <div key={cat} className="toko-cat-group">
                    <h3
                      className={`toko-cat-title${collapsedCats[cat] ? " collapsed" : ""}`}
                      onClick={() => toggleCat(cat)}
                    >
                      <span className="toko-cat-chevron"><Icon name="chevron" size={16} /></span>
                      <span className="toko-cat-name">{cat}</span>
                      <span className="toko-cat-count">{items.length}</span>
                    </h3>
                    {!collapsedCats[cat] && (
                      <div className="toko-prod-grid">
                        {items.map(renderCard)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}