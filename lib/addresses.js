"use client";
import { useEffect, useState } from "react";

const KEY = "kopipetani_addresses";

export function getAddresses() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function persist(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("addresses-updated"));
}

export function addAddress(addr) {
  const list = getAddresses();
  const item = {
    id: "AD" + Date.now(),
    name: (addr.name || "").trim(),
    phone: (addr.phone || "").trim(),
    detail: (addr.detail || "").trim(),
    isDefault: list.length === 0,
  };
  list.unshift(item);
  persist(list);
  return item;
}

export function updateAddress(id, patch) {
  const list = getAddresses().map((a) =>
    a.id === id
      ? {
          ...a,
          name: (patch.name ?? a.name).trim?.() ?? a.name,
          phone: (patch.phone ?? a.phone).trim?.() ?? a.phone,
          detail: (patch.detail ?? a.detail).trim?.() ?? a.detail,
        }
      : a
  );
  persist(list);
}

export function deleteAddress(id) {
  let list = getAddresses().filter((a) => a.id !== id);
  if (list.length && !list.some((a) => a.isDefault)) {
    list = list.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }
  persist(list);
}

export function setDefaultAddress(id) {
  const list = getAddresses().map((a) => ({ ...a, isDefault: a.id === id }));
  persist(list);
}

export function useAddresses() {
  const [addresses, setAddresses] = useState([]);
  useEffect(() => {
    const load = () => setAddresses(getAddresses());
    load();
    window.addEventListener("addresses-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("addresses-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return addresses;
}