import fs from 'fs'
import path from 'path'

/** 
 * @typedef {(path: string) => boolean} QueryFunction
 */

/** @type {{[extension: string]: QueryFunction}} */
const QuerySearchFunctionExtensions = new Proxy( {}, {
    get: ( _, prop ) => function ( p ) {
        return path.basename( p ).endsWith( prop )
    }
} )

export const QuerySearchFunctions = {
    all() { return true },
    nondot( p ) { return !/^\.\w+/.test( path.basename( p ) ) },
    extension: QuerySearchFunctionExtensions,
}
export const QueryPathValidators = {
    all() { return true },
    nondot( p ) { return !/^\.\w+/.test( path.basename( p ) ) },
}

/** @param {string} dir @param {QueryFunction} [searchFunction] @param {QueryFunction} [pathValidator] @returns {string[]} */
export function query( dir, searchFunction = QuerySearchFunctions.all, pathValidator = QueryPathValidators.all ) {
    const files = fs.readdirSync( dir )
    const results = []
    for ( const file of files ) {
        const filePath = path.join( dir, file )
        const stat = fs.statSync( filePath )
        if ( stat.isDirectory() && pathValidator( filePath ) ) results.push( ...query( filePath, searchFunction, pathValidator ) )
        if ( stat.isFile() && searchFunction( filePath ) ) results.push( filePath )
    }
    return results
}

/** @param {string|string[]} paths @param {BufferEncoding|{encoding: BufferEncoding?, flag?: string}} [options] */
export function read( paths, options = { encoding: 'utf8' } ) {
    /** @param {string} path */
    function read( path ) { return { path, content: fs.readFileSync( path, options ) } }
    return typeof paths === "string"
        ? read( paths )
        : paths.map( read )
}
/** @param {string} filepath @param {string} content */
export function write( filepath, content ) {
    fs.mkdirSync( path.dirname( filepath ), { recursive: true } )
    fs.writeFileSync( filepath, content, { encoding: "utf8" } )
}
/** @param {string} path */
export function exists( path ) {
    return fs.existsSync( path )
}
/** @param {string} path */
export function mkdir( path ) {
    return exists( path ) ? false : fs.mkdirSync( path, { recursive: true } ), true
}
/** @param {string} source @param {string} destination */
export function copy( source, destination ) {
    fs.cpSync( source, destination, { recursive: true } )
}
/** @param {string|string[]} paths */
export function remove( paths ) {
    /** @param {string} path */
    function remove( path ) { fs.rmSync( path, { force: true, recursive: true } ) }
    typeof paths === "string"
        ? remove( paths )
        : paths.forEach( remove )
}