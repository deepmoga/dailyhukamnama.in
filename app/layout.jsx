import './globals.css';

export const metadata = {
  metadataBase: new URL('https://dailyhukamnama.in'),
  title: "Today's Daily Hukamnama | Sachkhand Sri Harmandir Sahib Amritsar",
  description: "Read today's Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib (Golden Temple), Amritsar with Gurmukhi text, Punjabi Viakhya, English and Hindi translations.",
  keywords: "daily hukamnama, hukamnama today, golden temple hukamnama, sri darbar sahib mukhwak, nanakshahi calendar, sikhism",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Daily Hukamnama Sri Darbar Sahib Amritsar",
    description: "Read today's divine Hukamnama directly from Sachkhand Sri Harmandir Sahib.",
    url: "https://dailyhukamnama.in",
    siteName: "Daily Hukamnama",
    images: [
      {
        url: '/slider1.jpg',
        width: 1200,
        height: 630,
        alt: 'Daily Hukamnama Sri Darbar Sahib',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Noto+Sans+Gurmukhi:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fdfbf7] text-slate-800 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
