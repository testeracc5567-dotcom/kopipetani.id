// KupAI rule-based chatbot logic, ported from the original vanilla JS prototype.
// answer(q) returns [htmlString, recommendedProductId?]

export const chipsByMode = {
  pembeli: [
    "Rekomendasiin kopi buat aku",
    "Cara seduh V60 yang enak",
    "Bedanya arabika & robusta?",
    "Apa itu light/medium/dark roast?",
  ],
  petani: [
    "Tips tanam kopi arabika",
    "Harga wajar green bean berapa?",
    "Proses natural vs honey vs washed",
    "Cara jadi mitra petani",
  ],
};

export function answer(q) {
  const has = (...words) => words.some((w) => q.includes(w));

  if (has("halo", "hai", "hi ", "pagi", "malam", "sore"))
    return ["Halo! Ada yang bisa KupAI bantu soal kopi hari ini?"];

  if (has("v60", "seduh", "brew", "nyeduh", "pour over"))
    return [
      "<b>Panduan seduh V60</b><br>• Rasio 1:15 (mis. 15g kopi : 225ml air)<br>• Gilingan medium (kayak gula pasir)<br>• Suhu air 90–94°C<br>• Blooming 30 detik pakai 30ml air dulu<br>• Tuang melingkar pelan, total ~2.5–3 menit<br>Mau alatnya? Aku rekomen V60 Set kami.",
      8,
    ];

  if (has("tubruk"))
    return [
      "<b>Kopi tubruk</b> gampang: 1 sdm kopi bubuk halus + air 90°C, aduk, diamkan 4 menit biar ampas turun. Nikmat pakai Robusta Premium kami!",
      4,
    ];

  if (has("espresso"))
    return [
      "<b>Espresso</b>: gilingan halus, rasio 1:2 (18g in menjadi 36g out) dalam 25–30 detik. Pakai biji medium-dark biar body tebal, cocok House Blend kami.",
      3,
    ];

  if (has("rekomen", "saran", "pilih", "enak", "cocok", "bingung"))
    return [
      "Kalau kamu suka rasa <b>lembut, fruity & wangi</b>, <b>Arabika Gayo</b> pas banget. Kalau suka <b>bold, pahit mantap & nendang</b>, <b>Robusta Premium</b>. Mau coba yang mana?",
      3,
    ];

  if ((has("arabika") && has("robusta")) || has("beda", "perbedaan"))
    return [
      "<b>Arabika vs Robusta</b><br>• <b>Arabika</b>: asam cerah, aroma kompleks, kafein lebih rendah, tumbuh >1000 mdpl<br>• <b>Robusta</b>: body tebal, pahit kuat, kafein 2x lipat, tahan hama, dataran rendah<br>Gayo kami arabika premium.",
      2,
    ];

  if (has("roast", "sangrai", "light", "medium", "dark"))
    return [
      "<b>Tingkat sangrai (roast)</b><br>• <b>Light</b>: asam cerah, karakter biji menonjol<br>• <b>Medium</b>: seimbang manis-asam, paling aman<br>• <b>Dark</b>: pahit, smoky, body tebal (buat espresso/susu)<br>House Blend kami medium roast.",
      3,
    ];

  if (has("tanam", "nanam", "budidaya", "rawat", "bibit"))
    return [
      "<b>Tips tanam kopi arabika</b><br>• Ketinggian ideal 1.000–1.700 mdpl<br>• Butuh pohon peneduh & curah hujan cukup<br>• Jarak tanam 2,5×2,5 m<br>• Pupuk organik tiap 3–4 bulan<br>• Mulai berbuah ~3 tahun, petik ceri merah penuh<br>Mulai dari bibit unggul kami.",
      5,
    ];

  if (has("panen", "petik"))
    return [
      "<b>Panen kopi</b>: lakukan <b>petik merah</b> (hanya ceri matang merah penuh) untuk kualitas terbaik. Petik hijau menurunkan grade & harga. Panen raya biasanya sekali setahun dengan beberapa putaran petik.",
    ];

  if (has("natural", "honey", "washed", "proses", "pascapanen"))
    return [
      "<b>Proses pascapanen</b><br>• <b>Natural</b>: ceri dijemur utuh, rasa buah/manis kuat<br>• <b>Honey</b>: sebagian lendir disisakan, manis & body seimbang<br>• <b>Washed</b>: dicuci bersih, rasa bersih & asam cerah<br>Tiap proses ngaruh ke rasa & harga jual.",
    ];

  if (has("harga", "jual", "green bean", "grade"))
    return [
      "<b>Penasihat Harga Adil</b><br>Perkiraan harga wajar:<br>• Green bean Arabika G1: <b>Rp90.000–100.000/kg</b><br>• Ceri merah basah: Rp8.000–12.000/kg<br>• Robusta green bean: Rp30.000–38.000/kg<br>Di KopiPetani kamu tentukan harga sendiri, tanpa potongan perantara.",
      2,
    ];

  if (has("pupuk", "nutrisi"))
    return [
      "Untuk kopi, pakai <b>pupuk organik</b> kaya nitrogen & kalium tiap 3–4 bulan, tambah kompos di sekitar akar. Hindari kimia berlebih biar tanah tetap subur. Cek Pupuk Organik kami.",
      6,
    ];

  if (has("pestisida", "hama", "penyakit"))
    return [
      "Hama utama kopi: <b>penggerek buah (PBKo)</b> & karat daun. Solusi ramah lingkungan: pestisida nabati + sanitasi kebun (buang ceri busuk). Cek Pestisida Nabati kami.",
      7,
    ];

  if (has("mitra", "gabung", "daftar petani", "jual di"))
    return [
      "<b>Jadi Mitra Petani KopiPetani</b><br>1. Daftar akun & verifikasi kebun<br>2. Unggah produk + tentukan harga sendiri<br>3. Terima pesanan langsung dari pembeli<br>4. Pembayaran transparan tanpa perantara<br>Klik <b>Masuk/Daftar</b> di atas untuk mulai!",
    ];

  if (has("transparan", "kenapa mahal", "kenapa murah"))
    return [
      "Harga di KopiPetani transparan karena <b>memotong perantara</b>. Uang lebih banyak sampai ke petani, dan kamu tetap dapat harga tangan pertama yang adil.",
    ];

  if (has("kirim", "ongkir", "logistik"))
    return [
      "Estimasi logistik flat Rp15.000 (simulasi). Kopi dikemas rapi & dikirim segar.",
    ];

  if (has("terima kasih", "makasih", "thanks"))
    return ["Sama-sama! Selamat ngopi. Semoga harimu makin semangat."];

  return [
    "Hmm, aku belum nangkap persis maksudmu. Tapi aku jago soal: <b>rekomendasi kopi, cara seduh, tips tanam & panen, proses pascapanen, harga green bean, pupuk/hama, dan cara jadi mitra</b>. Coba tanya salah satu ya.",
  ];
}