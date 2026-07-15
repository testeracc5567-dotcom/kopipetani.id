export const PAYMENTS = [
  { id: "qris", label: "QRIS", icon: "📱" },
  {
    id: "ewallet",
    label: "E-Wallet",
    icon: "👛",
    accounts: [
      { name: "GoPay", value: "0857 6225 8302", note: "a.n. KopiPetani Store" },
      { name: "OVO", value: "0899 4598 599", note: "a.n. KopiPetani Store" },
      { name: "DANA", value: "0899 4598 599", note: "a.n. KopiPetani Store" },
    ],
  },
  {
    id: "bank",
    label: "Transfer Bank",
    icon: "🏦",
    accounts: [
      { name: "BCA", value: "1234 5678 9012", note: "a.n. KopiPetani Indonesia" },
      { name: "BRI", value: "0987 6543 2109", note: "a.n. KopiPetani Indonesia" },
      { name: "Mandiri", value: "1122 3344 5566", note: "a.n. KopiPetani Indonesia" },
    ],
  },
  { id: "cod", label: "Bayar di Tempat (COD)", icon: "💵" },
];

export function findPayment(id) {
  return PAYMENTS.find((p) => p.id === id) || null;
}