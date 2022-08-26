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
			message:
				"Sono stati trovati questi G profili sul tuo PC?\nQuali vuoi consultare?",
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
				'Dove vuoi salvare i file?\nSpecificare una directory,\nSe si intende salvare nella cartella corrente premere ENTER o punto (".") + ENTER.',
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

			inquirer.prompt(q).then((answers: any) => {
				console.log("\nEstrazione bookmarks...");
				const { outputFormat } = answers;
				const aReadPromises: Promise<ReadAsyncProp>[] = [];
				profiles.map((p) => {
					const path = join(rootChromeRootPath, p, "Bookmarks");
					console.log("path", path);
					aReadPromises.push(readAsync(path));
				});

				Promise.all(aReadPromises).then((values: ReadAsyncProp[]) => {
					const aWritePromises: Promise<void>[] = [];
					outputFormat.map((outType: ExportType) => {
						debugger;
						const file = createModelData(outType, values);
						const isMd = outType.indexOf("md") !== -1;
						const ext = isMd ? "md" : "json";
						const filename = `output-${outType}`;
						console.log(filename, ext);
						aWritePromises.push(
							writeAsync(
								`${filename}.${ext}`,
								isMd ? file : JSON.stringify(file, null, 2)
							)
						);
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
		}
	);
}
