/** @type {PhysicsObject[]} */
const PhysicsObjects = []

class PhysicsCollider {
    /** @param {PhysicsObject} parent */
    constructor( parent, opts = {} ) {
        this.parent = parent
        this.pos    = opts.pos ?? new vec2
        this.radius = opts.radius ?? 1
    }
}
class PhysicsObject {
    constructor(  ) {
        // Movement Properties
        this.pos = new vec2
        this.vel = new vec2
        this.acc = new vec2

        // Collider Properties
        this.collider = new PhysicsCollider(this)

        PhysicsObjects.push(this)
    }

    update( delta = 1 ) {
        this.vel.add(vec2.mul(this.acc, delta))
        this.pos.add(vec2.mul(this.vel, delta))
        this.acc.set(0)
        this.collider.pos = this.pos
    }

    updateCollision() {
        for (const obj of PhysicsObjects) {
            if (obj === this) continue
            const diff = vec2.sub(obj.pos, this.pos) // vector pointing from 'this' to 'obj'
            const dist = diff.length()
            if (dist < this.radius + obj.radius) {
                this.acc.set(0)
                this.vel.set(0)
            }
        }
    }
}