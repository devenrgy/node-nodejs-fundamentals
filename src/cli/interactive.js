import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";

const interactive = async () => {
	const rl = readline.createInterface({ input, output, prompt: "> " });

	const goodbye = () => {
		console.log("Goodbye!");
		process.exit(0);
	};

	rl.on("close", goodbye);

	while (true) {
		rl.prompt();
		const answer = await new Promise((resolve) => rl.once("line", resolve));

		switch (answer) {
			case "uptime":
				console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
				break;
			case "cwd":
				console.log(process.cwd());
				break;
			case "date":
				console.log(new Date().toISOString());
				break;
			case "exit":
				rl.off("close", goodbye);
				console.log("Goodbye!");
				process.exit(0);
			default:
				console.log("Unknown command");
		}
	}
};

await interactive();
