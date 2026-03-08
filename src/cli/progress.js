import { parseArgs } from "node:util";

const parseHexColor = (hexColor) => {
	if (!hexColor) return null;

	const hexMatch = hexColor.match(
		/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/,
	);

	if (!hexMatch) return null;

	return [
		parseInt(hexMatch[1], 16),
		parseInt(hexMatch[2], 16),
		parseInt(hexMatch[3], 16),
	];
};

const progress = () => {
	const { values: cliOptions } = parseArgs({
		options: {
			duration: { type: "string", default: "5000" },
			interval: { type: "string", default: "100" },
			length: { type: "string", default: "30" },
			color: { type: "string" },
		},
	});

	const totalDuration = parseInt(cliOptions.duration);
	const updateInterval = parseInt(cliOptions.interval);
	const barLength = parseInt(cliOptions.length);
	const rgbColor = parseHexColor(cliOptions.color);

	const totalSteps = Math.ceil(totalDuration / updateInterval);
	let currentStep = 0;

	const timer = setInterval(() => {
		currentStep++;

		const percentage = Math.min(
			Math.round((currentStep / totalSteps) * 100),
			100,
		);
		const filledChars = Math.round((percentage / 100) * barLength);
		const emptyChars = barLength - filledChars;

		const filledBlock = "█".repeat(filledChars);
		const emptyBlock = " ".repeat(emptyChars);

		const coloredFilledBlock = rgbColor
			? `\x1b[38;2;${rgbColor[0]};${rgbColor[1]};${rgbColor[2]}m${filledBlock}\x1b[0m`
			: filledBlock;

		process.stdout.write(
			`\r[${coloredFilledBlock}${emptyBlock}] ${percentage}%`,
		);

		if (percentage >= 100) {
			clearInterval(timer);
			process.stdout.write("\nDone!\n");
		}
	}, updateInterval);
};

progress();
