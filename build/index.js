import path from "path"
import url from "url"
import { QueryPathValidators, QuerySearchFunctions, copy, query, read, remove, write } from "./file.js"
import { HTMLNode, parseHTML } from "../xml/index.js"

const FILE_PATH = url.fileURLToPath( import.meta.url )
const FILE_DIR = path.dirname( FILE_PATH )

const ROOT_DIR = path.join( FILE_DIR, "../" )

const COMPONENT_DIR = path.join( ROOT_DIR, "components" )
const SCRIPT_DIR = path.join( ROOT_DIR, "scripts" )
const STYLE_DIR = path.join( ROOT_DIR, "styles" )
const IMAGE_DIR = path.join( ROOT_DIR, "images" )

const DST_DIR = path.join( ROOT_DIR, "dst" )
const SRC_DIR = path.join( ROOT_DIR, "src" )
remove( DST_DIR )
copy( SRC_DIR, DST_DIR )

const components = new Map( query( COMPONENT_DIR ).map( p => [path.basename( p ), p] ) )
const scripts = new Map( query( SCRIPT_DIR ).map( p => [path.basename( p ), p] ) )
const styles = new Map( query( STYLE_DIR ).map( p => [path.basename( p ), p] ) )
const images = new Map( query( IMAGE_DIR ).map( p => [path.basename( p ), p] ) )

const htmlFilePaths = query( DST_DIR, QuerySearchFunctions.extension.html )
const htmlFileContents = read( htmlFilePaths )


for ( const htmlFile of htmlFileContents ) {
    const parsed = parseHTML( htmlFile.content )
    /** @type {HTMLNode} */
    const html = parsed.find( node => node.name === "html" )
    if (!html) continue

    const tags = {
        script: html.findChildren( node => node.name === "script" && node.attributes.src ),
        style: html.findChildren( node => node.name === "link" && node.attributes.rel === "stylesheet" ),
        image: html.findChildren( node => node.name === "link" && node.attributes.rel === "icon" || node.name === "img" ),
    }

    for ( const { attributes } of tags.script ) {
        if ( scripts.has( attributes.src ) ) {
            const relative = path.relative( path.dirname( htmlFile.path ), scripts.get( attributes.src ) )
            attributes.src = relative
        }
    }
    for ( const { attributes } of tags.style ) {
        if ( styles.has( attributes.href ) ) {
            const relative = path.relative( path.dirname( htmlFile.path ), styles.get( attributes.href ) )
            attributes.href = relative
        }
    }
    for ( const { name, attributes } of tags.image ) {
        const attr = name === "img" ? "src" : "href"
        if ( images.has( attributes[attr] ) ) {
            const relative = path.relative( path.dirname( htmlFile.path ), images.get( attributes[attr] ) )
            attributes[attr] = relative
        }
    }
    
    const built = parsed.join("\n")
    write( htmlFile.path, built )
}

console.log(scripts)
console.log(styles)
console.log(images)