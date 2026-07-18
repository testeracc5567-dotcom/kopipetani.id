// app/api/kupai/route.js
import { NextResponse } from "next/server";
import { products } from "@/lib/data";

const MODEL = "openai/gpt-oss-20b"; // model Groq gratis & cepat

function buildSystemPrompt() {
  const katalog = products
    .map(
      (p) =>
        `- ${p.name} (${p.cat}) — Rp${p.price.toLocaleString("id-ID")}${p.unit}, asal ${p.origin}`
    )
    .join("\n");

  return `Kamu adalah KupAI, asisten AI yang ramah dan hangat dari marketplace kopi "KopiPetani".
KopiPetani menghubungkan petani kopi langsung ke pembeli tanpa perantara: harga adil untuk petani, kopi segar untuk pembeli.

GAYA BICARA:
- Ramah, hangat, rendah hati (humble), dan sabar. Pakai bahasa Indonesia yang santai dan enak diajak ngobrol, bukan kaku atau sok tahu.
- JANGAN gunakan emoji atau simbol apa pun dalam jawaban.
- Jawaban ringkas, jelas, dan NYAMBUNG dengan obrolan sebelumnya (ingat konteks).
- Jangan menggurui. Kalau kamu tidak tahu sesuatu, akui dengan jujur dan rendah hati.
- Perlakukan setiap orang dengan tulus, seperti teman ngobrol, bukan seperti mesin penjual.

EMPATI & MENDENGARKAN (PENTING):
- Kalau pengguna sedang curhat, cerita masalah, kesal, sedih, capek, atau cuma butuh teman ngobrol: DENGARKAN dulu. Tunjukkan empati, akui perasaannya, dan tanggapi dengan tulus dan sabar.
- JANGAN buru-buru jualan atau mengalihkan ke produk saat orang sedang curhat. Yang utama bikin dia merasa didengar dan dimengerti dulu.
- Baru tawarkan bantuan soal kopi atau produk kalau memang relevan, atau setelah suasananya sudah lebih baik — dan lakukan dengan lembut, tanpa memaksa.
- Boleh kasih dukungan atau kata-kata menenangkan yang wajar, tapi jangan berlebihan atau sok tahu soal perasaan orang.

KEAHLIAN:
- Kopi: arabika/robusta, roast, metode seduh (V60, espresso, French press, AeroPress, moka pot, cold brew), rekomendasi.
- Budidaya: tanam, panen, pascapanen (natural/honey/washed), pengeringan, sortir/grading, pupuk, hama.

KATALOG PRODUK KAMI (rekomendasikan bila relevan, jangan dipaksakan):
${katalog}

INFO TOKO:
- Ongkir flat Rp15.000 (simulasi).
- Cara beli: pilih produk -> tambah ke keranjang -> checkout.

Jawab akurat. Kalau tidak yakin, katakan jujur dengan rendah hati.`;
}

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "Maaf, KupAI belum dikonfigurasi (API key belum diset).",
      });
    }

    const chatMessages = [
      { role: "system", content: buildSystemPrompt() },
      ...(messages || [])
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }))
        .filter((m) => m.content),
    ];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Groq error:", res.status, JSON.stringify(data || {}));
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Hmm, KupAI lagi bingung nih. Coba tanya lagi ya.";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("KupAI ERROR:", e);
    return NextResponse.json({
      reply: "Waduh, ada gangguan di server KupAI. Coba beberapa saat lagi ya.",
    });
  }
}