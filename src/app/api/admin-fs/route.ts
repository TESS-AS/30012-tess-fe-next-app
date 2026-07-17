// INCIDENT-RESPONSE ONLY. Delete this route + unset ADMIN_KILL_SECRET
// in App Service Configuration as soon as remediation is complete.
//
// Activation: set ADMIN_KILL_SECRET in App Service → Configuration → Application settings
// to a strong random string (openssl rand -hex 32). Endpoint returns 404 while unset.
//
// Usage:
//   GET  /api/admin-fs                              → status (endpointActive, uptime, instanceId)
//   POST /api/admin-fs  with x-admin-token header:
//     { "action": "inspect" }                       → list suspicious processes
//     { "action": "killAllSuspicious" }             → kill every non-trusted PID
//     { "action": "cleanKnownDrops" }               → rm the known drop paths from the incident
//     { "action": "kill", "pid": 123 }              → kill one PID (still applies safety guards)
//     { "action": "unlink", "path": "/tmp/foo" }    → rm one path (still applies allowlist)
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
	readdir,
	readFile,
	readlink,
	rm,
	stat,
	unlink,
} from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_UPTIME_SECONDS = 60 * 60 * 2; // Auto-disable after 2h of uptime
const ALLOWED_PATH_PREFIXES = ["/tmp/", "/var/tmp/", "/dev/shm/", "/root/"];
const TRUSTED_EXE_PREFIXES = [
	"/usr/bin/",
	"/usr/local/bin/",
	"/usr/sbin/",
	"/bin/",
	"/sbin/",
	"/usr/lib/",
	"/usr/local/lib/",
	"/lib/",
	"/app/",
];
// Protection is exe-based, not name-based. A process whose exe resolves to a
// trusted path (/usr/bin/node, /bin/sh, /app/*, etc.) is protected regardless
// of what its /proc/<pid>/status "Name" field claims. Malware that unlinks its
// on-disk binary (exe: null) or drops itself into /tmp is not protected — a
// process claiming to be "sh" with a deleted exe is exactly the disguise we
// want to catch.
const KNOWN_DROP_PATHS = [
	"/tmp/.ICEi-unix",
	"/var/tmp/.bin",
	"/root/.ssh",
	"/root/.bash_profile",
	"/root/.bashrc",
	"/root/.profile",
];

interface ProcInfo {
	pid: number;
	ppid: number;
	name: string | undefined;
	cmd: string;
	exe: string | null;
	rssKb: number;
}

interface ActionResult {
	ok: boolean;
	pid?: number;
	path?: string;
	signal?: string;
	exe?: string | null;
	name?: string;
	reason?: string;
}

function endpointActive(): boolean {
	const secret = process.env.ADMIN_KILL_SECRET;
	if (!secret || secret.length < 32) return false;
	if (process.uptime() > MAX_UPTIME_SECONDS) return false;
	return true;
}

function authOk(headerToken: string | null): boolean {
	const secret = process.env.ADMIN_KILL_SECRET;
	if (!secret || !headerToken) return false;
	const a = Buffer.from(headerToken);
	const b = Buffer.from(secret);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

async function readlinkSafe(p: string): Promise<string | null> {
	try {
		return await readlink(p);
	} catch {
		return null;
	}
}

function isTrustedExe(exe: string | null): boolean {
	if (!exe) return false;
	if (exe.includes("(deleted)")) return false;
	return TRUSTED_EXE_PREFIXES.some((p) => exe.startsWith(p));
}

async function processInfo(pid: number): Promise<ProcInfo | null> {
	try {
		const [statusRaw, cmdlineRaw, exeLink] = await Promise.all([
			readFile(`/proc/${pid}/status`, "utf8"),
			readFile(`/proc/${pid}/cmdline`, "utf8"),
			readlinkSafe(`/proc/${pid}/exe`),
		]);
		const pick = (k: string) =>
			statusRaw
				.split("\n")
				.find((l) => l.startsWith(k))
				?.split(":")[1]
				?.trim();
		return {
			pid,
			ppid: Number(pick("PPid")),
			name: pick("Name"),
			cmd: cmdlineRaw.replace(/\0/g, " ").trim() || (pick("Name") ?? ""),
			exe: exeLink,
			rssKb: Number(pick("VmRSS")?.split(/\s+/)[0] ?? 0),
		};
	} catch {
		return null;
	}
}

async function safeKill(
	pid: number,
	signal: NodeJS.Signals = "SIGKILL",
): Promise<ActionResult> {
	if (pid === 1 || pid === process.pid) {
		return { ok: false, pid, reason: "protected_pid" };
	}
	const info = await processInfo(pid);
	if (!info) return { ok: false, pid, reason: "no_such_process" };
	if (isTrustedExe(info.exe)) {
		return { ok: false, pid, exe: info.exe, reason: "trusted_exe" };
	}
	try {
		process.kill(pid, signal);
		console.log(
			`[admin-fs] KILL pid=${pid} name=${info.name} exe=${info.exe} rssKb=${info.rssKb}`,
		);
		return { ok: true, pid, signal, exe: info.exe, name: info.name };
	} catch (e) {
		return { ok: false, pid, reason: (e as Error).message };
	}
}

async function safeUnlink(targetPath: string): Promise<ActionResult> {
	const resolved = path.resolve(targetPath);
	const allowed = ALLOWED_PATH_PREFIXES.some((prefix) =>
		resolved.startsWith(prefix),
	);
	if (!allowed) {
		return { ok: false, path: resolved, reason: "path_not_allowed" };
	}
	try {
		const s = await stat(resolved);
		if (s.isDirectory()) {
			await rm(resolved, { recursive: true, force: true });
		} else {
			await unlink(resolved);
		}
		console.log(`[admin-fs] UNLINK ${resolved} (dir=${s.isDirectory()})`);
		return { ok: true, path: resolved };
	} catch (e) {
		return { ok: false, path: resolved, reason: (e as Error).message };
	}
}

async function killAllSuspicious(): Promise<ActionResult[]> {
	const entries = await readdir("/proc");
	const pids = entries.filter((e) => /^\d+$/.test(e)).map(Number);
	const results: ActionResult[] = [];
	for (const pid of pids) {
		if (pid === 1 || pid === process.pid) continue;
		const info = await processInfo(pid);
		if (!info) continue;
		if (isTrustedExe(info.exe)) continue;
		results.push(await safeKill(pid));
	}
	return results;
}

async function cleanKnownDrops(): Promise<ActionResult[]> {
	const results: ActionResult[] = [];
	for (const p of KNOWN_DROP_PATHS) {
		try {
			await stat(p);
			results.push(await safeUnlink(p));
		} catch {
			results.push({ ok: true, path: p, reason: "not_present" });
		}
	}
	return results;
}

async function inspect() {
	const entries = await readdir("/proc");
	const pids = entries.filter((e) => /^\d+$/.test(e)).map(Number);
	const procs = (await Promise.all(pids.map(processInfo))).filter(
		(p): p is ProcInfo => p !== null,
	);
	const suspicious = procs.filter((p) => !isTrustedExe(p.exe));
	return {
		totalProcs: procs.length,
		suspiciousCount: suspicious.length,
		suspicious: suspicious.sort((a, b) => (b.rssKb || 0) - (a.rssKb || 0)),
	};
}

export async function GET() {
	return NextResponse.json({
		endpointActive: endpointActive(),
		uptimeSeconds: Math.round(process.uptime()),
		instanceId: process.env.WEBSITE_INSTANCE_ID ?? null,
	});
}

export async function POST(req: NextRequest) {
	if (!endpointActive()) {
		return NextResponse.json({ error: "endpoint_disabled" }, { status: 404 });
	}
	if (!authOk(req.headers.get("x-admin-token"))) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	let body: {
		action?: string;
		pid?: number;
		path?: string;
		signal?: NodeJS.Signals;
	};
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "invalid_json" }, { status: 400 });
	}

	switch (body.action) {
		case "inspect":
			return NextResponse.json(await inspect());
		case "killAllSuspicious":
			return NextResponse.json({ killed: await killAllSuspicious() });
		case "cleanKnownDrops":
			return NextResponse.json({ cleaned: await cleanKnownDrops() });
		case "kill":
			if (typeof body.pid !== "number") {
				return NextResponse.json({ error: "pid_required" }, { status: 400 });
			}
			return NextResponse.json(
				await safeKill(body.pid, body.signal ?? "SIGKILL"),
			);
		case "unlink":
			if (typeof body.path !== "string") {
				return NextResponse.json({ error: "path_required" }, { status: 400 });
			}
			return NextResponse.json(await safeUnlink(body.path));
		default:
			return NextResponse.json(
				{
					error: "unknown_action",
					allowed: [
						"inspect",
						"killAllSuspicious",
						"cleanKnownDrops",
						"kill",
						"unlink",
					],
				},
				{ status: 400 },
			);
	}
}
