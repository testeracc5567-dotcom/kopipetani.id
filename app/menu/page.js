import Categories from "@/components/Categories";
import Shop from "@/components/Shop";
import MitraSection from "@/components/MitraSection";
import WhySection from "@/components/WhySection";
import Link from "next/link";

export default function MenuPage() {
  return (
    <main>
      {/* Hero ala beranda */}
      <section className="mnhero">
        <video
          className="mnhero__bg"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="mnhero__overlay" />
        <div className="mnhero__inner">
          <span className="mnhero__eyebrow">Dari Kebun ke Cangkir</span>
          <h1 className="mnhero__title">
            Temukan Seluruh Pilihan Produk KopiPetani.id
          </h1>
          <p className="mnhero__desc">
            Jelajahi kopi pilihan dan wawasan seduh dari petani lokal — semua di
            satu tempat, dari hulu sampai ke cangkirmu.
          </p>
          <div className="mnhero__actions">
            <Link href="/produk" className="mnhero__btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              Belanja Sekarang
            </Link>
            <Link href="/blog" className="mnhero__btn mnhero__btn--ghost">
              Baca Edukasi
            </Link>
          </div>
        </div>
      </section>

      {/* Section sama kayak beranda */}
      <Categories />
      <Shop />
      <MitraSection />
      <WhySection />
    </main>
  );
}