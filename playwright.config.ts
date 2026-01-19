import { defineConfig, devices } from '@playwright/test';

/**
 * PR-10: Minimal Playwright Config
 * 
 * Only for UI semantic assertions (DOM structure, not visual comparison).
 * Requires dev server running on :3000.
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }],
        ['json', { outputFile: 'artifacts/ui-semantic.report.json' }],
    ],
    use: {
        baseURL: 'http://127.0.0.1:3000',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // Expect dev server to be running
    webServer: {
        command: 'npm run dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
    },
});
