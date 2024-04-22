
const _newLightObj: NameUrlSign = ({ name, url }) => ({ name, url });
const _newLightMdLink: NameUrlMdSign = ({ name, url }) => `[${name}](${url}).`;
const _newManagedMd: (arg0: Partial<Child>) => string = ({
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

export const composeFormattedObj: (objectFile: Bookmark, lightObj?: boolean) => Partial<Child>[] 
	= (objectFile, lightObj = false) => {
	const { bookmark_bar, other, synced } = objectFile.roots;
	const aAllBookmark:Partial<Child>[]  = [];
	function _recursiveChildrenCheck(node: Partial<Child>) {
		if (node.hasOwnProperty("children")) {
			node.children && node.children.map((n) => {
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
export const formatMD: (objectFile: Bookmark, lightObj?: boolean) => string 
	= (objectFile, lightObj = false) => {
	const aAllBookmark = composeFormattedObj(objectFile, lightObj);
	return aAllBookmark
		.map((b) => (lightObj ? _newLightMdLink(b) : _newManagedMd(b)))
		.join("\n");
};
