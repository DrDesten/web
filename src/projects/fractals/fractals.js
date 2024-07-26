import * as Query from "../../../scripts/query.js"
import { vec2, vec3 } from "../../../svg/jvec/bin/vec.js"
import { dfloat, splitFloat, splitFloats } from "./dfloat.js"
import { Attribute } from "./gl/attributes.js"
import { Camera, CameraControls } from "./gl/camera.js"
import { Canvas } from "./gl/canvas.js"
import { setGL } from "./gl/gl.js"
import { Program } from "./gl/program.js"
import { Uniform } from "./gl/uniforms.js"
import { Mouse } from "./mouse.js"
import { juliaShader } from "./shaders/julia.js"
import { mandelbrotShader } from "./shaders/mandelbrot.js"

const defaults = {
    camera: {
        position: [-0.7, 0],
        scale: 5,
    },
    guideColor: [.5, .4, 1],
    iterations: 1000,
}
const params = structuredClone( defaults )
params.load = function () {
    const saved = JSON.parse( localStorage.getItem( "fractals/params" ) )
    if ( saved ) Object.assign( params, saved )
}
params.save = function () {
    localStorage.setItem( "fractals/params", JSON.stringify( params ) )
}
params.resetCamera = function () {
    Object.assign( params.camera, defaults.camera )
}

const inputElements = Query.getInputs()
const inputs = {
    listeners: {
        iterations: [],
        camera: [],
        color: [],
    },
    /** @param {"color"|"camera"|"iterations"} type @param {(...any)=>void} listener */
    addEventListener( type, listener ) {
        this.listeners[type].push( listener )
    },
    dispatchEvent( type, ...args ) {
        this.listeners[type].forEach( listener => listener( ...args ) )
    },

    number( value ) {
        return +/-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec( value )?.[0]
    },

    // Iterations
    displayIterations() {
        if ( inputElements.iterationsNumber.innerHTML != params.iterations )
            inputElements.iterationsNumber.innerHTML = params.iterations
        if ( inputElements.iterationsSlider.value != params.iterations )
            inputElements.iterationsSlider.value = params.iterations
    },
    getIterationsSlider() {
        params.iterations = ~~inputElements.iterationsSlider.value
        params.save()
        this.displayIterations()
        this.dispatchEvent( "iterations", params.iterations )
    },
    getIterationsNumber() {
        params.iterations = ~~inputElements.iterationsNumber.innerHTML
        params.save()
        this.displayIterations()
        this.dispatchEvent( "iterations", params.iterations )
    },

    // Camera
    displayCamera() {
        inputElements.real.innerHTML = params.camera.position[0]
        inputElements.imaginary.innerHTML = params.camera.position[1]
        inputElements.scale.innerHTML = params.camera.scale
    },
    getCamera() {
        const real = this.number( inputElements.real.innerHTML )
        const imaginary = this.number( inputElements.imaginary.innerHTML )
        const scale = this.number( inputElements.scale.innerHTML )
        if ( isFinite( real ) ) params.camera.position[0] = real
        if ( isFinite( imaginary ) ) params.camera.position[1] = imaginary
        if ( isFinite( scale ) && scale > 0 ) params.camera.scale = scale
        params.save()
        this.displayCamera()
        this.dispatchEvent( "camera", params.camera )
    },
    resetCamera() {
        params.resetCamera()
        params.save()
        this.displayCamera()
        this.dispatchEvent( "camera", params.camera )
    },
    updateCameraParams( camera ) {
        params.camera.position = camera.position.toArray()
        params.camera.scale = camera.scale
        params.save()
        this.displayCamera()
    },
    applyCameraParams( camera ) {
        camera.position.set( ...params.camera.position )
        camera.scale = params.camera.scale
    },

    // Color
    displayColor() {
        inputElements.guideColorR.value = params.guideColor[0]
        inputElements.guideColorG.value = params.guideColor[1]
        inputElements.guideColorB.value = params.guideColor[2]
    },
    getColor() {
        params.guideColor[0] = +inputElements.guideColorR.value || 0
        params.guideColor[1] = +inputElements.guideColorG.value || 0
        params.guideColor[2] = +inputElements.guideColorB.value || 0
        params.save()
        this.dispatchEvent( "color", params.guideColor )
    },
}

params.load()
inputs.displayIterations()
inputElements.iterationsSlider.addEventListener( "input", () => inputs.getIterationsSlider() )
inputElements.iterationsNumber.addEventListener( "focusout", () => inputs.getIterationsNumber() )

inputElements.real.addEventListener( "focusout", () => inputs.getCamera() )
inputElements.imaginary.addEventListener( "focusout", () => inputs.getCamera() )
inputElements.scale.addEventListener( "focusout", () => inputs.getCamera() )
inputElements.resetCamera.addEventListener( "click", () => inputs.resetCamera() )

inputs.displayColor()
inputElements.guideColorR.addEventListener( "input", () => inputs.getColor() )
inputElements.guideColorG.addEventListener( "input", () => inputs.getColor() )
inputElements.guideColorB.addEventListener( "input", () => inputs.getColor() )
inputElements.guideColorR.addEventListener( "focusout", () => inputs.displayColor() )
inputElements.guideColorG.addEventListener( "focusout", () => inputs.displayColor() )
inputElements.guideColorB.addEventListener( "focusout", () => inputs.displayColor() )

const mouse = new Mouse()
const screen = new Canvas( document.getElementById( "main" ), 1, true )
screen.requestResize()
const minimap = new Canvas( document.getElementById( "minimap" ) )

const camera = new Camera( screen.canvas )
const cameraControls = new CameraControls( camera, { zoomSensitivity: 0.001 } )
inputs.applyCameraParams( camera )
inputs.displayCamera()

const globalUniforms = () => [
    new Uniform( "maxIterations", "int", 1 ),
    new Uniform( "guideColor", "float", 3 ),
    new Uniform( "screenSize", "float", 4 ),
    new Uniform( "screenSizeInverse", "float", 4 ),
    new Uniform( "cameraPosition", "float", 4 ),
    new Uniform( "cameraScale", "float", 2 ),
    new Uniform( "viewPosition", "float", 4 ),
    new Uniform( "viewScale", "float", 2 ),
]
const vertexQuadData = [
    [-1, -1],
    [+1, -1],
    [-1, +1],
    [+1, +1],
]

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

    inputs.addEventListener( "camera", () => {
        invalidate()
        inputs.applyCameraParams( camera )
    } )

    cameraControls.addEventListener( () => {
        invalidate()
        inputs.updateCameraParams( camera )
    } )

    const vertexBuffer = gl.createBuffer()
    const program = new Program( mandelbrotShader.compile(), [
        new Attribute( vertexBuffer, "vertexPosition", 2, gl.FLOAT ),
    ], globalUniforms() )
    program.activate()
    program.getLocations()
    program.enableAttributes()

    // Fill Buffers
    const vertexBufferData = new Float32Array( vertexQuadData.flat() )
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW )

    // Render Setup
    gl.clearColor( 0, 0, 0, 1 )

    inputs.addEventListener( "iterations", () => invalidate() )
    inputs.addEventListener( "color", col => ( invalidate(), program.uploadUniform( "guideColor", col ) ) )
    program.uploadUniform( "guideColor", params.guideColor )

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT )

        const screenSize = new vec2( screen.canvas.width, screen.canvas.height )
        const screenSizeInverse = new vec2( 1 ).div( screenSize )
        const cameraPosition = camera.position
        const cameraScale = camera.scale

        const viewScale = camera.scale * screenSizeInverse.y
        const viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

        const margin = 0
        program.uploadUniform( "maxIterations", params.iterations )
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

    inputs.addEventListener( "camera", () => invalidate() )
    cameraControls.addEventListener( () => invalidate() )

    const vertexBuffer = gl.createBuffer()

    const program = new Program( juliaShader.compile(), [
        new Attribute( vertexBuffer, "vertexPosition", 2, gl.FLOAT ),
    ], globalUniforms() )
    program.activate()
    program.getLocations()
    program.enableAttributes()

    // Fill Buffers
    const vertexBufferData = new Float32Array( vertexQuadData.flat() )
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW )

    // Render Setup
    gl.clearColor( 0, 0, 0, 1 )

    inputs.addEventListener( "iterations", () => invalidate() )
    inputs.addEventListener( "color", col => ( invalidate(), program.uploadUniform( "guideColor", col ) ) )
    program.uploadUniform( "guideColor", params.guideColor )

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT )

        const screenSize = new vec2( minimap.canvas.width, minimap.canvas.height )
        const screenSizeInverse = new vec2( 1 ).div( screenSize )
        const cameraPosition = camera.position
        const cameraScale = camera.scale

        const viewScale = camera.scale * screenSizeInverse.y
        const viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

        const margin = 0
        program.uploadUniform( "maxIterations", params.iterations )
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