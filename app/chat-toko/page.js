"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useSellerRooms, useMessages, sendMessage, usePresence } from "@/lib/chat";

function Thread({ room, sellerKey, sellerName }) {
  const messages = useMessages(room.id);
  const { online, agoText } = usePresence(room.buyerKey);
  const [text, setText] = useState("");
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [messages]);
  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({ sellerKey, sellerName, buyerKey: room.buyerKey, buyerName: room.buyerName, from: "seller", text });
    setText("");
  };
  return (
    <div className="ct-thread">
      <div className="ct-thread-head">
        <span className="chat-avatar">{(room.buyerName || "P")[0].toUpperCase()}</span>
        <div>
          <p className="chat-seller-name" style={{ color: "#2d1107" }}>{room.buyerName}</p>
          <span className="chat-online" style={{ color: "#7b6a5c" }}>
            <span className={`chat-dot${online ? "" : " off"}`} /> {agoText}
          </span>
        </div>
      </div>
      <div className="ct-thread-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <p className="chat-empty">Belum ada pesan dari pembeli ini.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-msg${m.from === "seller" ? " chat-msg--me" : ""}`}>
              <span className="chat-bubble">{m.text}</span>
            </div>
          ))
        )}
      </div>
      <form className="chat-input-row" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Balas pesan pembeli..." />
        <button type="submit" aria-label="Kirim"><Icon name="send" size={18} /></button>
      </form>
    </div>
  );
}

function ChatTokoInner() {
  const { user, isLoggedIn } = useAuth();
  const { openAuth } = useUI();
  const [sellerName, setSellerName] = useState(null);
  useEffect(() => {
    const uid = user?.uid || auth.currentUser?.uid;
    if (!isLoggedIn || !uid) { setSellerName(null); return; }
    const ref = doc(db, "users", uid, "store", "main");
    const unsub = onSnapshot(ref, (snap) => setSellerName(snap.exists() ? (snap.data()?.name || null) : null), () => setSellerName(null));
    return () => unsub();
  }, [isLoggedIn, user?.uid]);

  const rooms = useSellerRooms(user?.uid); // 🔴 query inbox pakai uid
  const [activeId, setActiveId] = useState(null);
  const active = rooms.find((r) => r.id === activeId) || null;

  if (!isLoggedIn) {
    return (
      <main className="ct-wrap">
        <div className="ct-empty">
          <Icon name="lock" size={40} strokeWidth={1.6} />
          <p>Login dulu buat lihat chat dari pembeli.</p>
          <button className="ord-empty-btn" onClick={() => openAuth("masuk")}>Masuk / Daftar</button>
        </div>
      </main>
    );
  }
  if (!sellerName) {
    return (
      <main className="ct-wrap">
        <div className="ct-empty">
          <Icon name="store" size={40} strokeWidth={1.6} />
          <p>Kamu belum punya toko. Buat toko dulu di menu "Toko Anda" biar bisa nerima chat pembeli.</p>
        </div>
      </main>
    );
  }
  return (
    <main className="ct-wrap">
      <div className="ct-header">
        <h1 className="ct-title"><Icon name="send" size={20} /> Chat dari Pembeli</h1>
        <p className="ct-sub">Balas pertanyaan pembeli tentang produk tokomu di sini.</p>
      </div>
      <div className="ct-layout">
        <div className="ct-list">
          {rooms.length === 0 ? (
            <p className="ct-none">Belum ada chat masuk dari pembeli.</p>
          ) : (
            rooms.map((r) => (
              <button key={r.id} className={`ct-room${activeId === r.id ? " active" : ""}`} onClick={() => setActiveId(r.id)}>
                <span className="chat-avatar">{(r.buyerName || "P")[0].toUpperCase()}</span>
                <span className="ct-room-info">
                  <span className="ct-room-name">{r.buyerName}</span>
                  <span className="ct-room-last">{r.lastFrom === "seller" ? "Kamu: " : ""}{r.lastMessage || "Ketuk untuk buka"}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <div className="ct-panel">
          {active ? <Thread room={active} sellerKey={user?.uid} sellerName={sellerName} /> : <div className="ct-choose">Pilih percakapan di kiri.</div>}
        </div>
      </div>
    </main>
  );
}

export default function ChatTokoPage() {
  return (
    <Suspense fallback={<main className="ct-wrap"><div className="ct-choose">Memuat chat…</div></main>}>
      <ChatTokoInner />
    </Suspense>
  );
}