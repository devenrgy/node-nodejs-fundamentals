import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { parseArgs } from "node:util";

const rootPath = join(import.meta.dirname, "workspace");

const findByExt = async () => {
	const { values } = parseArgs({
		options: {
			ext: {
				type: "string",
				default: "txt",
			},
		},
	});

	const ext = values.ext.startsWith(".") ? values.ext : `.${values.ext}`;

	try {
		const entries = await readdir(rootPath, {
			recursive: true,
			withFileTypes: true,
		});

		const files = entries
			.filter((e) => e.isFile() && extname(e.name) === ext)
			.map((e) => join(e.parentPath, e.name).replace(`${rootPath}/`, ""))
			.sort((a, b) => a.localeCompare(b));

		console.log(files.join("\n"));
	} catch {
		throw new Error("FS operation failed");
	}
};

await findByExt();
