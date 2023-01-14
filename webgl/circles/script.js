import { mat4 } from "./index.js"
import { Circles } from "./circles.js"


function drawScene( programInfo, buffers ) {
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 ) // Clear to black, fully opaque
    gl.clearDepth( 1.0 ) // Clear everything
    gl.enable( gl.DEPTH_TEST ) // Enable depth testing
    gl.depthFunc( gl.LEQUAL ) // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = ( 45 * Math.PI ) / 180 // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective( projectionMatrix, fieldOfView, aspect, zNear, zFar )

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create()

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -6.0]
    ) // amount to translate


    // Tell WebGL to use our program when drawing
    gl.useProgram( programInfo.program )

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    )
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    )


    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    buffers.bindVertexPosition( programInfo.attribLocations.vertexPosition )

    {
        const offset = 0
        const vertexCount = 4
        gl.drawArrays( gl.TRIANGLE_STRIP, offset, vertexCount )
    }

}


/** @type {HTMLCanvasElement} */
const canvas = document.querySelector( "#canvas" )
const gl = canvas.getContext( "webgl" )
const Engine = new Circles( gl )
//const CanvasHandler = new Circles.CanvasHandler(canvas, 0.5)

// Only continue if WebGL is available and working
if ( gl === null ) {
    alert( "Unable to initialize WebGL. Your browser or machine may not support it." )
    throw new Error( "Unable to initialize WebGL." )
}


// Set clear color to black, fully opaque
gl.clearColor( 0.0, 0.0, 0.0, 1.0 )
// Clear the color buffer with specified clear color
gl.clear( gl.COLOR_BUFFER_BIT )


const vertexShaderSource = `
attribute vec4 vertexPosition;
uniform mat4 modelViewMatrix, projectionMatrix;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vertexPosition;
}
`

const fragmentShaderSource = `
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`


//const shaderProgram = new Engine.Shader( vertexShaderSource, fragmentShaderSource )
const shaderProgram = Engine.Shader.solid([1])

// Collect all the info needed to use the shader program.
// Look up which attribute our shader program is using
// for vertexPosition and look up uniform locations.
const programInfo = {
    program: shaderProgram.program,
    attribLocations: {
        vertexPosition: shaderProgram.getAttribute( "vertexPosition" ),
    },
    uniformLocations: {
        projectionMatrix: shaderProgram.getUniform( "projectionMatrix" ),
        modelViewMatrix: shaderProgram.getUniform( "modelViewMatrix" ),
    },
}


const quad = new Engine.Geometry.Quad()

// Draw the scene
drawScene( programInfo, quad )
