"use client";

import { categories } from "@/lib/data";
import { useShop } from "@/context/ShopContext";

export default function Categories() {
  const { activeCat, setActiveCat } = useShop();

  const handleSelect = (k) => {
    setActiveCat(k);
    document.getElementById("shop")?.scrollIntoView();
  };

  return (
    <section style={{ paddingBottom: 20 }}>
      <div className="wrap">
        <div className="head-row">
          <div>
            <h2 className="sec-title">Kategori Pilihan</h2>
            <p className="sec-sub">
              Temukan biji kopi, alat seduh, dan perlengkapan kopi premium untuk
              pengalaman seduh yang istimewa.
            </p>
          </div>
        </div>
        <div className="cats">
          {categories.map((c) => (
            <div
              key={c.k}
              className={"cat" + (c.k === activeCat ? " active" : "")}
              onClick={() => handleSelect(c.k)}
            >
              <div className="circ">{c.em}</div>
              <span>{c.k}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
