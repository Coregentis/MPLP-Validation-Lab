import manifestJson from "@/lib/data/mplp-public-manifest.json";

export type ProtocolManifestBoundary = {
    non_certifying: boolean;
    non_normative: boolean;
    evidence_based_verdicts_only: boolean;
    no_endorsement: boolean;
    no_certification: boolean;
    no_regulator_approval: boolean;
    no_protocol_truth_override: boolean;
    no_runtime_authority: boolean;
    no_sdk_authority: boolean;
};

export type ProtocolRepoMigrationStatus = {
    status: string;
    current_org: string;
    future_org: string;
    migration_now: boolean;
    remotes_changed: boolean;
    package_repository_urls_changed: boolean;
};

export type ProtocolPackageReplacementStatus = {
    status: string;
    clean_replacement_versions_defined: boolean;
    package_actions_executed: boolean;
};

export type BoundedProtocolManifest = {
    protocol_name: string;
    protocol_full_name: string;
    protocol_version: string;
    protocol_release_tag: string | null;
    protocol_commit_sha: string;
    canonical_repository: string;
    future_repository_target: string;
    copyright_holder: string;
    license: string;
    forbidden_claims: readonly string[];
    non_certification_notice: string;
    validation_lab_boundary: ProtocolManifestBoundary;
    repo_migration_status: ProtocolRepoMigrationStatus;
    package_replacement_status: ProtocolPackageReplacementStatus;
};

const manifest = manifestJson;

// Bounded pointer helper only. This does not define Protocol truth or alter Lab adjudication.
export const protocolManifest = Object.freeze({
    protocol_name: manifest.protocol_name,
    protocol_full_name: manifest.protocol_full_name,
    protocol_version: manifest.protocol_version,
    protocol_release_tag: manifest.protocol_release_tag,
    protocol_commit_sha: manifest.protocol_commit_sha,
    canonical_repository: manifest.canonical_repository,
    future_repository_target: manifest.future_repository_target,
    copyright_holder: manifest.copyright_holder,
    license: manifest.license,
    forbidden_claims: Object.freeze([...manifest.forbidden_claims]),
    non_certification_notice: manifest.non_certification_notice,
    validation_lab_boundary: Object.freeze({ ...manifest.validation_lab_boundary }),
    repo_migration_status: Object.freeze({ ...manifest.repo_migration_status }),
    package_replacement_status: Object.freeze({ ...manifest.package_replacement_status }),
}) satisfies BoundedProtocolManifest;

export function getProtocolManifestPointer(): BoundedProtocolManifest {
    return protocolManifest;
}

