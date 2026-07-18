"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection, doc, addDoc, setDoc, onSnapshot, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";

const clean = (s) => String(s || "").replace(/\//g, "-").trim() || "x";

export function makeRoomId(sellerKey, buyerKey) {
  return `${clean(sellerKey)}___${clean(buyerKey)}`;
}

// Kirim pesan (dari buyer maupun seller — sama-sama manusia)
export async function sendMessage({ sellerKey, sellerName, buyerKey, buyerName, from, text }) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;
  const roomId = makeRoomId(sellerKey, buyerKey);
  // simpan info room biar penjual punya "kotak masuk"
  await setDoc(
    doc(db, "rooms", roomId),
    {
      sellerKey: clean(sellerKey), sellerName: sellerName || sellerKey,
      buyerKey: clean(buyerKey), buyerName: buyerName || buyerKey,
      lastMessage: cleanText, lastFrom: from, lastAt: serverTimestamp(),
    },
    { merge: true }
  );
  await addDoc(collection(db, "rooms", roomId, "messages"), {
    from, text: cleanText, createdAt: serverTimestamp(),
  });
}

export function useMessages(roomId) {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => setMsgs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [roomId]);
  return msgs;
}

// Kotak masuk penjual: semua percakapan untuk toko ini
export function useSellerRooms(sellerKey) {
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    if (!sellerKey) return;
    const q = query(collection(db, "rooms"), where("sellerKey", "==", clean(sellerKey)));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.lastAt?.seconds || 0) - (a.lastAt?.seconds || 0));
      setRooms(list);
    });
  }, [sellerKey]);
  return rooms;
}

// Kotak masuk pembeli: semua percakapan milik pembeli ini
export function useBuyerRooms(buyerKey) {
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    if (!buyerKey) return;
    const q = query(collection(db, "rooms"), where("buyerKey", "==", clean(buyerKey)));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.lastAt?.seconds || 0) - (a.lastAt?.seconds || 0));
      setRooms(list);
    });
  }, [buyerKey]);
  return rooms;
}

// ===== Presence (Online / Offline) =====
export function useHeartbeat(userId, label) {
  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "presence", clean(userId));
    const beat = () => setDoc(ref, { online: true, label: label || userId, lastActive: serverTimestamp() }, { merge: true });
    beat();
    const iv = setInterval(beat, 10000);
    const goOff = () => setDoc(ref, { online: false, lastActive: serverTimestamp() }, { merge: true });
    window.addEventListener("beforeunload", goOff);
    return () => {
      clearInterval(iv);
      goOff();
      window.removeEventListener("beforeunload", goOff);
    };
  }, [userId, label]);
}

export function useOnline(userId) {
  const [data, setData] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "presence", clean(userId));
    return onSnapshot(ref, (snap) => setData(snap.data() || null));
  }, [userId]);
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(iv);
  }, []);
  if (!data || !data.online) return false;
  const last = data.lastActive?.seconds ? data.lastActive.seconds * 1000 : 0;
  return now - last < 45000; // dianggap online kalau aktif < 45 detik lalu
}
// ===== Presence detail: online + terakhir aktif + status toko lama nganggur =====
export function usePresence(userId) {
  const [data, setData] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }
    const ref = doc(db, "presence", clean(userId));
    return onSnapshot(ref, (snap) => setData(snap.exists() ? snap.data() : null));
  }, [userId]);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(iv);
  }, []);

  const lastActiveMs = data?.lastActive?.seconds ? data.lastActive.seconds * 1000 : 0;
  const hasData = lastActiveMs > 0;
  const online = !!(data && data.online) && hasData && now - lastActiveMs < 45000;
  const diff = hasData ? now - lastActiveMs : Infinity;
  const staleDays = hasData ? Math.floor(diff / 86400000) : Infinity;
  // toko dianggap "lama nganggur" kalau offline & terakhir aktif >= 3 hari (atau belum pernah online)
  const isStale = !online && (!hasData || diff >= 3 * 86400000);

  let agoText;
  if (online) {
    agoText = "Online sekarang";
  } else if (!hasData) {
    agoText = "Belum pernah terlihat online";
  } else {
    const mins = Math.floor(diff / 60000);
    if (mins < 1) agoText = "Aktif beberapa detik lalu";
    else if (mins < 60) agoText = `Aktif ${mins} menit lalu`;
    else {
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) agoText = `Aktif ${hrs} jam lalu`;
      else agoText = `Aktif ${Math.floor(hrs / 24)} hari lalu`;
    }
  }

  return { online, lastActiveMs, agoText, staleDays, isStale, hasData };
}