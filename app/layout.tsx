import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SITE_CONFIG } from "@/lib/constants/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} — SaaS Moderne de Gestion des Églises`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "ChurchOS",
    "SaaS église",
    "gestion église",
    "gestion membres église",
    "dîmes et offrandes",
    "présence culte",
    "suivi pastoral",
    "sermons",
    "comptabilité église",
  ],
  authors: [{ name: "ChurchOS Team" }],
  creator: "ChurchOS",
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_CONFIG.url,
    title: `${SITE_CONFIG.name} — SaaS Moderne de Gestion des Églises`,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
