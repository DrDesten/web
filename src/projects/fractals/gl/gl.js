/** @type {WebGL2RenderingContext} */
export let gl = null

/** @param {WebGL2RenderingContext} glContext  */
export function setGL( glContext ) {
    gl = glContext
}

const warnings = new Map
/** @param {string} message @param {number} count  */
export function warn( message, count = 10 ) {
    if ( count === Infinity ) return console.warn( message )
    if ( !warnings.has( message ) ) warnings.set( message, 1 )

    const currentCount = warnings.get( message )
    if ( currentCount < count ) {
        console.warn( message )
        warnings.set( message, currentCount + 1 )
        return
    }
    if ( currentCount === count ) {
        console.warn( `Suppressing Warnings:\n` + message )
        warnings.set( message, currentCount + 1 )
        return
    }
}