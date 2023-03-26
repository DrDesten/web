class Circle {
    constructor( position = new vec2, radius = 1, bounce = 0.5 ) {
        this.pos = position
        this.vel = new vec2
        this.acc = new vec2
        this.radius = radius

        this.bounce = bounce
    }

    static fromObject( obj ) {
        const circle = new Circle()
        circle.pos = new vec2(obj.pos)
        circle.vel = new vec2(obj.vel)
        circle.acc = new vec2(obj.acc)
        circle.radius = +obj.radius
        circle.bounce = +obj.bounce
        return circle
    }
}