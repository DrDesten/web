import * as attributes from "./attribute.js"
import * as uniforms from "./uniform.js"


/** @type {WebGL2RenderingContext} */
let gl = null

/** @param {WebGL2RenderingContext} glContext  */
function setGL( glContext ) {
    gl = glContext
}

export class GL {
    /** @param {WebGL2RenderingContext} gl WebGL2 Context */
    constructor( gl ) {
        this.gl = gl
    }

    /** 
     * @template {Function|{[key:string]:Function}} T
     * @param {T} constructor Class or Key-Value pair of classes to inject 
     * @returns {T} 
     **/
    inject( constructor ) {
        if ( typeof constructor === "function" ) return this._inject( constructor )
        return Object.fromEntries( Object.entries( constructor ).map( ( [key, value] ) => [key, this._inject( value )] ) )
    }

    /** 
     * @private
     * @template {Function} T
     * @param {T} constructor Class to inject 
     * @returns {T} 
     **/
    _inject( constructor ) {
        return new Proxy( constructor, {
            gl: this.gl,
            construct( target, args, newTarget ) {
                const instance = Reflect.construct( target, args, newTarget )
                instance.gl = this.gl
                return instance
            }
        } )
    }
}

/*

P = Object.getPrototypeOf
class a { constructor() { this.a = "a" } }
class b extends a { constructor() { super(); this.b = "b" } }
class c extends b { constructor() { super(); this.c = "c" } }
 
*/


const warnings = new Map
/** @param {string} message @param {number} count  */
function warn( message, count = 10 ) {
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

export { gl, setGL, warn }