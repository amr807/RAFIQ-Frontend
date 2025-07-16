import dynamic from "next/dynamic";
import Head from "next/head";

// Metadata for SEO and social media sharing
export const metadata = {
  title: "Add Task",
  openGraph: {
    title: "Add Task",
    description: "Create and assign new tasks to employees.",
    url: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/add-task`,
    siteName: "Dashboard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Task",
    description: "Create and assign new tasks to employees.",
  },
  alternates: {
    canonical:`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/add-task`,
  },
};

// Dynamic import of the AddTask component with SSR disabled
const AddTaskComponent = dynamic(() => import("./context"), {
  ssr: false,
});

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Add Task | Dashboard",
  description: "Create and assign new tasks to employees.",
  url: "`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/add-task",
};

// Page component
export default function AddTask() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <AddTaskComponent />
    </>
  );
}
