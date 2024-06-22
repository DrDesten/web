import path from "path"
import url from "url"
import { QueryPathValidators, QuerySearchFunctions, copy, query, read, remove, write } from "./file.js"
import { parseHTML } from "../xml/index.js"

const FILE_PATH = url.fileURLToPath( import.meta.url )
const FILE_DIR = path.dirname( FILE_PATH )

const ROOT_DIR = path.join( FILE_DIR, "../" )

const COMPONENT_DIR = path.join( ROOT_DIR, "components" )
const MODULE_DIR = path.join( ROOT_DIR, "modules" )
const ICON_DIR = path.join( ROOT_DIR, "components" )

const DST_DIR = path.join( ROOT_DIR, "dst" )
const SRC_DIR = path.join( ROOT_DIR, "src" )
remove( DST_DIR )
copy( SRC_DIR, DST_DIR )

const components = new Map( query( COMPONENT_DIR ).map( p => [path.basename( p ), p] ) )
const modules = new Map( query( MODULE_DIR ).map( p => [path.basename( p ), p] ) )
const icons = new Map( query( ICON_DIR ).map( p => [path.basename( p ), p] ) )

const htmlFilePaths = query( DST_DIR, QuerySearchFunctions.extension.html )
const htmlFileContents = read( htmlFilePaths )


for ( const htmlFile of htmlFileContents ) {
    const parsed = parseHTML( htmlFile.content )
    const html = parsed.find( node => node.name === "html" )
    if (!html) continue

    const scripts = html.findChildren( node => node.name === "script" && node.attributes.src )
    for ( const { attributes } of scripts ) {
        if ( modules.has( attributes.src ) ) {
            const relative = path.relative( htmlFile.path, modules.get( attributes.src ) )
            attributes.src = relative
        }
    }
    
    const built = parsed.join("\n")
    write( htmlFile.path, built )
}

console.log(modules)