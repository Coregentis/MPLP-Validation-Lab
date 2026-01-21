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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Guardrail Banner */}
        <div className="bg-amber-900/50 border border-amber-600 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-xl">⚠️</span>
            <div>
              <h2 className="font-bold text-amber-200 mb-2">Coverage Matrix Boundaries</h2>
              <ul className="text-amber-100 text-sm space-y-1">
                <li>• <strong>NOT</strong> a certification program</li>
                <li>• Does <strong>NOT</strong> host execution</li>
                <li>• Evidence viewing &amp; adjudication only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Vectors Coverage (v0.5)</h1>
          <p className="text-gray-400">
            Coverage matrix from SSOT:
            <code className="ml-2 text-xs bg-gray-800 px-2 py-1 rounded font-mono">
              test-vectors/v0.5/allowlist-v0.5.yaml
            </code>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Ruleset: <code className="text-blue-400">{allowlist.ruleset_pin}</code>
          </p>
        </div>

        {/* Coverage Navigation Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Link href="/coverage/adjudication" className="block rounded-lg border border-zinc-700 bg-zinc-800/50 p-5 hover:bg-zinc-800 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📊</span>
              <span className="text-sm font-semibold text-mplp-text">Adjudication Coverage Matrix</span>
            </div>
            <p className="text-sm text-mplp-text-muted">
              Substrate × GF/Domain matrix with clickable verdicts
            </p>
          </Link>

          <Link href="/adjudication" className="block rounded-lg border border-zinc-700 bg-zinc-800/50 p-5 hover:bg-zinc-800 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">⚖️</span>
              <span className="text-sm font-semibold text-mplp-text">All Adjudication Bundles</span>
            </div>
            <p className="text-sm text-mplp-text-muted">
              Browse bundles, verdict hashes & recheck status
            </p>
          </Link>
        </div>

        {/* Summary Stats */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{totalPass}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">PASS Vectors</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{totalFail}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">FAIL Vectors</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{totalPass + totalFail}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Vectors</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className={`text-2xl font-bold ${allMet ? 'text-green-400' : 'text-yellow-400'}`}>
              {allMet ? '✓' : '○'}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">≥5/≥5 Target</p>
          </div>
        </div>

        {/* Coverage Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Domain</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">PASS (≥5)</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">FAIL (≥5)</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => {
                const met = row.passCount >= 5 && row.failCount >= 5;
                return (
                  <tr key={row.domain} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <DomainPill domain={row.domain} />
                    </td>
                    <td className="py-3 px-4">{row.label}</td>
                    <td className="py-3 px-4 text-center">
                      <CountCell count={row.passCount} type="pass" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CountCell count={row.failCount} type="fail" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={met ? 'text-green-400' : 'text-yellow-400'}>
                        {met ? 'MET' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-bold mb-3 text-gray-300">Coverage Target</h3>
          <p className="text-sm text-gray-400">
            Each domain requires <strong>≥5 PASS</strong> and <strong>≥5 FAIL</strong> vectors
            to meet the v0.5 coverage target. All vectors are adjudicable via shadow-validator
            and signable via proof-signature gate.
          </p>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <Link href="/about" className="text-blue-400 hover:underline">About</Link>
          {' | '}
          <Link href="/runs" className="text-blue-400 hover:underline">Runs</Link>
          {' | '}
          <Link href="/rulesets" className="text-blue-400 hover:underline">Rulesets</Link>
        </div>
      </div>
    </div>
  );
}
