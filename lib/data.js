// Data extracted from prototipe KopiPetani.
// `ph` = placeholder styling (emoji + gradient) used when no product image is set.

export const products = [
  {
    id: 1,
    name: "Ceri Kopi Merah Segar",
    cat: "Ceri Kopi",
    origin: "Kebun Tani Makmur, Gayo",
    price: 12000,
    old: 15000,
    unit: "/kg",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
    ph: { em: "🍒", c: "linear-gradient(135deg,#7a1f1f,#4a1010)" },
    group: "Hasil Kopi",
  },
  {
    id: 2,
    name: "Green Bean Arabika Gayo",
    cat: "Green Bean",
    origin: "Koperasi Tani Gayo",
    price: 85000,
    old: 95000,
    unit: "/kg",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600",
    ph: { em: "🌾", c: "linear-gradient(135deg,#6a5a3a,#3d3320)" },
    group: "Hasil Kopi",
  },
  {
    id: 3,
    name: "Kopi Bubuk Arabika Gayo",
    cat: "Kopi Sangrai",
    origin: "Roastery KopiPetani",
    price: 55000,
    old: 65000,
    unit: "/200g",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600",
    ph: { em: "☕", c: "linear-gradient(135deg,#4A2210,#2A0E05)" },
    group: "Hasil Kopi",
  },
  {
    id: 4,
    name: "Kopi Bubuk Robusta Premium",
    cat: "Kopi Sangrai",
    origin: "Roastery KopiPetani",
    price: 45000,
    old: 52000,
    unit: "/200g",
    image: "https://images.unsplash.com/photo-1580934911767-fe48d1416e02?auto=format&fit=crop&q=80&w=600",
    ph: { em: "☕", c: "linear-gradient(135deg,#5a3620,#3d2311)" },
    group: "Hasil Kopi",
  },
  {
    id: 5,
    name: "Bibit Kopi Arabika Unggul",
    cat: "Bibit & Benih",
    origin: "Nursery Mitra Tani",
    price: 8000,
    old: 10000,
    unit: "/batang",
    image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=600",
    ph: { em: "🌱", c: "linear-gradient(135deg,#5f8f4e,#37622c)" },
    group: "Sarana Tani",
  },
  {
    id: 6,
    name: "Pupuk Organik Khusus Kopi",
    cat: "Pupuk & Nutrisi",
    origin: "Mitra Kopi Lokal",
    price: 65000,
    old: 75000,
    unit: "/karung",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600",
    ph: { em: "🧴", c: "linear-gradient(135deg,#8a6b3f,#5c4626)" },
    group: "Sarana Tani",
  },
  {
    id: 7,
    name: "Pestisida Nabati Ramah Lingkungan",
    cat: "Pupuk & Nutrisi",
    origin: "Vendor: BioGuard",
    price: 55000,
    old: 63000,
    unit: "/liter",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    ph: { em: "🌿", c: "linear-gradient(135deg,#4f7d55,#2f5236)" },
    group: "Sarana Tani",
  },
  {
    id: 8,
    name: "Alat Seduh V60 Set Lengkap",
    cat: "Alat Seduh",
    origin: "KopiPetani Gear",
    price: 175000,
    old: 200000,
    unit: "/set",
    image: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?auto=format&fit=crop&q=80&w=600",
    ph: { em: "🍵", c: "linear-gradient(135deg,#b07d45,#7a5330)" },
    group: "Sarana Tani",
  },
];

export const categories = [
  { k: "Semua", em: "🛍️" },
  { k: "Ceri Kopi", em: "🍒" },
  { k: "Green Bean", em: "🌾" },
  { k: "Kopi Sangrai", em: "☕" },
  { k: "Bibit & Benih", em: "🌱" },
  { k: "Pupuk & Nutrisi", em: "🧴" },
];

export const categorySections = [
  {
    title: "Green Bean",
    items: ["Gayo", "Mandailing", "Toraja", "Kintamani", "Flores", "Java Preanger"],
  },
  {
    title: "Roasted Bean",
    items: ["Light Roast", "Medium Roast", "Dark Roast"],
  },
  {
    title: "Ground Coffee",
    items: ["Espresso", "V60", "French Press", "Tubruk"],
  },
  {
    title: "Paket Kopi",
    description: "Coffee Explorer Box",
    items: ["Gayo", "Toraja", "Flores"],
  },
];

export const featuredFarmers = [
  {
    name: "Amir Syah",
    location: "Gayo, Aceh",
    bio: "Mengelola kebun kopi arabika single origin dengan teknik agroforestry dan pengepakan langsung.",
    tags: ["Arabika", "Sustainability", "Direct Trade"],
    em: "🌿",
  },
  {
    name: "Dewi Lestari",
    location: "Kintamani, Bali",
    bio: "Petani kopi spesialti dengan perhatian detail pada pemetikan ceritera buah terbaik.",
    tags: ["Single Origin", "Small Batch", "Premium"],
    em: "🌺",
  },
  {
    name: "Rudi Pratama",
    location: "Toraja, Sulawesi",
    bio: "Ahli roasting keluarga yang menghadirkan karakter kopi tanah tinggi dengan keseimbangan rasa yang tajam.",
    tags: ["Roasting", "High Altitude", "Authentic"],
    em: "☕",
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Aisyah Ananda",
    role: "Barista & Coffee Enthusiast",
    initials: "AA",
    quote: "Kopi terbaik yang pernah saya coba, kualitasnya konsisten dan pelayanan marketplace ini sangat profesional.",
  },
  {
    id: 2,
    name: "Rizal Aditya",
    role: "Pemilik Kedai Kopi",
    initials: "RA",
    quote: "Sistem pemesanan mudah dan produk selalu tiba segar. Saya merasa lebih dekat dengan petani kopi.",
  },
  {
    id: 3,
    name: "Nina Kusuma",
    role: "Pecinta Kopi Rumahan",
    initials: "NK",
    quote: "Pilihan kopinya lengkap, dari green bean hingga kopi sangrai. Sangat cocok untuk eksperimen seduh di rumah.",
  },
];

export function rp(n) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
