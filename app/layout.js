import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";
import { ShopProvider } from "@/context/ShopContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KupaiChat from "@/components/KupaiChat";
import AuthModal from "@/components/AuthModal";
import OkModal from "@/components/OkModal";

export const metadata = {
  title: "KopiPetani — Kopi Segar Langsung dari Petani ke Cangkir",
  description:
    "KopiPetani menghubungkan para penikmat kopi dengan biji kopi artisanal terbaik dari seluruh Nusantara, langsung dari tangan petani lokal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <UIProvider>
          <AuthProvider>
            <ShopProvider>
              <CartProvider>
                <Header />
                {children}
                <Footer />
                <KupaiChat />
                <AuthModal />
                <OkModal />
              </CartProvider>
            </ShopProvider>
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  );
}
