import * as Query from "../../../scripts/query.js"
import { vec2, vec3 } from "../../../svg/jvec/bin/vec.js"
import { dfloat, splitFloat, splitFloats } from "./dfloat.js"
import { EventHandler } from "./event.js"
import { Attribute } from "./gl/attribute.js"
import { Camera, CameraControls } from "./gl/camera.js"
import { Canvas } from "./gl/canvas.js"
import { GL } from "./gl/gl.js"
import { Uniform } from "./gl/uniform.js"
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
Object.values( inputElements ).forEach( ele =>
    ele.addEventListener( "keydown", e => e.key === "Enter" && ele.blur() )
)
const outputElements = {
    minimapReal: document.getElementById( "minimap-real" ),
    minimapImaginary: document.getElementById( "minimap-imaginary" ),
}

const inputs = {
    events: new EventHandler( "color", "camera", "iterations" ),

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
        this.events.dispatchEvent( "iterations", params.iterations )
    },
    getIterationsNumber() {
        params.iterations = ~~inputElements.iterationsNumber.innerHTML
        params.save()
        this.displayIterations()
        this.events.dispatchEvent( "iterations", params.iterations )
    },

    // Camera
    displayCamera() {
        inputElements.real.innerHTML = params.camera.position[0].toPrecision( 8 )
        inputElements.imaginary.innerHTML = params.camera.position[1].toPrecision( 8 )
        inputElements.scale.innerHTML = params.camera.scale.toPrecision( 8 )
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
        this.events.dispatchEvent( "camera", params.camera )
    },
    resetCamera() {
        params.resetCamera()
        params.save()
        this.displayCamera()
        this.events.dispatchEvent( "camera", params.camera )
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
        this.events.dispatchEvent( "color", params.guideColor )
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

const screen = new Canvas( document.getElementById( "main" ), { defer: true } )
const minimap = new Canvas( document.getElementById( "minimap" ), { defer: true } )
screen.requestResize()
minimap.requestResize()

const camera = new Camera( screen.canvas )
const cameraControls = new CameraControls( camera, { zoomSensitivity: 0.001 } )
inputs.applyCameraParams( camera )
inputs.displayCamera()

const globalUniforms = [
    new Uniform( "maxIterations", "int", 1 ),
    new Uniform( "guideColor", "float", 3 ),
    new Uniform( "screenSize", "float", 2 ),
    new Uniform( "screenSizeInverse", "float", 2 ),
    new Uniform( "cameraPosition", "float", 2 ),
    new Uniform( "cameraScale", "float", 1 ),
    new Uniform( "mousePosition", "float", 2 ),
    new Uniform( "viewPosition", "float", 2 ),
    new Uniform( "viewScale", "float", 1 ),
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
    screen.events.addEventListener( "resizeRequest", invalidate )
    screen.events.addEventListener( "resize", ( w, h ) => gl.viewport( 0, 0, w, h ) )
    const glHook = new GL( gl )
    const { Program } = glHook.classes
    const mouse = new Mouse( screen.canvas )

    inputs.events.addEventListener( "camera", () => {
        invalidate()
        inputs.applyCameraParams( camera )
    } )

    cameraControls.addEventListener( () => {
        invalidate()
        inputs.updateCameraParams( camera )
    } )

    const vertexBuffer = gl.createBuffer()
    const shader = glHook.inject( mandelbrotShader )
    const program = new Program( shader.compile(), [
        new Attribute( vertexBuffer, "vertexPosition", 2, gl.FLOAT ),
    ], globalUniforms )
    program.activate()
    program.getLocations()
    program.enableAttributes()

    // Fill Buffers
    const vertexBufferData = new Float32Array( vertexQuadData.flat() )
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW )

    // Render Setup
    gl.clearColor( 0, 0, 0, 1 )

    inputs.events.addEventListener( "iterations", () => invalidate() )
    inputs.events.addEventListener( "color", col => ( invalidate(), program.uploadUniform( "guideColor", col ) ) )
    program.uploadUniform( "guideColor", params.guideColor )

    let screenSize = new vec2()
    let screenSizeInverse = new vec2()
    let viewScale = camera.scale * screenSizeInverse.y
    let viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT )

        screenSize.set( screen.width, screen.height )
        screenSizeInverse = new vec2( 1 ).div( screenSize )
        viewScale = camera.scale * screenSizeInverse.y
        viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

        program.uploadUniform( "maxIterations", params.iterations )
        program.uploadUniform( "screenSize", screenSize )
        program.uploadUniform( "screenSizeInverse", screenSizeInverse )
        program.uploadUniform( "cameraPosition", camera.position )
        program.uploadUniform( "cameraScale", camera.scale )
        program.uploadUniform( "mousePosition", mouse.relativeWebglPosition )
        program.uploadUniform( "viewPosition", viewPosition )
        program.uploadUniform( "viewScale", viewScale )

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
    minimap.events.addEventListener( "resizeRequest", invalidate )
    minimap.events.addEventListener( "resize", ( w, h ) => gl.viewport( 0, 0, w, h ) )
    const glHook = new GL( gl )
    const { Program } = glHook.classes

    const mouse = new Mouse( screen.canvas )
    screen.canvas.addEventListener( "mousemove", invalidate )
    screen.canvas.addEventListener( "mouseenter", invalidate )

    inputs.events.addEventListener( "camera", () => invalidate() )
    cameraControls.addEventListener( () => invalidate() )

    const vertexBuffer = gl.createBuffer()
    const shader = glHook.inject( juliaShader )
    const program = new Program( shader.compile(), [
        new Attribute( vertexBuffer, "vertexPosition", 2, gl.FLOAT ),
    ], [
        ...globalUniforms,
        new Uniform( "mainScreenSize", "float", 2 ),
        new Uniform( "mainScreenSizeInverse", "float", 2 ),
    ] )
    program.activate()
    program.getLocations()
    program.enableAttributes()

    // Fill Buffers
    const vertexBufferData = new Float32Array( vertexQuadData.flat() )
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW )

    // Render Setup
    gl.clearColor( 0, 0, 0, 1 )

    inputs.events.addEventListener( "iterations", () => invalidate() )
    inputs.events.addEventListener( "color", col => ( invalidate(), program.uploadUniform( "guideColor", col ) ) )
    program.uploadUniform( "guideColor", params.guideColor )

    function update() {
        const juliaPosition = vec2.add( camera.position,
            mouse.relativeWebglPosition.clone()
                .sub( .5 )
                .mul( new vec2( screen.width / screen.height, 1 ).mul( .5 ) )
                .mul( camera.scale )
        )
        outputElements.minimapReal.innerHTML = juliaPosition.x.toPrecision( 8 )
        outputElements.minimapImaginary.innerHTML = juliaPosition.y.toPrecision( 8 )
    }

    let screenSize = new vec2()
    let screenSizeInverse = new vec2()
    let mainScreenSize = new vec2()
    let mainScreenSizeInverse = new vec2()
    let viewScale = camera.scale * screenSizeInverse.y
    let viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT )

        screenSize.set( minimap.width, minimap.height )
        screenSizeInverse = new vec2( 1 ).div( screenSize )
        mainScreenSize.set( screen.width, screen.height )
        mainScreenSizeInverse = new vec2( 1 ).div( mainScreenSize )
        viewScale = camera.scale * screenSizeInverse.y
        viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

        program.uploadUniform( "maxIterations", params.iterations )
        program.uploadUniform( "screenSize", screenSize )
        program.uploadUniform( "screenSizeInverse", screenSizeInverse )
        program.uploadUniform( "mainScreenSize", mainScreenSize )
        program.uploadUniform( "mainScreenSizeInverse", mainScreenSizeInverse )
        program.uploadUniform( "cameraPosition", camera.position )
        program.uploadUniform( "cameraScale", camera.scale )
        program.uploadUniform( "mousePosition", mouse.relativeWebglPosition )
        program.uploadUniform( "viewPosition", viewPosition )
        program.uploadUniform( "viewScale", viewScale )

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4, 4 )
    }

    /** @param {number} millis */
    function renderLoop( millis ) {
        if ( !renderStatus ) {
            minimap.requestResize()
            update( millis )
            render( millis )
            renderStatus = true
        }
        requestAnimationFrame( renderLoop )
    }
    renderLoop( 0 )
}()