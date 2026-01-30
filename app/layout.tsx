import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Leads Tracker",
  description: "Track local business prospects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/" className="text-xl font-bold text-gray-900">
                Local Leads
              </a>
              <nav className="flex gap-4">
                <a href="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </a>
                <a href="/prospects/new" className="text-gray-600 hover:text-gray-900">
                  Add Prospect
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
