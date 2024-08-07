let lab6lookup = []

class v extends Float64Array {
    constructor( arg1 = 0, arg2 = 0, arg3 = 0 ) {
        if ( arg1 instanceof v ) {
            super( [...arg1] )
        } else if ( arg1 instanceof Array ) {
            super( [...arg1] )
        } else {
            super( [arg1, arg2, arg3] )
        }
    }

    get r() { return this[0] }
    set r( value ) { this[0] = value }

    get g() { return this[1] }
    set g( value ) { this[1] = value }

    get b() { return this[2] }
    set b( value ) { this[2] = value }

    get x() { return this[0] }
    set x( value ) { this[0] = value }

    get y() { return this[1] }
    set y( value ) { this[1] = value }

    get z() { return this[2] }
    set z( value ) { this[2] = value }

    add( other ) {
        if ( other instanceof v ) {
            return new v( this[0] + other[0], this[1] + other[1], this[2] + other[2] )
        } else if ( typeof other === 'number' ) {
            return new v( this[0] + other, this[1] + other, this[2] + other )
        } else {
            throw new Error( 'Invalid argument type for add function.' )
        }
    }

    sub( other ) {
        if ( other instanceof v ) {
            return new v( this[0] - other[0], this[1] - other[1], this[2] - other[2] )
        } else if ( typeof other === 'number' ) {
            return new v( this[0] - other, this[1] - other, this[2] - other )
        } else {
            throw new Error( 'Invalid argument type for sub function.' )
        }
    }

    mul( other ) {
        if ( other instanceof v ) {
            return new v( this[0] * other[0], this[1] * other[1], this[2] * other[2] )
        } else if ( typeof other === 'number' ) {
            return new v( this[0] * other, this[1] * other, this[2] * other )
        } else {
            throw new Error( 'Invalid argument type for mul function.' )
        }
    }

    div( other ) {
        if ( other instanceof v ) {
            return new v( this[0] / other[0], this[1] / other[1], this[2] / other[2] )
        } else if ( typeof other === 'number' ) {
            return new v( this[0] / other, this[1] / other, this[2] / other )
        } else {
            throw new Error( 'Invalid argument type for div function.' )
        }
    }

    length() {
        return Math.sqrt( this[0] ** 2 + this[1] ** 2 + this[2] ** 2 )
    }

    static dist( vec1, vec2 ) {
        if ( !( vec1 instanceof v ) || !( vec2 instanceof v ) )
            throw new Error( 'Invalid argument type for dist function.' )
        return vec1.sub( vec2 ).length()
    }

    static min( arg1, arg2 ) {
        return new v(
            Math.min( arg1[0] ?? arg1, arg2[0] ?? arg2 ),
            Math.min( arg1[1] ?? arg1, arg2[1] ?? arg2 ),
            Math.min( arg1[2] ?? arg1, arg2[2] ?? arg2 )
        )
    }

    static max( arg1, arg2 ) {
        return new v(
            Math.max( arg1[0] ?? arg1, arg2[0] ?? arg2 ),
            Math.max( arg1[1] ?? arg1, arg2[1] ?? arg2 ),
            Math.max( arg1[2] ?? arg1, arg2[2] ?? arg2 )
        )
    }

    static clamp( value, min, max ) {
        return v.max( v.min( value, max ), min )
    }

    static saturate( value ) {
        return v.clamp( value, 0, 1 )
    }
}

function rgb2oklab( c ) {
    const l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b
    const m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b
    const s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b

    const l_ = Math.cbrt( l )
    const m_ = Math.cbrt( m )
    const s_ = Math.cbrt( s )

    return new v(
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    )
}

function oklab2rgb( c ) {
    const l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z
    const m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z
    const s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z

    const l = l_ * l_ * l_
    const m = m_ * m_ * m_
    const s = s_ * s_ * s_

    return new v(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    )
}

function decodeLab6( color ) {
    const bits = new v( color & 3, ( color >> 2 ) & 1, ( color >> 3 ) & 7 )

    const lightness = bits.x / 3.0
    const chroma = bits.y === 1 ? 0.325 : 0.2
    const hue = bits.z / 8.0 * Math.PI * 2.0

    const lab = new v(
        ( 1.0 - chroma ),
        chroma * Math.cos( hue ),
        chroma * Math.sin( hue )
    )

    return v.saturate( oklab2rgb( lab ).mul( lightness * lightness ) )
}

function encodeLab6( color ) {
    if ( lab6lookup.length === 0 ) {
        lab6lookup = new Array( 64 ).fill().map( ( _, i ) => rgb2oklab( decodeLab6( i ) ) )
    }

    const labcolor = rgb2oklab( color )
    const closest = lab6lookup.slice().sort( ( a, b ) => v.dist( a, labcolor ) - v.dist( b, labcolor ) )[0]

    return lab6lookup.indexOf( closest )
}