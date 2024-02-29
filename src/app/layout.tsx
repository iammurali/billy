import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Billy POS",
  description: "A pos desktop application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex flex-col h-screen max-h-screen min-w-96">
            <div className="border-b border-zinc-700 bg-zinc-800 flex flex-row justify-start font-light text-sm h-7">
              <Link
                href={'/manage-menu'}
                className="border-zinc-600 text-left hover:bg-zinc-500 px-2 py-1 rounded-sm"
              >
                Manage menu
              </Link>
              <Link
                href={'/reports'}
                className="border-zinc-600 text-center hover:bg-zinc-500 px-2 py-1 rounded-sm"
              >
                Reports
              </Link>
              <Link
                href={'/bills'}
                className="border-zinc-600 text-center hover:bg-zinc-500 px-2 py-1 rounded-sm"
              >
                Bills
              </Link>
            </div>
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
