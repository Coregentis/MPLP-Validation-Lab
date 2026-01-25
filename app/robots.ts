import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: [
                    "/",
                    "/about",
                    "/runs",
                    "/adjudication",
                    "/rulesets",
                    "/guarantees",
                    "/coverage",
                    "/coverage/adjudication",
                    "/methodology",
                    "/policies/contract",
                    "/policies/intake",
                    "/policies/substrate-scope",
                    "/policies/fmm",
                    "/policies/cross-verified",
                    "/validation",
                    "/validation/samples",
                ],
                disallow: [
                    "/api",
                    "/api/",
                    "/examples",
                    "/examples/",
                    "/builder",
                    "/builder/",
                    "/statement",
                    "/statement/",
                ],
            },
        ],
        sitemap: "https://lab.mplp.io/sitemap.xml",
    };
}

