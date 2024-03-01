import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { MenuSquare } from "lucide-react";

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
          <main className="flex h-screen max-h-screen min-w-96 flex-col">
            <div className="flex h-7 flex-row justify-start border-b border-zinc-700 bg-zinc-800 text-sm font-light">
              <Link
                href={"/manage-menu"}
                className="flex items-center gap-1 rounded-sm border-zinc-600 px-2 py-1 text-left hover:bg-zinc-500"
              >
                <MenuSquare size={16} /> Manage menu
              </Link>
              <Link
                href={"/reports"}
                className="rounded-sm border-zinc-600 px-2 py-1 text-center hover:bg-zinc-500"
              >
                Reports
              </Link>
              <Link
                href={"/bills"}
                className="rounded-sm border-zinc-600 px-2 py-1 text-center hover:bg-zinc-500"
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
