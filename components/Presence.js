"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useHeartbeat } from "@/lib/chat";

export default function Presence() {
  const { user, isLoggedIn } = useAuth();
  const [storeName, setStoreName] = useState(null);

  // Kunci pribadi (dipakai di chat, biar pembeli keliatan online ke penjual)
  const personalKey = isLoggedIn ? (user?.email || user?.name || null) : null;

  // Ambil nama toko user (kalau punya) -> biar tokonya juga "online"
  useEffect(() => {
    const uid = user?.uid || auth.currentUser?.uid;
    if (!isLoggedIn || !uid) {
      setStoreName(null);
      return;
    }
    const ref = doc(db, "users", uid, "store", "main");
    const unsub = onSnapshot(
      ref,
      (snap) => setStoreName(snap.exists() ? (snap.data()?.name || null) : null),
      () => setStoreName(null)
    );
    return () => unsub();
  }, [isLoggedIn, user?.uid]);

  // Detak jantung untuk 2 kunci: pribadi + nama toko
  useHeartbeat(personalKey, user?.name);
  useHeartbeat(storeName, storeName);

  return null;
}