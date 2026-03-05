import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const rootPath = join(import.meta.dirname, "workspace");
const outputPath = join(import.meta.dirname, "snapshot.json");

const snapshot = async () => {
	try {
		(await stat(rootPath)).isDirectory();
	} catch {
		throw new Error("FS operation failed");
	}

	const entries = [];
	const items = await readdir(rootPath, { recursive: true });

	for (const relPath of items) {
		const fullPath = join(rootPath, relPath);
		const stats = await stat(fullPath);

		if (stats.isDirectory()) {
			entries.push({
				path: relPath,
				type: "directory",
			});
		} else if (stats.isFile()) {
			const content = await readFile(fullPath, "base64");

			entries.push({
				path: relPath,
				type: "file",
				size: stats.size,
				content,
			});
		}
	}

	const snapshot = { rootPath, entries };

	await writeFile(outputPath, JSON.stringify(snapshot, null, 2));
};

await snapshot();
