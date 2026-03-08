import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";

const rootPath = join(import.meta.dirname, "workspace");
const toCompressPath = join(rootPath, "toCompress");
const compressedPath = join(rootPath, "compressed");
const archivePath = join(compressedPath, "archive.br");

const compressDir = async () => {
	try {
		await stat(toCompressPath);
	} catch {
		throw new Error("FS operation failed");
	}

	await mkdir(compressedPath, { recursive: true });

	const collectFiles = async (dirPath, basePath = "") => {
		const entries = await readdir(dirPath, { withFileTypes: true });
		const files = [];

		for (const entry of entries) {
			const fullPath = join(dirPath, entry.name);
			const relativePath = basePath ? join(basePath, entry.name) : entry.name;

			if (entry.isDirectory()) {
				const subFiles = await collectFiles(fullPath, relativePath);
				files.push(...subFiles);
			} else if (entry.isFile()) {
				files.push({ fullPath, relativePath });
			}
		}

		return files;
	};

	const files = await collectFiles(toCompressPath);

	const writeStream = createWriteStream(archivePath);
	const brotliStream = zlib.createBrotliCompress();

	const contentStream = new Readable({
		read() {},
	});

	const run = async () => {
		for (const file of files) {
			contentStream.push(`${file.relativePath}\0`);
			const readStream = createReadStream(file.fullPath);
			for await (const chunk of readStream) {
				contentStream.push(chunk);
			}
			contentStream.push("\0");
		}
		contentStream.push(null);
	};

	run();

	await pipeline(contentStream, brotliStream, writeStream);
};

await compressDir();
