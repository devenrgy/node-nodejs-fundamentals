import { readFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { join } from "node:path";
import { Worker } from "node:worker_threads";

const dataPath = join(import.meta.dirname, "data.json");

const mergeKSortedArrays = (arrays) => {
	if (arrays.length === 0) return [];
	if (arrays.length === 1) return arrays[0];

	const pointers = new Array(arrays.length).fill(0);
	const result = [];

	while (true) {
		let minVal = Infinity;
		let minIdx = -1;

		for (let i = 0; i < arrays.length; i++) {
			if (pointers[i] < arrays[i].length) {
				const val = arrays[i][pointers[i]];
				if (val < minVal) {
					minVal = val;
					minIdx = i;
				}
			}
		}

		if (minIdx === -1) break;

		result.push(minVal);
		pointers[minIdx]++;
	}

	return result;
};

const main = async () => {
	const data = JSON.parse(await readFile(dataPath, "utf-8"));
	const numCores = availableParallelism();
	const chunkSize = Math.ceil(data.length / numCores);

	const chunks = [];
	for (let i = 0; i < numCores; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, data.length);
		if (start < data.length) {
			chunks.push(data.slice(start, end));
		}
	}

	const workers = [];
	const results = new Array(chunks.length);

	for (let i = 0; i < chunks.length; i++) {
		const worker = new Worker(join(import.meta.dirname, "worker.js"));
		workers.push({ worker, index: i });

		worker.on("message", (sortedChunk) => {
			results[i] = sortedChunk;
		});

		worker.postMessage(chunks[i]);
	}

	await Promise.all(
		workers.map(
			({ worker }) => new Promise((resolve) => worker.on("exit", resolve)),
		),
	);

	const sortedArray = mergeKSortedArrays(results);
	console.log(sortedArray);
};

await main();
