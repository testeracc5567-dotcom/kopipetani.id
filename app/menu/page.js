import Link from "next/link";

export default function MenuPage() {
  return (
    <main className="page-section">
      <div className="wrap">
        <div className="page-head">
          <p className="eyebrow">Menu</p>
          <h1>Temukan Seluruh Pilihan Produk KopiPetani</h1>
          <p className="page-intro">
            Jelajahi kategori kopi, alat seduh, dan produk pendukung pertanian kopi dalam satu tempat.
          </p>
        </div>

        <div className="page-grid">
          {[
            { title: "Biji Kopi", href: "/produk", description: "Kopi arabika, robusta, dan green bean dari kebun lokal.", button: "Lihat Produk" },
            { title: "Peralatan", href: "/produk", description: "Alat seduh dan perlengkapan kopi berkualitas premium.", button: "Lihat Produk" },
            { title: "Edukasi", href: "/blog", description: "Konten dan artikel kopi untuk meningkatkan pengetahuan seduh Anda.", button: "Baca Blog" },
            { title: "Tentang Kami", href: "/tentang-kami", description: "Pelajari misi KopiPetani dan dukungan kami terhadap petani lokal.", button: "Pelajari Lebih" },
          ].map((card) => (
            <article key={card.title} className="page-card">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link href={card.href} className="btn btn-ghost">
                {card.button}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
