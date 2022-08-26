import inquirer from "inquirer";
import figlet from "figlet";
import { join } from "path";
import { createModelData, getProfile, readAsync, writeAsync } from "./utils";
// create shortcut per lanciare automaticamente il download
// --all e scarica tutti i profili
// --outDir <percorso o "."> per esportare in un determinato percorso o quello corrente
//
export function cli(args: Args) {
	// console.log('TS', args);
	const { profiles, rootChromeRootPath } = getProfile();
	const q = [
		{
			type: "list",
			name: "profile",
			message: `Sono stati trovati ${profiles.length} G profili sul tuo PC.\nQuali vuoi consultare?`,
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
			message:
				"Dove vuoi salvare i file?\nSpecificare una directory,\nSe si intende salvare nella cartella corrente premere ENTER",
		},
		{
			type: "confirm",
			name: "recursive",
			message: "Vuoi continuare a scaricare?",
			default: false,
		},
	];

	figlet(
		`Bookmarks 
  Manager!!`,
		function (err, data) {
			if (err) {
				console.log("Something went wrong...");
				console.dir(err);
				return;
			}
			console.log(data);
			console.log(
				"Ciao, e benvenuto in Bookmark Manager! Il tool che ti permette di avere un resoconto su tutti i tuoi bookmark "
			);

			const job = () =>
				inquirer.prompt(q).then((answers: any) => {
					console.log("\nEstrazione bookmarks...");
					const { outputFormat, profile, recursive } = answers;
					const aReadPromises: Promise<ReadAsyncProp>[] = [];
					// filtered profile from selected
					const profileFiltered =
						profile === "ALL"
							? profiles
							: profiles.filter((p) => p === profile);
					console.log(profileFiltered.length);
					profileFiltered.map((p) => {
						const path = join(rootChromeRootPath, p, "Bookmarks");
						aReadPromises.push(readAsync(path));
					});

					Promise.all(aReadPromises).then((values: ReadAsyncProp[]) => {
						const aWritePromises: Promise<void>[] = [];
						outputFormat.map((outType: ExportType) => {
							debugger;
							const file = createModelData(outType, values);
							const isMd = outType.indexOf("md") !== -1;
							const ext = isMd ? "md" : "json";
							const filename = `bookmarks-${profile}-${outType}`;
							aWritePromises.push(
								writeAsync(
									`${filename}.${ext}`,
									isMd ? file : JSON.stringify(file, null, 2)
								)
							);
						});
						aWritePromises.length > 0 &&
							Promise.all(aWritePromises)
								.then((_) => {
									console.log("all file are written");
									recursive ? job() : process.exit(1);
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

			job();
		}
	);
}
