import { Transform } from "node:stream";
import { parseArgs } from "node:util";

const filter = () => {
	const {
		values: { pattern },
	} = parseArgs({
		options: {
			pattern: {
				type: "string",
			},
		},
	});

	if (!pattern) {
		process.stderr.write("Error: --pattern <string> argument required\n");
		process.exit(1);
	}

	let buffer = "";

	const transform = new Transform({
		transform(chunk, _, callback) {
			buffer += chunk.toString();
			const lines = buffer.split("\n");
			buffer = lines.pop();

			for (const line of lines) {
				if (line.includes(pattern)) {
					this.push(`${line}\n`);
				}
			}

			callback();
		},
		flush(callback) {
			if (buffer?.includes(pattern)) {
				this.push(`${buffer}\n`);
			}
			callback();
		},
	});

	process.stdin.pipe(transform).pipe(process.stdout);
};

filter();
