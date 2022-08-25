import { existsSync, readFile, writeFile, readdirSync } from "fs";
import { homedir, platform } from "os";
import { join } from "path";

// const _getPlatform: Platform = platform.call();
const _getPlatform = platform.call();

// export const getProfile:{rootChromeRootPath: String, readRootBookmarkFolder: string[]} = () => {
export const getProfile = () => {
	// 1. necessario discriminare l'implementazione per sistemi osx, windows e linux
	console.log(`This platform is ${_getPlatform}`);
	// homedir() --> "/Users/<user>/" || "C:\Users\<user>"
	// 2.1 macos  - /Users/<user>/Library/Application Support/Google/Chrome/*
	// 2.2 win    - C:\Users\<user>\AppData\Local\Google\Chrome\User Data\*
	let dir = "";
	switch (_getPlatform) {
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
	return { rootChromeRootPath, readRootBookmarkFolder };
};

// export const readAsync: Promise<{data: Buffer, path: string}> = (filePath: string) => {
export const readAsync = (filePath) => {
	if (existsSync(filePath)) {
		return new Promise((res, rej) => {
			readFile(filePath, (err, data) => {
				console.log("readFile", filePath);
				if (err) throw Error("OS not working!");
				res({ data, path: filePath });
			});
		});
	} else {
		return new Promise.resolve({ data: null, path: filePath });
	}
};

// export const writeAsync: Promise<void> = (filePath: string, file: string) => {
export const writeAsync = (filePath, file) => {
	return new Promise((res, rej) => {
		// override file if exists
		writeFile(filePath, file, (err) => {
			console.log("writeFile", filePath);
			if (err) throw Error("OS not working!");
			res("success");
		});
	});
};
