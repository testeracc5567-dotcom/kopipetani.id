"use client";
import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export async function addReview(productId, review) {
  const entry = {
    productId: String(productId),
    user: review.user || "Pengguna",
    userId: auth.currentUser?.uid || null,
    rating: review.rating || 5,
    text: review.text || "",
    createdAt: Date.now(),
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
  };
  await addDoc(collection(db, "reviews"), entry);
  return entry;
}

export function useProductReviews(productId) {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (productId == null) { setList([]); return; }
    const q = query(collection(db, "reviews"), where("productId", "==", String(productId)));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setList(arr);
      },
      () => setList([])
    );
    return () => unsub();
  }, [productId]);
  return list;
}

// stub biar import lama nggak error
export function getReviews() { return {}; }
export function getProductReviews() { return []; }