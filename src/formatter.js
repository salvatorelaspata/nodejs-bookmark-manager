const _newLightObj = ({ name, url }) => ({ name, url });
const _newLightMdLink = ({ name, url }) => `[${name}](${url}).`;
const _newManagedMd = ({
	date_added,
	guid,
	id,
	name,
	url,
	meta_info,
	date_modified,
}) => `# ${name}

## ${_newLightMdLink({ name, url })}

| id	      	| guid 				| date_added 		| date_modified		 				| $meta_info		|
| ----------- | ----------- | ------------- | ----------------------- | ------------- |
| ${id}     	| ${guid}     | ${date_added}	| ${date_modified || ""} 	| ${
	meta_info?.last_visited_desktop || ""
}  |
`;

// export const composeFormattedObj: any[] = (objectFile: any, lightObj: boolean = false) => {
export const composeFormattedObj = (objectFile, lightObj = false) => {
	const { bookmark_bar, other, synced } = objectFile.roots;
	const aAllBookmark = [];
	function _recursiveChildrenCheck(node) {
		if (node.hasOwnProperty("children")) {
			node.children.map((n) => {
				_recursiveChildrenCheck(n);
			});
		} else {
			aAllBookmark.push(lightObj ? _newLightObj(node) : node);
		}
	}
	_recursiveChildrenCheck(bookmark_bar);
	_recursiveChildrenCheck(other);
	_recursiveChildrenCheck(synced);
	return aAllBookmark;
};

// export const formatMD: string = (objectFile: any, lightObj: boolean = false) => {
export const formatMD = (objectFile, lightObj = false) => {
	const aAllBookmark = composeFormattedObj(objectFile, lightObj);
	return aAllBookmark
		.map((b) => (lightObj ? _newLightMdLink(b) : _newManagedMd(b)))
		.join("\n");
};
