import { writeFile, readdirSync, readFile, existsSync } from "fs";
import { homedir, platform } from "os";
import { join } from "path";

// 1. necessario discriminare l'implementazione per sistemi osx, windows e linux
const p = platform.call();
console.log(`This platform is ${p}`);
let dir = "";
switch (p) {
	case "darwin":
		dir = "/Library/Application Support/Google/Chrome/";
		break;
	case "win32":
		console.log("bbbbb");
		dir = "/AppData/Local/Google/Chrome/User Data/";
		break;
	default:
		break;
}
// homedir() --> "/Users/<user>/" || "C:\Users\<user>"
// 2.1 macos  - /Users/<user>/Library/Application Support/Google/Chrome/*
//              per determinare quanti utenti sono presenti
// 2.2 win    - C:\Users\<user>\AppData\Local\Google\Chrome\User Data\*
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

// const _recursiveFormattedObj = (obj) => {
// 	for (var property in obj) {
// 		if (obj.hasOwnProperty(property)) {
// 			if (property === "type" && obj[property] === "folder") {
// 				console.log("folder", obj);
// 				_recursiveFormattedArray(obj["children"]);
// 			}
// 		}
// 	}
// };

// const _composeFormattedObj = (objectFile) => {
// 	const { bookmark_bar, other, synced } = objectFile.roots;
// 	const allBookmark = { ...bookmark_bar, ...other, ...synced };
// 	return allBookmark.children;
// };
Promise.all(aPromise)
	.then((values) => {
		const obj = {};
		// let objMerged = {};
		values.map((v) => {
			obj[v.path] = JSON.parse(v.data);
			// not working
			// objMerged = { ...objMerged, ...JSON.parse(v.data) };

			// if (objMerged) {
			// 	console.log(objMerged.roots.bookmark_bar.children.length);
			// 	console.log(JSON.parse(v.data).roots.bookmark_bar.children.length);
			// }
		});
		const outputJson = JSON.stringify(obj, null, 2);
		writeFile("outputFile.json", outputJson, (err) => {
			if (err) throw err;
			console.log("File written.");
		});
		// delete objMerged.sync_metadata;
		// delete objMerged.version;
		// console.log(objMerged.roots.bookmark_bar.children.length);
		// const outputMergedJson = JSON.stringify(objMerged.roots, null, 2);
		// writeFile("outputMergedFile.json", outputMergedJson, (err) => {
		// 	if (err) throw err;
		// 	console.log("File written.");
		// });
	})
	.catch((err) => {
		console.log(err);
	});
