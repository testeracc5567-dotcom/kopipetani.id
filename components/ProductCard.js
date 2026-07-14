"use client";

import { rp } from "@/lib/data";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="card">
      <div className="imgwrap">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="ph" style={{ background: product.ph.c }}>
            <span className="em">{product.ph.em}</span>
            <small>{product.cat}</small>
          </div>
        )}
        <div className="tag-cat">{product.cat}</div>
      </div>
      <div className="body">
        <div className="nm">{product.name}</div>
        <div className="origin">{product.origin}</div>
        <div className="prow">
          <div>
            <div className="price">{rp(product.price)}</div>
            <div className="unit">{product.unit}</div>
          </div>
          <div className="old">{rp(product.old)}</div>
        </div>
        <button className="add" onClick={() => addToCart(product.id)}>
          Tambahkan ke Keranjang
        </button>
      </div>
    </article>
  );
}
