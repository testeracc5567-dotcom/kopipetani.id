"use client";

import { useEffect, useRef, useState } from "react";
import { products } from "@/lib/data";
import { chipsByMode, answer } from "@/lib/kupai";
import { useCart } from "@/context/CartContext";

export default function KupaiChat() {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState("pembeli");
  const [messages, setMessages] = useState([]); // {who: 'bot'|'me', html?: string, text?: string, recId?: number}
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const botSay = (html, recId) => {
    setMessages((prev) => [...prev, { who: "bot", html, recId }]);
  };

  const meSay = (text) => {
    setMessages((prev) => [...prev, { who: "me", text }]);
  };

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && !started) {
      setStarted(true);
      botSay(
        "Halo! Aku <b>KupAI</b> ☕, asisten kopi kamu — dari kebun sampai cangkir. Mau tanya soal belanja kopi, cara seduh, atau tips tanam? Pilih di bawah atau ketik langsung ya!"
      );
    }
  };

  const setModeAndAnnounce = (m) => {
    setMode(m);
    botSay(
      m === "pembeli"
        ? "Oke, mode <b>Pembeli</b> aktif ☕. Aku bantu pilih kopi & cara nyeduhnya."
        : "Oke, mode <b>Petani</b> aktif 🌱. Aku bantu soal tanam, panen, proses & harga jual."
    );
  };

  const respond = (text) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const [html, recId] = answer(text.toLowerCase());
      botSay(html, recId);
    }, 650);
  };

  const ask = (chip) => {
    if (!open) toggle();
    meSay(chip);
    respond(chip);
  };

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    meSay(t);
    respond(t);
  };

  return (
    <>
      <button
        className="kup-fab"
        style={{ display: open ? "none" : "flex" }}
        onClick={toggle}
        aria-label="Buka KupAI"
      >
        <span className="em">☕</span>
        <span className="lbl">KupAI</span>
      </button>

      <div className={"kup-panel" + (open ? " open" : "")}>
        <div className="kup-head">
          <div className="av">☕</div>
          <div className="ht">
            <b>KupAI</b>
            <small>Online</small>
          </div>
          <button className="kclose" onClick={toggle} aria-label="Tutup">
            ×
          </button>
        </div>
        <div className="kup-mode">
          <button
            className={mode === "pembeli" ? "active" : ""}
            onClick={() => setModeAndAnnounce("pembeli")}
          >
            Pembeli
          </button>
          <button
            className={mode === "petani" ? "active" : ""}
            onClick={() => setModeAndAnnounce("petani")}
          >
            Petani
          </button>
        </div>
        <div className="kup-body" ref={bodyRef}>
          {messages.map((m, i) =>
            m.who === "bot" ? (
              <div className="msg bot" key={i}>
                <span dangerouslySetInnerHTML={{ __html: m.html }} />
                {m.recId && (
                  <>
                    <br />
                    <button
                      className="recadd"
                      onClick={() => addToCart(m.recId)}
                    >
                      ➕ Tambah{" "}
                      {products.find((p) => p.id === m.recId)?.name} ke
                      keranjang
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="msg me" key={i}>
                {m.text}
              </div>
            )
          )}
          {typing && (
            <div className="msg bot typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
        <div className="chips">
          {chipsByMode[mode].map((c) => (
            <button key={c} onClick={() => ask(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="kup-input">
          <input
            type="text"
            placeholder="Ketik pertanyaanmu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} aria-label="Kirim">
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
