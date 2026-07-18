"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useBuyerRooms, useMessages, sendMessage, useHeartbeat, usePresence, makeRoomId } from "@/lib/chat";

function Thread({ room, buyerKey, buyerName }) {
  const messages = useMessages(room.id);
  const { online, agoText, isStale, staleDays } = usePresence(room.sellerKey);
  const [text, setText] = useState("");
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({ sellerKey: room.sellerKey, sellerName: room.sellerName, buyerKey, buyerName, from: "buyer", text });
    setText("");
  };

  return (
    <div className="ct-thread">
      <div className="ct-thread-head">
        <span className="chat-avatar">{(room.sellerName || "P")[0].toUpperCase()}</span>
        <div>
          <p className="chat-seller-name" style={{ color: "#2d1107" }}>{room.sellerName}</p>
          <span className="chat-online" style={{ color: "#7b6a5c" }}>
            <span className={`chat-dot${online ? "" : " off"}`} /> {agoText}
          </span>
        </div>
      </div>

      {isStale && (
        <div className="ct-stale">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            Toko ini {staleDays === Infinity ? "belum pernah terlihat online" : `sudah ${staleDays} hari tidak aktif`}.
            Belum bisa dipastikan apakah tokonya sedang buka — balasan mungkin lama ya.
          </span>
        </div>
      )}

      <div className="ct-thread-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <p className="chat-empty">Mulai obrolan dengan penjual.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-msg${m.from === "buyer" ? " chat-msg--me" : ""}`}>
              <span className="chat-bubble">{m.text}</span>
            </div>
          ))
        )}
      </div>
      <form className="chat-input-row" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan..." />
        <button type="submit" aria-label="Kirim"><Icon name="send" size={18} /></button>
      </form>
    </div>
  );
}

function ChatInner() {
  const { user, isLoggedIn } = useAuth();
  const { openAuth } = useUI();
  const searchParams = useSearchParams();
  const paramSeller = searchParams.get("seller");
  const paramName = searchParams.get("name");

  const buyerKey = user?.email || user?.name || "guest";
  const buyerName = user?.name || "Pembeli";
  useHeartbeat(isLoggedIn ? buyerKey : null, buyerName);
  const rooms = useBuyerRooms(isLoggedIn ? buyerKey : null);

  // Room dari tombol "Chat Penjual" (bisa jadi belum ada pesannya)
  const synthetic = paramSeller
    ? { id: makeRoomId(paramSeller, buyerKey), sellerKey: paramSeller, sellerName: paramName || paramSeller }
    : null;

  const [activeId, setActiveId] = useState(null);
  useEffect(() => {
    if (synthetic) setActiveId(synthetic.id);
  }, [synthetic?.id]);

  const allRooms =
    synthetic && !rooms.some((r) => r.id === synthetic.id) ? [synthetic, ...rooms] : rooms;
  const active = allRooms.find((r) => r.id === activeId) || null;

  if (!isLoggedIn) {
    return (
      <main className="ct-wrap">
        <div className="ct-empty">
          <Icon name="lock" size={40} strokeWidth={1.6} />
          <p>Login dulu buat lihat & lanjutin chat kamu dengan penjual.</p>
          <button className="ord-empty-btn" onClick={() => openAuth("masuk")}>Masuk / Daftar</button>
        </div>
      </main>
    );
  }

  return (
    <main className="ct-wrap">
      <div className="ct-header">
        <h1 className="ct-title"><Icon name="send" size={20} /> Chat Saya</h1>
        <p className="ct-sub">Semua obrolanmu dengan penjual ada di sini. Gak perlu cari produk lagi buat lanjut chat.</p>
      </div>
      <div className="ct-layout">
        <div className="ct-list">
          {allRooms.length === 0 ? (
            <p className="ct-none">Belum ada chat. Buka produk lalu klik "Chat Penjual" buat mulai.</p>
          ) : (
            allRooms.map((r) => (
              <button key={r.id} className={`ct-room${activeId === r.id ? " active" : ""}`} onClick={() => setActiveId(r.id)}>
                <span className="chat-avatar">{(r.sellerName || "P")[0].toUpperCase()}</span>
                <span className="ct-room-info">
                  <span className="ct-room-name">{r.sellerName}</span>
                  <span className="ct-room-last">{r.lastFrom === "buyer" ? "Kamu: " : ""}{r.lastMessage || "Ketuk untuk mulai chat"}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <div className="ct-panel">
          {active ? <Thread room={active} buyerKey={buyerKey} buyerName={buyerName} /> : <div className="ct-choose">Pilih percakapan di kiri.</div>}
        </div>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<main className="ct-wrap"><div className="ct-choose">Memuat chat…</div></main>}>
      <ChatInner />
    </Suspense>
  );
}