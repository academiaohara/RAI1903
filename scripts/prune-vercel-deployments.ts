/**
 * Prune old Vercel preview deployments to free Deployment Storage.
 *
 * Requires:
 *   VERCEL_TOKEN — https://vercel.com/account/settings/tokens
 *   VERCEL_PROJECT — project name (default: rai1903web)
 * Optional:
 *   VERCEL_TEAM_ID — team id for team-scoped projects (e.g. rai1903fan)
 *
 * Usage:
 *   npx tsx scripts/prune-vercel-deployments.ts --dry-run
 *   npx tsx scripts/prune-vercel-deployments.ts --days 14
 *   npx tsx scripts/prune-vercel-deployments.ts --yes
 */

const API_BASE = "https://api.vercel.com";

type DeploymentTarget = "production" | "staging" | null;

interface Deployment {
  uid: string;
  url: string | null;
  name: string;
  created: number;
  target: DeploymentTarget;
  state: string;
  readyState?: string;
  alias?: string[];
  aliasAssigned?: number | boolean | null;
}

interface ListDeploymentsResponse {
  deployments: Deployment[];
  pagination?: { count: number; next: number | null; prev: number | null };
}

function parseArgs(argv: string[]) {
  let dryRun = false;
  let yes = false;
  let days = 14;
  let limit = 100;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--yes" || arg === "-y") yes = true;
    else if (arg === "--days") {
      days = Number(argv[++i]);
      if (!Number.isFinite(days) || days < 0) throw new Error("--days must be a non-negative number");
    } else if (arg === "--limit") {
      limit = Number(argv[++i]);
      if (!Number.isFinite(limit) || limit < 1) throw new Error("--limit must be >= 1");
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npx tsx scripts/prune-vercel-deployments.ts [options]

Options:
  --days <n>     Delete preview deployments older than n days (default: 14)
  --limit <n>    Page size when listing deployments (default: 100)
  --dry-run      List candidates without deleting
  --yes, -y      Skip confirmation prompt
`);
      process.exit(0);
    }
  }

  return { dryRun, yes, days, limit };
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. Create a token at https://vercel.com/account/settings/tokens`);
  return value;
}

function teamQuery(): string {
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  return teamId ? `&teamId=${encodeURIComponent(teamId)}` : "";
}

async function vercelFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = requireEnv("VERCEL_TOKEN");
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel API ${response.status} ${path}: ${body}`);
  }

  return (await response.json()) as T;
}

function deploymentCreatedAt(deployment: Deployment): number {
  return Number(deployment.created);
}

async function listDeployments(project: string, limit: number): Promise<Deployment[]> {
  const all: Deployment[] = [];
  let until: number | undefined;

  for (;;) {
    const untilParam = until ? `&until=${until}` : "";
    const data = await vercelFetch<ListDeploymentsResponse>(
      `/v7/deployments?projectId=${encodeURIComponent(project)}&limit=${limit}${untilParam}${teamQuery()}`,
    );

    if (!data.deployments.length) break;
    all.push(...data.deployments);

    const next = data.pagination?.next;
    if (!next) break;
    until = Number(next);
  }

  return all;
}

function hasActiveAlias(deployment: Deployment): boolean {
  if (deployment.alias && deployment.alias.length > 0) return true;
  if (deployment.aliasAssigned) return true;
  return false;
}

function isProtected(deployment: Deployment): boolean {
  if (deployment.target === "production") return true;
  if (hasActiveAlias(deployment)) return true;
  return false;
}

async function deleteDeployment(id: string): Promise<void> {
  await vercelFetch(`/v13/deployments/${id}${teamQuery().replace("&", "?")}`, { method: "DELETE" });
}

async function main() {
  const { dryRun, yes, days, limit } = parseArgs(process.argv.slice(2));
  const project = process.env.VERCEL_PROJECT?.trim() || "rai1903web";
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

  console.log(`Project: ${project}`);
  console.log(`Retention: delete preview deployments older than ${days} days`);
  if (process.env.VERCEL_TEAM_ID) console.log(`Team: ${process.env.VERCEL_TEAM_ID}`);
  if (dryRun) console.log("Mode: dry-run (no deletions)");

  const deployments = await listDeployments(project, limit);
  console.log(`Fetched ${deployments.length} deployments`);

  const candidates = deployments
    .filter((deployment) => !isProtected(deployment))
    .filter((deployment) => deploymentCreatedAt(deployment) < cutoffMs)
    .filter((deployment) => deployment.state !== "DELETED")
    .sort((a, b) => deploymentCreatedAt(a) - deploymentCreatedAt(b));

  if (!candidates.length) {
    console.log("No preview deployments to prune.");
    return;
  }

  console.log(`\nCandidates (${candidates.length}):`);
  for (const deployment of candidates) {
    const created = new Date(deploymentCreatedAt(deployment)).toISOString().slice(0, 10);
    const label = deployment.url ?? deployment.uid;
    console.log(`  ${created}  ${deployment.state.padEnd(10)}  ${label}`);
  }

  if (dryRun) {
    console.log("\nDry-run complete. Re-run without --dry-run to delete.");
    return;
  }

  if (!yes) {
    console.log("\nPass --yes to delete these deployments.");
    process.exit(1);
  }

  let deleted = 0;
  let failed = 0;

  for (const deployment of candidates) {
    try {
      await deleteDeployment(deployment.uid);
      deleted += 1;
      console.log(`Deleted ${deployment.url ?? deployment.uid}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed ${deployment.uid}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\nDone. Deleted ${deleted}, failed ${failed}.`);
  console.log("Storage usage updates in Vercel → Usage after the cleanup job runs (can take hours).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
