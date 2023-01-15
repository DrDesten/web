
export class Circles {
    /** @param {WebGLRenderingContext} RenderingContext */
    constructor( RenderingContext ) {
        this.gl = RenderingContext
    }

    get Geometry() {
        const RenderingContext = this.gl
        return {
            Quad: class {
                constructor() {
                    this.gl = RenderingContext

                    // Create a new Buffer and bind it
                    const vertexBuffer = this.gl.createBuffer()
                    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, vertexBuffer )

                    // Fill it with vertex information
                    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( [
                        // First Triangle |\
                        -1, -1,
                        -1, +1,
                        +1, -1,
                        // Last Point |\|
                        +1, +1,
                    ] ), this.gl.STATIC_DRAW )

                    this.position = vertexBuffer
                }

                bindVertexPosition( attributeLocation ) {
                    const dimension = 2 // pull out 2 values per iteration
                    const normalize = false // don't normalize
                    const stride = 0 // how many bytes to get from one set of values to the next. 0 = use type and dimension above
                    const offset = 0
                    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.position )
                    this.gl.enableVertexAttribArray( attributeLocation )
                    this.gl.vertexAttribPointer(
                        attributeLocation,
                        dimension,
                        this.gl.FLOAT,
                        normalize,
                        stride,
                        offset
                    )
                }
            }
        }
    }

    get Shader() {
        const RenderingContext = this.gl
        const CircleJSShader = class {
            constructor( vertexShaderSource, fragmentShaderSource ) {
                this.gl = RenderingContext
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
        }
        return Object.assign( CircleJSShader, {
            vertexShaderTemplate: `attribute vec4 vertexPosition; uniform mat4 modelViewMatrix, projectionMatrix; void main() { gl_Position = projectionMatrix * modelViewMatrix * vertexPosition; }`,

            solid( rgba ) {
                const color = [rgba[0] ?? 0, rgba[1] ?? rgba[0] ?? 0, rgba[3] ?? rgba[1] ?? rgba[0] ?? 0, rgba[3] ?? 1]
                return new CircleJSShader(
                    this.vertexShaderTemplate,
                    `void main() { gl_FragColor = vec4(${color.join( "," )}); }`
                )
            },
        } )
    }

    static get CanvasHandler() {
        return class {
            /** @param {HTMLCanvasElement} CanvasElement */
            constructor( CanvasElement, resolutionScale = 1 ) {
                this.canvas = CanvasElement
                this.resolutionScale = resolutionScale

                this.resizeObserver = new ResizeObserver( entries => {
                    // Get the size of the canvas element.
                    const canvas = entries[0].target
                    const size = { x: canvas.clientWidth, y: canvas.clientHeight }

                    // Scale the Canvas elements render dimensions according to the canvas size.
                    this.canvas.width = size.x * this.resolutionScale
                    this.canvas.height = size.y * this.resolutionScale
                } )
                this.resizeObserver.observe( this.canvas )
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
        return new Array( 4 ).fill().map( ( _, i ) => {
            return {
                position: positions[i],
                coord: coords[i],
                fill: fills[i],
                keypoints: keypoints[i],
            }
        } )
    }

    asBuffer() {
        // For each vertex:
        // 3 * [4] bytes position (float)
        // 2 * [1] bytes texture coordinates (byte)
        // 4 * [1] bytes color (unsigned byte)
        // 4 * 2 * [2] bytes keypoints (short)
        // TOTAL 34 bytes
        // Because stride has to be a multiple of gl.FLOAT (the largest type), the size needs to be padded to 36 bytes
        const buffer = new ArrayBuffer( 36 * 4 )
        const dataView = new DataView( buffer )
        const vertecies = this.vertexData()

        for ( let i = 0; i < vertecies.length; i++ ) {
            const offset = i * 36
            const vertex = vertecies[i]
            console.log( vertex )

            dataView.setFloat32( offset + 0, vertex.position[0], true )
            console.log( dataView.getFloat32( offset + 0, true ) )
            dataView.setFloat32( offset + 4, vertex.position[1], true )
            console.log( dataView.getFloat32( offset + 4, true ) )
            dataView.setFloat32( offset + 8, vertex.position[2], true )
            console.log( dataView.getFloat32( offset + 8, true ) )

            dataView.setInt8( offset + 12, vertex.coord[0] * 127 )
            console.log( dataView.getInt8( offset + 12 ) )
            dataView.setInt8( offset + 13, vertex.coord[1] * 127 )
            console.log( dataView.getInt8( offset + 13 ) )

            dataView.setUint8( offset + 14, vertex.fill[0] * 255 )
            console.log( dataView.getUint8( offset + 14 ) )
            dataView.setUint8( offset + 15, vertex.fill[1] * 255 )
            console.log( dataView.getUint8( offset + 15 ) )
            dataView.setUint8( offset + 16, vertex.fill[2] * 255 )
            console.log( dataView.getUint8( offset + 16 ) )
            dataView.setUint8( offset + 17, vertex.fill[3] * 255 )
            console.log( dataView.getUint8( offset + 17 ) )

            dataView.setInt16( offset + 18, vertex.keypoints[0][0] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 18, true ) )
            dataView.setInt16( offset + 20, vertex.keypoints[0][1] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 20, true ) )
            dataView.setInt16( offset + 22, vertex.keypoints[1][0] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 22, true ) )
            dataView.setInt16( offset + 24, vertex.keypoints[1][1] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 24, true ) )
            dataView.setInt16( offset + 26, vertex.keypoints[2][0] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 26, true ) )
            dataView.setInt16( offset + 28, vertex.keypoints[2][1] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 28, true ) )
            dataView.setInt16( offset + 30, vertex.keypoints[3][0] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 30, true ) )
            dataView.setInt16( offset + 32, vertex.keypoints[3][1] * ( ( 1 << 15 ) - 1 ), true )
            console.log( dataView.getInt16( offset + 32, true ) )
        }

        return buffer
    }
}