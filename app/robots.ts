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
                    "/policies/contract",
                    "/policies/intake",
                    "/policies/substrate-scope",
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

