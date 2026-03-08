import { join } from "node:path";

const pluginsDirPath = join(import.meta.dirname, "plugins");

const dynamic = async () => {
	const pluginName = process.argv[2];

	if (!pluginName) {
		console.error("Please provide a plugin name as a command line argument.");
		process.exit(1);
	}

	try {
		const plugin = await import(join(pluginsDirPath, `${pluginName}.js`));

		if (plugin && typeof plugin.run === "function") {
			console.log(plugin.run());
		} else {
			console.error(`Plugin "${pluginName}" does not export a run() function.`);
			process.exit(1);
		}
	} catch (error) {
		if (error.code === "ERR_MODULE_NOT_FOUND" || error.code === "ENOENT") {
			console.log("Plugin not found");
			process.exit(1);
		}
		throw error;
	}
};

await dynamic();
