"use client";
import Link from "next/link";
import { rp } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import Icon from "@/components/Icon";

function CartIcon() {
  return (
    <svg className="pc-cart-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 4h3l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 7H6" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const rating = product.rating ?? (4.6 + ((product.id * 3) % 5) / 10).toFixed(1);
  const sold = product.sold ?? 50 + ((product.id * 37) % 400);
  const showPhoto = product.image && product.hasPhoto !== false;

  return (
    <div className="pc">
      <Link href={`/produk/${product.id}`} className="pc-img-link">
        <div className="pc-img">
          {showPhoto ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="pc-ph" style={{ background: product.ph.c }}>
              <Icon name={product.icon || "coffee"} size={46} className="pc-ph-ic" />
            </div>
          )}
          <span className="pc-badge">{product.cat}</span>
        </div>
      </Link>
      <div className="pc-body">
        <Link href={`/produk/${product.id}`} className="pc-name-link">
          <h3 className="pc-name">{product.name}</h3>
        </Link>
        <p className="pc-origin">{product.origin}</p>
        <div className="pc-rating">
          <span className="pc-stars">★★★★★</span>
          <span className="pc-rating-val">{rating}</span>
          <span className="pc-sold">· {sold} terjual</span>
        </div>
        <div className="pc-price">
          <span className="pc-price-now">{rp(product.price)}</span>
          <span className="pc-unit">{product.unit}</span>
          {product.old && <span className="pc-price-old">{rp(product.old)}</span>}
        </div>
        <div className="pc-actions">
          <button className="pc-btn" onClick={() => addToCart(product.id)}>
            <CartIcon />
            Tambahkan ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}