import type { Metadata } from "next";
import { NonEndorsementBanner } from "@/components/layout/non-endorsement-banner";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL("https://lab.mplp.io"),
    title: {
        default: "MPLP Validation Lab",
        template: "%s — MPLP Validation Lab",
    },
    description:
        "Evidence-based verdict viewing and export for MPLP conformance evaluation. Not a certification program. Does not host execution.",
    alternates: { canonical: "https://lab.mplp.io" },
    openGraph: {
        title: "MPLP Validation Lab",
        description:
            "Evidence-based verdict viewing and export for MPLP conformance evaluation. Not a certification program. Does not host execution.",
        url: "https://lab.mplp.io",
        siteName: "MPLP Validation Lab",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "MPLP Validation Lab",
        description:
            "Evidence-based verdict viewing and export for MPLP conformance evaluation. Not a certification program. Does not host execution.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-zinc-950 text-white min-h-screen" suppressHydrationWarning>
                <NonEndorsementBanner />
                <Nav />
                <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
            </body>
        </html>
    );
}
