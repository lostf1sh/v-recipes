import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://v.recipes"),
  title: {
    default: "v.recipes",
    template: "%s | v.recipes",
  },
  description:
    "Small team, big curiosity. Privacy-focused DNS, network tools, and developer experiments.",
  applicationName: "v.recipes",
  openGraph: {
    title: "v.recipes",
    description:
      "Small team, big curiosity. Privacy-focused DNS, network tools, and developer experiments.",
    siteName: "v.recipes",
    type: "website",
    url: "https://v.recipes",
  },
  twitter: {
    card: "summary_large_image",
    title: "v.recipes",
    description:
      "Small team, big curiosity. Privacy-focused DNS, network tools, and developer experiments.",
  },
  icons: {
    icon: [
      {
        url: "https://v.recipes/assets/internal/vrecipeslogo1.png",
        type: "image/x-icon",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
