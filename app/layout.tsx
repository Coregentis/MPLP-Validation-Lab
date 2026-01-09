import type { Metadata } from "next";
import { NonEndorsementBanner } from "@/components/layout/non-endorsement-banner";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
    title: "MPLP Validation Lab",
    description: "Evidence-based verdicts for MPLP lifecycle guarantees (Golden Flows), under a versioned deterministic ruleset.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-zinc-950 text-white min-h-screen">
                <NonEndorsementBanner />
                <Nav />
                <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
            </body>
        </html>
    );
}
