import dynamic from "next/dynamic";
import Head from "next/head";

export const metadata = {
  title: "Sign Up",
  openGraph: {
    title: "Sign Up",
    description: "Create a new account to access the dashboard.",
    url: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/signup`,
    siteName: "Dashboard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up",
    description: "Create a new account to access the dashboard.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/signup`,
  },
};

const SignUpComponent = dynamic(() => import("./context"), {
  ssr: false,
});

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Sign Up | Dashboard",
  description: "Create a new account to access the dashboard.",
  url: "`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/signup",
};

// Page component
export default function SignUp() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <SignUpComponent />
    </>
  );
}
