import { Replacer } from "./string.js"

/** @param {string} source */
export function parseScript( source ) {
    const importRegex = /import\s+(?:.*?from\s+)?(['"])(?<import>(?:.|\\\1)*?)\1/gd
    const imports = Array.from( source.matchAll( importRegex ) ).map( match => {
        const path = match.groups.import
        const [start, end] = match.indices.groups.import
        return new Replacer( start, end, path )
    } )
    return { imports }
}