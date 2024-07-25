export class Replacer {
    /** @param {number} start @param {number} end @param {string} value */
    constructor( start, end, value ) {
        this.start = start
        this.end = end
        this.value = value
    }

    /** @param {string} source @param {Replacer[]} replacers  */
    static apply( source, replacers ) {
        const parts = []
        let last = 0
        for ( const replacer of replacers ) {
            parts.push( source.slice( last, replacer.start ) )
            parts.push( replacer.value )
            last = replacer.end
        }
        parts.push( source.slice( last ) )
        return parts.join( '' )
    }
}