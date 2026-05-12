import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://bouncelab.nyc"),
  title: {
    default: "Bounce Lab — Twerk, High Heels & Stretching Classes in Portland, OR",
    template: "%s | Bounce Lab Dance Studio Portland",
  },
  description: "Twerk, High Heels & Stretching dance classes in Portland, Oregon. Beginner-friendly, judgment-free studio for women. Drop-in $20–$30 or monthly pass. Book online.",
  keywords: [
    "twerk class Portland",
    "twerk Portland Oregon",
    "high heels dance class Portland",
    "high heels Portland OR",
    "stretching class Portland",
    "dance studio Portland Oregon",
    "twerk Vancouver WA",
    "high heels dance Vancouver",
    "dance classes for women Portland",
    "beginner dance class Portland",
    "adult dance class Portland",
    "bounce lab Portland",
    "dance studio near me Portland",
  ],
  authors: [{ name: "bounce lab Dance Studio" }],
  creator: "bounce lab",
  openGraph: {
    title: "bounce lab — Twerk, High Heels & Stretching in Portland, OR",
    description: "Judgment-free dance studio for women in Portland, Oregon. Twerk · High Heels · Stretching. Drop-in from $20. Book your spot online.",
    url: "https://bouncelab.nyc",
    siteName: "bounce lab Dance Studio",
    images: [{ url: "/studio.jpg", width: 1200, height: 630, alt: "bounce lab Dance Studio Portland Oregon" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "bounce lab — Dance Classes in Portland, OR",
    description: "Twerk, High Heels & Stretching for women in Portland, Oregon. Beginner-friendly. Book online.",
    images: ["/studio.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://bouncelab.nyc",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DanceSchool",
  "name": "bounce lab Dance Studio",
  "description": "Twerk, High Heels & Stretching dance classes in Portland, Oregon. Beginner-friendly, judgment-free studio for women.",
  "url": "https://bouncelab.nyc",
  "telephone": "+16465554567",
  "email": "hello@bouncelab.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Portland",
    "addressRegion": "OR",
    "addressCountry": "US",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.5051,
    "longitude": -122.6750,
  },
  "areaServed": [
    { "@type": "City", "name": "Portland", "containedIn": { "@type": "State", "name": "Oregon" } },
    { "@type": "City", "name": "Vancouver", "containedIn": { "@type": "State", "name": "Washington" } },
  ],
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday",   "opens": "16:00", "closes": "17:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday",  "opens": "19:00", "closes": "20:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "11:00", "closes": "12:20" },
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Dance Classes",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": "Twerk Class Portland", "description": "Beginner & intermediate twerk class every Monday 4–5 PM" },
        "price": "25", "priceCurrency": "USD",
      },
      {
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": "High Heels Dance Class Portland", "description": "High heels dance class every Tuesday 7–8 PM" },
        "price": "30", "priceCurrency": "USD",
      },
      {
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": "Stretching Class Portland", "description": "All-levels stretching class every Saturday 11 AM–12:20 PM" },
        "price": "20", "priceCurrency": "USD",
      },
    ],
  },
  "sameAs": ["https://www.instagram.com/iryna.pytska"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${cormorant.variable} ${montserrat.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#F5EDE0",
              border: "1px solid #333333",
            },
          }}
        />
      </body>
    </html>
  );
}
