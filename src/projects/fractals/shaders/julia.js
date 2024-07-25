import { Shader } from "../gl/shader.js"
import { Fractallib } from "./fractal.js"

export const juliaShader = new Shader( `
    in vec2 vertexPosition;
    void main(){
        gl_Position = vec4(vertexPosition, 0, 1);
    }
`, `
    uniform int maxIterations;
    uniform vec4 screenSize;
    uniform vec4 screenSizeInverse;
    uniform vec4 cameraPosition;
    uniform vec2 cameraScale;
    uniform vec4 viewPosition;
    uniform vec2 viewScale;

    ${Fractallib}

    float lengthSq(vec2 z) {
        return dot(z, z);
    }

    out vec4 fragColor;
    void main() {
        const float exitDistance = 5.;

        vec2 fragCoord = (gl_FragCoord.xy - screenSize.xy * .5) * screenSizeInverse.y * .5;
        vec2 position  = fragCoord * 8.;

        Fractal f = Z2(position, cameraPosition.xy);

        if (f.iterations == -1.) {
            fragColor = vec4(0,0,0,1);
            return;
        }

        const vec3  guideColor = vec3(.5, .4, 1);
        const float guideScale = 1. / 10.;

        float smoothIter = f.iterations + 1.0 - log(log(length(f.z))) / log(2.0);
        float guideIter  = smoothIter * TAU * guideScale;

        fragColor = vec4(cos(guideColor + smoothIter * 0.2) * .5 + .5, 1.0);
    }
`)