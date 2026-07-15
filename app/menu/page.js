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
            satu tempat, dari hulu sampai ke cangkirmu. ☕
          </p>
          <div className="mnhero__actions">
            <Link href="/produk" className="mnhero__btn">
              🛒 Belanja Sekarang
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