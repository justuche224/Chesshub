import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import Topbar from "@/components/Navbar/Topbar";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

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
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <SessionProvider session={session}>
        <NextTopLoader color="red" />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Topbar />
          <main>{children}</main>
          <Toaster
            position="top-center"
            closeButton
            toastOptions={{
              // unstyled: true,
              classNames: {
                toast: "dark:bg-black bg-white",
                // title: 'text-red-400',
                // description: 'text-red-400',
                // actionButton: 'bg-zinc-400',
                // cancelButton: 'bg-orange-400',
                // closeButton: 'bg-lime-400',
              },
            }}
          />
        </body>
      </SessionProvider>
    </html>
  );
}
