interface Bookmark {
  checksum: String
  roots: Root
  sync_metadata: String
  version: Number
}

interface Root {
  bookmark_bar: Child
  other: Child
  synced: Child
}

type TypeBookmarkChild = "folder" | "url" 
interface Child {
  date_added: String
  guid: String
  id: String
  name: String
  type: TypeBookmarkChild
  url?: String
  meta_info?: {last_visited_desktop?: String}
  date_modified?: String
  children?: [Child]
}