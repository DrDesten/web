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

class Square {
    constructor() {
        this.position = [0, 0, 0]
        this.size = 1
    }

    toArray() {
        const array = new Float32Array( [ 
            // Vertex Positions and Texture Coordinates Interlieved
            -this.size + this.position[0], -this.size + this.position[1], this.position[2],
            -1, -1,
            -this.size + this.position[0], +this.size + this.position[1], this.position[2],
            -1, +1, 
            +this.size + this.position[0], -this.size + this.position[1], this.position[2],
            +1, -1,
            +this.size + this.position[0], +this.size + this.position[1], this.position[2],
            +1, +1,
        ] )
        return array
    }
    get offsets() {
        return {
            positionOffset: 0 * 4, coordinateOffset: 3 * 4,
            stride: (3 * 4) + (2 * 4),
        }
    }
}
class ShaderProgram {
    /** @param {WebGLRenderingContext} RenderingContext @param {string} vertexShaderSource @param {string} fragmentShaderSource */
    constructor( RenderingContext, vertexShaderSource, fragmentShaderSource ) {
        this.gl = RenderingContext
        this.vertex = vertexShaderSource
        this.fragment = fragmentShaderSource
        this.program = this.compileShaderProgram( vertexShaderSource, fragmentShaderSource )
    }

    createShader( type, source ) {
        const shader = this.gl.createShader( type )
        this.gl.shaderSource( shader, source )
        this.gl.compileShader( shader )

        // See if it compiled successfully
        if ( !this.gl.getShaderParameter( shader, this.gl.COMPILE_STATUS ) ) {
            const log = this.gl.getShaderInfoLog( shader )
            this.gl.deleteShader( shader )
            throw new Error( `An error occurred compiling a shader program: ${log}` )
        }
        return shader
    }
    compileShaderProgram( vertexShaderSource, fragmentShaderSource ) {
        const vertexShader = this.createShader( this.gl.VERTEX_SHADER, vertexShaderSource )
        const fragmentShader = this.createShader( this.gl.FRAGMENT_SHADER, fragmentShaderSource )

        const shaderProgram = this.gl.createProgram()
        this.gl.attachShader( shaderProgram, vertexShader )
        this.gl.attachShader( shaderProgram, fragmentShader )
        this.gl.linkProgram( shaderProgram )


        // If creating the shader program failed, alert
        if ( !this.gl.getProgramParameter( shaderProgram, this.gl.LINK_STATUS ) ) {
            throw new Error( `Unable to link a shader program: ${this.gl.getProgramInfoLog( shaderProgram )}` )
        }

        return shaderProgram
    }

    getAttribute( attribute ) {
        return this.gl.getAttribLocation( this.program, attribute )
    }
    getUniform( uniform ) {
        return this.gl.getUniformLocation( this.program, uniform )
    }

    getStandardAttributes() {
        return {
            vertexPosition: this.getAttribute( "vertexPosition" ),
            textureCoordinate: this.getAttribute( "textureCoordinate" ),
        }
    }
    getStandardUniforms() {
        return {
            modelViewMatrix: this.getUniform( "modelViewMatrix" ),
            projectionMatrix: this.getUniform( "projectionMatrix" ),
            cameraPosition: this.getUniform( "cameraPosition" ),
        }
    }


    /** @returns {Object<string,number>} */
    getAttributes() {
        const attributesIterator = this.vertex.matchAll(/attribute\s+\S+\s+(\w+(?:\s*,\s*\w+)*)/g)
        const attributes = {}
        for (const match of attributesIterator) 
            for (const attribute of match[1].split(/\s*,\s*/g))
                attributes[attribute] = this.getAttribute(attribute)
        return attributes
    }
    /** @returns {Object<string,WebGLUniformLocation|null>} */
    getUniforms() {
        const uniformsIterator = this.vertex.matchAll(/uniform\s+\S+\s+(\w+(?:\s*,\s*\w+)*)/g)
        const uniforms = {}
        for (const match of uniformsIterator) 
            for (const uniform of match[1].split(/\s*,\s*/g))
                console.log(uniform, uniforms[uniform] = this.getUniform(uniform))
        return uniforms
    }
}


class Circle {
    constructor() {
        // Quad Generation
        /** @type {[number,number,number]} 3d position of the Circle */
        this.position = [0,0,0]
        /** @type {number} size of the Circle */
        this.scale = 1

        // Circle 
        /** @type {[number,number,number,number]} color of the Circle */
        this.fill = [1,1,1,1]
        /** @type {[[number,number],[number,number],[number,number],[number,number]]} keypoints for the shape the Circle */
        this.keypoints = [[0,0],[0,0],[0,0],[0,0]]
    }

    vertexData() {
        const positions = [ 
            // Vertex Positions
            [-this.scale + this.position[0], -this.scale + this.position[1], this.position[2]],
            [-this.scale + this.position[0], +this.scale + this.position[1], this.position[2]],
            [+this.scale + this.position[0], -this.scale + this.position[1], this.position[2]],
            [+this.scale + this.position[0], +this.scale + this.position[1], this.position[2]],
        ]
        const coords = [
            // Texture Coordinates
            [-1, -1],
            [-1, +1], 
            [+1, -1],
            [+1, +1],
        ]
        const fills = new Array(4).fill().map(_ => [...this.fill])
        const keypoints = new Array(4).fill().map(_ => this.keypoints.map(a => [...a]))
        return new Array(4).fill().map((_,i) => {
            return {
                position: positions[i],
                coord: coords[i],
                fill: fills[i],
                keypoints: keypoints[i],
            }
        })
    }

    asBuffer() {
        // For each vertex:
        // 3 * [4] bytes position (float)
        // 2 * [1] bytes texture coordinates (byte)
        // 4 * [1] bytes color (unsigned byte)
        // 4 * 2 * [2] bytes keypoints (short)
        // TOTAL 34 bytes
        // Because stride has to be a multiple of gl.FLOAT (the largest type), the size needs to be padded to 36 bytes
        const buffer = new ArrayBuffer(36 * 4)
        const dataView = new DataView(buffer)
        const vertecies = this.vertexData()

        for (let i = 0; i < vertecies.length; i++) {
            const offset = i * 36
            const vertex = vertecies[i]
            console.log(vertex)

            dataView.setFloat32(offset + 0, vertex.position[0], true)
console.log(dataView.getFloat32(offset + 0, true))
            dataView.setFloat32(offset + 4, vertex.position[1], true)
console.log(dataView.getFloat32(offset + 4, true))
            dataView.setFloat32(offset + 8, vertex.position[2], true)
console.log(dataView.getFloat32(offset + 8, true))

            dataView.setInt8(offset + 12, vertex.coord[0] * 127)
console.log(dataView.getInt8(offset + 12))
            dataView.setInt8(offset + 13, vertex.coord[1] * 127)
console.log(dataView.getInt8(offset + 13))

            dataView.setUint8(offset + 14, vertex.fill[0] * 255)
console.log(dataView.getUint8(offset + 14))
            dataView.setUint8(offset + 15, vertex.fill[1] * 255)
console.log(dataView.getUint8(offset + 15))
            dataView.setUint8(offset + 16, vertex.fill[2] * 255)
console.log(dataView.getUint8(offset + 16))
            dataView.setUint8(offset + 17, vertex.fill[3] * 255)
console.log(dataView.getUint8(offset + 17))

            dataView.setInt16(offset + 18, vertex.keypoints[0][0] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 18, true))
            dataView.setInt16(offset + 20, vertex.keypoints[0][1] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 20, true))
            dataView.setInt16(offset + 22, vertex.keypoints[1][0] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 22, true))
            dataView.setInt16(offset + 24, vertex.keypoints[1][1] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 24, true))
            dataView.setInt16(offset + 26, vertex.keypoints[2][0] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 26, true))
            dataView.setInt16(offset + 28, vertex.keypoints[2][1] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 28, true))
            dataView.setInt16(offset + 30, vertex.keypoints[3][0] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 30, true))
            dataView.setInt16(offset + 32, vertex.keypoints[3][1] * ((1<<15)-1), true)
console.log(dataView.getInt16(offset + 32, true))
        }

        return buffer
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
attribute vec2 textureCoordinate;
attribute vec2 keypoint1;
attribute vec2 keypoint2;
attribute vec2 keypoint3;
attribute vec2 keypoint4;
attribute vec4 vertexColor;

uniform mat4 modelViewMatrix, projectionMatrix;

varying highp vec4 color;
varying highp vec2 coord;
varying highp vec2 kp1;
varying highp vec2 kp2;
varying highp vec2 kp3;
varying highp vec2 kp4;

void main() {
    color = vertexColor;
    coord = textureCoordinate;
    kp1 = keypoint1, kp2 = keypoint2, kp3 = keypoint3, kp4 = keypoint4;

    gl_Position = projectionMatrix * modelViewMatrix * vertexPosition;
}
`

const fragmentShaderSource = `
varying highp vec4 color;
varying highp vec2 coord;
varying highp vec2 kp1;
varying highp vec2 kp2;
varying highp vec2 kp3;
varying highp vec2 kp4;

void main() {
    highp vec2 sum = kp1 + kp2 + kp3 + kp4;
    gl_FragColor = vec4(color.rgb + length(sum), 1.0);
    gl_FragColor.xy += coord;
}
`

const circle = new Circle
const circleShader = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource )
const circleProgram = {
    program: circleShader.program,
    attributeLocations: circleShader.getAttributes(),
    uniformLocations: circleShader.getUniforms(),
}
console.log( circleProgram )

const circleVBO = gl.createBuffer()
const circleGeometryBuffer = circle.asBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER, circleVBO)
gl.bufferData(gl.ARRAY_BUFFER, circleGeometryBuffer, gl.STATIC_DRAW)

console.log("Vertex Position")
gl.enableVertexAttribArray(circleProgram.attributeLocations.vertexPosition)
gl.vertexAttribPointer(
    circleProgram.attributeLocations.vertexPosition,
    3, gl.FLOAT, false, 36, 0,
)

console.log("Texture Coordinate")
gl.vertexAttribPointer(
    circleProgram.attributeLocations.textureCoordinate,
    2, gl.BYTE, true, 36, 12,
)
gl.enableVertexAttribArray(circleProgram.attributeLocations.textureCoordinate)

console.log("Vertex Color")
gl.vertexAttribPointer(
    circleProgram.attributeLocations.vertexColor,
    4, gl.UNSIGNED_BYTE, true, 36, 14,
)
gl.enableVertexAttribArray(circleProgram.attributeLocations.vertexColor)

console.log("Keypoint 1")
gl.vertexAttribPointer(
    circleProgram.attributeLocations.keypoint1,
    2, gl.SHORT, true, 36, 18,
)
gl.enableVertexAttribArray(circleProgram.attributeLocations.keypoint1)

console.log("Keypoint 2")
gl.vertexAttribPointer(
    circleProgram.attributeLocations.keypoint2,
    2, gl.SHORT, true, 36, 22,
)
gl.enableVertexAttribArray(circleProgram.attributeLocations.keypoint2)

console.log("Keypoint 3")
gl.vertexAttribPointer(
    circleProgram.attributeLocations.keypoint3,
    2, gl.SHORT, true, 36, 26,
)
gl.enableVertexAttribArray(circleProgram.attributeLocations.keypoint3)

console.log("Keypoint 4")
gl.vertexAttribPointer(
    circleProgram.attributeLocations.keypoint4,
    2, gl.SHORT, true, 36, 30,
)
gl.enableVertexAttribArray(circleProgram.attributeLocations.keypoint4)

/* 
const squareGeometry = new Square
const squareShader = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource )
const squareProgram = {
    program: squareShader.program,
    attributeLocations: squareShader.getStandardAttributes(),
    uniformLocations: squareShader.getStandardUniforms(),
}

const squareGeometryArray = new Float32Array( squareGeometry.toArray() )
const squareGeometryBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, squareGeometryBuffer)
gl.bufferData(gl.ARRAY_BUFFER, squareGeometryArray, gl.DYNAMIC_DRAW)
gl.enableVertexAttribArray(squareProgram.attributeLocations.vertexPosition)
gl.vertexAttribPointer(
    squareProgram.attributeLocations.vertexPosition,
    3, gl.FLOAT, false, squareGeometry.offsets.stride, squareGeometry.offsets.positionOffset,
)
gl.enableVertexAttribArray(squareProgram.attributeLocations.textureCoordinate)
gl.vertexAttribPointer(
    squareProgram.attributeLocations.textureCoordinate,
    2, gl.FLOAT, true, squareGeometry.offsets.stride, squareGeometry.offsets.coordinateOffset,
)


console.log( squareGeometryArray ) */


{

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
    gl.useProgram( circleShader.program )

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        circleProgram.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    )
    gl.uniformMatrix4fv(
        circleProgram.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    )

    {
        const offset = 0
        const vertexCount = 4
        gl.drawArrays( gl.TRIANGLE_STRIP, offset, vertexCount )
    }
}