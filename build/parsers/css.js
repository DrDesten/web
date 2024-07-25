import { Replacer } from "./string.js"

/** @param {string} source */
export function parseStyle( source ) {
    const urlRegex = /url\((?<delim>["'])(?<url>.*?)\k<delim>\)/gd
    const urls = Array.from( source.matchAll( urlRegex ) ).map( match => {
        const url = match.groups.url
        const [start, end] = match.indices.groups.url
        return new Replacer( start, end, url )
    } )
    return { urls }
}