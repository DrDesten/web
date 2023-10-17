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
        return new vec2( ...this )
    }
    set( vec = 0, y ) {
        return typeof vec === "number" ? 
            (this.x = vec, this.y = y ?? vec, this) :
            (this.x = vec.x, this.y = vec.y, this)
    }
    reset() {
        return this.x = this.y = 0, this
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
    lengthSq() {
        return this.x * this.x + this.y * this.y
    }

    normalize() {
        return this.mul( 1 / this.length() )
    }
    static normalize( vec ) {
        return vec2.mul( vec, 1 / vec.length() )
    }

    static dist( v1, v2 ) {
        return vec2.sub(v1, v2).length()
    }
    static distSq( v1, v2 ) {
        return vec2.sub(v1, v2).lengthSq()
    }


    rot90() {
        this.x = this.y
        this.y = this.x
        return this
    }
    rotf( angle ) {
        const sin = Math.sin( angle ), cos = Math.cos( angle )
        this.x = cos * this.x - sin * this.y
        this.y = sin * this.x + cos * this.y
        return this
    }
    rot( angle ) {
        const length = this.length()
        const sin = Math.sin( angle ), cos = Math.cos( angle )
        this.x = cos * this.x - sin * this.y
        this.y = sin * this.x + cos * this.y
        return this.normalize().mul( length )
    }

    static rotf( vec, angle ) {
        const sin = Math.sin( angle ), cos = Math.cos( angle )
        vec = vec.copy()
        vec.x = cos * vec.x - sin * vec.y
        vec.y = sin * vec.x + cos * vec.y
        return vec
    }
    static rot( vec, angle ) {
        const length = vec.length()
        const sin = Math.sin( angle ), cos = Math.cos( angle )
        vec = vec.copy()
        vec.x = cos * vec.x - sin * vec.y
        vec.y = sin * vec.x + cos * vec.y
        return vec.normalize().mul( length )
    }
    static fromAngle( angle ) {
        return new vec2( Math.cos( angle ), Math.sin( angle ) )
    }


    lerp( vec, factor ) {
        this.x = this.x * (1 - factor) + vec.x * factor
        this.y = this.y * (1 - factor) + vec.y * factor
        return this
    }
    static lerp( v1, v2, factor ) {
        return new vec2( 
            v1.x * (1 - factor) + v2.x * factor,
            v1.y * (1 - factor) + v2.y * factor,
        )
    }


    abs() {
        return this.x = Math.abs(this.x), this.y = Math.abs(this.y), this
    }
    static abs( vec ) {
        return new vec2( Math.abs(vec.x), Math.abs(vec.y) )
    }

    dot( vec ) {
        return this.x * vec.x + this.y * vec.y
    }
    static dot( v1, v2 ) {
        return v1.x * v2.x + v1.y * v2.y
    }

    static get random() {
        return Object.assign(
            function ( multiplier = 1 ) {
                return new vec2((Math.random() * 2 - 1) * multiplier, (Math.random() * 2 - 1) * multiplier)
            }, {
            unit() {
                return vec2.fromAngle( Math.random() * Math.PI * 2 )
            },
        } )
    }


    static isNaN( vec ) {
        return isNaN(vec.x) || isNaN(vec.y)
    }
    static isFinite( vec ) {
        return isFinite(vec.x) && isFinite(vec.y)
    }

    toString() {
        return `{ ${this.x}, ${this.y}] }`
    }
}