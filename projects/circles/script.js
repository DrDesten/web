function resize() {}
function render() {}


const WORLDSCALE = 100
const BOUNDRIES = {}

// Initialize Canvas
const canvas = document.querySelector( "canvas" )
const ctx = canvas.getContext( "2d" )
const draw = new Canvas2dDrawWrapper( ctx )

// Canvas Resizes with Screen
const resolutionScale = 1
const observer = new ResizeObserver( entries => {
    const dim = entries[0].contentRect
    canvas.width = dim.width * resolutionScale
    canvas.height = dim.height * resolutionScale
    resize()
} )
observer.observe( canvas )

// Set Boundries
function updateBoundries() {
    BOUNDRIES.top = canvas.height / WORLDSCALE
    BOUNDRIES.bottom = 0
    BOUNDRIES.left = 0
    BOUNDRIES.right = canvas.width / WORLDSCALE
}
updateBoundries()


// Set up Worker
const physicsWorker = new Worker( "./engine.js" )
let renderData = null

physicsWorker.postMessage( Message( M.setGravity, new vec2( 0, -9.81 ) ) )

physicsWorker.postMessage( Message( M.setTickrate, 1000 / 60 ) )
physicsWorker.postMessage( Message( M.setTimescale, 1 ) )

physicsWorker.postMessage( Message( M.setBoundries, BOUNDRIES ) )
physicsWorker.postMessage( Message( M.start ) )

physicsWorker.onmessage = function ( e ) {
    const type = e.data.type
    const data = e.data.data

    switch ( type ) {
        case M.renderData:
            renderData = data
            break

        default:
            console.warn( "Main Thread:", "Unrecognized Message from Physics Worker:", e.data )
    }
}

for (let i = 0; i < 2; i++) {
    const c = new Circle(vec2.random(10).abs(), 1, 1)
    c.vel = vec2.random(10)
    physicsWorker.postMessage( Message( M.pushCircle, c ) )
}

// Window Resize
function resize() {
    ctx.resetTransform()
    ctx.scale(1, -1)
    ctx.translate(0, -canvas.height)

    updateBoundries()
    physicsWorker.postMessage( Message( M.setBoundries, BOUNDRIES ) )
}


// Render Function
function render( millis ) {
    if ( !renderData ) return
    if ( renderData.length % 3 != 0 ) console.warn( "Weird renderData Array:", renderData )

    draw.fill("white")


    for ( let i = 0; i < ~~( renderData.length / 3 ); i++ ) {
        const pos = new vec2(
            renderData[i * 3],
            renderData[i * 3 + 1],
        ).mul(WORLDSCALE)
        const radius = renderData[i * 3 + 2] * WORLDSCALE

        draw.circle(pos, radius, `rgba(${i * 255},0,0,0.5)`)
    }
}

















function frameCall( time ) {
    render( time )
    requestAnimationFrame( frameCall )
}
requestAnimationFrame( frameCall )