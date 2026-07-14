"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEFAULT_USER = {
  name: "Waguri",
  email: "waguri@email.com",
  role: "Pembeli",
  memberLevel: "bronze",
  points: 1257,
  joinDate: "2024-01-15",
  avatar: null,
  phone: "+62 812 3456 7890",
  address: "Jakarta, Indonesia",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kopipetani_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("kopipetani_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("kopipetani_user");
    }
  }, [user]);

  const login = (formData) => {
    const userData = {
      ...DEFAULT_USER,
      name: formData.name || DEFAULT_USER.name,
      email: formData.email || DEFAULT_USER.email,
    };
    setUser(userData);
    return userData;
  };

  const register = (formData) => {
    const userData = {
      ...DEFAULT_USER,
      name: formData.name || "Pengguna Baru",
      email: formData.email || DEFAULT_USER.email,
      points: 100,
      memberLevel: "bronze",
      joinDate: new Date().toISOString().split("T")[0],
    };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const isLoggedIn = !!user;

  const memberInfo = {
    bronze: {
      label: "AgroBronze Member",
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
        logout,
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
