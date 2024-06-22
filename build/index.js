import path from "path"
import url from "url"
import { QueryPathValidators, QuerySearchFunctions, query, read } from "./file.js"

const FILE_PATH = url.fileURLToPath( import.meta.url )
const FILE_DIR = path.dirname( FILE_PATH )
const ROOT_DIR = path.join( FILE_DIR, "../" )

const htmlFilePaths = query( ROOT_DIR, QuerySearchFunctions.extension.html, QueryPathValidators.nondot )
const htmlFileContents = read( htmlFilePaths )

for ( const htmlFile of htmlFileContents ) {
    const scriptSrcRegex = /(?<=<script\s+src=(["'])).*?(?=\1.*?\s*>\s*<\/script>)/g
    const scriptSrcTags = [...htmlFile.content.matchAll( scriptSrcRegex )].map( tag => tag[0] )
    console.log( scriptSrcTags )
}