"use client";

import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";

export default function MitraSection() {
  const { openAuth } = useUI();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleToko = () => {
    if (isLoggedIn) router.push("/toko");
    else openAuth("daftar");
  };

  return (
    <section id="mitra">
      <div className="wrap">
        <div className="mitra-inner">
          <h2>Bergabunglah dengan KopiPetani.id</h2>
          <p className="mitra-tagline">
            Terhubung dengan komunitas kopi yang menghargai kualitas,
            transparansi, dan dukungan lokal.
          </p>
          <div className="mitra-cards">
            <div className="mcard">
              <p>
                Petani kopi, tawarkan hasil panen langsung ke pencinta kopi
                premium.
              </p>
              <button className="btn" onClick={handleToko}>
                Daftar Toko KopiPetani.id
              </button>
            </div>
            <div className="mcard">
              <p>
                Penikmat kopi, temukan biji kopi seduh racikan artisan dari
                nusantara.
              </p>
              <button className="btn" onClick={() => router.push("/produk")}>
                Ayo Belanja Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}