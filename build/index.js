import path from "path"
import url from "url"
import { QueryPathValidators, QuerySearchFunctions, copy, query, read, remove, write } from "./file.js"
import { parseHTML } from "../xml/index.js"

const FILE_PATH = url.fileURLToPath( import.meta.url )
const FILE_DIR = path.dirname( FILE_PATH )
const ROOT_DIR = path.join( FILE_DIR, "../" )

const DST_DIR = path.join( ROOT_DIR, "dst" )
const SRC_DIR = path.join( ROOT_DIR, "src" )
remove( DST_DIR )
copy( SRC_DIR, ROOT_DIR )

const htmlFilePaths = query( ROOT_DIR, QuerySearchFunctions.extension.html, p => !/^\.\w+|build|modules|components/.test( path.basename( p ) ) )
const htmlFileContents = read( htmlFilePaths )

const modules = new Map( 
    query( path.join(ROOT_DIR, "modules"), QuerySearchFunctions.extension.js )
        .map( p => [path.basename( p ), p] ) 
)

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
    write( path.join(DST_DIR, path.relative( ROOT_DIR, htmlFile.path ) ) , built )
}

console.log(modules)