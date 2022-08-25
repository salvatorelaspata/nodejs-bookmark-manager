#! /usr/bin/env node
import { join } from "path";
import { composeFormattedObj, formatMD } from "./formatter.js";
import { getProfile, readAsync, writeAsync } from "./utils.js";

const { readRootBookmarkFolder, rootChromeRootPath } = getProfile();

const profile = readRootBookmarkFolder.filter(
	(b) => b.startsWith("Profile") || b.startsWith("Default")
);

const aReadPromises = [];
profile.map((p) => {
	const path = join(rootChromeRootPath, p, "Bookmarks");
	console.log("path", path);
	aReadPromises.push(readAsync(path));
});

Promise.all(aReadPromises)
	.then((values) => {
		const obj = {},
			objSimple = {};
		const objMerged = { bookmarks: [] },
			objSimpleMerged = { bookmarks: [] };
		let mdFile = "",
			mdFileSimple = "";
		values.map((v) => {
			obj[v.path] = composeFormattedObj(JSON.parse(v.data));
			objMerged.bookmarks.push(...composeFormattedObj(JSON.parse(v.data)));
			objSimple[v.path] = composeFormattedObj(JSON.parse(v.data), true);
			objSimpleMerged.bookmarks.push(
				...composeFormattedObj(JSON.parse(v.data), true)
			);
			mdFile += formatMD(JSON.parse(v.data));
			mdFileSimple += formatMD(JSON.parse(v.data), true);
		});

		const aWritePromises = [];
		const outputJson = JSON.stringify(obj, null, 2);
		aWritePromises.push(writeAsync("outputFile.json", outputJson));
		const outputSimpleJson = JSON.stringify(objSimple, null, 2);
		aWritePromises.push(writeAsync("outputSimpleFile.json", outputSimpleJson));
		const outputMergedJson = JSON.stringify(objMerged, null, 2);
		aWritePromises.push(writeAsync("outputMergedFile.json", outputMergedJson));
		const outputsSimpleMergedJson = JSON.stringify(objSimpleMerged, null, 2);
		aWritePromises.push(
			writeAsync("outputSimpleMergedFile.json", outputsSimpleMergedJson)
		);
		aWritePromises.push(writeAsync("output.md", mdFile));
		aWritePromises.push(writeAsync("outputSimple.md", mdFileSimple));

		Promise.all(aWritePromises)
			.then((_) => {
				console.log("all file are written");
				process.exit(1);
			})
			.catch((err) => {
				console.log(err);
				process.exit(1);
			});
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
