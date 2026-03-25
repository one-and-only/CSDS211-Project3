import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const notoSans = Noto_Sans({ variable: '--font-sans', subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chant",
  description: "Talk to your buddies; freely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" className={notoSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AppSidebar />

          <SidebarTrigger />
          {children}
        </SidebarProvider>
      </body>
    </html>

  );
}
