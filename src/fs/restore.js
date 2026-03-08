import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const snapshotPath = join(import.meta.dirname, "snapshot.json");
const outputPath = join(import.meta.dirname, "workspace_restored");

const restore = async () => {
	let snapshotData;

	try {
		snapshotData = JSON.parse(await readFile(snapshotPath, "utf-8"));
	} catch {
		throw new Error("FS operation failed");
	}

	const { entries } = snapshotData;

	try {
		await stat(outputPath);
		throw new Error("FS operation failed");
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
		await mkdir(outputPath, { recursive: true });
	}

	for (const entry of entries) {
		const fullPath = join(outputPath, entry.path);

		switch (entry.type) {
			case "directory":
				await mkdir(fullPath, { recursive: true });
				break;
			case "file": {
				await mkdir(dirname(fullPath), { recursive: true });
				const buffer = Buffer.from(entry.content, "base64");
				await writeFile(fullPath, buffer);
				break;
			}
			default:
				throw new Error("FS operation failed");
		}
	}
};

await restore();
