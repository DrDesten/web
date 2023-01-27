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





const CAMERA_MIN_SIZE = 1
const CAMERA_MARGIN = 0.1
const CAMERA_SMOOTH = 1
const w = { x: 0, y: 0 }

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
        ctx.translate( this.pos.x, this.pos.y )
    },
}

// Game Objects

const missile = {
    pos: new vec2(),
    vel: new vec2(),
    acc: new vec2(),

    heading: new vec2(),
    thrust: 0,

    draw() {
        ctx.fillStyle = "lightblue"
        ctx.fillRect( ...this.pos.copy().sub( 1 ), 2, 2 )
    }
}

const target = {
    pos: new vec2(-10),
    vel: new vec2(),

    draw() {
        ctx.fillStyle = "red"
        ctx.fillRect( ...this.pos.copy().sub( 1 ), 2, 2 )
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
        missile.pos = new vec2( 10, 10 )
        
        
        
    }

    // Move Camera
    camera.transform()

    // Draw Objects
    target.draw()
    missile.draw()

    //crosshair(0.5)
}







function frameCall( time ) {
    update( time )
    requestAnimationFrame( frameCall )
}
requestAnimationFrame( frameCall )