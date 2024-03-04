import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { MenuSquare } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex h-screen max-h-screen min-w-96 flex-col bg-background">
            <div className="flex h-7 px-2 flex-row border-b border-border bg-background text-sm font-light items-center justify-between">
              <div className="flex flex-row">
              <Link
                href={"/manage-menu"}
                className="text-foreground flex items-center gap-1 rounded-sm border-border px-2 py-1 text-left hover:bg-accent"
              >
                Manage menu
              </Link>
              <Link
                href={"/reports"}
                className="text-foreground rounded-sm border-border px-2 py-1 text-center hover:bg-accent"
              >
                Reports
              </Link>
              <Link
                href={"/bills"}
                className="text-foreground rounded-sm border-border px-2 py-1 text-center hover:bg-accent"
              >
                Bills
              </Link>
              </div>
              <ModeToggle />
            </div>
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
