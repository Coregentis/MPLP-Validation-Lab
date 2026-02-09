import React from "react";
import ReactMarkdown from "react-markdown";

function resolveToken(model: unknown, token: string): string | null {
    const parts = token.split(".");
    let cur: unknown = model;
    for (const p of parts) {
        if (cur == null || typeof cur !== "object" || !(p in (cur as Record<string, unknown>))) return null;
        cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === "string" || typeof cur === "number" || typeof cur === "boolean"
        ? String(cur)
        : JSON.stringify(cur);
}

export function renderDoclet(md: string, model: unknown) {
    return md.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (m, token) => {
        const v = resolveToken(model, token);
        return v == null ? `__UNRESOLVED__(${token})` : v;
    });
}

interface DocletProps {
    md: string;
    model: unknown;
    className?: string; // allow styling injection
}

export default function Doclet(props: DocletProps) {
    const text = renderDoclet(props.md, props.model);
    return (
        <div className={`prose prose-invert prose-sm max-w-none doclet-container ${props.className || ''}`}>
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
}
