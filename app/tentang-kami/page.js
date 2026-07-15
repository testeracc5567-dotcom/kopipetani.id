export default function TentangKamiPage() {
  return (
    <main className="tk-page">
      <div className="tk-head">
        <span className="tk-eyebrow">TENTANG KAMI</span>
        <h1 className="tk-title">Tentang KopiPetani</h1>
        <p className="tk-sub">
          KopiPetani hadir untuk menghubungkan petani kopi lokal dengan para
          penikmat kopi berkualitas — biar hubungannya adil, dekat, dan saling
          menguntungkan.
        </p>
      </div>

      <div className="tk-grid">
        <div className="tk-card">
          <h2 className="tk-card-title">Misi Kami</h2>
          <p className="tk-card-text">
            Membangun platform perdagangan kopi yang adil, transparan, dan
            berkelanjutan. Kami mendukung petani lokal dengan membuka akses pasar
            yang lebih luas, memangkas rantai perantara, dan menonjolkan kualitas
            kopi Nusantara supaya makin dihargai — di dalam maupun luar negeri.
          </p>
        </div>

        <div className="tk-card">
          <h2 className="tk-card-title">Visi Kami</h2>
          <p className="tk-card-text">
            Menjadi marketplace kopi pilihan yang mempertemukan komoditas kopi
            terbaik dengan teknologi yang ramah pengguna. Kami ingin setiap
            transaksi membawa dampak sosial yang nyata bagi petani dan komunitas
            kopi di seluruh Indonesia.
          </p>
        </div>
      </div>

      <div className="tk-card tk-card--wide">
        <h2 className="tk-card-title">Nilai Kami</h2>
        <p className="tk-card-text">
          Kualitas, keaslian, keberlanjutan, dan kolaborasi adalah fondasi kami.
          Kami percaya kopi terbaik lahir dari proses yang jujur dan hubungan yang
          erat dengan komunitas petani lokal — dari kebun sampai ke cangkir kamu.
        </p>
      </div>
    </main>
  );
}