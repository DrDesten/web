import * as attribute from "./attribute.js"
import * as uniform from "./uniform.js"
import * as program from "./program.js"
import * as shader from "./shader.js"

export const Classes = { ...attribute, ...program, ...shader, ...uniform }

/**
 * @template T
 * @typedef {T} Constructed
 * @typedef {new(...args: any[]) => T} Constructor
 **/
/**
 * @template T
 * @typedef {Constructor<T> | Constructed<T>} GLInjectable
 **/

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
     * @template {GLInjectable|{[key:string]:GLInjectable}} T
     * @param {T} object Class, Object or Object of Classes and Objects to inject 
     * @returns {T} 
     **/
    inject( object ) {
        if ( Object.getPrototypeOf( object ) === Object.prototype || Object.getPrototypeOf( object ) === null ) {
            // Object is not a custom object
            return Object.fromEntries( Object.entries( object ).map( ( [key, value] ) => [key, this.injectSingle( value )] ) )
        } else {
            // Object is a custom object or a constructor
            return this.injectSingle( object )
        }
    }

    /** 
     * @private
     * @template {GLInjectable} T
     * @param {T} object Class or Object to inject 
     * @returns {T} 
     **/
    injectSingle( object ) {
        if ( typeof object === "function" ) {
            return this.injectConstructor( object )
        } else {
            return this.injectObject( object )
        }
    }

    /** 
     * @private
     * @template {Constructor} T
     * @param {T} constructor Class to inject 
     * @returns {T} 
     **/
    injectConstructor( constructor ) {
        return new Proxy( constructor, {
            gl: this.gl,
            construct( target, args, newTarget ) {
                const instance = Reflect.construct( target, args, newTarget )
                instance.gl = this.gl
                return instance
            }
        } )
    }
    /** 
     * @private
     * @template {Constructed} T
     * @param {T} object Object to inject 
     * @returns {T} 
     **/
    injectObject( object ) {
        const copy = Object.setPrototypeOf( structuredClone( object ), Object.getPrototypeOf( object ) )
        copy.gl = this.gl
        return copy
    }
}

/*

console.log( Classes.constructor, attribute.constructor, attribute )
console.log( Object.getPrototypeOf( Classes ), Object.getPrototypeOf( attribute ) )
console.log( Object.getPrototypeOf( Classes ) === Object.prototype, Object.getPrototypeOf( attribute ) )

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