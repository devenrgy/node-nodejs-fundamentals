import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const verify = async () => {
	const checksumsPath = join(import.meta.dirname, "checksums.json");

	let checksumsData;
	try {
		checksumsData = await readFile(checksumsPath, "utf-8");
	} catch {
		throw new Error("FS operation failed");
	}

	const checksums = JSON.parse(checksumsData);

	for (const [filename, expectedHash] of Object.entries(checksums)) {
		const filePath = join(import.meta.dirname, filename);
		const hash = createHash("sha256");
		const stream = createReadStream(filePath);

		const actualHash = await new Promise((resolve, reject) => {
			stream.on("data", (chunk) => hash.update(chunk));
			stream.on("end", () => resolve(hash.digest("hex")));
			stream.on("error", reject);
		});

		const result = actualHash === expectedHash ? "OK" : "FAIL";
		console.log(`${filename} — ${result}`);
	}
};

await verify();
