import { gl } from "./gl.js"

function vertex( source ) {
    return `
#version 300 es
precision highp float;
precision highp int;
${source}`.trim()
}

function fragment( source ) {
    return `
#version 300 es
precision highp float;
precision highp int;
${source}`.trim()
}

export class Shader {
    constructor( vertexShaderSource, fragmentShaderSource ) {
        this.vertexShaderSource = vertexShaderSource
        this.fragmentShaderSource = fragmentShaderSource
    }

    static compile( vertexShaderSource, fragmentShaderSource ) {
        const vshSource = vertex( vertexShaderSource )
        const vsh = gl.createShader( gl.VERTEX_SHADER )
        gl.shaderSource( vsh, vshSource )
        gl.compileShader( vsh )

        const fshSource = fragment( fragmentShaderSource )
        const fsh = gl.createShader( gl.FRAGMENT_SHADER )
        gl.shaderSource( fsh, fshSource )
        gl.compileShader( fsh )

        const program = gl.createProgram()
        gl.attachShader( program, vsh )
        gl.attachShader( program, fsh )
        gl.linkProgram( program )

        return program
    }
    compile() {
        return Shader.compile( this.vertexShaderSource, this.fragmentShaderSource )
    }
}
