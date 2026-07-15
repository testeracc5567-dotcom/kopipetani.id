import Link from "next/link";

export default function Hero() {
  return (
    <section className="khero">
      {/* Video background (asli, bukan AI) */}
      <video
        className="khero-video"
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="khero-overlay" />

      <div className="khero-content">
        <span className="khero-eyebrow">DARI KEBUN KE CANGKIR</span>
        <h1 className="khero-title">
          Kopi Segar, Langsung dari Petani Nusantara
        </h1>
        <p className="khero-desc">
          Kami bantu petani kopi lokal menjual hasil panennya langsung ke kamu —
          biji pilihan dari kebun terbaik Indonesia, dengan harga yang adil buat
          para petani.
        </p>

        <Link href="/produk" className="khero-btn">
          <svg
            className="khero-btn-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Belanja Sekarang
        </Link>
      </div>
    </section>
  );
}