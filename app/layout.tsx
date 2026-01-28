import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Table Picker - Wedding Seating Planner",
  description: "Drag and drop wedding seating arrangement tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
