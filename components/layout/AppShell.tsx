import React from 'react';
import { NonEndorsementBanner } from "@/components/layout/non-endorsement-banner";
import { NonCertificationNotice } from "@/components/layout/non-certification-notice";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/layout/Footer";

import { VersionStrip } from '@/components/VersionStrip';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';

interface AppShellProps {
    children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
    const versionModel = await getVersionStripModel();

    return (
        <>
            {/* Background Effects - One single source of truth for the "Starfield" */}
            <div className="fixed inset-0 bg-grid pointer-events-none opacity-20 z-0" aria-hidden="true" />
            <div className="fixed inset-0 bg-mesh pointer-events-none opacity-60 z-0" aria-hidden="true" />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-mplp-dark/50 to-mplp-dark pointer-events-none z-0" aria-hidden="true" />

            {/* Main Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen" data-testid="app-shell-container">
                <NonEndorsementBanner />
                <NonCertificationNotice />
                <Nav />
                <VersionStrip {...versionModel} />

                {/* 
                  Standard Page Container
                  Max Width: 7xl (80rem / 1280px)
                  Padding: px-4 sm:px-6 lg:px-8
                  Vertical Padding: py-8
                */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
                    {children}
                </main>

                <Footer />
            </div>
        </>
    );
}
