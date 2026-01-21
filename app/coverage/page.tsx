import { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

export const metadata: Metadata = {
  title: 'Test Vectors Coverage | MPLP Validation Lab',
  description: 'MPLP v0.5 test vector coverage matrix - D1/D2/D3/D4 domains',
  robots: { index: true, follow: true }
};


// Load test-vectors allowlist from SSOT
function loadAllowlist() {
  const allowlistPath = join(process.cwd(), 'test-vectors', 'v0.5', 'allowlist-v0.5.yaml');
  const content = readFileSync(allowlistPath, 'utf-8');
  return yaml.parse(content);
}

interface DomainData {
  PASS: { vector_id: string; description: string; path: string }[];
  FAIL: { vector_id: string; description: string; path: string }[];
}

interface Allowlist {
  version: string;
  ruleset_pin: string;
  D1: DomainData;
  D2: DomainData;
  D3: DomainData;
  D4: DomainData;
}

function DomainPill({ domain }: { domain: string }) {
  const colors: Record<string, string> = {
    'D1': 'bg-blue-600',
    'D2': 'bg-green-600',
    'D3': 'bg-purple-600',
    'D4': 'bg-orange-600'
  };

  return (
    <span className={`${colors[domain] || 'bg-gray-500'} text-white px-3 py-1 rounded text-sm font-bold`}>
      {domain}
    </span>
  );
}

function CountCell({ count, type }: { count: number; type: 'pass' | 'fail' }) {
  const color = type === 'pass' ? 'text-green-400' : 'text-red-400';
  const target = 5;
  const met = count >= target;

  return (
    <span className={`${color} font-mono`}>
      {count}
      {met && <span className="text-xs ml-1">✓</span>}
    </span>
  );
}

export default function CoveragePage() {
  const allowlist = loadAllowlist() as Allowlist;
  const domains = ['D1', 'D2', 'D3', 'D4'] as const;

  const domainLabels: Record<string, string> = {
    D1: 'Budget Control',
    D2: 'Lifecycle State',
    D3: 'AuthZ Decision',
    D4: 'Termination'
  };

  const summary = domains.map(d => ({
    domain: d,
    label: domainLabels[d],
    passCount: allowlist[d]?.PASS?.length || 0,
    failCount: allowlist[d]?.FAIL?.length || 0,
  }));

  const totalPass = summary.reduce((acc, s) => acc + s.passCount, 0);
  const totalFail = summary.reduce((acc, s) => acc + s.failCount, 0);
  const allMet = summary.every(s => s.passCount >= 5 && s.failCount >= 5);

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Evidence</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Test Vectors Coverage (v0.5)</h1>
        <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
          Coverage matrix from SSOT: <code className="ml-2 text-xs bg-mplp-dark-soft px-2 py-1 rounded font-mono border border-mplp-border/40">test-vectors/v0.5/allowlist-v0.5.yaml</code>
        </p>
        <p className="text-mplp-text-muted/60 text-sm mt-2">
          Ruleset: <code className="text-mplp-blue-soft">{allowlist.ruleset_pin}</code>
        </p>
      </div>

      {/* Boundary Statement */}
      <div className="mb-10 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-amber-400/90 font-medium uppercase tracking-wider mb-2">
          Coverage Matrix Boundaries
        </p>
        <ul className="text-sm text-mplp-text-muted space-y-1">
          <li>• <strong className="text-amber-400">NOT</strong> a certification program</li>
          <li>• Does <strong className="text-amber-400">NOT</strong> host execution</li>
          <li>• Evidence viewing &amp; adjudication only</li>
        </ul>
      </div>

      {/* Coverage Navigation Cards */}
      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <Link href="/coverage/adjudication" className="block rounded-2xl border border-mplp-border/30 bg-glass p-6 hover:bg-mplp-blue-soft/5 hover:border-mplp-blue-soft/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-semibold text-mplp-text">Adjudication Coverage Matrix</span>
          </div>
          <p className="text-sm text-mplp-text-muted">
            Substrate × GF/Domain matrix with clickable verdicts
          </p>
        </Link>

        <Link href="/adjudication" className="block rounded-2xl border border-mplp-border/30 bg-glass p-6 hover:bg-mplp-blue-soft/5 hover:border-mplp-blue-soft/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚖️</span>
            <span className="text-sm font-semibold text-mplp-text">All Adjudication Bundles</span>
          </div>
          <p className="text-sm text-mplp-text-muted">
            Browse bundles, verdict hashes &amp; recheck status
          </p>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
          <p className="text-2xl font-bold text-green-400">{totalPass}</p>
          <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">PASS Vectors</p>
        </div>
        <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
          <p className="text-2xl font-bold text-red-400">{totalFail}</p>
          <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">FAIL Vectors</p>
        </div>
        <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
          <p className="text-2xl font-bold text-mplp-text">{totalPass + totalFail}</p>
          <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">Total Vectors</p>
        </div>
        <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
          <p className={`text-2xl font-bold ${allMet ? 'text-green-400' : 'text-yellow-400'}`}>
            {allMet ? '✓' : '○'}
          </p>
          <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">≥5/≥5 Target</p>
        </div>
      </div>

      {/* Coverage Table */}
      <div className="bg-glass rounded-2xl overflow-hidden border border-mplp-border/30 mb-10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-mplp-dark-soft/50">
              <tr>
                <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Domain</th>
                <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Description</th>
                <th className="text-center p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">PASS (≥5)</th>
                <th className="text-center p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">FAIL (≥5)</th>
                <th className="text-center p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => {
                const met = row.passCount >= 5 && row.failCount >= 5;
                return (
                  <tr key={row.domain} className="border-b border-mplp-border/20 hover:bg-mplp-blue-soft/5 transition-colors">
                    <td className="p-4">
                      <DomainPill domain={row.domain} />
                    </td>
                    <td className="p-4 text-mplp-text">{row.label}</td>
                    <td className="p-4 text-center">
                      <CountCell count={row.passCount} type="pass" />
                    </td>
                    <td className="p-4 text-center">
                      <CountCell count={row.failCount} type="fail" />
                    </td>
                    <td className="p-4 text-center">
                      <span className={met ? 'text-green-400 font-bold' : 'text-yellow-400'}>
                        {met ? 'MET' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="p-6 bg-glass rounded-2xl border border-mplp-border/30 mb-10">
        <h3 className="font-bold mb-3 text-mplp-text">Coverage Target</h3>
        <p className="text-sm text-mplp-text-muted">
          Each domain requires <strong className="text-mplp-text">≥5 PASS</strong> and <strong className="text-mplp-text">≥5 FAIL</strong> vectors
          to meet the v0.5 coverage target. All vectors are adjudicable via shadow-validator
          and signable via proof-signature gate.
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-8 pt-8 border-t border-mplp-border/30 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider">
        <Link href="/about" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
          About →
        </Link>
        <Link href="/runs" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
          Runs →
        </Link>
        <Link href="/rulesets" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
          Rulesets →
        </Link>
      </div>
    </div>
  );
}
