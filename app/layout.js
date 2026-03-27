import { Inter } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import Header from "@/components/header";
import SplashCursor from "@/components/SplashCursor";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Welth",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <SplashCursor />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="py-12 bg-blue-50">
            <div className="container px-4 mx-auto text-center text-gray-600">
              <p>Developed & maintained by Samruddhi</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
