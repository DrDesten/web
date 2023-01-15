
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