function froundMargin( x, margin ) {
    const buffer = new ArrayBuffer( 4 )
    const float = new Float32Array( buffer )
    const int = new Uint32Array( buffer )
    float[0] = x
    int[0] &= ~( ~0 >>> ( 32 - margin ) )
    return float[0]
}
/** @param {number} number  */
export function splitFloat( number, margin = 0 ) {
    const round = margin === 0 ? Math.fround( number ) : froundMargin( number, margin )
    const error = number - round
    return [round, error]
}
/** @param {number[]} numbers  */
export function splitFloats( numbers, margin = 0 ) {
    const split = numbers.map( x => splitFloat( x, margin ) )
    return [...split.map( x => x[0] ), ...split.map( x => x[1] )]
}

export const dfloat = `

#pragma optimize(off)
#pragma optionNV(fastmath off)
#pragma optionNV(fastprecision off)

#define dfloat vec2
dfloat dnew(float x) { return dfloat(x, 0.); }
dfloat dnew(float x, float y) { return dfloat(x, y); }

float toFloat(dfloat a) { return a.x + a.y; }

float dcomp(vec2 a, vec2 b) {
    if (a.x < b.x) {
        return -1.;
    } else if (a.x == b.x) {
        if      (a.y < b.y)  return -1.;
        else if (a.y == b.y) return 0.;
        else                 return 1.;
    } else {
        return 1.;
    }
}

dfloat dadd(dfloat a, dfloat b) { 
    dfloat res;
    float  t1, t2, e;

    t1 = a.x + b.x;
    e  = t1 - a.x;
    t2 = ((b.x - e) + (a.x - (t1 - e))) + a.y + b.y;

    res.x = t1 + t2;
    res.y = t2 - (res.x - t1);
    return res;
}
dfloat dsub(dfloat a, dfloat b) { 
    dfloat res;
    float  t1, t2, e;

    t1 = a.x - b.x;
    e  = t1 - a.x;
    t2 = ((-b.x - e) + (a.x - (t1 - e))) + a.y - b.y;

    res.x = t1 + t2;
    res.y = t2 - (res.x - t1);
    return res;
}
dfloat dmul(dfloat a, dfloat b) { 
    dfloat res;
    float  c11, c21, c2, e, t1, t2;
    float  a1, a2, b1, b2, cona, conb, split = 8193.;

    cona = a.x * split;
    conb = b.x * split;
    a1 = cona - (cona - a.x);
    b1 = conb - (conb - b.x);
    a2 = a.x - a1;
    b2 = b.x - b1;

    c11 = a.x * b.x;
    c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

    c2 = a.x * b.y + a.y * b.x;

    t1 = c11 + c2;
    e = t1 - c11;
    t2 = a.y * b.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

    res.x = t1 + t2;
    res.y = t2 - (res.x - t1);

    return res;
}
dfloat dsq(dfloat a) { 
    return dmul(a, a); 
}

struct dfloat2 { dfloat x; dfloat y; };
dfloat2 d2new(float x) { return dfloat2(dnew(x), dnew(x)); }
dfloat2 d2new(vec2 v) { return dfloat2(dnew(v.x), dnew(v.y)); }
dfloat2 d2new(float x, float y) { return dfloat2(dnew(x), dnew(y)); }
dfloat2 d2new(dfloat x, dfloat y) { return dfloat2(x, y); }

dfloat2 d2add(dfloat2 a, dfloat2 b) { return dfloat2(dadd(a.x, b.x), dadd(a.y, b.y)); }
dfloat2 d2sub(dfloat2 a, dfloat2 b) { return dfloat2(dsub(a.x, b.x), dsub(a.y, b.y)); }
dfloat2 d2mul(dfloat2 a, dfloat2 b) { return dfloat2(dmul(a.x, b.x), dmul(a.y, b.y)); }
dfloat2 d2sq(dfloat2 a) { return dfloat2(dsq(a.x), dsq(a.y)); }

dfloat d2dot(dfloat2 a, dfloat2 b) { return dadd(dmul(a.x, b.x), dmul(a.y, b.y)); }
dfloat d2lengthSq(dfloat2 a) { return dadd(dsq(a.x), dsq(a.y)); }

`

/* 
#define dfloat vec2
dfloat dnew( float x ) { return dfloat( x, 0. ) }
dfloat dnew( float x, float y ) { return dfloat( x, y ) }

float toFloat( dfloat a ) { return a.x + a.y }

dfloat dadd( dfloat a, dfloat b ) { return dfloat( a.x + b.x, a.y + b.y ) }
dfloat dsub( dfloat a, dfloat b ) { return dfloat( a.x - b.x, a.y - b.y ) }
dfloat dmul( dfloat a, float b ) { return dfloat( a.x * b, a.y * b ) }
dfloat dmul( float a, dfloat b ) { return dfloat( a * b.x, a * b.y ) }
dfloat dmul( dfloat a, dfloat b ) { 
    float uu = a.x * b.x;
    float ul = a.x * b.y;
    float lu = a.y * b.x;
    float ll = a.y * b.y
    if ( abs( ul ) < abs( lu ) ) {
        float t = ul
        ul = lu
        lu = t
    }
    return dfloat( uu + ul, lu + ll )
}
dfloat dsq( dfloat a ) { return dfloat( a.x * a.x, 2. * a.x * a.y + a.y * a.y ) }

dfloat renormalize( dfloat a ) {
    float f = a.x + a.y;
    float d = f - a.x
    return dfloat( a.x + d, a.y - d )
}

struct dfloat2 { dfloat x; dfloat y };
dfloat2 d2new( vec2 v ) { return dfloat2( dnew( v.x ), dnew( v.y ) ) }
dfloat2 d2new( float x, float y ) { return dfloat2( dnew( x ), dnew( y ) ) }
dfloat2 d2new( dfloat x, dfloat y ) { return dfloat2( x, y ) }

dfloat2 d2add( dfloat2 a, dfloat2 b ) { return dfloat2( dadd( a.x, b.x ), dadd( a.y, b.y ) ) }
dfloat2 d2sub( dfloat2 a, dfloat2 b ) { return dfloat2( dsub( a.x, b.x ), dsub( a.y, b.y ) ) }
dfloat2 d2mul( dfloat2 a, dfloat2 b ) { return dfloat2( dmul( a.x, b.x ), dmul( a.y, b.y ) ) }
dfloat2 d2sq( dfloat2 a ) { return dfloat2( dsq( a.x ), dsq( a.y ) ) }

float d2dot( dfloat2 a, dfloat2 b ) { return toFloat( dmul( a.x, b.x ) ) + toFloat( dmul( a.y, b.y ) ) }
float d2lengthSq( dfloat2 a ) { return toFloat( dadd( dsq( a.x ), dsq( a.y ) ) ) }

dfloat2 renormalize( dfloat2 a ) { return dfloat2( renormalize( a.x ), renormalize( a.y ) ) }
 */