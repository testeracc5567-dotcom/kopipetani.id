"use client";
import { categories } from "@/lib/data";
import { useShop } from "@/context/ShopContext";
import Icon from "@/components/Icon";

export default function Categories() {
  const { activeCat, setActiveCat } = useShop();
  const handleSelect = (k) => {
    setActiveCat(k);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="kcats-section">
      <div className="kcats-head">
        <h2 className="kcats-title">Kategori Pilihan</h2>
        <p className="kcats-sub">
          Temukan biji kopi, alat seduh, dan perlengkapan kopi premium untuk
          pengalaman seduh yang istimewa.
        </p>
      </div>
      <div className="kcats-grid">
        {categories.map((c) => (
          <button
            key={c.k}
            className={"kcat" + (activeCat === c.k ? " active" : "")}
            onClick={() => handleSelect(c.k)}
          >
            <span className="kcat-badge"><Icon name={c.icon} size={26} /></span>
            <span className="kcat-label">{c.k}</span>
          </button>
        ))}
      </div>
    </section>
  );
}