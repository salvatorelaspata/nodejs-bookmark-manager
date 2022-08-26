import { join } from "path";
import { createModelData, getProfile, readAsync, writeAsync } from "./utils";

const { profiles, rootChromeRootPath } = getProfile();

const aReadPromises: Promise<ReadAsyncProp>[] = [];
profiles.map((p) => {
	const path = join(rootChromeRootPath, p, "Bookmarks");
	console.log("path", path);
	aReadPromises.push(readAsync(path));
});

Promise.all(aReadPromises)
	.then((values: ReadAsyncProp[]) => {
		// const obj: any = {},
		// 	objSimple: any = {};
		// const objMerged: { bookmarks: Partial<Child>[] } = { bookmarks: [] },
		// 	objSimpleMerged: { bookmarks: Partial<Child>[] } = { bookmarks: [] };
		// let mdFile = "",
		// 	mdFileSimple = "";
		// values.map((v) => {
		// 	if(v && v.data){
		// 		obj[v.path] = composeFormattedObj(JSON.parse(v.data as unknown as string));
		// 		objMerged.bookmarks.push(...composeFormattedObj(JSON.parse(v.data as unknown as string)));
		// 		objSimple[v.path] = composeFormattedObj(JSON.parse(v.data as unknown as string), true);
		// 		objSimpleMerged.bookmarks.push(
		// 			...composeFormattedObj(JSON.parse(v.data as unknown as string), true)
		// 		);
		// 		mdFile += formatMD(JSON.parse(v.data as unknown as string));
		// 		mdFileSimple += formatMD(JSON.parse(v.data as unknown as string), true);
		// 	}
		// });

		const aWritePromises = [];
		const obj = createModelData("json", values);
		const outputJson = JSON.stringify(obj, null, 2);
		aWritePromises.push(writeAsync("outputFile.json", outputJson));
		const objSimple = createModelData("jsonSimple", values);
		const outputSimpleJson = JSON.stringify(objSimple, null, 2);
		aWritePromises.push(writeAsync("outputSimpleFile.json", outputSimpleJson));
		// const objMerged = createModelData('jsonSimple', values)
		// const outputMergedJson = JSON.stringify(objMerged, null, 2);
		// aWritePromises.push(writeAsync("outputMergedFile.json", outputMergedJson));
		// const outputsSimpleMergedJson = JSON.stringify(objSimpleMerged, null, 2);
		// aWritePromises.push(
		// 	writeAsync("outputSimpleMergedFile.json", outputsSimpleMergedJson)
		// );
		const mdFile = createModelData("md", values);
		aWritePromises.push(writeAsync("output.md", mdFile));
		const mdFileSimple = createModelData("mdSimple", values);
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
