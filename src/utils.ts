import { existsSync, readFile, writeFile, readdirSync } from "fs";
import { homedir, platform } from "os";
import { join } from "path";
import { composeFormattedObj, formatMD } from "./formatter";

// const _getPlatform: Platform = platform.call();
const _getPlatform = platform;

export const getProfile: () => ProfileProp = () => {
	// 1. necessario discriminare l'implementazione per sistemi osx, windows e linux
	// console.log(`This platform is ${_getPlatform}`);
	// homedir() --> "/Users/<user>/" || "C:\Users\<user>"
	// 2.1 macos  - /Users/<user>/Library/Application Support/Google/Chrome/*
	// 2.2 win    - C:\Users\<user>\AppData\Local\Google\Chrome\User Data\*
	let dir = "";
	switch (_getPlatform()) {
		case "darwin":
			dir = "/Library/Application Support/Google/Chrome/";
			break;
		case "win32":
			dir = "/AppData/Local/Google/Chrome/User Data/";
			break;
		default:
			throw Error("OS not working!");
	}

	const rootChromeRootPath = join(homedir(), dir);
	const readRootBookmarkFolder = readdirSync(rootChromeRootPath);
	const profiles = readRootBookmarkFolder.filter(
		(b) => b.startsWith("Profile") || b.startsWith("Default")
	);
	return { profiles, rootChromeRootPath } as ProfileProp;
};

export const readAsync: (filePath: string) => Promise<ReadAsyncProp> = (
	filePath
) => {
	if (existsSync(filePath)) {
		return new Promise<ReadAsyncProp>((res, rej) => {
			readFile(filePath, (err, data) => {
				console.log("readFile", filePath);
				if (err) throw Error("OS not working!");
				res({
					data,
					path: filePath.split("/")[filePath.split("/").length - 1],
				});
			});
		});
	} else {
		return Promise<ReadAsyncProp>.resolve({
			data: null,
			path: filePath.split("/")[filePath.split("/").length - 1],
		});
	}
};

export const writeAsync: (filePath: string, file: string) => Promise<void> = (
	filePath,
	file
) => {
	return new Promise((res, rej) => {
		// override file if exists
		writeFile(filePath, file, (err) => {
			console.log("writeFile", filePath);
			if (err) throw Error("OS not working!");
			res();
		});
	});
};

export const createModelData = (type: ExportType, values: ReadAsyncProp[]) => {
	let ret: any = {};
	values.map((v) => {
		const data = v.data as unknown as string;
		if (v && data) {
			switch (type) {
				case "json":
					ret[v.path] = composeFormattedObj(JSON.parse(data));
					break;
				case "jsonSimple":
					ret[v.path] = composeFormattedObj(JSON.parse(data), true);
					break;
				case "md":
					if (typeof ret === "object") ret = "";
					ret += formatMD(JSON.parse(data));
					break;
				case "mdSimple":
					if (typeof ret === "object") ret = "";
					ret += formatMD(JSON.parse(data), true);
					break;
				default:
					break;
			}

			// objMerged.bookmarks.push(...composeFormattedObj(JSON.parse(data)));
			// objSimpleMerged.bookmarks.push(
			// 	...composeFormattedObj(JSON.parse(data), true)
			// );
		}
	});
	return ret;
};
