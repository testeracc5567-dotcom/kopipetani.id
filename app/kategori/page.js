import { categorySections } from "@/lib/data";

export default function KategoriPage() {
  return (
    <main className="page-section">
      <div className="wrap">
        <div className="page-head">
          <p className="eyebrow">Kategori</p>
          <h1>Jelajahi Kategori Kopi Kami</h1>
          <p className="page-intro">
            Pilih tipe kopi dan paket untuk menemukan pengalaman seduh yang sesuai.
          </p>
        </div>

        <div className="categories-grid">
          {categorySections.map((section) => (
            <article key={section.title} className="category-card">
              <h2>{section.title}</h2>
              {section.description && <p className="category-note">{section.description}</p>}
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
