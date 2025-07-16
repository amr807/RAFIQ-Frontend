import dynamic from "next/dynamic";
import Head from "next/head";

// Metadata for SEO and social media sharing
export const metadata = {
  title: "Tasks",
  openGraph: {
    title: "Tasks",
    description: "View and manage tasks assigned to employees.",
    url: "`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/tasks",
    siteName: "Dashboard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tasks",
    description: "View and manage tasks assigned to employees.",
  },
  alternates: {
    canonical: "`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/tasks",
  },
};

// Dynamic import of the Task component with SSR disabled
const TaskComponent = dynamic(() => import("./context"), {
  ssr: false,
});

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Tasks | Dashboard",
  description: "View and manage tasks assigned to employees.",
  url: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/tasks`,
};

// Page component
export default function Tasks() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <TaskComponent />
    </>
  );
}
