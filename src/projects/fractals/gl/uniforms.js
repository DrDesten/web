import { gl } from "./gl.js"

export class Uniform {
    /** @param {string} name @param {"int"|"uint"|"float"|"mat"} type @param {number} [d1] @param {number} [d2] */
    constructor( name, type, d1 = 1, d2 = undefined ) {
        this.name = name
        this.type = type
        this.d1 = d1
        this.d2 = d2

        let functionName = type === "mat"
            ? `uniformMatrix${d1}${d2 === undefined ? '' : 'x' + d2}f`
            : `uniform${d1}${{ int: "i", uint: "ui", float: "f" }[type]}`
        if ( d1 > 1 ) functionName += 'v'

        this.function = gl[functionName].bind( gl )
    }
}

export class BoundUniform {
    /** @param {Uniform} uniform @param {WebGLUniformLocation?} uniformLocation */
    constructor( uniform, uniformLocation ) {
        this.uniform = uniform
        this.location = uniformLocation
        this.active = uniformLocation !== null
    }

    /** @param {number|Iterable<number>} value @param {boolean} [transpose] */
    upload( value, transpose = false ) {
        if ( !this.active ) return
        this.uniform.type === "mat"
            ? this.uniform.function( this.location, transpose, value )
            : this.uniform.function( this.location, value )
    }
}