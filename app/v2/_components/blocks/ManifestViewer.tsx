import React from 'react';

interface ManifestViewerProps {
    data?: {
        run_id?: string;
        ruleset_version?: string;
        schema_bundle_version?: string;
        pack_root_hash?: string;
        env_ref?: { image_digest: string } | string;
        produced_at?: string;
        [key: string]: any;
    };
    tokens: Record<string, string>;
}

export function ManifestViewer({ data, tokens }: ManifestViewerProps) {
    if (!data) return null;

    const discl = tokens['DISCL_NOT_SDK'] || 'Not SDK';
    const hash = data.pack_root_hash || data.canonical || tokens['LIT_NOT_APPLICABLE'];
    const env = typeof data.env_ref === 'object' ? data.env_ref.image_digest : (data.env_ref || tokens['LIT_NOT_APPLICABLE']);

    return (
        <div className="manifest-viewer bg-white border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <strong className="block text-gray-400 text-[10px] uppercase tracking-wider">{tokens['LIT_RUN_ID']}</strong>
                    <span className="block break-all">{data.run_id || tokens['LIT_NOT_APPLICABLE']}</span>
                </div>
                <div>
                    <strong className="block text-gray-400 text-[10px] uppercase tracking-wider">{tokens['LIT_RULESET_VERSION']}</strong>
                    <span className="block">{data.ruleset_version || tokens['LIT_NOT_APPLICABLE']}</span>
                </div>
                <div>
                    <strong className="block text-gray-400 text-[10px] uppercase tracking-wider">{tokens['LIT_SCHEMA_BUNDLE']}</strong>
                    <span className="block">{data.schema_bundle_version || tokens['LIT_NOT_APPLICABLE']}</span>
                </div>
                <div>
                    <strong className="block text-gray-400 text-[10px] uppercase tracking-wider">{tokens['LIT_PACK_ROOT_HASH']}</strong>
                    <span className="block break-all">{hash}</span>
                </div>
                <div className="md:col-span-2">
                    <strong className="block text-gray-400 text-[10px] uppercase tracking-wider">{tokens['LIT_ENV_REF']}</strong>
                    <span className="block break-all">{env}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px]">
                    {discl}
                </span>
            </div>
        </div>
    );
}
