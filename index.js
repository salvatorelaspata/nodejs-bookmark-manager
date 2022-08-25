import { writeFile, readdirSync, readFile, existsSync } from "fs";
import { homedir, platform } from "os";
import { join } from "path";
import { composeFormattedObj, formatMD } from "./src/formatter.js";

// 1. necessario discriminare l'implementazione per sistemi osx, windows e linux
const p = platform.call();
console.log(`This platform is ${p}`);
// homedir() --> "/Users/<user>/" || "C:\Users\<user>"
// 2.1 macos  - /Users/<user>/Library/Application Support/Google/Chrome/*
// 2.2 win    - C:\Users\<user>\AppData\Local\Google\Chrome\User Data\*
let dir = "";
switch (p) {
	case "darwin":
		dir = "/Library/Application Support/Google/Chrome/";
		break;
	case "win32":
		dir = "/AppData/Local/Google/Chrome/User Data/";
		break;
	default:
		break;
}

const rootChromeRootPath = join(homedir(), dir);
const readRootBookmarkFolder = readdirSync(rootChromeRootPath);
const profile = readRootBookmarkFolder.filter(
	(b) => b.startsWith("Profile") || b.startsWith("Default")
);

const _readAsync = (filePath) => {
	if (existsSync(filePath)) {
		return new Promise((res, rej) => {
			readFile(filePath, (err, data) => {
				console.log("readFile", filePath);
				if (err) return rej(err);
				res({ data, path: filePath });
			});
		});
	} else {
		return new Promise.resolve({ data: null, path: filePath });
	}
};

const aPromise = [];
profile.map((p) => {
	const path = join(rootChromeRootPath, p, "Bookmarks");
	console.log("path", path);
	aPromise.push(_readAsync(path));
});

Promise.all(aPromise)
	.then((values) => {
		const obj = {},
			objSimple = {};
		const objMerged = [],
			objSimpleMerged = [];
		let mdFile = "",
			mdFileSimple = "";
		values.map((v) => {
			obj[v.path] = composeFormattedObj(JSON.parse(v.data));
			objMerged.push(...composeFormattedObj(JSON.parse(v.data)));
			objSimple[v.path] = composeFormattedObj(JSON.parse(v.data), true);
			objSimpleMerged.push(...composeFormattedObj(JSON.parse(v.data), true));
			mdFile += formatMD(JSON.parse(v.data));
			mdFileSimple += formatMD(JSON.parse(v.data), true);
		});
		const outputJson = JSON.stringify(obj, null, 2);
		writeFile("outputFile.json", outputJson, (err) => {
			if (err) throw err;
			console.log("File written.");
		});
		const outputSimpleJson = JSON.stringify(objSimple, null, 2);
		writeFile("outputSimpleFile.json", outputSimpleJson, (err) => {
			if (err) throw err;
			console.log("File written.");
		});
		const outputMergedJson = JSON.stringify({ bookmarks: objMerged }, null, 2);
		writeFile("outputMergedFile.json", outputMergedJson, (err) => {
			if (err) throw err;
			console.log("File written.");
		});
		const outputsSimpleMergedJson = JSON.stringify(
			{ bookmarks: objSimpleMerged },
			null,
			2
		);
		writeFile("outputSimpleMergedFile.json", outputsSimpleMergedJson, (err) => {
			if (err) throw err;
			console.log("File written.");
		});

		writeFile("output.md", mdFile, (err) => {
			if (err) throw err;
			console.log("File written.");
		});
		writeFile("outputSimple.md", mdFileSimple, (err) => {
			if (err) throw err;
			console.log("File written.");
		});
	})
	.catch((err) => {
		console.log(err);
	});
