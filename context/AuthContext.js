"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);

const DEFAULT_PROFILE = {
  role: "Pembeli",
  memberLevel: "bronze",
  points: 100,
  avatar: null,
  phone: "",
  address: "",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let profile = {};
        try {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          if (snap.exists()) profile = snap.data();
        } catch (e) {}
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || profile.name || "Pengguna",
          ...DEFAULT_PROFILE,
          ...profile,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const register = async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      try { await updateProfile(cred.user, { displayName: name }); } catch (e) {}
    }
    const profile = {
      name: name || "Pengguna Baru",
      email,
      role: "Pembeli",
      memberLevel: "bronze",
      points: 100,
      avatar: null,
      phone: "",
      address: "",
      joinDate: new Date().toISOString().split("T")[0],
    };
    try { await setDoc(doc(db, "users", cred.user.uid), profile); } catch (e) {}
    setUser({ uid: cred.user.uid, ...DEFAULT_PROFILE, ...profile });
    return cred.user;
  };

  // === LOGIN DENGAN GOOGLE ===
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const fbUser = cred.user;
    // Kalau user baru (belum ada profil di Firestore), buatkan profilnya
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const profile = {
        name: fbUser.displayName || "Pengguna Baru",
        email: fbUser.email,
        role: "Pembeli",
        memberLevel: "bronze",
        points: 100,
        avatar: fbUser.photoURL || null,
        phone: "",
        address: "",
        joinDate: new Date().toISOString().split("T")[0],
      };
      try { await setDoc(ref, profile); } catch (e) {}
    }
    return fbUser;
  };

  const logout = async () => {
    await signOut(auth);
  };

  // === RESET PASSWORD via email (Firebase bawaan) ===
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUser = async (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    if (user?.uid) {
      try { await updateDoc(doc(db, "users", user.uid), updates); } catch (e) {}
    }
  };

  const isLoggedIn = !!user;

  const memberInfo = {
    bronze: {
      label: "Bronze Member",
      nextLevel: "Silver",
      pointsNeeded: 2500,
      color: "#CD7F32",
      benefits: [
        "Mendapatkan 1 voucher diskon 12% jika belanja 10x dalam waktu sebulan.",
        "Bonus poin kelipatan 10%",
      ],
    },
    silver: {
      label: "AgroSilver Member",
      nextLevel: "Gold",
      pointsNeeded: 5000,
      color: "#C0C0C0",
      benefits: [
        "Mendapatkan 2 voucher diskon 20% jika belanja 20x dalam waktu sebulan.",
        "Bonus poin kelipatan level member +20%",
        "Dapatkan Promo Spesial tiap bulannya",
      ],
    },
    gold: {
      label: "AgroGold Member",
      nextLevel: null,
      pointsNeeded: 10000,
      color: "#FFD700",
      benefits: [
        "Mendapatkan 3 voucher diskon 35% jika belanja 30x dalam waktu sebulan.",
        "Bonus poin kelipatan level member +30%",
        "Dapatkan Promo Spesial tiap minggunya",
        "Spesial diskon ulang tahun",
      ],
    },
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUser,
        memberInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}