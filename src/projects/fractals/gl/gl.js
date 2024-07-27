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
        return GL.inject( this.gl, object )
    }

    /** 
     * @template {GLInjectable|{[key:string]:GLInjectable}} T
     * @param {WebGL2RenderingContext} gl
     * @param {T} object Class, Object or Object of Classes and Objects to inject 
     * @returns {T} 
     **/
    static inject( gl, object ) {
        if ( Object.getPrototypeOf( object ) === Object.prototype || Object.getPrototypeOf( object ) === null ) {
            // Object is not a custom object
            return Object.fromEntries( Object.entries( object ).map( ( [key, value] ) => [key, GL.injectSingle( gl, value )] ) )
        } else {
            // Object is a custom object or a constructor
            return GL.injectSingle( gl, object )
        }
    }

    /** 
     * @private
     * @template {GLInjectable} T
     * @param {WebGL2RenderingContext} gl
     * @param {T} object Class or Object to inject 
     * @returns {T} 
     **/
    static injectSingle( gl, object ) {
        if ( typeof object === "function" ) {
            return GL.injectConstructor( gl, object )
        } else {
            return GL.injectObject( gl, object )
        }
    }

    /** 
     * @private
     * @template {Constructor} T
     * @param {WebGL2RenderingContext} gl
     * @param {T} constructor Class to inject 
     * @returns {T} 
     **/
    static injectConstructor( gl, constructor ) {
        return new Proxy( constructor, {
            gl: gl,
            construct( target, args, newTarget ) {
                // In order to inject the value before calling the constructor, I have to inject it into the prototype first
                // Only after construction can I inject it into the instance itself
                // After construction, I restore the class prototype

                // Get potentially overwritten property from prototype
                const property = Object.getOwnPropertyDescriptor( target.prototype, "gl" )
                // Inject into prototype
                target.prototype.gl = this.gl
                // Construct Object
                const instance = Reflect.construct( target, args, newTarget )
                // Inject into instance
                instance.gl = this.gl
                // Restore prototype
                if ( property ) Object.defineProperty( target.prototype, "x", property )
                else delete target.prototype.x
                return instance
            }
        } )
    }
    /** 
     * @private
     * @template {Constructed} T
     * @param {WebGL2RenderingContext} gl
     * @param {T} object Object to inject 
     * @returns {T} 
     **/
    static injectObject( gl, object ) {
        const copy = Object.setPrototypeOf( structuredClone( object ), Object.getPrototypeOf( object ) )
        copy.gl = gl
        return copy
    }
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