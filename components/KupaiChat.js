"use client";
import { useEffect, useRef, useState } from "react";
import { products } from "@/lib/data";
import { chipsByMode } from "@/lib/kupai";
import { useCart } from "@/context/CartContext";
import Icon from "@/components/Icon";

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

  // 🔴 Biar KupAI bisa dibuka dari luar (misal tombol banner "Ngobrol sama KupAI")
  useEffect(() => {
    const handler = () => {
      if (open) return; // sudah kebuka, biarin aja
      setOpen(true);
      if (!started) {
        setStarted(true);
        botSay(
          "Halo! Aku <b>KupAI</b>, asisten kopi kamu — dari kebun sampai cangkir. Mau tanya soal belanja kopi, cara seduh, atau tips tanam? Atau mau cerita-cerita dulu juga boleh, aku dengerin kok!"
        );
      }
    };
    window.addEventListener("open-kupai", handler);
    return () => window.removeEventListener("open-kupai", handler);
  }, [open, started]);

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && !started) {
      setStarted(true);
      botSay(
        "Halo! Aku <b>KupAI</b>, asisten kopi kamu — dari kebun sampai cangkir. Mau tanya soal belanja kopi, cara seduh, atau tips tanam? Pilih di bawah atau ketik langsung ya!"
      );
    }
  };

  const setModeAndAnnounce = (m) => {
    setMode(m);
    botSay(
      m === "pembeli"
        ? "Oke, mode <b>Pembeli</b> aktif. Aku bantu pilih kopi & cara nyeduhnya."
        : "Oke, mode <b>Petani</b> aktif. Aku bantu soal tanam, panen, proses & harga jual."
    );
  };

  const respond = async (text) => {
    setTyping(true);
    const history = [...messages, { who: "me", text }].map((m) => ({
      role: m.who === "bot" ? "assistant" : "user",
      content: (m.html || m.text || "").replace(/<[^>]+>/g, " ").trim(),
    }));
    try {
      const res = await fetch("/api/kupai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      setTyping(false);
      botSay(data.reply);
    } catch (e) {
      setTyping(false);
      botSay("Waduh, KupAI lagi susah nyambung ke server. Coba lagi ya.");
    }
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
        <img className="kup-logo" src="/kupai-logo.svg" alt="KupAI" />
        <span className="lbl">KupAI</span>
      </button>

      <div className={"kup-panel" + (open ? " open" : "")}>
        <div className="kup-head">
          <div className="av"><img className="kup-logo" src="/kupai-logo.svg" alt="KupAI" /></div>
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
                      <Icon name="plus" size={13} /> Tambah{" "}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
              <path d="m21.854 2.147-10.94 10.939" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}