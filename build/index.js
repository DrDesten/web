import path from "path"
import url from "url"
import { QueryPathValidators, QuerySearchFunctions, copy, mkdir, query, read, remove, write } from "./file.js"
import { HTMLNode, parseHTML } from "../xml/index.js"

const FILE_PATH = url.fileURLToPath( import.meta.url )
const FILE_DIR = path.dirname( FILE_PATH )

const ROOT_DIR = path.join( FILE_DIR, "../" )

const COMPONENT_DIR = path.join( ROOT_DIR, "components" )
const SCRIPT_DIR = path.join( ROOT_DIR, "scripts" )
const STYLE_DIR = path.join( ROOT_DIR, "styles" )
const IMAGE_DIR = path.join( ROOT_DIR, "images" )

const DST_DIR = path.join( ROOT_DIR, "dst" )
const DSTBIN_DIR = path.join( DST_DIR, "bin" )
const DSTSCRIPT_DIR = path.join( DSTBIN_DIR, "scripts" )
const DSTSTYLE_DIR = path.join( DSTBIN_DIR, "styles" )
const DSTIMAGE_DIR = path.join( DSTBIN_DIR, "images" )
const DSTDEPENDENCY_DIR = path.join( DSTBIN_DIR, "dependencies" )
const SRC_DIR = path.join( ROOT_DIR, "src" )

remove( DST_DIR )
copy( SRC_DIR, DST_DIR )
copy( SCRIPT_DIR, DSTSCRIPT_DIR )
copy( STYLE_DIR, DSTSTYLE_DIR )
copy( IMAGE_DIR, DSTIMAGE_DIR )
mkdir( DSTDEPENDENCY_DIR )

const components = new Map( query( COMPONENT_DIR ).map( p => [path.basename( p, ".js" ), p] ) )
const scripts = new Map( query( SCRIPT_DIR ).map( p => [path.basename( p ), p] ) )
const styles = new Map( query( STYLE_DIR ).map( p => [path.basename( p ), p] ) )
const images = new Map( query( IMAGE_DIR ).map( p => [path.basename( p ), p] ) )

const htmlFilePaths = query( DST_DIR, QuerySearchFunctions.extension.html )
const htmlFileContents = read( htmlFilePaths )
const htmlDocuments = htmlFileContents.map( ( { path, content } ) => {
    let parsed = parseHTML( content ), root = parsed.find( ( { name } ) => name === "html" )
    if ( !( root instanceof HTMLNode ) ) throw new Error( "Unable to find root html in\n---\n" + content + "\n---\nat" + path )
    return { path, content, parsed, root }
} )

// Resolve Components
const meta = {
    pages: Object.freeze( [...htmlFilePaths] )
}
for ( const { path: filepath, root } of htmlDocuments ) {
    const candidates = root.findChildren( node => components.has( node.name ) )
    if ( !candidates.length ) continue

    const globals = {
        meta: meta,
        ROOT: DST_DIR,
        PATH: filepath,
        DIRNAME: path.dirname( filepath ),
        FILENAME: path.basename( filepath ),
    }

    for ( const node of candidates ) {
        const component = ( await import( url.pathToFileURL( components.get( node.name ) ) ) ).default
        const html = component( globals, node.attributes, node.children.join( "\n" ) )
        //console.log( html )
        const parsed = parseHTML( html )
        const replaceIndex = node.parent.children.indexOf( node )
        node.parent.children.splice( replaceIndex, 1, ...parsed )
    }
}

// Resolve Sources
for ( const htmlFile of htmlDocuments ) {
    const parsed = htmlFile.parsed
    const html = htmlFile.root

    const dirname = path.dirname( htmlFile.path )
    const tags = {
        script: html.findChildren( node => node.name === "script" && node.attributes.src ),
        style: html.findChildren( node => node.name === "link" && node.attributes.rel === "stylesheet" ),
        image: html.findChildren( node => node.name === "link" && node.attributes.rel === "icon" || node.name === "img" ),
    }

    const dependencies = []
    const resolved = new Map
    for ( const { attributes } of tags.script ) {
        if ( scripts.has( attributes.src ) ) {
            const filepath = path.join( DSTSCRIPT_DIR, attributes.src )
            attributes.src = path.relative( dirname, filepath )
        }
    }

    for ( const { attributes } of tags.style ) {
        if ( styles.has( attributes.href ) )
            attributes.href = path.relative( dirname, path.join( DSTSTYLE_DIR, attributes.href ) )
    }
    for ( const { name, attributes } of tags.image ) {
        const attr = name === "img" ? "src" : "href"
        if ( images.has( attributes[attr] ) )
            attributes[attr] = path.relative( dirname, path.join( DSTIMAGE_DIR, attributes[attr] ) )
    }

    const built = parsed.join( "\n" )
    write( htmlFile.path, built )
}