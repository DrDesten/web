import { Shader } from "../gl/shader.js"
import { Fractallib } from "./fractal.js"

export const juliaShader = new Shader( `
    in vec2 vertexPosition;
    void main(){
        gl_Position = vec4(vertexPosition, 0, 1);
    }
`, `
    uniform int maxIterations;
    uniform vec3 guideColor;
    uniform float guideScale;

    uniform vec2 screenSize;
    uniform vec2 screenSizeInverse;
    uniform vec2 mainScreenSize;
    uniform vec2 mainScreenSizeInverse;
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

        vec2 fragCoord  = (gl_FragCoord.xy - screenSize * .5) 
                        * screenSizeInverse.y * .5;
        vec2 mouseCoord = (mousePosition - .5)
                        * (mainScreenSize * mainScreenSizeInverse.y * .5)
                        * cameraScale;
        vec2 position   = fragCoord * 6.;

        Fractal f = Z2(position, cameraPosition + mouseCoord, 16.);

        if (f.iterations == -1.) {
            fragColor = vec4(0,0,0,1);
            return;
        }

        vec3 fractalColor = FractalColor(f, guideColor, guideScale);

        fragColor = vec4(fractalColor, 1.0);
    }
`)