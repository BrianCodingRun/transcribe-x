import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Anek_Telugu } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const AnekTelugu = Anek_Telugu({
  subsets: ["latin"], 
  variable: "--font-caption",
});

export const metadata: Metadata = {
  title: "TranscribeX",
  description: "TranscribeX est un service de conversion de format de fichier, il permet de convertir n'importe quel fichier en format souhaité.",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    }
  ],
  creator: "BRIAN COUPAMA - DEVELOPER WEB FULLSTACK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={cn(GeistSans.variable, AnekTelugu, `font-sans`)}>
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
