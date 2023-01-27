class vec2 {
    constructor( x = 0, y ) {
        if ( typeof x === "number" )
            this.x = x, this.y = y ?? x
        else
            this.x = x.x, this.y = x.y ?? x.x
    }

    *[Symbol.iterator]() {
        yield this.x
        yield this.y
    }
    copy() {
        return new vec2( this.x, this.y )
    }

    add( vec ) {
        if ( typeof vec === "number" )
            this.x += vec, this.y += vec
        else
            this.x += vec.x, this.y += vec.y
        return this
    }
    sub( vec ) {
        if ( typeof vec === "number" )
            this.x -= vec, this.y -= vec
        else
            this.x -= vec.x, this.y -= vec.y
        return this
    }
    mul( vec ) {
        if ( typeof vec === "number" )
            this.x *= vec, this.y *= vec
        else
            this.x *= vec.x, this.y *= vec.y
        return this
    }
    div( vec ) {
        if ( typeof vec === "number" )
            this.x /= vec, this.y /= vec
        else
            this.x /= vec.x, this.y /= vec.y
        return this
    }

    static add( v1, v2 ) {
        if ( typeof v2 === "number" )
            return new vec2( v1.x + v2, v1.y + v2 )
        else
            return new vec2( v1.x + v2.x, v1.y + v2.y )
    }
    static sub( v1, v2 ) {
        if ( typeof v2 === "number" )
            return new vec2( v1.x - v2, v1.y - v2 )
        else
            return new vec2( v1.x - v2.x, v1.y - v2.y )
    }
    static mul( v1, v2 ) {
        if ( typeof v2 === "number" )
            return new vec2( v1.x * v2, v1.y * v2 )
        else
            return new vec2( v1.x * v2.x, v1.y * v2.y )
    }
    static div( v1, v2 ) {
        if ( typeof v2 === "number" )
            return new vec2( v1.x / v2, v1.y / v2 )
        else
            return new vec2( v1.x / v2.x, v1.y / v2.y )
    }

    length() {
        return Math.sqrt( this.x * this.x + this.y * this.y )
    }
    normalize() {
        return this.mul( 1 / this.length() )
    }


    rotate( angle ) {
        const sin = Math.sin(angle), cos = Math.cos(angle)
        this.x = sin * this.x + cos * this.y
        this.y = cos * this.x - sin * this.y
        return this
    }
    static fromAngle( angle ) {
        return new vec2( Math.sin( angle ), Math.cos( angle ) )
    }


}