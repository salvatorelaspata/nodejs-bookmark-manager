import { readdirSync, existsSync, readFile, writeFile } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';
import { formatMD, composeFormattedObj } from './formatter.js';

// const _getPlatform: Platform = platform.call();
const _getPlatform = platform;
const getProfile = () => {
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
    const profiles = readRootBookmarkFolder.filter((b) => b.startsWith("Profile") || b.startsWith("Default"));
    return { profiles, rootChromeRootPath };
};
const readAsync = (filePath) => {
    if (existsSync(filePath)) {
        return new Promise((res, rej) => {
            readFile(filePath, (err, data) => {
                console.log("readFile", filePath);
                if (err)
                    throw Error("OS not working!");
                res({ data, path: filePath.split('/')[filePath.split('/').length - 1] });
            });
        });
    }
    else {
        return Promise.resolve({ data: null, path: filePath.split('/')[filePath.split('/').length - 1] });
    }
};
const writeAsync = (filePath, file) => {
    return new Promise((res, rej) => {
        // override file if exists
        writeFile(filePath, file, (err) => {
            console.log("writeFile", filePath);
            if (err)
                throw Error("OS not working!");
            res();
        });
    });
};
const createModelData = (type, values) => {
    let ret = {};
    values.map((v) => {
        if (v && v.data) {
            switch (type) {
                case 'json':
                    ret[v.path] = composeFormattedObj(JSON.parse(v.data));
                    break;
                case 'jsonSimple':
                    ret[v.path] = composeFormattedObj(JSON.parse(v.data), true);
                    break;
                case 'md':
                    if (typeof ret === 'object')
                        ret = '';
                    ret += formatMD(JSON.parse(v.data));
                    break;
                case 'mdSimple':
                    if (typeof ret === 'object')
                        ret = '';
                    ret += formatMD(JSON.parse(v.data), true);
                    break;
            }
            // objMerged.bookmarks.push(...composeFormattedObj(JSON.parse(v.data as unknown as string)));
            // objSimpleMerged.bookmarks.push(
            // 	...composeFormattedObj(JSON.parse(v.data as unknown as string), true)
            // );
        }
    });
    return ret;
};

export { createModelData, getProfile, readAsync, writeAsync };
