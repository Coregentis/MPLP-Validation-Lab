import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://lab.mplp.io";
    return [
        { url: `${base}/`, lastModified: new Date() },
        { url: `${base}/about`, lastModified: new Date() },
    ];
}
