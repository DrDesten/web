import { vec2, vec3 } from "../../../svg/jvec/bin/vec.js"
import { dfloat, splitFloat, splitFloats } from "./dfloat.js"
import { Attribute } from "./gl/attributes.js"
import { Camera, CameraControls } from "./gl/camera.js"
import { Canvas } from "./gl/canvas.js"
import { setGL } from "./gl/gl.js"
import { Program } from "./gl/program.js"
import { Shader } from "./gl/shader.js"
import { Uniform } from "./gl/uniforms.js"
import { Mouse } from "./mouse.js"
import { Fractallib } from "./shaders/fractal.js"
import { juliaShader } from "./shaders/julia.js"
import { mandelbrotShader } from "./shaders/mandelbrot.js"

const htmlOutputs = {
    re: document.getElementById( "re" ),
    im: document.getElementById( "im" ),
    sc: document.getElementById( "sc" ),
    it: document.getElementById( "it" ),

    updateCamera( camera ) {
        this.re.innerHTML = camera.position.x
        this.im.innerHTML = camera.position.y
        this.sc.innerHTML = camera.scale
    }
}
const htmlInputs = {
    iterations: document.getElementById( "iterations" ),
    resetPos: document.getElementById( "reset-pos" ),
}

function saveCamera( camera ) {
    localStorage.setItem( "camera", JSON.stringify( {
        position: camera.position.toArray(),
        scale: camera.scale,
    } ) )
}
function loadCamera( camera ) {
    const data = localStorage.getItem( "camera" ) ?? '{"position": [-0.7, 0], "scale": 5}'
    const { position, scale } = JSON.parse( data )
    camera.position.set( ...position )
    camera.scale = scale
}

const mouse = new Mouse()
const screen = new Canvas( document.getElementById( "main" ), 1, true )
screen.requestResize()
const minimap = new Canvas( document.getElementById( "minimap" ) )

const camera = new Camera( screen.canvas )
const cameraControls = new CameraControls( camera, { zoomSensitivity: 0.001 } )
loadCamera( camera )
htmlOutputs.updateCamera( camera )

// Setup main canvas
~function MainCanvas() {
    let renderStatus = false
    function invalidate() { renderStatus = false }

    const gl = screen.canvas.getContext( "webgl2", {
        premultipliedAlpha: false,
        alpha: false,
    } )
    screen.onResizeRequest = () => invalidate()
    screen.onResize = ( w, h ) => gl.viewport( 0, 0, w, h )
    setGL( gl )

    htmlInputs.resetPos.addEventListener( "click", () => {
        invalidate()
        camera.position.set( -0.7, 0 )
        camera.scale = 5
        htmlOutputs.updateCamera( camera )
    } )

    cameraControls.addEventListener( () => {
        invalidate()
        saveCamera( camera )
        htmlOutputs.updateCamera( camera )
    } )

    const vertexBuffer = gl.createBuffer()
    const uniforms = [
        new Uniform( "maxIterations", "int", 1 ),
        new Uniform( "screenSize", "float", 4 ),
        new Uniform( "screenSizeInverse", "float", 4 ),
        new Uniform( "cameraPosition", "float", 4 ),
        new Uniform( "cameraScale", "float", 2 ),
        new Uniform( "viewPosition", "float", 4 ),
        new Uniform( "viewScale", "float", 2 ),
    ]

    const program = new Program( mandelbrotShader.compile(), [
        new Attribute( vertexBuffer, "vertexPosition", 2, gl.FLOAT ),
    ], uniforms )
    program.activate()
    program.getLocations()
    program.enableAttributes()

    // Fill Buffers
    const vertexData = [
        [-1, -1],
        [+1, -1],
        [-1, +1],
        [+1, +1],
    ]
    const vertexBufferData = new Float32Array( vertexData.flat() )
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW )

    // Render Setup
    gl.clearColor( 0, 0, 0, 1 )

    let iterations = ~~htmlInputs.iterations.value
    it.innerHTML = iterations
    htmlInputs.iterations.addEventListener( "input", () => {
        iterations = ~~htmlInputs.iterations.value
        it.innerHTML = iterations
        invalidate()
    } )

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT )

        const screenSize = new vec2( screen.canvas.width, screen.canvas.height )
        const screenSizeInverse = new vec2( 1 ).div( screenSize )
        const cameraPosition = camera.position
        const cameraScale = camera.scale

        const viewScale = camera.scale * screenSizeInverse.y
        const viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

        const margin = 0
        program.uploadUniform( "maxIterations", iterations )
        program.uploadUniform( "screenSize", splitFloats( screenSize.toArray(), margin ) )
        program.uploadUniform( "screenSizeInverse", splitFloats( screenSizeInverse.toArray(), margin ) )
        program.uploadUniform( "cameraPosition", splitFloats( cameraPosition.toArray(), margin ) )
        program.uploadUniform( "cameraScale", splitFloat( cameraScale, margin ) )
        program.uploadUniform( "viewPosition", splitFloats( viewPosition.toArray(), margin ) )
        program.uploadUniform( "viewScale", splitFloat( viewScale, margin ) )

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4, 4 )
    }

    /** @param {number} millis */
    function renderLoop( millis ) {
        if ( !renderStatus ) {
            screen.requestResize()
            render( millis )
            renderStatus = true
        }
        requestAnimationFrame( renderLoop )
    }
    renderLoop( 0 )
}()

// Setup minimap
~function MinimapCanvas() {
    let renderStatus = false
    function invalidate() { renderStatus = false }

    const gl = minimap.canvas.getContext( "webgl2", {
        premultipliedAlpha: false,
        alpha: false,
    } )
    minimap.onResizeRequest = () => invalidate()
    minimap.onResize = ( w, h ) => gl.viewport( 0, 0, w, h )
    setGL( gl )

    htmlInputs.resetPos.addEventListener( "click", () => invalidate() )
    cameraControls.addEventListener( () => invalidate() )

    const vertexBuffer = gl.createBuffer()
    const uniforms = [
        new Uniform( "maxIterations", "int", 1 ),
        new Uniform( "screenSize", "float", 4 ),
        new Uniform( "screenSizeInverse", "float", 4 ),
        new Uniform( "cameraPosition", "float", 4 ),
        new Uniform( "cameraScale", "float", 2 ),
        new Uniform( "viewPosition", "float", 4 ),
        new Uniform( "viewScale", "float", 2 ),
    ]

    const program = new Program( juliaShader.compile(), [
        new Attribute( vertexBuffer, "vertexPosition", 2, gl.FLOAT ),
    ], uniforms )
    program.activate()
    program.getLocations()
    program.enableAttributes()

    // Fill Buffers
    const vertexData = [
        [-1, -1],
        [+1, -1],
        [-1, +1],
        [+1, +1],
    ]
    const vertexBufferData = new Float32Array( vertexData.flat() )
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW )

    // Render Setup
    gl.clearColor( 0, 0, 0, 1 )

    let iterations = ~~htmlInputs.iterations.value
    it.innerHTML = iterations
    htmlInputs.iterations.addEventListener( "input", () => {
        iterations = ~~htmlInputs.iterations.value
        it.innerHTML = iterations
        invalidate()
    } )

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT )

        const screenSize = new vec2( minimap.canvas.width, minimap.canvas.height )
        const screenSizeInverse = new vec2( 1 ).div( screenSize )
        const cameraPosition = camera.position
        const cameraScale = camera.scale

        const viewScale = camera.scale * screenSizeInverse.y
        const viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

        const margin = 0
        program.uploadUniform( "maxIterations", iterations )
        program.uploadUniform( "screenSize", splitFloats( screenSize.toArray(), margin ) )
        program.uploadUniform( "screenSizeInverse", splitFloats( screenSizeInverse.toArray(), margin ) )
        program.uploadUniform( "cameraPosition", splitFloats( cameraPosition.toArray(), margin ) )
        program.uploadUniform( "cameraScale", splitFloat( cameraScale, margin ) )
        program.uploadUniform( "viewPosition", splitFloats( viewPosition.toArray(), margin ) )
        program.uploadUniform( "viewScale", splitFloat( viewScale, margin ) )

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4, 4 )
    }

    /** @param {number} millis */
    function renderLoop( millis ) {
        if ( !renderStatus ) {
            minimap.requestResize()
            render( millis )
            renderStatus = true
        }
        requestAnimationFrame( renderLoop )
    }
    renderLoop( 0 )
}()