"use client";

import { useUI } from "@/context/UIContext";

export default function MitraSection() {
  const { openAuth } = useUI();

  return (
    <section id="mitra">
      <div className="wrap">
        <div className="mitra-inner">
          <h2>Bergabunglah dengan KopiPetani</h2>

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

              <button
                className="btn"
                onClick={() => openAuth("daftar")}
              >
                Daftar Mitra KopiPetani
              </button>
            </div>

            <div className="mcard">
              <p>
                Penikmat kopi, temukan biji kopi seduh racikan artisan dari
                nusantara.
              </p>

              <button
                className="btn"
                onClick={() => openAuth("daftar")}
              >
                Bergabung sebagai Pembeli
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}