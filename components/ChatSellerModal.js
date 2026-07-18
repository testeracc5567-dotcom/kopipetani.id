"use client";
import { useState, useEffect, useRef } from "react";
import Icon from "@/components/Icon";
import { makeRoomId, useMessages, sendMessage, useOnline, useHeartbeat } from "@/lib/chat";

export default function ChatSellerModal({ sellerKey, sellerName, buyerKey, buyerName, onClose }) {
  const roomId = makeRoomId(sellerKey, buyerKey);
  const messages = useMessages(roomId);
  const online = useOnline(sellerKey);
  useHeartbeat(buyerKey, buyerName); // biar penjual lihat pembeli online
  const [text, setText] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({ sellerKey, sellerName, buyerKey, buyerName, from: "buyer", text });
    setText("");
  };

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-head">
          <div className="chat-head-info">
            <span className="chat-avatar">{(sellerName || "P")[0].toUpperCase()}</span>
            <div>
              <p className="chat-seller-name">{sellerName}</p>
              <span className="chat-online">
                <span className={`chat-dot${online ? "" : " off"}`} /> {online ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <button className="chat-close" onClick={onClose} aria-label="Tutup"><Icon name="x" size={18} /></button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {messages.length === 0 ? (
            <p className="chat-empty">Mulai obrolan dengan penjual. Tanya stok, pengiriman, atau produk ya!</p>
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
    </div>
  );
}