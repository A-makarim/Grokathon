import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { BountiesProvider } from "@/contexts/BountiesContext";
import { ApplicationsProvider } from "@/contexts/ApplicationsContext";

export const metadata: Metadata = {
  title: "X Bounties - Bounty Marketplace",
  description: "A modern bounty marketplace for freelancers and clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          <BountiesProvider>
            <ApplicationsProvider>
              {children}
            </ApplicationsProvider>
          </BountiesProvider>
        </UserProvider>
      </body>
    </html>
  );
}
