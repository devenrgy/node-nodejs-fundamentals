import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";

const rootPath = join(import.meta.dirname, "workspace");
const compressedPath = join(rootPath, "compressed");
const decompressedPath = join(rootPath, "decompressed");
const archivePath = join(compressedPath, "archive.br");

const decompressDir = async () => {
	try {
		await stat(compressedPath);
		await stat(archivePath);
	} catch {
		throw new Error("FS operation failed");
	}

	await mkdir(decompressedPath, { recursive: true });

	const readStream = createReadStream(archivePath);
	const brotliStream = zlib.createBrotliDecompress();

	const files = [];
	let buffer = Buffer.alloc(0);
	let currentPath = null;

	const parseStream = new Writable({
		write(chunk, _, callback) {
			buffer = Buffer.concat([buffer, chunk]);

			let nullIndex = buffer.indexOf(0);
			while (nullIndex !== -1) {
				const segment = buffer.subarray(0, nullIndex);
				buffer = buffer.subarray(nullIndex + 1);

				if (currentPath === null) {
					currentPath = segment.toString("utf-8");
				} else {
					files.push({ path: currentPath, content: segment });
					currentPath = null;
				}

				nullIndex = buffer.indexOf(0);
			}

			callback();
		},

		final(callback) {
			if (currentPath !== null && buffer.length > 0) {
				files.push({ path: currentPath, content: buffer });
			}
			callback();
		},
	});

	await pipeline(readStream, brotliStream, parseStream);

	for (const file of files) {
		const filePath = join(decompressedPath, file.path);
		const fileDir = dirname(filePath);

		await mkdir(fileDir, { recursive: true });
		await writeFile(filePath, file.content);
	}
};

await decompressDir();
