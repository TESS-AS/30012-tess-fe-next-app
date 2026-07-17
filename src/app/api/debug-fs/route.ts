// Temporary diagnostic route — remove once the /images/* + /icons/* 400 issue is root-caused.
// Hit https://tessix.no/api/debug-fs immediately after a restart, and again when images 400.
// The FD count and openBanner.code are the smoking guns.
import { NextResponse } from "next/server";
import { open, readdir, readFile, stat } from "node:fs/promises";
import os from "node:os";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
	const cwd = process.cwd();
	const imagesPath = `${cwd}/public/images`;
	const bannerPath = `${imagesPath}/banner.png`;
	const result: Record<string, unknown> = {
		cwd,
		nodeVersion: process.version,
		pid: process.pid,
		hostname: os.hostname(),
		instanceId: process.env.WEBSITE_INSTANCE_ID ?? null,
		siteName: process.env.WEBSITE_SITE_NAME ?? null,
		uptimeSeconds: Math.round(process.uptime()),
		memory: process.memoryUsage(),
		system: { freeMem: os.freemem(), totalMem: os.totalmem() },
	};

	try {
		const meminfo = await readFile("/proc/meminfo", "utf8");
		const pick = (key: string) =>
			meminfo.split("\n").find((l) => l.startsWith(key))?.trim();
		result.meminfo = {
			memFree: pick("MemFree:"),
			memAvailable: pick("MemAvailable:"),
			swapTotal: pick("SwapTotal:"),
			swapFree: pick("SwapFree:"),
		};
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.meminfo = { error: err.code ?? err.message };
	}

	try {
		const files = await readdir(imagesPath);
		result.imagesReaddir = {
			ok: true,
			count: files.length,
			sample: files.slice(0, 5),
		};
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.imagesReaddir = { ok: false, code: err.code, message: err.message };
	}

	try {
		const s = await stat(bannerPath);
		result.bannerStat = { ok: true, size: s.size, mode: s.mode.toString(8) };
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.bannerStat = { ok: false, code: err.code, message: err.message };
	}

	try {
		const fh = await open(bannerPath, "r");
		const buf = Buffer.alloc(8);
		await fh.read(buf, 0, 8, 0);
		await fh.close();
		result.bannerOpen = { ok: true, firstBytesHex: buf.toString("hex") };
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.bannerOpen = { ok: false, code: err.code, message: err.message };
	}

	try {
		const fds = await readdir(`/proc/${process.pid}/fd`);
		result.openFdCount = fds.length;
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.openFdCount = { error: err.code ?? err.message };
	}

	try {
		const limits = await readFile(`/proc/${process.pid}/limits`, "utf8");
		const openFilesLine = limits
			.split("\n")
			.find((l) => l.includes("Max open files"));
		result.maxOpenFiles = openFilesLine?.trim();
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.maxOpenFiles = { error: err.code ?? err.message };
	}

	// Container-scoped memory (cgroup v2, falling back to v1). Unlike os.freemem()
	// which reflects the host kernel, these are isolated to this container.
	const readNum = async (path: string) => {
		const raw = (await readFile(path, "utf8")).trim();
		return raw === "max" ? "max" : Number(raw);
	};
	try {
		result.cgroup = {
			v: "v2",
			currentBytes: await readNum("/sys/fs/cgroup/memory.current"),
			maxBytes: await readNum("/sys/fs/cgroup/memory.max"),
			swapCurrentBytes: await readNum("/sys/fs/cgroup/memory.swap.current").catch(
				() => null,
			),
		};
	} catch {
		try {
			result.cgroup = {
				v: "v1",
				usageBytes: await readNum(
					"/sys/fs/cgroup/memory/memory.usage_in_bytes",
				),
				limitBytes: await readNum(
					"/sys/fs/cgroup/memory/memory.limit_in_bytes",
				),
			};
		} catch (e) {
			const err = e as NodeJS.ErrnoException;
			result.cgroup = { error: err.code ?? err.message };
		}
	}

	// Process listing inside the container — catches child workers (sharp, etc.)
	// that would consume memory outside this Node process's own heap.
	try {
		const entries = await readdir("/proc");
		const pids = entries.filter((e) => /^\d+$/.test(e));
		const procs = await Promise.all(
			pids.map(async (pid) => {
				try {
					const [statusRaw, cmdlineRaw] = await Promise.all([
						readFile(`/proc/${pid}/status`, "utf8"),
						readFile(`/proc/${pid}/cmdline`, "utf8"),
					]);
					const pick = (k: string) =>
						statusRaw
							.split("\n")
							.find((l) => l.startsWith(k))
							?.split(":")[1]
							?.trim();
					return {
						pid: Number(pid),
						ppid: Number(pick("PPid")),
						name: pick("Name"),
						cmd: cmdlineRaw.replace(/\0/g, " ").trim() || pick("Name"),
						rssKb: Number(pick("VmRSS")?.split(/\s+/)[0] ?? 0),
					};
				} catch {
					return null;
				}
			}),
		);
		const active = procs.filter((p): p is NonNullable<typeof p> => p !== null);
		result.processes = {
			count: active.length,
			totalRssKb: active.reduce((s, p) => s + (p.rssKb || 0), 0),
			list: active.sort((a, b) => (b.rssKb || 0) - (a.rssKb || 0)),
		};
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.processes = { error: err.code ?? err.message };
	}

	return NextResponse.json(result, { status: 200 });
}
