"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

// Cuma menu utama ini yang munculin animasi loading
const LOADER_PATHS = ["/menu", "/produk", "/kategori", "/blog", "/tentang-kami"];

export default function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const firstRender = useRef(true);

  useEffect(() => {
    // Lewati render pertama biar gak muncul pas awal buka web
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Cuma tampil kalau pindah PERSIS ke salah satu menu utama
    if (!LOADER_PATHS.includes(pathname)) return;

    let mounted = true;
    setVisible(true);
    setProgress(0);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 16 + 7;
      if (p >= 90) { p = 90; clearInterval(iv); }
      if (mounted) setProgress(Math.round(p));
    }, 130);

    const done = setTimeout(() => {
      clearInterval(iv);
      if (mounted) setProgress(100);
      setTimeout(() => { if (mounted) setVisible(false); }, 300);
    }, 700);

    return () => {
      mounted = false;
      clearInterval(iv);
      clearTimeout(done);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="route-loader__box">
        <div className="route-loader__logo">
          <Logo tone="dark" size={72} />
        </div>
        <div className="route-loader__bar">
          <div className="route-loader__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="route-loader__pct">{progress}%</div>
      </div>
    </div>
  );
}