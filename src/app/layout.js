import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Navbar } from '@/components/layout/navbar'
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Internship Management App",
  description: "Manage internship programs with learning paths and task tracking",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <Navbar />
              <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {children}
              </main>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
