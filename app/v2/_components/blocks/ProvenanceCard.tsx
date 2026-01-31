
import React from 'react';

interface ProvenanceCardProps {
    data?: {
        provenance?: {
            protocol_ref?: { protocol_name: string; schemas_version: string };
            substrate_ref?: { substrate_name: string; upstream_tag: string };
            lab_ref?: { lab_version: string };
            env_ref?: { runner_id: string; image_digest: string };
        };
    };
    tokens: Record<string, string>;
}

export function ProvenanceCard({ data, tokens }: ProvenanceCardProps) {
    if (!data || !data.provenance) return null;

    const prov = data.provenance;
    // Fallback labels if tokens missing (though gate checks this)
    const lblProto = tokens['LIT_PROTOCOL_REF'];
    const lblSubstrate = tokens['LIT_SUBSTRATE_REF'];
    const lblLab = tokens['LIT_LAB_REF'];

    return (
        <div className="glass-card mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
                {tokens['LIT_PROVENANCE_HEADER']}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <span className="block text-xs text-gray-600 mb-1">{lblProto}</span>
                    <div className="font-mono text-sm text-cyan-400">
                        {prov.protocol_ref?.protocol_name} <span className="text-gray-500">{prov.protocol_ref?.schemas_version}</span>
                    </div>
                </div>

                <div>
                    <span className="block text-xs text-gray-600 mb-1">{lblSubstrate}</span>
                    <div className="font-mono text-sm text-white">
                        {prov.substrate_ref?.substrate_name} <span className="text-gray-500">{prov.substrate_ref?.upstream_tag}</span>
                    </div>
                </div>

                <div>
                    <span className="block text-xs text-gray-600 mb-1">{lblLab}</span>
                    <div className="font-mono text-sm text-white">
                        VLab <span className="text-gray-500">{prov.lab_ref?.lab_version}</span>
                    </div>
                </div>
            </div>

            {/* Optional: Runner Info */}
            {prov.env_ref && (
                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-xs text-gray-600">Runner ID: {prov.env_ref.runner_id}</span>
                    <span className="text-xs font-mono text-gray-700" title={prov.env_ref.image_digest}>
                        {prov.env_ref.image_digest.substring(0, 12)}...
                    </span>
                </div>
            )}
        </div>
    );
}
