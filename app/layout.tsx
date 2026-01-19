import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from "next/font/google";
import { NonEndorsementBanner } from "@/components/layout/non-endorsement-banner";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
    display: "swap",
});

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
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-mplp-dark text-mplp-text min-h-screen flex flex-col`} suppressHydrationWarning>
                {/* Background Effects - Reduced opacity for text contrast */}
                <div className="fixed inset-0 bg-grid pointer-events-none opacity-20 z-0" aria-hidden="true"></div>
                <div className="fixed inset-0 bg-mesh pointer-events-none opacity-60 z-0" aria-hidden="true"></div>
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-mplp-dark/50 to-mplp-dark pointer-events-none z-0" aria-hidden="true"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col min-h-screen">
                    <NonEndorsementBanner />
                    <Nav />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
