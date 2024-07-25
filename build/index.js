import path from "path"
import url from "url"
import crypto from "crypto"
import { QueryPathValidators, QuerySearchFunctions, copy, exists, mkdir, query, read, remove, write } from "./file.js"
import { HTMLNode, parseHTML } from "../xml/index.js"
import { parseScript } from "./parsers/js.js"
import { Replacer } from "./parsers/string.js"
import { exit } from "process"

const FILE_PATH = url.fileURLToPath( import.meta.url )
const FILE_DIR = path.dirname( FILE_PATH )
const CACHE_DIR = path.join( FILE_DIR, "cache" )
const CACHE_PATH = path.join( CACHE_DIR, "cache.json" )

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
const SRC_DIR = path.join( ROOT_DIR, "src" )

mkdir( DST_DIR )
mkdir( DSTSCRIPT_DIR )
mkdir( DSTSTYLE_DIR )
mkdir( DSTIMAGE_DIR )

function hash( string ) {
    return crypto.createHash( "md5" ).update( string ).digest( "base64" )
}
const oldCache = exists( CACHE_PATH )
    ? new Map(
        Object.entries( JSON.parse( read( CACHE_PATH ).content ) )
            .filter( ( [path] ) => exists( path ) )
    )
    : new Map(
        read( query( DST_DIR ) )
            .map( f => [f.path, hash( f.content )] )
    )
const newCache = new Map()

function conditionalWrite( filepath, content ) {
    const filehash = hash( content )
    newCache.set( filepath, filehash )
    if ( oldCache.get( filepath ) === filehash ) return
    console.log( "wrote", path.relative( DST_DIR, filepath ) )

    write( filepath, content )
    oldCache.set( filepath, filehash )
}

const components = new Map( query( COMPONENT_DIR ).map( p => [path.basename( p, ".js" ), p] ) )
const scripts = new Map( query( SCRIPT_DIR ).map( p => [path.basename( p ), p] ) )
const styles = new Map( query( STYLE_DIR ).map( p => [path.basename( p ), p] ) )
const images = new Map( query( IMAGE_DIR ).map( p => [path.basename( p ), p] ) )

const htmlFilePaths = query( SRC_DIR, QuerySearchFunctions.extension.html )
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
const filenames = new Set
const resolvedScripts = new Map
const resolvedStyles = new Map
const resolvedImages = new Map
const resolvedImports = new Map

function requestPath( targetDir, filepath ) {
    let dirname = path.basename( path.dirname( filepath ) )
    let filename = dirname + "_" + path.basename( filepath )
    while ( filenames.has( filename ) ) filename = "_" + filename
    filenames.add( filename )
    return path.join( targetDir, filename )
}

function resolveImports( oldpath, newpath ) {
    if ( resolvedImports.has( oldpath ) ) return resolvedImports.get( oldpath )
    newpath ??= requestPath( DSTSCRIPT_DIR, oldpath )
    resolvedImports.set( oldpath, newpath )

    const dirname = path.dirname( oldpath )
    const source = read( oldpath ).content
    const { imports } = parseScript( source )
    for ( const replacer of imports ) {
        const absolute = path.resolve( path.join( dirname, replacer.value ) )
        replacer.value = "./" + path.relative( path.dirname( newpath ), resolveImports( absolute ) )
    }

    const patchedSource = Replacer.apply( source, imports )
    conditionalWrite( newpath, patchedSource )
    return newpath
}

for ( const htmlFile of htmlDocuments ) {
    const parsed = htmlFile.parsed
    const html = htmlFile.root

    const currentDir = path.dirname( htmlFile.path )
    const targetDir = path.join( DST_DIR, path.relative( SRC_DIR, currentDir ) )
    const targetPath = path.join( targetDir, path.basename( htmlFile.path ) )

    const tags = {
        script: html.findChildren( node => node.name === "script" && node.attributes.src ),
        style: html.findChildren( node => node.name === "link" && node.attributes.rel === "stylesheet" ),
        image: html.findChildren( node => node.name === "link" && node.attributes.rel === "icon" || node.name === "img" ),
    }

    for ( const { attributes } of tags.script ) {
        // Get Absolute Path of Script
        const filepath = scripts.has( attributes.src )
            ? path.resolve( path.join( SCRIPT_DIR, attributes.src ) )
            : path.join( currentDir, attributes.src )
        // Get Already Resolved
        if ( resolvedScripts.has( filepath ) ) {
            const targetpath = resolvedScripts.get( filepath )
            attributes.src = path.relative( targetDir, targetpath )
            continue
        }
        // Move Script
        const targetpath = requestPath( DSTSCRIPT_DIR, filepath )
        resolvedScripts.set( filepath, targetpath )
        // Update HTML
        attributes.src = path.relative( targetDir, targetpath )
    }

    for ( const { attributes } of tags.style ) {
        // Get Absolute Path of Style
        const filepath = styles.has( attributes.href )
            ? path.resolve( path.join( STYLE_DIR, attributes.href ) )
            : path.join( currentDir, attributes.href )
        // Get Already Resolved
        if ( resolvedStyles.has( filepath ) ) {
            const targetpath = resolvedStyles.get( filepath )
            attributes.href = path.relative( targetDir, targetpath )
            continue
        }
        // Move Style
        const targetpath = requestPath( DSTSTYLE_DIR, filepath )
        const content = read( filepath ).content
        conditionalWrite( targetpath, content )
        resolvedStyles.set( filepath, targetpath )
        // Update HTML
        attributes.href = path.relative( targetDir, targetpath )
    }
    for ( const { name, attributes } of tags.image ) {
        const attr = name === "img" ? "src" : "href"
        // Get Absolute Path of Image
        const filepath = images.has( attributes[attr] )
            ? path.resolve( path.join( IMAGE_DIR, attributes[attr] ) )
            : path.join( currentDir, attributes[attr] )
        // Get Already Resolved
        if ( resolvedImages.has( filepath ) ) {
            const targetpath = resolvedImages.get( filepath )
            attributes[attr] = path.relative( targetDir, targetpath )
            continue
        }
        // Move Image
        const targetpath = requestPath( DSTIMAGE_DIR, filepath )
        const content = read( filepath ).content
        conditionalWrite( targetpath, content )
        // Update HTML
        attributes[attr] = path.relative( targetDir, targetpath )
    }

    const built = parsed.join( "\n" )
    conditionalWrite( targetPath, built )
}

// Resolve Imports
for ( const [oldpath, newpath] of resolvedScripts.entries() ) {
    resolveImports( oldpath, newpath )
}

// Save Cache
write( CACHE_PATH, JSON.stringify( Object.fromEntries( newCache.entries() ), null, 4 ) )