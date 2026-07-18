"use client";
import { useRef, useEffect, useState } from "react";
import Icon from "@/components/Icon";

export default function WhySection() {
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
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="why" id="why" ref={ref}>
      <div className={`wrap why-reveal${inView ? " is-in" : ""}`}>
        {/* 🔴 Banner ajakan KupAI */}
        <div className="ai-cta">
          <div className="ai-cta__left">
            <span className="ai-cta__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 0 1-.9-3.9A8.38 8.38 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5z" />
              </svg>
            </span>
            <div>
              <b className="ai-cta__title">Bingung mau Belanja atau Menjual?</b>
              <p className="ai-cta__desc">
                Santai, nggak usah pusing sendiri! Yuk ngobrol langsung sama KupAI — asisten pintar kami yang siap nemenin & bantuin kamu kapan aja.
              </p>
            </div>
          </div>
          <button
            className="ai-cta__btn"
            onClick={() => window.dispatchEvent(new Event("open-kupai"))}
          >
            Ngobrol sama KupAI →
          </button>
        </div>

        <div className="center">
          <span className="eyebrow">Kenapa KopiPetani</span>
          <h2>Mengapa Pilih KopiPetani.id?</h2>
          <p>
            Kami merangkai pengalaman kopi premium yang mengutamakan rasa,
            keberlanjutan, dan manfaat nyata bagi petani lokal.
          </p>
        </div>

        <div className="why-cols">
          <div className="why-col">
            <h3>
              <span className="ic"><Icon name="coffee" size={20} /></span> Untuk Penikmat Kopi
            </h3>
            <div className="feat">
              <span className="fi"><Icon name="star" size={22} /></span>
              <div>
                <b>Rasa Otentik Nusantara</b>
                <p>
                  Pilihan biji kopi single origin dan roasted blends yang
                  dikelola langsung dari petani ke cangkir Anda.
                </p>
              </div>
            </div>
            <div className="feat">
              <span className="fi"><Icon name="truck" size={22} /></span>
              <div>
                <b>Pengiriman Segar &amp; Cepat</b>
                <p>
                  Kopi dikemas rapi dan dikirim dalam kondisi terbaik sehingga
                  tetap segar sampai di rumah Anda.
                </p>
              </div>
            </div>
            <div className="feat">
              <span className="fi"><Icon name="leaf" size={22} /></span>
              <div>
                <b>Dukung Komunitas Lokal</b>
                <p>
                  Setiap pesanan membantu meningkatkan kesejahteraan petani
                  kopi dan keberlanjutan usaha mereka.
                </p>
              </div>
            </div>
          </div>
          <div className="why-col">
            <h3>
              <span className="ic"><Icon name="sprout" size={20} /></span> Untuk Mitra Petani
            </h3>
            <div className="feat">
              <span className="fi"><Icon name="coins" size={22} /></span>
              <div>
                <b>Harga Jual yang Lebih Adil</b>
                <p>
                  Petani dapat menjual kopi langsung tanpa perantara, sehingga
                  margin lebih adil dan transparan.
                </p>
              </div>
            </div>
            <div className="feat">
              <span className="fi"><Icon name="store" size={22} /></span>
              <div>
                <b>Akses Pasar yang Luas</b>
                <p>
                  Produk kopi Anda tampil di hadapan komunitas kopi yang
                  menghargai kualitas dan cerita di balik setiap biji.
                </p>
              </div>
            </div>
            <div className="feat">
              <span className="fi"><Icon name="check-circle" size={22} /></span>
              <div>
                <b>Transparansi Proses</b>
                <p>
                  Informasi harga, pengiriman, dan pembayaran jelas di setiap
                  langkah kerjasama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}