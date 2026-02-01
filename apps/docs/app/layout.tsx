import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import { siteConfig } from "@/fumadocs.config";
import { inter, poppins } from "./fonts";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "zh_CN",
    type: "website",
  },
  icons: {
    shortcut: siteConfig.icon,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${inter.className} ${inter.variable} ${poppins.variable}`}
      lang="zh-CN"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
