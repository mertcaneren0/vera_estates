import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gayrimenkul İlanları - Lüleburgaz Satılık Kiralık Emlak | Vera Gayrimenkul",
  description: "Lüleburgaz'da satılık daire, kiralık daire, arsa ve ticari gayrimenkul ilanları. Vera Gayrimenkul güvencesiyle en güncel emlak fırsatlarını keşfedin. Kırklareli ve çevre illerde uzman hizmet.",
  keywords: "lüleburgaz satılık daire, lüleburgaz kiralık daire, lüleburgaz arsa, lüleburgaz emlak ilanları, kırklareli gayrimenkul, vera gayrimenkul ilanlar, lüleburgaz ticari gayrimenkul, emlak fırsatları lüleburgaz",
  openGraph: {
    title: "Lüleburgaz Gayrimenkul İlanları | Vera Gayrimenkul",
    description: "Lüleburgaz'da satılık ve kiralık emlak fırsatları. En güncel gayrimenkul ilanlarını inceleyin.",
    images: ['/placeholder-property.jpg'],
  },
};

export default function IlanlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 