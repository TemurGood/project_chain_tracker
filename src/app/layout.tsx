import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "ChainTracker - Управление сетью",
  description: "Финансовый учет и бюджетирование",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      {/* Используем стандартный системный шрифт Tailwind (font-sans), чтобы избежать запросов к Google */}
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <RoleProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </RoleProvider>
      </body>
    </html>
  );
}