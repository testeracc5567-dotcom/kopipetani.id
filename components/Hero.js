export default function Hero() {
  return (
    <div className="hero">
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="eyebrow" style={{ color: "var(--caramel)" }}>
              DARI KEBUN KE CANGKIR
            </span>
            <h1>
              Kopi Segar Langsung dari Tangan Petani Nusantara
            </h1>
            <p>
              KopiPetani menghubungkan penikmat kopi sejati dengan biji kopi artisanal terbaik dari dataran tinggi Indonesia, diproses secara berkelanjutan oleh petani lokal.
            </p>
            <div className="hero-actions">
              <a href="#shop" className="btn btn-caramel">
                BELANJA SEKARANG
              </a>
              <a href="#why" className="btn btn-ghost">
                PELAJARI PROSES
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
