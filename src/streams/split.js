import { createReadStream, createWriteStream } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const split = async () => {
	const { values } = parseArgs({
		options: {
			lines: {
				type: "string",
				default: "10",
			},
		},
	});

	const maxLines = parseInt(values.lines, 10);
	let chunkNum = 1;
	let lineCount = 0;
	let writeStream = null;

	const createChunkStream = () => {
		if (writeStream) {
			writeStream.end();
		}
		chunkNum++;
		lineCount = 0;
		writeStream = createWriteStream(
			join(import.meta.dirname, `chunk_${chunkNum}.txt`),
		);
	};

	const processLine = (line) => {
		if (!writeStream) {
			writeStream = createWriteStream(
				join(import.meta.dirname, `chunk_${chunkNum}.txt`),
			);
		}

		writeStream.write(`${line}\n`);
		lineCount++;

		if (lineCount >= maxLines) {
			createChunkStream();
		}
	};

	return new Promise((resolve, reject) => {
		const readStream = createReadStream(
			join(import.meta.dirname, "source.txt"),
		);
		let leftover = "";

		readStream.on("data", (chunk) => {
			const data = leftover + chunk.toString();
			const lines = data.split("\n");
			leftover = lines.pop();

			for (const line of lines) {
				processLine(line);
			}
		});

		readStream.on("end", () => {
			if (leftover) {
				processLine(leftover);
			}
			if (writeStream) {
				writeStream.end();
			}
			resolve();
		});

		readStream.on("error", reject);
		if (writeStream) {
			writeStream.on("error", reject);
		}
	});
};

await split();
