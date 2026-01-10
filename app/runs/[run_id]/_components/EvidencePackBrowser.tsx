export function EvidencePackBrowser({ runId }: { runId: string }) {
    const files = [
        'manifest.json',
        'integrity/sha256sums.txt',
        'integrity/pack.sha256',
        'timeline/events.ndjson',
        'artifacts/context.json',
        'artifacts/plan.json',
        'artifacts/trace.json'
    ];

    return (
        <section className="border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Evidence Pack (7 files)</h2>

            <ul className="space-y-2">
                {files.map(file => (
                    <li key={file} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                        <code className="text-sm font-mono">{file}</code>
                        <div className="flex gap-3">
                            <a
                                href={`/api/runs/${runId}/files/${file}`}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                View
                            </a>
                            <a
                                href={`/api/runs/${runId}/download/${file}`}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Download
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
