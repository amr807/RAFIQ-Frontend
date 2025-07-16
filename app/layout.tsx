import localFont from "next/font/local";
import "./globals.css";
import Provider from "./components/Provider";
import { Navbar } from "./components/Navbar";
import LoadingState from "./components/loadingspin";
import Footer from "./components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: " Dashboard",
  description: "Manage your organization, employees, and tasks efficiently.",
  openGraph: {
    title: " Dashboard",
    description: "Manage your organization, employees, and tasks efficiently.",
    images: ["./favicon.ico"],
  },
  twitter: {
    card: "summary_large_image",
    title: " Dashboard",
    description: "Manage your organization, employees, and tasks efficiently.",
    images: ["/favicon.ico"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
 <body
 // Add this right after the opening <body> tag

        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >   
      <div className="symbolic-elements">
<div className="symbol symbol-1">✓</div>
<div className="symbol symbol-2">📋</div>
<div className="symbol symbol-3">⏰</div>
<div className="symbol symbol-4">🎯</div>
<div className="symbol symbol-5">⭐</div>
</div>            
 <Provider>    <LoadingState>
       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 bg-pattern">   
 
        

               <div className="flex justify-center py-4">
             
              </div>
               <Navbar/>      
               <Toaster/>

 <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</div>
   
      </div> </LoadingState>
 <Footer/>   
 </Provider>
      </body>   

    </html>
  );
}
