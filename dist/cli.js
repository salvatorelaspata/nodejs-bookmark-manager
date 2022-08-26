import inquirer from 'inquirer';
import figlet from 'figlet';
import { join } from 'path';
import { readdirSync, existsSync, readFile, writeFile } from 'fs';
import { homedir, platform } from 'os';

const _newLightObj = ({ name, url }) => ({ name, url });
const _newLightMdLink = ({ name, url }) => `[${name}](${url}).`;
const _newManagedMd = ({ date_added, guid, id, name, url, meta_info, date_modified, }) => `# ${name}

## ${_newLightMdLink({ name, url })}

| id	      	| guid 				| date_added 		| date_modified		 				| $meta_info		|
| ----------- | ----------- | ------------- | ----------------------- | ------------- |
| ${id}     	| ${guid}     | ${date_added}	| ${date_modified || ""} 	| ${meta_info?.last_visited_desktop || ""}  |
`;
const composeFormattedObj = (objectFile, lightObj = false) => {
    const { bookmark_bar, other, synced } = objectFile.roots;
    const aAllBookmark = [];
    function _recursiveChildrenCheck(node) {
        if (node.hasOwnProperty("children")) {
            node.children && node.children.map((n) => {
                _recursiveChildrenCheck(n);
            });
        }
        else {
            aAllBookmark.push(lightObj ? _newLightObj(node) : node);
        }
    }
    _recursiveChildrenCheck(bookmark_bar);
    _recursiveChildrenCheck(other);
    _recursiveChildrenCheck(synced);
    return aAllBookmark;
};
// export const formatMD: string = (objectFile: any, lightObj: boolean = false) => {
const formatMD = (objectFile, lightObj = false) => {
    const aAllBookmark = composeFormattedObj(objectFile, lightObj);
    return aAllBookmark
        .map((b) => (lightObj ? _newLightMdLink(b) : _newManagedMd(b)))
        .join("\n");
};

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
                res({
                    data,
                    path: filePath.split("/")[filePath.split("/").length - 1],
                });
            });
        });
    }
    else {
        return Promise.resolve({
            data: null,
            path: filePath.split("/")[filePath.split("/").length - 1],
        });
    }
};
const writeAsync = (filePath, file) => {
    console.log(filePath, file);
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
        const data = v.data;
        if (v && data) {
            switch (type) {
                case "json":
                    ret[v.path] = composeFormattedObj(JSON.parse(data));
                    break;
                case "jsonSimple":
                    ret[v.path] = composeFormattedObj(JSON.parse(data), true);
                    break;
                case "md":
                    if (typeof ret === "object")
                        ret = "";
                    ret += formatMD(JSON.parse(data));
                    break;
                case "mdSimple":
                    if (typeof ret === "object")
                        ret = "";
                    ret += formatMD(JSON.parse(data), true);
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

// create shortcut per lanciare automaticamente il download
// --all e scarica tutti i profili
// --outDir <percorso o "."> per esportare in un determinato percorso o quello corrente
//
function cli(args) {
    // console.log('TS', args);
    const { profiles, rootChromeRootPath } = getProfile();
    const q = [
        {
            type: "list",
            name: "profile",
            message: "Sono stati trovati questi G profili sul tuo PC?\nQuali vuoi consultare?",
            choices: ["ALL", ...profiles],
        },
        {
            type: "checkbox",
            name: "outputFormat",
            pageSize: 6,
            message: "In che formato file vuoi scaricare i tuoi bookmarks?",
            choices: [
                {
                    key: "1",
                    name: "JSON\tFile",
                    value: "json",
                },
                {
                    key: "2",
                    name: "JSON\tSemplice file (name, url)",
                    value: "jsonSimple",
                },
                {
                    key: "3",
                    name: "MD\tFile",
                    value: "md",
                },
                {
                    key: "4",
                    name: "MD\tSemplice file (name, url)",
                    value: "mdSimple",
                },
            ],
        },
        {
            type: "input",
            name: "directory",
            message: 'Dove vuoi salvare i file?\nSpecificare una directory,\nSe si intende salvare nella cartella corrente premere ENTER o punto (".") + ENTER.',
        },
    ];
    figlet(`Bookmarks 
  Manager!!`, function (err, data) {
        if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
        }
        console.log(data);
        console.log("Ciao, e benvenuto in Bookmark Manager! Il tool che ti permette di avere un resoconto su tutti i tuoi bookmark ");
        inquirer.prompt(q).then((answers) => {
            console.log("\nEstrazione bookmarks...");
            const { outputFormat } = answers;
            const aReadPromises = [];
            profiles.map((p) => {
                const path = join(rootChromeRootPath, p, "Bookmarks");
                console.log("path", path);
                aReadPromises.push(readAsync(path));
            });
            Promise.all(aReadPromises).then((values) => {
                const aWritePromises = [];
                outputFormat.map((outType) => {
                    debugger;
                    const file = createModelData(outType, values);
                    const isMd = outType.indexOf("md") !== -1;
                    const ext = isMd ? "md" : "json";
                    const filename = `output-${outType}`;
                    console.log(filename, ext);
                    aWritePromises.push(writeAsync(`${filename}.${ext}`, isMd ? file : JSON.stringify(file, null, 2)));
                });
                // console.log(aWritePromises.length);
                aWritePromises.length > 0 &&
                    Promise.all(aWritePromises)
                        .then((_) => {
                        console.log("all file are written");
                        process.exit(1);
                    })
                        .catch((err) => {
                        console.log(err);
                        process.exit(1);
                    });
            });
            //
            // SE ALL allora scaricare i merged file
            console.log(JSON.stringify(answers, null, "  "));
        });
    });
}

export { cli };
