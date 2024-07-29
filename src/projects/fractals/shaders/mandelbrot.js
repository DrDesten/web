import { Shader } from "../gl/shader.js"
import { Fractallib } from "./fractal.js"

export const mandelbrotShader = new Shader( `
    in vec2 vertexPosition;
    void main(){
        gl_Position = vec4(vertexPosition, 0, 1);
    }
`, `
    uniform int maxIterations;
    uniform vec3 guideColor;
    uniform vec2 screenSize;
    uniform vec2 screenSizeInverse;
    uniform vec2 cameraPosition;
    uniform float cameraScale;
    uniform vec2 mousePosition;
    uniform vec2 viewPosition;
    uniform float viewScale;

    ${Fractallib}

    float lengthSq(vec2 z) {
        return dot(z, z);
    }

    out vec4 fragColor;
    void main() {
        const float exitDistance = 5.;

        vec2 fragCoord      = (gl_FragCoord.xy - screenSize * .5)
                            * screenSizeInverse.y * .5;
        vec2 position       = cameraPosition;
        vec2 position_delta = fragCoord * cameraScale;

        Fractal f = mandelbrot(position + position_delta);

        /* if (length(position_delta) < 0.003 * cameraScale.x) {
            fragColor = vec4(1,0,0,1);
            return;
        } */

        if (f.iterations == -1.) {
            fragColor = vec4(0,0,0,1);
            return;
        }

        const float guideScale = 1. / 10.;

        float smoothIter = f.iterations + 1.0 - log(log(length(f.z))) / log(2.0);
        float guideIter  = smoothIter * TAU * guideScale;

        fragColor = vec4(cos(guideColor + smoothIter * 0.2) * .5 + .5, 1.0);
    }
`)