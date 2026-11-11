import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import MetaPixel from "@/components/MetaPixel";
import { getSchedule, getClassSettings } from "@/lib/dal";
import { DAY_NAMES, CLASS_IDS, CLASS_STATIC, ID_TO_SLUG, classPrices, formatSlot, parseTimeRange } from "@/lib/classes";

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
  metadataBase: new URL("https://bounce-lab.com"),
  title: {
    default: "Twerk & High Heels Dance Classes in Portland, OR | bounce lab",
    template: "%s | bounce lab",
  },
  description:
    "Twerk & High Heels dance classes in Portland, Oregon. Beginner-friendly, judgment-free studio for women on E Burnside. Book online.",
  keywords: [
    "twerk class Portland",
    "twerk Portland Oregon",
    "high heels dance class Portland",
    "high heels Portland OR",
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
    title: "bounce lab — Twerk & High Heels in Portland, OR",
    description:
      "Judgment-free dance studio for women in Portland, Oregon. Twerk · High Heels. Beginner-friendly. Book your spot online.",
    url: "https://bounce-lab.com",
    siteName: "bounce lab Dance Studio",
    images: [
      {
        url: "/og-image-v2.jpg",
        width: 1200,
        height: 630,
        alt: "bounce lab Dance Studio Portland Oregon",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "bounce lab — Dance Classes in Portland, OR",
    description:
      "Twerk & High Heels for women in Portland, Oregon. Beginner-friendly. Book online.",
    images: ["/og-image-v2.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "87x82", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://bounce-lab.com",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [schedule, classSettings] = await Promise.all([getSchedule(), getClassSettings()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DanceSchool",
    "@id": "https://bounce-lab.com/#business",
    name: "bounce lab Dance Studio",
    description:
      "Twerk & High Heels dance classes in Portland, Oregon. Beginner-friendly, judgment-free studio for women.",
    url: "https://bounce-lab.com",
    telephone: "+15034220858",
    image: "https://bounce-lab.com/og-image-v2.jpg",
    priceRange: "$$",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+15034220858",
      contactType: "reservations",
      availableLanguage: ["English"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "2648 E Burnside St",
      addressLocality: "Portland",
      addressRegion: "OR",
      postalCode: "97214",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 45.5226344,
      longitude: -122.6383752,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Portland",
        containedIn: { "@type": "State", name: "Oregon" },
      },
      {
        "@type": "City",
        name: "Vancouver",
        containedIn: { "@type": "State", name: "Washington" },
      },
    ],
    openingHoursSpecification: schedule.flatMap(s => {
      const range = parseTimeRange(s.timeDisplay);
      return range ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_NAMES[s.dayOfWeek], opens: range.opens, closes: range.closes }] : [];
    }),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dance Classes",
      // Built from the live schedule + admin prices so Google never sees a stale day/time.
      itemListElement: CLASS_IDS.map(id => {
        const s = schedule.find(x => x.classType === id);
        const label = CLASS_STATIC[id].label;
        return {
          "@type": "Offer",
          price: String(classPrices(id, classSettings).dropin),
          priceCurrency: "USD",
          url: `https://bounce-lab.com/classes/${ID_TO_SLUG[id]}`,
          itemOffered: {
            "@type": "Service",
            name: `${label} Dance Class Portland`,
            description: s ? `Beginner-friendly ${label.toLowerCase()} dance class every ${formatSlot(s)}` : `Beginner-friendly ${label.toLowerCase()} dance class`,
          },
        };
      }),
    },
    sameAs: [
      "https://www.instagram.com/iryna.pytska",
      "https://www.google.com/maps/place/Bounce+Lab/@45.5308718,-122.6595633,17z",
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${cormorant.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <MetaPixel />
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
