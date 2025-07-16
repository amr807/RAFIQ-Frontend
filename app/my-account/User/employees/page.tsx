
import dynamic from "next/dynamic";
export const metadata = {
  title: "Employees ",
  openGraph: {
    title: "Employees ",
    description: "View and manage all employees in your organization.",
    url: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/employees`,
    siteName: " Dashboard",
   
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Employees ",
    description: "View and manage all employees in your organization.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/employees`,
  },
};
const Employees=dynamic(()=>import("./contex"),{
  ssr:false
})
import Head from "next/head";
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Employees |  Dashboard",
  description: "View and manage all employees in your organization.",
  url:`${process.env.NEXT_PUBLIC_Base_URL}/my-account/User/employees`,
};

export default function EmployeesPage() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
<Employees/>
    </>
  );
}
