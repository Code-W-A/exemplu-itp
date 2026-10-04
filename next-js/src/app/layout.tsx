import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "@/lib/store";
export const metadata: Metadata = {
  title: "WHITE LABEL · Administrare",
  description: "Programări, vehicule și întreținere într-un singur loc.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
