"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStoreProducts } from "@/lib/storeProducts";
import { usePresence } from "@/lib/chat";
import { rp } from "@/lib/data";
import Icon from "@/components/Icon";

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.uid;

  const allStore = useStoreProducts();
  const [store, setStore] = useState(undefined); // undefined = masih loading
  const [reviews, setReviews] = useState([]);

  // Ambil data toko (publik)
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "users", uid, "store", "main");
    const unsub = onSnapshot(
      ref,
      (snap) => setStore(snap.exists() ? snap.data() : null),
      () => setStore(null)
    );
    return () => unsub();
  }, [uid]);

  // Ambil semua ulasan (publik) buat dihitung per toko
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "reviews"),
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setReviews(arr);
      },
      () => {}
    );
    return () => unsub();
  }, []);

  const myProducts = allStore.filter((p) => p.storeId === uid);
  const storeName = store?.name || myProducts[0]?.storeName || "Toko";
  const storeAddress = store?.address || myProducts[0]?.storeAddress || "Alamat belum diisi";
  const soldTotal = store?.soldTotal || 0;

  const ids = new Set(myProducts.map((p) => String(p.id)));
  const myReviews = reviews.filter((r) => ids.has(String(r.productId)));
  const reviewCount = myReviews.length;
  const avgRating = reviewCount
    ? (myReviews.reduce((a, r) => a + (r.rating || 0), 0) / reviewCount).toFixed(1)
    : "–";

  const { online, agoText } = usePresence(storeName);

  const openChat = () => {
    const q = encodeURIComponent(storeName);
    router.push(`/chat?seller=${q}&name=${q}`);
  };

  if (store === undefined) return null; // loading
  if (store === null && myProducts.length === 0) {
    return (
      <main style={wrap}>
        <div style={emptyBox}>
          <Icon name="store" size={40} />
          <h2>Toko tidak ditemukan</h2>
          <Link href="/produk" style={linkBtn}>← Kembali ke Produk</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <button onClick={() => router.back()} style={backBtn}>← Kembali</button>

      {/* Header toko */}
      <div style={header}>
        <div style={avatar}>{storeName[0]?.toUpperCase() || "T"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 22, color: "#2d1107" }}>{storeName}</h1>
            <span title="Penjual terverifikasi" style={{ color: "#1c8a3b", display: "inline-flex" }}>
              <Icon name="shield" size={16} />
            </span>
          </div>
          <div style={{ fontSize: 13, color: online ? "#1c8a3b" : "#7b6a5c", marginTop: 4 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: online ? "#1c8a3b" : "#c2b4a5", marginRight: 6 }} />
            {agoText}
          </div>
          <div style={{ fontSize: 13.5, color: "#5c4a3a", marginTop: 6, display: "flex", alignItems: "flex-start", gap: 6 }}>
            <Icon name="map-pin" size={15} /> <span>{storeAddress}</span>
          </div>
        </div>
        <button onClick={openChat} style={chatBtn}>
          <Icon name="send" size={15} /> Chat Penjual
        </button>
      </div>

      {/* Statistik */}
      <div style={stats}>
        <div style={statBox}><span style={statNum}>{myProducts.length}</span><span style={statLbl}>Produk</span></div>
        <div style={statBox}><span style={statNum}>{soldTotal}</span><span style={statLbl}>Terjual</span></div>
        <div style={statBox}><span style={statNum}>{reviewCount}</span><span style={statLbl}>Ulasan</span></div>
        <div style={statBox}>
          <span style={statNum}>{avgRating} {avgRating !== "–" && <Icon name="star" size={16} />}</span>
          <span style={statLbl}>Rating</span>
        </div>
      </div>

      {/* Produk toko */}
      <h2 style={{ fontSize: 18, color: "#2d1107", margin: "24px 0 14px" }}>Produk dari {storeName}</h2>
      {myProducts.length === 0 ? (
        <div style={emptyBox}><Icon name="package" size={36} /><p>Toko ini belum punya produk.</p></div>
      ) : (
        <div style={grid}>
          {myProducts.map((p) => (
            <Link key={p.id} href={`/produk/${p.id}`} style={prodCard}>
              <div style={prodImg}>
                {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="coffee" size={30} />}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, color: "#8a6d4f", textTransform: "uppercase", letterSpacing: 0.3 }}>{p.cat}</div>
                <div style={{ fontSize: 14, color: "#2d1107", margin: "3px 0 6px", fontWeight: 600 }}>{p.name}</div>
                <div style={{ color: "#b3743a", fontWeight: 700 }}>{rp(p.price)}</div>
                <div style={{ fontSize: 12, color: "#7b6a5c", marginTop: 3 }}>Stok: {p.stock}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

const wrap = { maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px" };
const backBtn = { background: "none", border: "none", color: "#8a6d4f", cursor: "pointer", fontSize: 14, marginBottom: 16 };
const header = { display: "flex", alignItems: "flex-start", gap: 16, background: "#fff", border: "1px solid #eee3d7", borderRadius: 16, padding: 20, flexWrap: "wrap" };
const avatar = { width: 64, height: 64, borderRadius: "50%", background: "#c8874a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, flexShrink: 0 };
const chatBtn = { background: "#2d1107", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, height: "fit-content" };
const stats = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 };
const statBox = { background: "#fff", border: "1px solid #eee3d7", borderRadius: 12, padding: "16px 8px", textAlign: "center", display: "flex", flexDirection: "column", gap: 4 };
const statNum = { fontSize: 20, fontWeight: 700, color: "#2d1107", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 };
const statLbl = { fontSize: 12.5, color: "#7b6a5c" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 };
const prodCard = { background: "#fff", border: "1px solid #eee3d7", borderRadius: 12, overflow: "hidden", textDecoration: "none", color: "inherit", display: "block" };
const prodImg = { width: "100%", height: 130, background: "#f4ece2", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a6d4f" };
const emptyBox = { background: "#fff", border: "1px solid #eee3d7", borderRadius: 14, padding: "48px 18px", textAlign: "center", color: "#7b6a5c", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 };
const linkBtn = { color: "#b3743a", textDecoration: "none", fontWeight: 600 };