# Jejak Kopi — Next.js

Konversi dari prototipe Jejak Kopi ke struktur proyek
**Next.js (App Router)** dengan komponen React yang terpisah per bagian.

## Struktur folder

```
agrodirect-nextjs/
├─ app/
│  ├─ layout.js        # Root layout + provider (Cart, UI, Shop)
│  ├─ page.js           # Merangkai semua section jadi satu halaman
│  └─ globals.css       # Semua CSS asli (variabel warna, komponen, responsive)
├─ components/
│  ├─ Header.js         # Navbar, search cepat, tombol keranjang & login
│  ├─ Hero.js            # Section hero
│  ├─ Categories.js      # Grid kategori produk
│  ├─ Shop.js            # Etalase produk (search, sort, filter kategori)
│  ├─ ProductCard.js     # Satu kartu produk
│  ├─ WhySection.js      # "Kenapa Jejak Kopi" (penikmat & mitra)
│  ├─ MitraSection.js    # CTA jadi mitra petani / pembeli
│  ├─ Footer.js
│  ├─ CartDrawer.js      # Drawer keranjang + kalkulasi total & promo
│  ├─ AuthModal.js       # Modal Masuk/Daftar
│  ├─ OkModal.js         # Modal konfirmasi sukses (checkout/login)
│  └─ KupaiChat.js       # Widget chatbot KupAI (rule-based)
├─ context/
│  ├─ CartContext.js     # State keranjang, promo, kalkulasi total (global)
│  ├─ ShopContext.js     # State search/sort/kategori (dibagi Header ↔ Shop)
│  └─ UIContext.js       # State modal auth & modal sukses
├─ lib/
│  ├─ data.js            # Data produk & kategori + helper `rp()` format Rupiah
│  └─ kupai.js            # Logika jawaban rule-based chatbot KupAI
├─ jsconfig.json         # Alias `@/...` -> root proyek
├─ next.config.js
└─ package.json
```

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Catatan konversi

- Semua state yang tadinya variabel global (`cart`, `promoOn`, `activeCat`, dst)
  dipindah ke React Context (`CartContext`, `ShopContext`, `UIContext`) supaya
  bisa dipakai lintas komponen tanpa manipulasi DOM langsung.
- Semua `document.getElementById(...).innerHTML = ...` di skrip asli diganti
  render deklaratif React (`.map()`, kondisi `{cond && <X/>}`, dsb).
- Gambar hero & mitra pada file asli berupa base64 raksasa — pada versi ini
  diganti gradient CSS agar proyek ringan; tinggal ganti dengan `<Image>` dari
  `next/image` dan taruh file di `public/` jika ingin pakai foto asli.
- Chatbot KupAI tetap rule-based (bukan LLM sungguhan), logikanya dipindah ke
  `lib/kupai.js` supaya gampang dites/diperluas.
