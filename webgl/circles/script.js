import { mat4 } from "./index.js"
import { Circles } from "./circles.js"

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

    /** @param {string} attribute */
    getAttribute( attribute ) {
        return this.gl.getAttribLocation( this.program, attribute )
    }
    /** @param {string} uniform */
    getUniform( uniform ) {
        return this.gl.getUniformLocation( this.program, uniform )
    }

    /** @returns {Object<string,number>} Returns an Object containing all used attributes with their locations of a given shader program */
    getAttributes() {
        const attributesIterator = this.vertex.matchAll( /attribute\s+\S+\s+(\w+(?:\s*,\s*\w+)*)/g )
        const attributes = {}
        for ( const match of attributesIterator )
            for ( const attribute of match[1].split( /\s*,\s*/g ) ) {
                let attributeLocation = this.getAttribute( attribute )
                if ( attributeLocation !== -1 ) attributes[attribute] = attributeLocation
            }
        return attributes
    }
    /** @returns {Object<string,WebGLUniformLocation>} Returns an Object containing all used uniforms with their locations of a given shader program  */
    getUniforms() {
        // merges multiple iterators
        const uniformsIterator = ( function* ( ...iterators ) { for ( const iterator of iterators ) yield* iterator } )(
            this.vertex.matchAll( /uniform\s+\S+\s+(\w+(?:\s*,\s*\w+)*)/g ),
            this.fragment.matchAll( /uniform\s+\S+\s+(\w+(?:\s*,\s*\w+)*)/g ),
        )
        const uniforms = {}
        for ( const match of uniformsIterator )
            for ( const uniform of match[1].split( /\s*,\s*/g ) ) {
                let uniformLocation = this.getUniform( uniform )
                if ( uniformLocation !== null ) uniforms[uniform] = uniformLocation
            }
        return uniforms
    }
}

class VBO {
    constructor() {
        /** @type {VBOVertex[]} */
        this.vertecies = []
        /** @type {ArrayBuffer|null} */
        this.buffer = null
        this.bufferMapping = {
            stride: NaN, vertexCount: NaN,
            attributes: {},
        }
        this.bufferInfo = {}
    }

    /** @param {VBOVertex} vertex */
    addVertex( vertex ) {
        this.vertecies.push( vertex )
    }

    createBuffer() {
        if ( this.vertecies.length === 0 ) return new ArrayBuffer( 0 )

        // Get all vertex attributes (they have to be the same for all vertecies, so well take them from the first index)
        const attributes = []
        for ( const attribute in this.vertecies[0].attributes )
            attributes.push( this.vertecies[0].attributes[attribute] )
        console.log( attributes )

        // Calculate the required size per vertex
        const requiredSize = attributes.reduce(
            ( acc, attribute ) => acc + attribute.dimension * VBO.TypeSize[attribute.type], 0
        )
        console.log( requiredSize )

        // Add padding for the largest type
        const largestType = attributes.reduce(
            ( acc, attribute ) => Math.max( acc, VBO.TypeSize[attribute.type] ), 0
        )
        const bufferSize = Math.ceil( requiredSize / largestType ) * largestType
        this.bufferInfo.stride = bufferSize

        console.log( largestType, bufferSize )

        this.bufferMapping.stride = bufferSize
        this.bufferMapping.vertexCount = this.vertecies.length

        // Create an ArrayBuffer and a DataView of the appropiate size
        const buffer = new ArrayBuffer( bufferSize * this.vertecies.length )
        const dataView = new DataView( buffer )
        for ( let i = 0; i < this.vertecies.length; i++ ) {
            const vertex = this.vertecies[i]
            // Offset for the entire vertex
            const vertexOffset = i * 36
            // Offset for the individual values
            let offset = 0

            for ( const attributeName in vertex.attributes ) {
                // Get attribute and the DataView set*() function for the type
                const attribute = vertex.attributes[attributeName]
                const func = VBO.DVTypeFunction[attribute.type]
                const endian = VBO.DVTypeEndianness[attribute.type]

                if (i === 0) this.bufferMapping.attributes[attributeName] = {
                    offset: offset,
                    dimension: attribute.dimension,
                    type: attribute.type,
                    normalize: attribute.normalize,
                }

                for ( let value of attribute.data ) {
                    if ( attribute.normalize ) value = VBO.TypeNormalize[attribute.type]( value )
                    dataView[func]( vertexOffset + offset, value, endian )
                    offset += VBO.TypeSize[attribute.type]
                }
            }
        }

        console.log(this.bufferMapping)
        this.buffer = buffer
        return buffer
    }

    /** @param {WebGLRenderingContext} gl */
    bindBuffer( gl ) {
        if (this.buffer === null) return null

        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.buffer, gl.STATIC_DRAW)

        return buffer
    }

    /** @param {WebGLRenderingContext} gl @param {ShaderProgram} shader */
    bindAttributes( gl, shader ) {
        const stride = this.bufferInfo.stride
        const attributeLocations = shader.getAttributes()

        for (const attribute in attributeLocations) {
            //console.log(attribute)
            const info = this.bufferMapping.attributes[attribute]
            gl.enableVertexAttribArray(attributeLocations[attribute])
            gl.vertexAttribPointer(
                attributeLocations[attribute],
                info.dimension, gl[VBO.GLType[info.type]], info.normalize, stride, info.offset
            )
        }
    }

    static get TypeSize() {
        return {
            i8: 1, u8: 1,
            i16: 2, u16: 2,
            i32: 4, u32: 4,
            f32: 4,
        }
    }
    static get TypeNormalize() {
        return {
            i8: x => x * ( 2 ** 7 - 1 ),
            u8: x => x * ( 2 ** 8 - 1 ),
            i16: x => x * ( 2 ** 15 - 1 ),
            u16: x => x * ( 2 ** 16 - 1 ),
            i32: x => x * ( 2 ** 31 - 1 ),
            u32: x => x * ( 2 ** 32 - 1 ),
            f32: x => x,
        }
    }
    static get GLType() {
        return {
            i8: "BYTE", u8: "UNSIGNED_BYTE",
            i16: "SHORT", u16: "UNSIGNED_SHORT",
            i32: "INT", u32: "UNSIGNED_INT",
            f32: "FLOAT",
        }
    }
    static get DVTypeFunction() {
        return {
            i8: "setInt8", u8: "setUint8",
            i16: "setInt16", u16: "setUint16",
            i32: "setInt32", u32: "setUint32",
            f32: "setFloat32",
        }
    }
    static get DVTypeEndianness() {
        return {
            i8: undefined, u8: undefined,
            i16: true, u16: true,
            i32: true, u32: true,
            f32: true,
        }
    }

    /**
     * @typedef VBOVertex
     * @property {Object<string,{data: number[], dimension: number, type: string, normalize: boolean}} attributes
     * @property {(attribute: string, data: number|number[], type: string, normalize: boolean=true) => VBOVertex} addAttribute
     */
    /** @return {VBOVertex} */
    static get Vertex() {
        return class Vertex {
            constructor() {
                this.attributes = {}
            }
            addAttribute( attribute, data, type, normalize = true ) {
                if ( typeof data === "number" ) data = [data]
                if ( type[0] === "f" ) normalize = false
                this.attributes[attribute] = {
                    data: data,
                    dimension: data.length,
                    type: type,
                    normalize: normalize,
                }
                return this
            }
        }
    }
}

class Circle {
    constructor() {
        // Quad Generation
        /** @type {[number,number,number]} 3d position of the Circle */
        this.position = [0, 0, 0]
        /** @type {number} size of the Circle */
        this.scale = 1

        // Circle 
        /** @type {[number,number,number,number]} color of the Circle */
        this.fill = [1, 1, 1, 1]
        /** @type {[[number,number],[number,number],[number,number],[number,number]]} keypoints for the shape the Circle */
        this.keypoints = [[0, 0], [0, 0], [0, 0], [0, 0]]
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
        const fills = new Array( 4 ).fill().map( _ => [...this.fill] )
        const keypoints = new Array( 4 ).fill().map( _ => this.keypoints.map( a => [...a] ) )

        const vbo = new VBO
        for ( let i = 0; i < 4; i++ ) {
            vbo.addVertex(
                new VBO.Vertex()
                    .addAttribute( "vertexPosition", positions[i], "f32" )
                    .addAttribute( "textureCoordinate", coords[i], "i8" )
                    .addAttribute( "vertexColor", fills[i], "u8" )
                    .addAttribute( "keypoint1", keypoints[i][0], "i16" )
                    .addAttribute( "keypoint2", keypoints[i][1], "i16" )
                    .addAttribute( "keypoint3", keypoints[i][2], "i16" )
                    .addAttribute( "keypoint4", keypoints[i][3], "i16" )
            )
        }
        return vbo
    }

    vbo() { return this.vertexData() }

    asBuffer() {
        return this.vertexData().createBuffer()
    }
}

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector( "#canvas" )
canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight
const gl = canvas.getContext( "webgl2" )
const Engine = new Circles( gl )
//const CanvasHandler = new Circles.CanvasHandler(canvas, 0.5)

// Only continue if WebGL is available and working
if ( gl === null ) {
    alert( "Unable to initialize WebGL. Your browser or machine may not support it." )
    throw new Error( "Unable to initialize WebGL." )
}




const vertexShaderSource = `

#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

attribute vec4 vertexPosition;
attribute vec2 textureCoordinate;
attribute vec2 keypoint1, keypoint2, keypoint3, keypoint4;
attribute vec4 vertexColor;

uniform mat4 modelViewMatrix, projectionMatrix;

varying vec4 color;
varying vec2 coord;
varying vec2 kp1;
varying vec2 kp2;
varying vec2 kp3;
varying vec2 kp4;

void main() {
    color = vertexColor;
    coord = textureCoordinate;
    kp1 = keypoint1, kp2 = keypoint2, kp3 = keypoint3, kp4 = keypoint4;

    gl_Position = projectionMatrix * modelViewMatrix * vertexPosition;
}
`

const fragmentShaderSource = `

#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

varying vec4 color;
varying vec2 coord;
varying vec2 kp1;
varying vec2 kp2;
varying vec2 kp3;
varying vec2 kp4;

struct CircleData {
    vec2 kp1, kp2, kp3, kp4;    
    vec3 fillColor;
};

struct FragData {
    vec4 color;
};

#define SQRT_SLOPE_FACTOR .2
float sqrtPositiveSlope( float x ) {
    return x > 0. ? 
        sqrt( x + SQRT_SLOPE_FACTOR ) * 2. * sqrt(SQRT_SLOPE_FACTOR) - sqrt(SQRT_SLOPE_FACTOR) * 2. * sqrt(SQRT_SLOPE_FACTOR)
        : x;
}

#define LOG_SLOPE_FACTOR 0.1
float logPositiveSlope( float x ) {
    return x > 0. ?
        log( x + LOG_SLOPE_FACTOR ) * LOG_SLOPE_FACTOR - log(LOG_SLOPE_FACTOR) * LOG_SLOPE_FACTOR
        : x;
}

FragData RenderCircle( vec2 coord, CircleData data ) {
    
    float sdf = 0.0;
    sdf += logPositiveSlope( length(coord - data.kp1) - 0.5 );
    sdf += logPositiveSlope( length(coord - data.kp2) - 0.5 );
    sdf += logPositiveSlope( length(coord - data.kp3) - 0.5 );
    sdf += logPositiveSlope( length(coord - data.kp4) - 0.5 );
       
    float inside = float(sdf < 0.);
    //inside = 0.5 - sdf;
    
    vec3 color = data.fillColor;
    return FragData(vec4(color, inside));
}

void main() {
    FragData circle = RenderCircle( coord, CircleData(
        kp1, kp2, kp3, kp4,
        color.rgb
    ));

    gl_FragColor = vec4(circle.color.rgba);
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

const vboObject = circle.vbo()
const buffer = vboObject.createBuffer()
const vbo = vboObject.bindBuffer(gl)
vboObject.bindAttributes(gl, circleShader)

{

    gl.clearColor( .5, .5, .5, 1 ) // Clear to black, fully opaque
    gl.clearDepth( 1.0 ) // Clear everything
    gl.enable( gl.DEPTH_TEST ) // Enable depth testing
    gl.depthFunc( gl.LEQUAL ) // Near things obscure far things
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Clear the canvas before we start drawing on it.

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = ( 15 * Math.PI ) / 180 // in radians
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
        [-0.0, 0.0, -10.0]
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