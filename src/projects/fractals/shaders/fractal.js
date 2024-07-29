export const Fractallib = `
#define PI ${Math.PI}
#define TAU ${Math.PI * 2}
#define E ${Math.E}

vec2 cmul(vec2 a, vec2 b) { 
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); 
}
float cmag(vec2 a) { 
    return length(a); 
}
float cmagSq(vec2 a) { 
    return dot(a, a); 
}

struct Fractal {
    vec2  z;
    vec2  c;
    float iterations;
};
Fractal FractalInside() {
    return Fractal(vec2(0), vec2(0), -1.);
}
float FractalSmoothIter(Fractal f) {
    return f.iterations + 1.0 - log(log(cmagSq(f.z)) * 0.5) / log(2.0);
}

vec3 FractalColor(Fractal f, vec3 guideColor, float guideScale) {
    float smoothIter = FractalSmoothIter(f);
    float guideIter  = smoothIter * ${Math.PI * 2} * guideScale;
    return cos(guideColor + guideIter) * .5 + .5;
}
vec3 FractalColorLog(Fractal f, vec3 guideColor, float guideScale) {
    float smoothIter = FractalSmoothIter(f);
    smoothIter       = smoothIter / (1. + exp(-smoothIter)) + 1.;
    float guideIter  = log(smoothIter) * ${Math.PI * 2} * guideScale;
    return cos(guideColor + guideIter) * .5 + .5;
}

Fractal Z2(vec2 z, vec2 c, float exitDistance) {
    float exit       = exitDistance * exitDistance;
    float iterations = -1.;
    for (int i = 0; i < maxIterations; i++) {
        z = cmul(z, z) + c;
        if (cmagSq(z) > exit) {
            iterations = float(i);
            break;
        }
    }
    return Fractal(z, c, iterations);
}

Fractal mandelbrot(vec2 position, float exitDistance) {
    // Check for first and second lobes
    float epsilon = 1e-6;
    float pSq  = cmagSq(position);
    float pSq2 = cmagSq(position + vec2(1,0));
    if (
        256.*pSq*pSq - 96.*pSq + 32.*position.x + epsilon < 3. ||
        pSq2 < .25 * .25
    ) return FractalInside();
    // Compute Fractal
    return Z2(vec2(0), position, exitDistance);
}

Fractal mandelbrotPertubation(vec2 position, vec2 positionDelta, float exitDistance) {
    float exit = exitDistance * exitDistance;

    vec2  z  = vec2(0, 0);
    vec2  dz = vec2(0, 0);
    vec2  c  = position;
    vec2  dc = positionDelta;
    float iterations = -1.;

    for (int i = 0; i < maxIterations; i++) {
        dz = cmul(2. * z + dz, dz) + dc;
        z  = cmul(z, z) + c;

        if (cmagSq(dz) > exit) {
            iterations = float(i);
            break;
        }
    }

    return Fractal(z + dz, c + dc, iterations);
}
`