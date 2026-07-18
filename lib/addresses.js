"use client";
import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, onSnapshot, writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

function col(uid) { return collection(db, "users", uid, "addresses"); }

export async function addAddress(addr) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const snap = await getDocs(col(uid));
  const data = {
    name: (addr.name || "").trim(),
    phone: (addr.phone || "").trim(),
    detail: (addr.detail || "").trim(),
    isDefault: snap.empty,
    createdAt: Date.now(),
  };
  const ref = await addDoc(col(uid), data);
  return { id: ref.id, ...data };
}

export async function updateAddress(id, patch) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const data = {};
  if (patch.name != null) data.name = String(patch.name).trim();
  if (patch.phone != null) data.phone = String(patch.phone).trim();
  if (patch.detail != null) data.detail = String(patch.detail).trim();
  await updateDoc(doc(db, "users", uid, "addresses", id), data);
}

export async function deleteAddress(id) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await deleteDoc(doc(db, "users", uid, "addresses", id));
  const snap = await getDocs(col(uid));
  if (!snap.empty && !snap.docs.some((d) => d.data().isDefault)) {
    await updateDoc(snap.docs[0].ref, { isDefault: true });
  }
}

export async function setDefaultAddress(id) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const snap = await getDocs(col(uid));
  const batch = writeBatch(db);
  snap.forEach((d) => batch.update(d.ref, { isDefault: d.id === id }));
  await batch.commit();
}

export function useAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [uid, setUid] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);
  useEffect(() => {
    if (!uid) { setAddresses([]); return; }
    const unsub = onSnapshot(
      col(uid),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAddresses(list);
      },
      () => setAddresses([])
    );
    return () => unsub();
  }, [uid]);
  return addresses;
}

export function getAddresses() { return []; } // stub