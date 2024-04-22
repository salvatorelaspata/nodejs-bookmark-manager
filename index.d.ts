interface Bookmark {
  checksum: string
  roots: Root
  sync_metadata: string
  version: Number
}

interface Root {
  bookmark_bar: Child
  other: Child
  synced: Child
}

type TypeBookmarkChild = "folder" | "url" 
interface Child {
  date_added: string
  guid: string
  id: string
  name: string
  type: TypeBookmarkChild
  url?: string
  meta_info?: {last_visited_desktop?: string}
  date_modified?: string
  children?: [Child]
}

interface ProfileProp {rootChromeRootPath: string, profiles: string[]}
interface ReadAsyncProp {data: Buffer | null, path: string}

// interface NameUrl { name: string; url?: string; }
type NameUrlSign = function(Partial<Child>): NameUrl
type NameUrlMdSign = function(Partial<Child>): string

interface OutputResponse<QueryKey extends Type, OutputType> {
  [key in QueryKey]: OutputType;
}

// CLI
type Args = string[]

type ExportType = "json" | "jsonSimple" | "jsonMerge" | "jsonMergeSimple" | "md" | "mdSimple"