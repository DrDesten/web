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

function saveCamera( camera ) {
    localStorage.setItem( "camera", JSON.stringify( {
        position: camera.position.toArray(),
        scale: camera.scale,
    } ) )
}
function loadCamera( camera ) {
    const data = localStorage.getItem( "camera" )
        && '{"position": [-0.7, 0], "scale": 5}'
    const { position, scale } = JSON.parse( data )
    camera.position.set( ...position )
    camera.scale = scale
}

const mouse = new Mouse()
const screen = new Canvas( document.getElementById( "main" ), 1, true )
screen.requestResize()
const minimap = new Canvas( document.getElementById( "minimap" ) )

const htmlOutputs = {
    re: document.getElementById( "re" ),
    im: document.getElementById( "im" ),
    sc: document.getElementById( "sc" ),
    it: document.getElementById( "it" ),
}
const htmlInputs = {
    iterations: document.getElementById( "iterations" ),
}

const mandelbrotShader = new Shader( `
    in vec2 vertexPosition;
    void main(){
        gl_Position = vec4(vertexPosition, 0, 1);
    }
`, `
    #define PI ${Math.PI}
    #define TAU ${Math.PI * 2}
    #define E ${Math.E}

    uniform vec4 viewPosition;
    uniform vec2 viewScale;

    out vec4 fragColor;
    void main() {
        const float maxDistance = 5.;

        vec2 coord = viewPosition.xz + gl_FragCoord.xy * viewScale.x;
        vec2 z = vec2(0.0, 0.0);
        vec2 c = coord;

        float finalIterations = -1.;
        for (int i = 0; i < 1000; i++) {
            z = vec2((z.x*z.x) - (z.y*z.y), 2.0 * z.x * z.y) + c;

            float lenSq = dot(z, z);
            if (lenSq > maxDistance * maxDistance) {
                finalIterations = float(i);
                break;
            }
        }

        if (finalIterations == -1.) {
            fragColor = vec4(0,0,0,1);
            return;
        }

        const vec3  guideColor = vec3(.5, .4, 1);
        const float guideScale = 1. / 10.;

        float smoothIter = finalIterations + 1.0 - log(log(dot(z,z))) / log(2.0);
        float guideIter  = smoothIter * TAU * guideScale;

        fragColor = vec4(cos(guideColor + smoothIter * 0.2) * .5 + .5, 1.0);
    }
`)

// Setup main canvas
~function () {
    let renderStatus = false
    function invalidate() { renderStatus = false }

    const gl = screen.canvas.getContext( "webgl2", {
        premultipliedAlpha: false,
        alpha: false,
    } )
    screen.onResizeRequest = () => invalidate()
    screen.onResize = ( w, h ) => gl.viewport( 0, 0, w, h )
    setGL( gl )

    const camera = new Camera( screen.canvas )
    loadCamera( camera )
    htmlOutputs.re.innerHTML = camera.position.x
    htmlOutputs.im.innerHTML = camera.position.y
    htmlOutputs.sc.innerHTML = camera.scale

    const cameraControls = new CameraControls( camera, { zoomSensitivity: 0.001 } )
    cameraControls.addEventListener( () => {
        invalidate()
        saveCamera( camera )
        htmlOutputs.re.innerHTML = camera.position.x
        htmlOutputs.im.innerHTML = camera.position.y
        htmlOutputs.sc.innerHTML = camera.scale
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

    const shader = new Shader( `
        in vec2 vertexPosition;
        void main(){
            gl_Position = vec4(vertexPosition, 0, 1);
        }
    `, `
        #define PI ${Math.PI}
        #define TAU ${Math.PI * 2}
        #define E ${Math.E}

        vec2 cmul(vec2 a, vec2 b) { 
            return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); 
        }

        uniform int maxIterations;
        uniform vec4 screenSize;
        uniform vec4 screenSizeInverse;
        uniform vec4 cameraPosition;
        uniform vec2 cameraScale;
        uniform vec4 viewPosition;
        uniform vec2 viewScale;

        struct Fractal {
            vec2  z;
            vec2  dz;
            float iterations;
        };

        Fractal mandelbrot(vec2 position) {
            const float exitDistance = 5.;
            const float exitDistanceSq = exitDistance * exitDistance;

            vec2  z = vec2(0, 0);
            vec2  c = position;
            float iterations = -1.;

            for (int i = 0; i < maxIterations; i++) {
                z = cmul(z, z) + c;
                if (dot(z, z) > exitDistanceSq) {
                    iterations = float(i);
                    break;
                }
            }

            return Fractal(z, vec2(0), iterations);
        }

        Fractal mandelbrotPertubation(vec2 position, vec2 positionDelta) {
            const float exitDistance = 5.;
            const float exitDistanceSq = exitDistance * exitDistance;

            vec2  z  = vec2(0, 0);
            vec2  dz = vec2(0, 0);
            vec2  c  = position;
            vec2  dc = positionDelta;
            float iterations = -1.;

            for (int i = 0; i < maxIterations; i++) {
                dz = cmul(2. * z + dz, dz) + dc;
                z  = cmul(z, z) + c;

                if (dot(dz, dz) > exitDistanceSq) {
                    iterations = float(i);
                    break;
                }
            }

            return Fractal(z, dz, iterations);
        }

        out vec4 fragColor;
        void main() {
            const float exitDistance = 5.;

            vec2 fragCoord      = (gl_FragCoord.xy - screenSize.xy * .5) * screenSizeInverse.y * .5;
            vec2 position       = cameraPosition.xy;
            vec2 position_delta = fragCoord * cameraScale.x + cameraPosition.zw;

            Fractal f;
            f = mandelbrot(position + position_delta);

            if (length(position_delta) < 0.003 * cameraScale.x) {
                fragColor = vec4(1,0,0,1);
                return;
            }

            if (f.iterations == -1.) {
                fragColor = vec4(0,0,0,1);
                return;
            }

            const vec3  guideColor = vec3(.5, .4, 1);
            const float guideScale = 1. / 10.;

            float smoothIter = f.iterations + 1.0 - log(log(length(f.z + f.dz))) / log(2.0);
            float guideIter  = smoothIter * TAU * guideScale;

            fragColor = vec4(cos(guideColor + smoothIter * 0.2) * .5 + .5, 1.0);
        }
    `)
    const program = new Program( shader.compile(), [
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