import type { Metadata } from "next";
import { NonEndorsementBanner } from "@/components/layout/non-endorsement-banner";
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
            <body>
                <NonEndorsementBanner />
                <main>{children}</main>
            </body>
        </html>
    );
}
