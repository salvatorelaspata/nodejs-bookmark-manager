import typescript from "@rollup/plugin-typescript";

export default {
	input: ["src/index.ts", "src/formatter.ts", "src/utils.ts"],
	output: {
		dir: "distlocal",
		format: "es",
	},
	plugins: [typescript()],
};
