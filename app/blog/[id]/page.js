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
                <span className="blg-detail__views">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {post.views.toLocaleString("id-ID")} Pembaca
                </span>
              </div>
            </div>
            {/* Cover Visual */}
            <div className="blg-detail__cover">
              <img
                className="blg-detail__cover-img"
                src={post.image}
                alt={post.title}
              />
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
                <span className="blg__widget-title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                </span> Artikel Populer
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