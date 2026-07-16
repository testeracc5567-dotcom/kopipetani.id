"use client";
import { useEffect, useState } from "react";

const KEY = "kopipetani_chats";

export function getAllChats() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function persist(all) {
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("chats-updated"));
}

export function getThread(seller) {
  const all = getAllChats();
  return all[seller] || [];
}

function autoReply(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("kirim") || t.includes("kapan") || t.includes("sampai"))
    return "Halo kak! Pesanannya sedang kami proses ya, estimasi dikirim 1x24 jam.";
  if (t.includes("stok") || t.includes("ready"))
    return "Stok masih tersedia kak, langsung checkout aja ya!";
  if (t.includes("harga") || t.includes("nego"))
    return "Untuk harga sudah paling pas kak, tapi ada potongan kalau beli banyak.";
  return "Halo kak, terima kasih sudah menghubungi kami! Ada yang bisa dibantu?";
}

export function sendMessage(seller, text) {
  const clean = (text || "").trim();
  if (!clean) return;
  const all = getAllChats();
  const thread = all[seller] || [];
  thread.push({ id: "M" + Date.now(), from: "buyer", text: clean, time: Date.now() });
  all[seller] = thread;
  persist(all);
  // Balasan otomatis penjual (simulasi)
  setTimeout(() => {
    const cur = getAllChats();
    const th = cur[seller] || [];
    th.push({ id: "M" + Date.now() + "r", from: "seller", text: autoReply(clean), time: Date.now() });
    cur[seller] = th;
    persist(cur);
  }, 900);
}

export function useChatThread(seller) {
  const [thread, setThread] = useState([]);
  useEffect(() => {
    const load = () => setThread(getThread(seller));
    load();
    window.addEventListener("chats-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("chats-updated", load);
      window.removeEventListener("storage", load);
    };
  }, [seller]);
  return thread;
}