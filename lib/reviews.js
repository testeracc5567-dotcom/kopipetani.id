"use client";

import { useEffect, useState } from "react";

const REVIEWS_KEY = "kopipetani_reviews";

export function getReviews() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getProductReviews(productId) {
  return getReviews()[productId] || [];
}

export function addReview(productId, review) {
  const all = getReviews();
  const list = all[productId] || [];
  const entry = {
    id: Date.now(),
    user: review.user || "Pengguna",
    rating: review.rating || 5,
    text: review.text || "",
    date: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
  all[productId] = [entry, ...list];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("reviews-updated"));
  return entry;
}

export function useProductReviews(productId) {
  const [list, setList] = useState([]);
  useEffect(() => {
    const load = () => setList(getProductReviews(productId));
    load();
    window.addEventListener("reviews-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("reviews-updated", load);
      window.removeEventListener("storage", load);
    };
  }, [productId]);
  return list;
}