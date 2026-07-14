import Link from "next/link";
import { posts, popularPosts } from "@/lib/blogData";

export default function BlogPostPage({ params }) {
  const { id } = params;
  const postId = parseInt(id, 10);
  const post = posts.find((p) => p.id === postId);

  // If post not found, show a clean message
  if (!post) {
    return (
      <main className="blg-detail wrap">
        <div className="blg-detail__not-found">
          <h2>Artikel Tidak Ditemukan</h2>
          <p>Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
          <Link href="/blog" className="btn btn-caramel">
            Kembali ke Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="blg-detail">
      <div className="wrap">
        {/* Back navigation */}
        <Link href="/blog" className="blg-detail__back">
          ← Kembali ke Blog
        </Link>

        {/* Dynamic two-column layout */}
        <div className="blg__layout">
          {/* Left Column: Full Article Content */}
          <article className="blg-detail__article">
            {/* Header info */}
            <div className="blg-detail__header">
              <span className="blg-detail__badge">{post.cat}</span>
              <h1 className="blg-detail__title">{post.title}</h1>
              <div className="blg-detail__meta">
                <span>Ditulis oleh <b>{post.author}</b></span>
                <span className="blg-detail__dot">•</span>
                <span>{post.date}</span>
                <span className="blg-detail__dot">•</span>
                <span>👁️ {post.views.toLocaleString("id-ID")} Pembaca</span>
              </div>
            </div>

            {/* Cover Visual */}
            <div className="blg-detail__cover" style={{ background: post.ph.c }}>
              <span className="blg-detail__cover-em">{post.ph.em}</span>
            </div>

            {/* Body Content */}
            <div className="blg-detail__body">
              {post.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </article>

          {/* Right Column: Sidebar */}
          <aside className="blg__sidebar">
            {/* Widget: Artikel Populer */}
            <div className="blg__widget">
              <h3 className="blg__widget-title">
                <span className="blg__widget-title-icon">📈</span> Artikel Populer
              </h3>
              <div className="blg__popular-list">
                {popularPosts.map((pop) => (
                  <div key={pop.rank} className="blg__popular-item">
                    <div className="blg__popular-rank">{pop.rank}</div>
                    <div className="blg__popular-detail">
                      <h4 className="blg__popular-title">
                        <Link href={`/blog/${pop.id}`}>{pop.title}</Link>
                      </h4>
                      <p className="blg__popular-views">{pop.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget: Promo Banner */}
            <div className="blg__promo-banner">
              <h3 className="blg__promo-title">Gunakan Bibit Kopi Unggul</h3>
              <p className="blg__promo-text">
                Dapatkan diskon 20% untuk pembelian pertama sarana tani di Marketplace kami.
              </p>
              <Link href="/produk" className="btn blg__promo-btn">
                Cek Toko Sekarang
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
