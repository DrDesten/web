import { Attribute } from "./attribute.js"
import { GL, warn } from "./gl.js"
import { BoundUniform, Uniform } from "./uniform.js"

export class Program {
    /** @param {WebGLProgram} program @param {Attribute[]} [attributes] @param {Uniform[]} [uniforms] */
    constructor( program, attributes = [], uniforms = [] ) {
        /** @type {WebGLProgram} */
        this.program = program
        /** @type {WebGLVertexArrayObject} */
        this.vao = this.gl.createVertexArray()
        /** @type {Attribute[]} */
        this.attributes = attributes
        /** @type {{[name: string]: number}} */
        this.attributeLocations = {}
        /** @type {Uniform[]} */
        this.uniforms = uniforms
        /** @type {{[name: string]: BoundUniform}} */
        this.boundUniforms = {}
    }

    // General

    activate() {
        this.gl.bindVertexArray( this.vao )
        this.gl.useProgram( this.program )
    }
    deactivate() {
        this.gl.bindVertexArray( null )
        this.gl.useProgram( null )
    }

    // Setup

    /** @param {...Attribute} attributes */
    addAttribute( ...attributes ) {
        this.attributes.push( ...attributes )
    }
    /** @param {...Uniform} uniforms */
    addUniform( ...uniforms ) {
        this.uniforms.push( ...uniforms )
    }

    getAttributeLocations() {
        this.attributes.forEach( a => {
            this.attributeLocations[a.name] = this.gl.getAttribLocation( this.program, a.name )
        } )
    }
    getUniformLocations() {
        this.uniforms.forEach( u => {
            this.boundUniforms[u.name] = new ( GL.inject( this.gl, BoundUniform ) )( u, this.gl.getUniformLocation( this.program, u.name ) )
        } )
    }
    getLocations() {
        this.getAttributeLocations()
        this.getUniformLocations()
    }
    enableAttributes() {
        this.attributes.forEach( attribute => {
            const { buffer, name, size, type, normalized, stride, offset, divisor } = attribute
            const location = this.attributeLocations[name]
            if ( location === -1 ) return

            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer )

            if ( size instanceof Array ) { // Matrix Attribute
                const [col, row] = size
                for ( let i = 0; i < col; i++ ) {
                    const loc = location + i
                    const offs = offset + i * row * 4
                    this.gl.enableVertexAttribArray( loc )
                    this.gl.vertexAttribPointer( loc, row, type, normalized, stride, offs )
                    if ( divisor ) this.gl.vertexAttribDivisor( loc, divisor )
                }
            } else { // Vector / Scalar Attribute
                this.gl.enableVertexAttribArray( location )
                this.gl.vertexAttribPointer( location, size, type, normalized, stride, offset )
                if ( divisor ) this.gl.vertexAttribDivisor( location, divisor )
            }

        } )
    }

    // Runtime

    /** @param {string} name @param {number|Iterable<number>|()=>number|Iterable<number>} value @param {boolean} [transpose]  */
    uploadUniform( name, value, transpose ) {
        const boundUniform = this.boundUniforms[name]
        if ( boundUniform ) boundUniform.upload( value, transpose )
        else warn( `Uniform '${name}' does not exist on program` )
    }
}