"use client";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";

export default function MitraSection() {
  const { openAuth } = useUI();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleToko = () => {
    if (isLoggedIn) router.push("/toko");
    else openAuth("daftar");
  };

  return (
    <section id="mitra">
      <div className="wrap">
        <div ref={ref} className={`mitra-inner mitra-reveal${inView ? " is-in" : ""}`}>
          <h2>Bergabunglah dengan KopiPetani.id</h2>
          <p className="mitra-tagline">
            Terhubung dengan komunitas kopi yang menghargai kualitas, transparansi, dan dukungan lokal.
          </p>
          <div className="mitra-cards">
            <div className="mcard">
              <p>Petani kopi, tawarkan hasil panen langsung ke pencinta kopi premium.</p>
              <button className="btn" onClick={handleToko}>Daftar Toko KopiPetani.id</button>
            </div>
            <div className="mcard">
              <p>Penikmat kopi, temukan biji kopi seduh racikan artisan dari nusantara.</p>
              <button className="btn" onClick={() => router.push("/produk")}>Ayo Belanja Sekarang</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}