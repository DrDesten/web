const CIRCLE_IDPOOL = { id: 0 }

class Circle {
    constructor( position = new vec2, radius = 1, bounce = 0.5 ) {
        this.id = CIRCLE_IDPOOL.id++

        this.pos = position
        this.vel = new vec2
        this.acc = new vec2
        this.radius = radius

        this.bounce = bounce
    }

    static fromObject( obj = {} ) {
        obj.__proto__ = Circle.prototype
        obj.pos.__proto__ = vec2.prototype
        obj.vel.__proto__ = vec2.prototype
        obj.acc.__proto__ = vec2.prototype
        return obj
    }

    static fromBuffer( array, index ) {
        index *= 4
        const obj = Object.create(Circle.prototype)
        obj.id = array[index]
        obj.pos = new vec2(array[index+1], array[index+2])
        obj.radius = array[index+3]
        return obj
    }

    static get renderSize() {
        return 4
    }
}