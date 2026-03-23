import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f7f4",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const display = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "El Garage de Steve | Apple, premium usados y servicio técnico",
  description:
    "MacBook, iPhone, iPad, Apple Watch, AirPods, iMac y más. Equipos nuevos sellados, usados premium y servicio técnico especializado. Pedidos por WhatsApp.",
  openGraph: {
    title: "El Garage de Steve",
    description:
      "Tecnología Apple y accesorios con atención personalizada. Tienda online y cierre por WhatsApp.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${display.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] pb-[env(safe-area-inset-bottom)] text-[var(--text)] antialiased">
        {children}
      </body>
    </html>
  );
}
