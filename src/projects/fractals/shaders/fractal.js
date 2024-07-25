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
    float iterations;
};

Fractal Z2(vec2 z, vec2 c) {
    const float exitDistance = 5.;
    const float exitDistanceSq = exitDistance * exitDistance;

    float iterations = -1.;
    for (int i = 0; i < maxIterations; i++) {
        z = cmul(z, z) + c;
        if (cmagSq(z) > exitDistanceSq) {
            iterations = float(i);
            break;
        }
    }

    return Fractal(z, iterations);
}

Fractal mandelbrot(vec2 position) {
    // Check for first and second lobes
    float epsilon = 1e-6;
    float pSq  = cmagSq(position);
    float pSq2 = cmagSq(position + vec2(1,0));
    if (
        256.*pSq*pSq - 96.*pSq + 32.*position.x + epsilon < 3. ||
        pSq2 < .25 * .25
    ) return Fractal(vec2(0, 0), -1.);
    // Compute Fractal
    return Z2(vec2(0, 0), position);
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

        if (cmagSq(dz) > exitDistanceSq) {
            iterations = float(i);
            break;
        }
    }

    return Fractal(z + dz, iterations);
}
`