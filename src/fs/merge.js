import { access, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { parseArgs } from "node:util";

const rootPath = join(import.meta.dirname, "workspace");
const partsPath = join(rootPath, "parts");
const outputPath = join(rootPath, "merged.txt");

const merge = async () => {
	const { values } = parseArgs({
		options: {
			files: {
				type: "string",
				default: "",
			},
		},
	});

	let fileNames;

	try {
		if (values.files) {
			fileNames = values.files.split(",");
			for (const name of fileNames) {
				try {
					await access(join(partsPath, name));
				} catch {
					throw new Error("FS operation failed");
				}
			}
		} else {
			const entries = await readdir(partsPath, { withFileTypes: true });
			fileNames = entries
				.filter((e) => e.isFile() && extname(e.name) === ".txt")
				.map((e) => e.name)
				.sort();

			if (fileNames.length === 0) {
				throw new Error("FS operation failed");
			}
		}

		const chunks = await Promise.all(
			fileNames.map((name) => readFile(join(partsPath, name), "utf-8")),
		);

		await writeFile(outputPath, chunks.join(""));
	} catch (err) {
		if (err.message === "FS operation failed") throw err;
		throw new Error("FS operation failed");
	}
};

await merge();
