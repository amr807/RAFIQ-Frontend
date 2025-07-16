import dynamic from "next/dynamic";
import Head from "next/head";

export const metadata = {
  title: "Login",
  openGraph: {
    title: "Login",
    description: "Log in to access your dashboard.",
    url:`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/login`,
    siteName: "Dashboard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login",
    description: "Log in to access your dashboard.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/login`,
  },
};

const LoginComponent = dynamic(() => import("./context"), {
  ssr: false,
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Login | Dashboard",
  description: "Log in to access your dashboard.",
  url: "`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/login",
};

// Page component
export default function Login() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <LoginComponent />
    </>
  );
}
