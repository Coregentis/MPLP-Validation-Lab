import { VersionStripModel } from "@/lib/unified/version-strip-model";
// import Link from 'next/link'; -- Unused

export function VersionStrip(props: VersionStripModel) {
    return (
        <div data-testid="version-strip" className="w-full bg-mplp-dark-soft/50 border-b border-mplp-border/40 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-[10px] sm:text-xs font-mono tracking-wide text-mplp-text-muted">

                {/* Build / Seal */}
                <div className="flex items-center gap-2">
                    <span className="uppercase font-bold text-mplp-text-muted/60">Build</span>
                    <span className={`px-1.5 py-0.5 rounded ${props.seal_status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400' :
                        props.seal_status === 'INVALID' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-500/10 text-zinc-400'
                        }`}>
                        {props.build_id}
                    </span>
                </div>

                {/* Run Inventory */}
                <div className="flex items-center gap-2 hidden sm:flex">
                    <span className="uppercase font-bold text-mplp-text-muted/60">Inventory</span>
                    <span>
                        <span className="text-mplp-text">{props.run_inventory.total} Runs</span>
                        <span className="mx-1 opacity-40">|</span>
                        <span title={`V1 Curated (Gen: ${props.run_inventory.v1_version})`}>V1:{props.run_inventory.v1_count}</span>
                        <span className="mx-1 opacity-40">/</span>
                        <span title={`V2 Index (Gen: ${props.run_inventory.v2_version})`}>V2:{props.run_inventory.v2_count}</span>
                    </span>
                </div>

                {/* Ruleset Inventory */}
                <div className="flex items-center gap-2 hidden md:flex">
                    <span className="uppercase font-bold text-mplp-text-muted/60">Logic</span>
                    <span>
                        <span className="text-mplp-text">{props.ruleset_inventory.total} Sets</span>
                        <span className="mx-1 opacity-40">|</span>
                        <span>Def: {props.ruleset_inventory.current_default}</span>
                    </span>
                </div>

                {/* Snapshot Date */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="uppercase font-bold text-mplp-text-muted/60">SSOT</span>
                    <span>{props.snapshot_date}</span>
                </div>
            </div>
        </div>
    );
}
