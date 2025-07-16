import dynamic from "next/dynamic";
import Head from "next/head";

export const metadata = {
  title: "Location",
  openGraph: {
    title: "Location",
    description: "View and track employee locations in real-time.",
    url: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/location`,
    siteName: "Dashboard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Location",
    description: "View and track employee locations in real-time.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/location`,
  },
};

const LocationComponent = dynamic(() => import("./context"), {
  ssr: false,
});

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Location | Dashboard",
  description: "View and track employee locations in real-time.",
  url: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/location`,
};

export default function Location() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <LocationComponent />
    </>
  );
}
