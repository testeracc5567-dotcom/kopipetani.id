"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useSellerRooms, useMessages, sendMessage, useHeartbeat, useOnline } from "@/lib/chat";

function useStoreName() {
  const [name, setName] = useState(undefined); // undefined = loading, null = belum ada toko
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("kopipetani_store") || "null");
      setName(s?.name || null);
    } catch {
      setName(null);
    }
  }, []);
  return name;
}

function Thread({ room }) {
  const messages = useMessages(room.id);
  const buyerOnline = useOnline(room.buyerKey);
  const [text, setText] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({
      sellerKey: room.sellerKey, sellerName: room.sellerName,
      buyerKey: room.buyerKey, buyerName: room.buyerName,
      from: "seller", text,
    });
    setText("");
  };

  return (
    <div className="ct-thread">
      <div className="ct-thread-head">
        <span className="chat-avatar">{(room.buyerName || "P")[0].toUpperCase()}</span>
        <div>
          <p className="chat-seller-name" style={{ color: "#2d1107" }}>{room.buyerName}</p>
          <span className="chat-online" style={{ color: "#7b6a5c" }}>
            <span className={`chat-dot${buyerOnline ? "" : " off"}`} /> {buyerOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <div className="ct-thread-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <p className="chat-empty">Belum ada pesan. Sapa pembelimu!</p>
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

export default function ChatTokoPage() {
  const storeName = useStoreName();
  useHeartbeat(storeName, storeName); // penjual dianggap online selama halaman ini kebuka
  const rooms = useSellerRooms(storeName);
  const [activeId, setActiveId] = useState(null);
  const active = rooms.find((r) => r.id === activeId) || null;

  if (storeName === undefined) return null; // masih loading
  if (storeName === null) {
    return (
      <main className="ct-wrap">
        <div className="ct-empty">
          <Icon name="store" size={40} strokeWidth={1.6} />
          <p>Kamu belum punya toko. Buka menu Toko dulu buat mulai jualan & terima chat.</p>
          <Link href="/toko" className="ord-empty-btn">Buka Toko Saya</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ct-wrap">
      <div className="ct-header">
        <h1 className="ct-title"><Icon name="send" size={20} /> Kotak Masuk — {storeName}</h1>
        <p className="ct-sub">Selama halaman ini kebuka, kamu tampil <b>Online</b> ke pembeli. Bales chat langsung di sini.</p>
      </div>
      <div className="ct-layout">
        <div className="ct-list">
          {rooms.length === 0 ? (
            <p className="ct-none">Belum ada pembeli yang chat.</p>
          ) : (
            rooms.map((r) => (
              <button key={r.id} className={`ct-room${activeId === r.id ? " active" : ""}`} onClick={() => setActiveId(r.id)}>
                <span className="chat-avatar">{(r.buyerName || "P")[0].toUpperCase()}</span>
                <span className="ct-room-info">
                  <span className="ct-room-name">{r.buyerName}</span>
                  <span className="ct-room-last">{r.lastFrom === "seller" ? "Kamu: " : ""}{r.lastMessage}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <div className="ct-panel">
          {active ? <Thread room={active} /> : <div className="ct-choose">Pilih percakapan di kiri buat mulai bales.</div>}
        </div>
      </div>
    </main>
  );
}