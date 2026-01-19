import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./content/**/*.{md,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                mplp: {
                    // Brand Palette - Technical & Standard (Matches Docs)
                    blue: "#2563EB",       // Tailwind Blue 600
                    "blue-soft": "#3B82F6", // Tailwind Blue 500
                    "blue-light": "#60A5FA", // Tailwind Blue 400
                    "blue-dark": "#1D4ED8",  // Tailwind Blue 700

                    cyano: "#5ADEFF",        // Legacy accent kept for now
                    indigo: "#6366F1",       // Legacy accent kept for now
                    emerald: "#10B981",

                    // Neutrals (Dark Theme - Slate Scale)
                    dark: "#030712",      // slate-950
                    "dark-soft": "#111827", // slate-900
                    border: "#1F2937",    // slate-800
                    text: "#F9FAFB",      // slate-50
                    "text-muted": "#9CA3AF", // slate-400

                    // Semantic
                    success: "#10B981",
                    warning: "#F59E0B",
                    error: "#EF4444",
                    info: "#0EA5E9",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
            },
            borderRadius: {
                lg: "0.5rem",
                xl: "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
            boxShadow: {
                stable: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                glow: "0 0 20px -5px rgba(37, 99, 235, 0.1)",
                "glow-blue": "0 0 15px -3px rgba(59, 130, 246, 0.2)",
                "glow-hover": "0 10px 40px -10px rgba(59, 130, 246, 0.25)",
            },
            animation: {
                "fade-in-up": "fade-in-up 0.4s ease-out forwards",
                "fade-in": "fade-in 0.2s ease-out forwards",
                "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            },
            keyframes: {
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(4px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-in-right": {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(0)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
