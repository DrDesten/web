function VectorAuto( vector, y, z, w ) {
    if ( typeof vector === "number" ) {
        const dimensions = w != undefined ? 4 : z != undefined ? 3 : y != undefined ? 2 : 1
        if      ( dimensions == 1 ) return vector
        else if ( dimensions == 2 ) return new Vector2D( vector, y )
        else if ( dimensions == 3 ) return new Vector3D( vector, y, z )
        else if ( dimensions == 4 ) return new Vector4D( vector, y, z, w )
    } else {
        const dimensions = vector.dimensions
        if      ( dimensions == 2 ) return new Vector2D( vector.x, vector.y )
        else if ( dimensions == 3 ) return new Vector3D( vector.x, vector.y, vector.z )
        else if ( dimensions == 4 ) return new Vector4D( vector.x, vector.y, vector.z, vector.w )
    }
}

class Vector {
    
    static from(point) {
        const a = point
        return { to(point) {
            return VectorAuto(point).sub(a)
        }}
    }
    static to(point) {
        const a = point 
        return { from(point) {
            return VectorAuto(a).sub(point)
        }}
    }
}

class Vector3D {
    constructor(x, y, z) {
        if (typeof x === 'number')
            this.x = x, this.y = y ?? x, this.z = z ?? y ?? x
        else if (Array.isArray(x))
            this.x = x[0], this.y = x[1] ?? x[0], this.z = x[2] ?? x[1] ?? x[0]
        else
            this.x = x.x, this.y = x.y ?? x.x, this.z = x.z ?? x.y ?? x.x
        
        this.dimensions = 3
    }

    clone() {
        return new Vector3D(this)
    }
    

    // Arithmetic ////////////////////////////////////////////

    add(v) {
        if (typeof v === 'number') 
            this.x += v, this.y += v, this.z += v
        else 
            this.x += v.x, this.y += v.y, this.z += v.z
        return this
    }

    sub(v) {
        if (typeof v === 'number') 
            this.x -= v, this.y -= v, this.z += v
        else 
            this.x -= v.x, this.y -= v.y, this.z += v.z
        return this
    }

    mult(v) {
        if (typeof v === 'number') 
            this.x *= v, this.y *= y, this.z *= v
        else 
            this.x *= v.x, this.y *= v.y, this.z *= v.z
        return this
    }

    div(v) {
        if (typeof v === 'number') {
            const inv = 1 / v
            this.x *= inv, this.y *= inv, this.z *= inv
        } else 
            this.x /= v.x, this.y /= v.y, this.z /= v.z
        return this
    }



    // Other Methods //////////////////////////////////////////////////////

    length() {
        return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z )
    }
    distance(v) {
        const difference = { x: this.x - v.x, y: this.y - v.y, z: this.z - v.z }
        return Math.sqrt( difference.x * difference.x + difference.y * difference.y + difference.z * difference.z )
    }
    normalize() {
        const scale = 1 / Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z )
        this.x *= scale, this.y *= scale, this.z *= scale
        return this
    }
    setLength( length ) {
        const scale = length / Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z )
        this.x *= scale, this.y *= scale, this.z *= scale
        return this
    }

}


const JVec = Object.assign(
    Vector, 
    {
        vec3: Vector3D,
    }
)