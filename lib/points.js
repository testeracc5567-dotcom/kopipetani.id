"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// Hitung poin dari total belanja (1000 poin per Rp10.000)
export function calcPoints(total) {
  return Math.floor((total || 0) / 10000) * 1000;
}

// Format tanggal buat ditampilkan
export function nowStr() {
  return new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Tambah 1 baris riwayat poin ke Firestore — otomatis per akun yang sedang login
export async function addPointHistory(entry) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await addDoc(collection(db, "users", user.uid, "pointHistory"), {
      type: entry.type, // "in" (masuk) atau "out" (keluar)
      amount: entry.amount,
      note: entry.note,
      date: entry.date || nowStr(),
      ts: Date.now(), // buat urutan
    });
  } catch (e) {
    console.error("Gagal menyimpan riwayat poin:", e);
  }
}

// Hook realtime: baca riwayat poin milik akun yang sedang login
export function useRiwayat() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Bersihin data dummy lama yang nyangkut di localStorage (kalau ada)
    try {
      localStorage.removeItem("kopipetani_riwayat");
    } catch {}

    let unsubSnap = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Ganti akun -> matiin listener lama
      if (unsubSnap) {
        unsubSnap();
        unsubSnap = null;
      }
      if (!user) {
        setHistory([]);
        return;
      }
      const q = query(
        collection(db, "users", user.uid, "pointHistory"),
        orderBy("ts", "desc")
      );
      unsubSnap = onSnapshot(
        q,
        (snap) => setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
          console.error("Gagal memuat riwayat poin:", err);
          setHistory([]);
        }
      );
    });

    return () => {
      if (unsubSnap) unsubSnap();
      unsubAuth();
    };
  }, []);

  return history;
}