function resize() {}
function render() {}



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
    resize(canvas)
} )
observer.observe( canvas )


// Set up Worker
const physicsWorker = new Worker( "./engine.js" )
let renderData = null

physicsWorker.postMessage( Message( M.setGravity, new vec2( 0, 9.81 ) ) )

physicsWorker.postMessage( Message( M.setTickrate, 100 ) )
physicsWorker.postMessage( Message( M.setTimescale, 1 ) )

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

// Render Function
function render( millis ) {
    if ( !renderData ) return
    if ( renderData.length % 3 != 0 ) console.warn( "Weird renderData Array:", renderData )

    draw.fill("white")
    
    let c = new Circle(new vec2(canvas.width/2, 100), 10)
    c.vel = vec2.random().mul(50)


    for ( let i = 0; i < ~~( renderData.length / 3 ); i++ ) {
        draw.circle(
            new vec2(
                renderData[i * 3],
                renderData[i * 3 + 1],
            ),
            renderData[i * 3 + 2],
            "black"
        )
    }
}

















function frameCall( time ) {
    render( time )
    requestAnimationFrame( frameCall )
}
requestAnimationFrame( frameCall )