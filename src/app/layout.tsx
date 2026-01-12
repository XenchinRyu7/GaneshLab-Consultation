import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";

import { getTranslations } from "next-intl/server";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: {
      default: "GaneshLab",
      template: "%s | GaneshLab",
    },
    description: t("homeDescription"),
    openGraph: {
      title: "GaneshLab",
      description: t("homeDescription"),
      url: "https://ganeshlab.com",
      siteName: "GaneshLab",
      images: [
        {
          url: "https://ganeshlab.com/og.png",
          width: 1920,
          height: 1080,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    twitter: {
      title: "GaneshLab",
      card: "summary_large_image",
    },
    icons: {
      shortcut: "/favicon.ico",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={[inter.variable, calSans.variable].join(" ")}
      suppressHydrationWarning
    >
      <body
        className={`bg-white ${process.env.NODE_ENV === "development" ? "debug-screens" : undefined}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
