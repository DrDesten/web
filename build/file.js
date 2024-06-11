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

/** @param {string[]} paths */
export function read( paths ) {
    const files = []
    for ( const path of paths ) {
        files.push( {
            path: path,
            content: fs.readFileSync( path, 'utf8' )
        } )
    }
    return files
}
