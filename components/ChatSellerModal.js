"use client";
import { useState, useEffect, useRef } from "react";
import Icon from "@/components/Icon";
import { useChatThread, sendMessage } from "@/lib/chat";

export default function ChatSellerModal({ seller, onClose }) {
  const thread = useChatThread(seller);
  const [text, setText] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [thread]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(seller, text);
    setText("");
  };

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-head">
          <div className="chat-head-info">
            <span className="chat-avatar">{(seller || "P")[0].toUpperCase()}</span>
            <div>
              <p className="chat-seller-name">{seller}</p>
              <span className="chat-online"><span className="chat-dot" /> Online</span>
            </div>
          </div>
          <button className="chat-close" onClick={onClose} aria-label="Tutup"><Icon name="x" size={18} /></button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {thread.length === 0 ? (
            <p className="chat-empty">Mulai obrolan dengan penjual. Tanya stok, pengiriman, atau produk ya!</p>
          ) : (
            thread.map((m) => (
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