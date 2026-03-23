import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backoffice | El Garage de Steve",
  robots: { index: false, follow: false },
};

export default function BackofficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
