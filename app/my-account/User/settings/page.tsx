import dynamic from "next/dynamic";
import Head from "next/head";

export const metadata = {
  title: "Manager Settings ",
  description: "Manage your profile, security, and team information .",
  openGraph: {
    title: "Manager Settings ",
    description: "Manage your profile, security, and team information .",
    url: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/settings`,
    siteName: " Dashboard",
  
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/settings`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Manager Settings ",
  description: "Manage your profile, security, and team information in the  Dashboard.",
  url: "`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/settings",
};

const ManagerccontextSettings = dynamic(() => import('./contex'), {
  ssr: false,})

export default function ManagerSettings() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <ManagerccontextSettings/>
    </>
  );
}