import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import RootLayoutClient from "@/components/layout/RootLayoutClient";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import GoogleTagManager from "@/components/Analytics/GoogleTagManager";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: 'Vera Gayrimenkul - Lüleburgaz Gayrimenkul Uzmanı | Profesyonel Emlak Danışmanlığı',
    template: '%s | Vera Gayrimenkul - Lüleburgaz'
  },
  description: 'Lüleburgaz\'ın en güvenilir gayrimenkul firması Vera Gayrimenkul. Emlak değerleme, satış, kiralama ve yatırım danışmanlığı hizmetleri. Kırklareli ve çevre illerde uzman kadromuzla hizmetinizdeyiz.',
  keywords: [
    'lüleburgaz gayrimenkul',
    'vera gayrimenkul',
    'lüleburgaz emlak',
    'kırklareli gayrimenkul',
    'lüleburgaz satılık daire',
    'lüleburgaz kiralık daire',
    'lüleburgaz arsa',
    'gayrimenkul değerleme lüleburgaz',
    'emlak danışmanlığı lüleburgaz',
    'gayrimenkul yatırım lüleburgaz',
    'vera grup',
    'lüleburgaz emlak ofisi',
    'kırklareli emlak',
    'trakya gayrimenkul',
    'marmara bölgesi emlak',
    'gayrimenkul ekspertizi',
    'emlak değerleme',
    'gayrimenkul analizi',
    'konut kredisi lüleburgaz',
    'ticari gayrimenkul lüleburgaz'
  ],
  authors: [{ name: 'Vera Gayrimenkul' }],
  creator: 'Vera Gayrimenkul',
  publisher: 'Vera Grup',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  metadataBase: new URL('https://veragayrimenkul.com'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://veragayrimenkul.com',
    siteName: 'Vera Gayrimenkul - Lüleburgaz',
    title: 'Vera Gayrimenkul - Lüleburgaz Gayrimenkul Uzmanı | Profesyonel Emlak Danışmanlığı',
    description: 'Lüleburgaz\'ın en güvenilir gayrimenkul firması Vera Gayrimenkul. Emlak değerleme, satış, kiralama ve yatırım danışmanlığı hizmetleri. Kırklareli ve çevre illerde uzman kadromuzla hizmetinizdeyiz.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Vera Gayrimenkul - Lüleburgaz Gayrimenkul Uzmanı',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@veragayrimenkul',
    creator: '@veragayrimenkul',
    title: 'Vera Gayrimenkul - Lüleburgaz Gayrimenkul Uzmanı | Profesyonel Emlak Danışmanlığı',
    description: 'Lüleburgaz\'ın en güvenilir gayrimenkul firması Vera Gayrimenkul. Emlak değerleme, satış, kiralama ve yatırım danışmanlığı hizmetleri.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console'dan alınacak
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={montserrat.className}>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
