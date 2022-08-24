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
const _newLightObj = ({ name, url }) => ({ name, url });
const _composeFormattedObj = (objectFile, lightObj = false) => {
	const { bookmark_bar, other, synced } = objectFile.roots;
	const allBookmark = [];
	function _recursiveChildrenCheck(node) {
		if (node.hasOwnProperty("children")) {
			// const element = node[prop];
			// console.log("children");
			node.children.map((n) => {
				_recursiveChildrenCheck(n);
			});
		} else {
			// console.log("node");
			allBookmark.push(lightObj ? _newLightObj(node) : node);
		}
	}
	// console.log(allBookmark.length);
	_recursiveChildrenCheck(bookmark_bar);
	// console.log(allBookmark.length);
	_recursiveChildrenCheck(other);
	// console.log(allBookmark.length);
	_recursiveChildrenCheck(synced);
	// console.log(allBookmark.length);
	return allBookmark;
};

Promise.all(aPromise)
	.then((values) => {
		const obj = {},
			objSimple = {};
		const objMerged = [],
			objSimpleMerged = [];
		values.map((v) => {
			obj[v.path] = _composeFormattedObj(JSON.parse(v.data));
			objMerged.push(..._composeFormattedObj(JSON.parse(v.data)));
			objSimple[v.path] = _composeFormattedObj(JSON.parse(v.data), true);
			objSimpleMerged.push(..._composeFormattedObj(JSON.parse(v.data), true));
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
	})
	.catch((err) => {
		console.log(err);
	});
