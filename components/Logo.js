"use client";

export default function Logo({ size = 36, showText = true, tone = "dark", className = "" }) {
  // tone "dark"  -> buat background GELAP (header)  => warna terang
  // tone "light" -> buat background TERANG (footer) => warna gelap
  const isDark = tone === "dark";
  const kColor = isDark ? "#f4ece2" : "#2d1107";
  const bean = "#c8874a";
  const crease = "#f4ece2";
  const textMain = isDark ? "#f4ece2" : "#2d1107";
  const textAccent = "#c8874a";

  return (
    <span className={`logo ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        {/* Huruf K + tiang huruf P */}
        <g stroke={kColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 11 V53" />
          <path d="M15 33 L35 11" />
          <path d="M21 29 L37 53" />
          <path d="M44 11 V53" />
        </g>
        {/* Biji kopi jadi lengkung huruf P */}
        <path d="M44 11 C 61 11 61 35 44 35 Z" fill={bean} />
        <path d="M47 15 C 57 19 57 27 47 31" stroke={crease} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </svg>
      {showText && (
        <span
          style={{
            fontWeight: 800,
            fontSize: size * 0.46,
            letterSpacing: "-0.02em",
            color: textMain,
            whiteSpace: "nowrap",
          }}
        >
          KopiPetani<span style={{ color: textAccent }}>.id</span>
        </span>
      )}
    </span>
  );
}