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

        this.function = WebGL2RenderingContext.prototype[functionName]
    }
}

export class BoundUniform {
    /** @param {Uniform} uniform @param {WebGLUniformLocation?} uniformLocation */
    constructor( uniform, uniformLocation ) {
        this.uniform = uniform
        this.function = uniform.function.bind( this.gl )
        this.location = uniformLocation
        this.active = uniformLocation !== null
    }

    /** @param {number|Iterable<number>|()=>number|Iterable<number>} value @param {boolean} [transpose] */
    upload( value, transpose = false ) {
        if ( !this.active ) return
        value = typeof value === "function" ? value() : value
        this.uniform.type === "mat"
            ? this.function( this.location, transpose, value )
            : this.function( this.location, value )
    }
}