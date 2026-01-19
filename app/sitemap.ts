import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://lab.mplp.io";
    const lastModified = new Date();

    return [
        { url: `${base}/`, lastModified },
        { url: `${base}/about`, lastModified },
        { url: `${base}/runs`, lastModified },
        { url: `${base}/adjudication`, lastModified },
        { url: `${base}/rulesets`, lastModified },
        { url: `${base}/guarantees`, lastModified },
        { url: `${base}/coverage`, lastModified },
        { url: `${base}/coverage/adjudication`, lastModified },
        { url: `${base}/policies/contract`, lastModified },
        { url: `${base}/policies/intake`, lastModified },
        { url: `${base}/policies/substrate-scope`, lastModified },
    ];
}
