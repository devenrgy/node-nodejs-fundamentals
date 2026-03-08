import { spawn } from "node:child_process";

const execCommand = () => {
	const command = process.argv[2];

	const child = spawn(command, {
		shell: true,
		env: process.env,
		stdio: ["inherit", "inherit", "inherit"],
	});

	child.on("close", (code) => {
		process.exit(code);
	});
};

execCommand();
