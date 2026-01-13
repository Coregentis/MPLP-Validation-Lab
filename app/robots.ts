import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/about"],
                disallow: [
                    "/runs",
                    "/runs/",
                    "/api",
                    "/api/",
                    "/examples",
                    "/examples/",
                    "/rulesets",
                    "/rulesets/",
                    "/policies",
                    "/policies/",
                    "/builder",
                    "/builder/",
                    "/coverage",
                    "/coverage/"
                ],
            },
        ],
        sitemap: "https://lab.mplp.io/sitemap.xml",
    };
}
