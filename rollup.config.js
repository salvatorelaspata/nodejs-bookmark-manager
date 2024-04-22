import typescript from "@rollup/plugin-typescript";

export default {
	input: "src/cli.ts",
	output: {
		dir: "dist",
		format: "es",
	},
	plugins: [typescript()],
	external: ["figlet", "inquirer", "os", "fs", "os"],
};
