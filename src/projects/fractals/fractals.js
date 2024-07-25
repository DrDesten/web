import { vec2 } from "../../../svg/jvec/bin/vec2.js"
import { vec3 } from "../../../svg/jvec/bin/vec3.js"
import { dfloat } from "./dfloat.js"
import { Attribute } from "./gl/attributes.js"
import { Camera, CameraControls } from "./gl/camera.js"
import { Canvas } from "./gl/canvas.js"
import { setGL } from "./gl/gl.js"
import { Program } from "./gl/program.js"
import { Shader } from "./gl/shader.js"
import { Uniform } from "./gl/uniforms.js"
import { Mouse } from "./mouse.js"

const mouse = new Mouse()
const screen = new Canvas( document.getElementById( "main" ) )
const minimap = new Canvas( document.getElementById( "minimap" ) )

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
    const gl = screen.canvas.getContext( "webgl2", {
        premultipliedAlpha: false,
        alpha: false,
    } )
    screen.onResize = ( w, h ) => gl.viewport( 0, 0, w, h )
    setGL( gl )

    const camera = new Camera( screen.canvas )
    camera.position.set( -1.9855272554901673, 0 )
    camera.scale = 0.000016891920124976755
    const cameraControls = new CameraControls( camera, { zoomSensitivity: 0.001 } )

    const vertexBuffer = gl.createBuffer()
    const uniforms = [
        new Uniform( "screenSize", "float", 4 ),
        new Uniform( "screenSizeInverse", "float", 4 ),
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

        ${dfloat}

        uniform vec4 viewPosition;
        uniform vec2 viewScale;

        out vec4 fragColor;
        void main() {
            const float maxDistance = 5.;
            dfloat      maxComp     = dsq(dnew(maxDistance));

            dfloat2 vp = d2new(dnew(viewPosition.x, viewPosition.y), 
                               dnew(viewPosition.z, viewPosition.w));
            dfloat  vs = dnew(viewScale.x, viewScale.y);

            dfloat2 coord = d2new(gl_FragCoord.x, gl_FragCoord.y);
            coord         = d2add(d2mul(coord, d2new(vs, vs)), vp);

            dfloat2 z = d2new(0.0, 0.0);
            dfloat2 c = coord;

            float finalIterations = -1.;
            for (int i = 0; i < 1000; i++) {
                z = d2new(
                    dsub(dsq(z.x), dsq(z.y)),
                    dmul(dnew(2.0), dmul(z.x, z.y))
                );
                z = d2add(z, c);

                dfloat lenSq = d2lengthSq(z);
                if (dcomp(lenSq, maxComp) >= 0.) {
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

            float smoothIter = finalIterations + 1.0 - log(log(toFloat(d2lengthSq(z)))) / log(2.0);
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

    function render() {
        gl.clear( gl.COLOR_BUFFER_BIT )

        const screenSize = new vec2( screen.canvas.width, screen.canvas.height )
        const screenSizeInverse = new vec2( 1 ).div( screenSize )

        let viewScale = camera.scale * screenSizeInverse.y
        let viewPosition = vec2.sub( camera.position, vec2.mul( screenSize, viewScale * .5 ) )

        let uViewPosition = [
            Math.fround( viewPosition.x ), viewPosition.x - Math.fround( viewPosition.x ),
            Math.fround( viewPosition.y ), viewPosition.y - Math.fround( viewPosition.y ),
        ]
        let uViewScale = [
            Math.fround( viewScale ), viewScale - Math.fround( viewScale )
        ]
        program.uploadUniform( "viewPosition", uViewPosition )
        program.uploadUniform( "viewScale", uViewScale )

        console.log( uViewPosition[1] )

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4, 4 )
    }

    /** @param {number} millis */
    function renderLoop( millis ) {
        render( millis )
        requestAnimationFrame( renderLoop )
    }
    renderLoop( 0 )
}()