// Temporary diagnostic route — remove once the /images/* + /icons/* 400 issue is root-caused.
// Hit https://tessix.no/api/debug-fs immediately after a restart, and again when images 400.
// The FD count and openBanner.code are the smoking guns.
import { NextResponse } from "next/server";
import { open, readdir, stat } from "node:fs/promises";

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
		uptimeSeconds: Math.round(process.uptime()),
		memory: process.memoryUsage(),
	};

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
		const { readFile } = await import("node:fs/promises");
		const limits = await readFile(`/proc/${process.pid}/limits`, "utf8");
		const openFilesLine = limits
			.split("\n")
			.find((l) => l.includes("Max open files"));
		result.maxOpenFiles = openFilesLine?.trim();
	} catch (e) {
		const err = e as NodeJS.ErrnoException;
		result.maxOpenFiles = { error: err.code ?? err.message };
	}

	return NextResponse.json(result, { status: 200 });
}
