import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const rootPath = join(import.meta.dirname, "workspace");
const outputPath = join(import.meta.dirname, "snapshot.json");

const snapshot = async () => {
	try {
		await stat(rootPath);
	} catch {
		throw new Error("FS operation failed");
	}

	const entries = [];
	const items = await readdir(rootPath, {
		recursive: true,
		withFileTypes: true,
	});

	for (const entry of items) {
		const relPath = entry.parentPath
			? join(entry.parentPath.replace(rootPath + "/", ""), entry.name)
			: entry.name;

		if (entry.isDirectory()) {
			entries.push({
				path: relPath,
				type: "directory",
			});
		} else if (entry.isFile()) {
			const content = await readFile(join(rootPath, relPath), "base64");

			entries.push({
				path: relPath,
				type: "file",
				size: entry.size,
				content,
			});
		}
	}

	const snapshotData = { rootPath, entries };

	await writeFile(outputPath, JSON.stringify(snapshotData, null, 2));
};

await snapshot();
