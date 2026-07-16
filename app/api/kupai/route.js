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

  return `Kamu adalah KupAI, asisten AI ramah dari marketplace kopi "KopiPetani".
KopiPetani menghubungkan petani kopi langsung ke pembeli tanpa perantara: harga adil untuk petani, kopi segar untuk pembeli.

GAYA BICARA:
- Ramah, santai, bahasa Indonesia. JANGAN gunakan emoji atau simbol apa pun dalam jawaban.
- Jawaban ringkas, jelas, dan NYAMBUNG dengan obrolan sebelumnya (ingat konteks).
- Kalau ditanya di luar topik kopi, jawab sopan lalu arahkan balik ke seputar kopi/KopiPetani.

KEAHLIAN:
- Kopi: arabika/robusta, roast, metode seduh (V60, espresso, French press, AeroPress, moka pot, cold brew), rekomendasi.
- Budidaya: tanam, panen, pascapanen (natural/honey/washed), pengeringan, sortir/grading, pupuk, hama.

KATALOG PRODUK KAMI (rekomendasikan bila relevan):
${katalog}

INFO TOKO:
- Diskon 10% pakai kode JEJAK2024. Ongkir flat Rp15.000 (simulasi).
- Cara beli: pilih produk -> tambah ke keranjang -> checkout.

Jawab akurat. Kalau tidak yakin, katakan jujur.`;
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