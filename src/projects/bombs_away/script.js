// Initialize Canvas
const canvas = document.querySelector( "canvas" )
const ctx = canvas.getContext( "2d" )

// Canvas Resizes with Screen
const resolutionScale = 1
const observer = new ResizeObserver( entries => {
    const dim = entries[0].contentRect
    canvas.width = dim.width * resolutionScale
    canvas.height = dim.height * resolutionScale
} )
observer.observe( canvas )





const CAMERA_MIN_SIZE = 0.05
const CAMERA_MARGIN = 0.5
const CAMERA_MOVE_SMOOTH = 0.9
const CAMERA_SCALE_SMOOTH = 0.9
const w = { x: 0, y: 0 }

const DELTA = 1./30
const GRAVITY = new vec2(0, -9.81)

/* const cameraController = {
    pos: createVector(0,0),
    scale: 1.0,

    update() {
        translate(this.pos)
    },
}

const missile = {
    pos: createVector(0,0),
    vel: createVector(0,0),
    acc: createVector(0,0),

    thrust: 0,
    heading: createVector(0,1),

    update() {
        this.acc = this.heading.normalize().mul(this.thrust)
        this.vel.add(this.acc)
        this.pos.add(this.vel)
    },
    draw() {
        fill(0,100,255)
        noStroke()
        circle(0,0,1,1)
    },
}
const target = {
    pos: createVector(0,0),
    vel: createVector(0,0),
    acc: createVector(0,0),

    update() {
        this.vel.add(this.acc)
        this.pos.add(this.vel)
    },
    draw() {
        fill(255,0,0)
        noStroke()
        circle(0,0,1,1)
    },
} */

// Camera and Transformations

function crosshair( scale = 1 ) {
    ctx.fillStyle = "gray"
    ctx.fillRect( -scale, -scale, 2 * scale, 2 * scale )
    ctx.fillStyle = "black"
    ctx.fillRect( -scale * .1, -scale * .1, scale * .2, scale * .2 )

    ctx.fillStyle = "red"
    ctx.fillRect( scale * .9, -scale * .1, scale * .2, scale * .2 )
    ctx.fillStyle = "lime"
    ctx.fillRect( -scale * .1, scale * .9, scale * .2, scale * .2 )
    ctx.fillStyle = "cyan"
    ctx.fillRect( -scale * 1.1, -scale * .1, scale * .2, scale * .2 )
    ctx.fillStyle = "magenta"
    ctx.fillRect( -scale * .1, -scale * 1.1, scale * .2, scale * .2 )
}

const camera = {
    pos: new vec2(),
    scale: .05,

    transform() {
        // Set aspect ratio
        ctx.scale( 1, canvas.width / canvas.height )
        // Set position and scale
        ctx.scale( this.scale, this.scale )
        ctx.translate( -this.pos.x, -this.pos.y )
    },
    update() {
        const mPos = missile.pos
        const tPos = target.pos
        this.pos.lerp( vec2.add(mPos, tPos).mul(.5), 1 - CAMERA_MOVE_SMOOTH)

        const xDist = Math.abs(mPos.x - tPos.x)
        const yDist = Math.abs(mPos.y - tPos.y)
        const xFrame = 1
        const yFrame = canvas.height / canvas.width

        let newScale = CAMERA_MARGIN * Math.min(xFrame / xDist * 2, yFrame / yDist * 2)
        newScale = Math.min(CAMERA_MIN_SIZE, newScale)
        this.scale = this.scale * CAMERA_SCALE_SMOOTH + newScale * (1 - CAMERA_SCALE_SMOOTH)
    },
}

// Game Objects

const missile = {
    physics: new PhysicsObject,
    get pos() { return this.physics.pos },
    get vel() { return this.physics.vel },
    get acc() { return this.physics.acc },

    heading: new vec2,
    thrust: 0,

    draw() {
        ctx.fillStyle = "lightblue"
        ctx.fillRect( ...this.pos.copy().sub( 1 ), 2, 2 )
    },
    update() {
        this.acc.add(vec2.mul(this.heading, this.thrust))
        this.physics.update(DELTA)
    }
}

const target = {
    physics: new PhysicsObject,
    get pos() { return this.physics.pos },
    get vel() { return this.physics.vel },
    get acc() { return this.physics.acc },

    draw() {
        ctx.fillStyle = "red"
        ctx.fillRect( ...this.pos.copy().sub( 1 ), 2, 2 )
    },
    update() {
        this.physics.update(DELTA)
    }
}


function update( millis ) {

    // Set the origin to be in the center
    ctx.resetTransform()
    ctx.translate( canvas.width * .5, canvas.height * .5 )
    ctx.scale( canvas.width * .5, -canvas.height * .5 )

    // Clear Background
    ctx.fillStyle = "white"
    ctx.fillRect( -1, -1, 2, 2 )

    // Game Logic
    {

        target.pos.set(10)

        guideMissile(missile, target)
        
    }

    // Gravity
    target.acc.add(GRAVITY)
    missile.acc.add(GRAVITY)


    // Update Objects
    target.update()
    missile.update()
    target.physics.updateCollision()
    missile.physics.updateCollision()

    // Ground Collision
    if ( target.pos.y <= 0 ) {
        target.pos.y = 0
        target.vel.y = 0
    }
    if ( missile.pos.y <= 0 ) {
        missile.pos.y = 0
        missile.vel.y = 0
    }

    // Move Camera
    camera.update()
    camera.transform()

    // Draw Objects
    target.draw()
    missile.draw()

    // Draw Ground Plane
    ctx.fillStyle = "gray"
    ctx.fillRect(Number.MIN_SAFE_INTEGER * .5, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)

    crosshair(1)
}


function guideMissile(missile, target) {
    missile.heading = vec2.sub(target.pos, missile.pos).normalize()
    missile.thrust = 10
}




function frameCall( time ) {
    update( time )
    requestAnimationFrame( frameCall )
}
requestAnimationFrame( frameCall )