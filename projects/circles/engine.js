importScripts( "./constants.js", "./vector.js", "./circle.js" )


let TICKRATE = 1000
let TIMESCALE = 1.0
let GRAVITY = new vec2

let STATE = false

const gameObjects = []

function serialize( arr ) {
    const typedArray = new Float32Array( arr.length * 3 )
    for ( let i = 0; i < arr.length; i++ ) {
        typedArray[i * 3] = arr[i].pos.x
        typedArray[i * 3 + 1] = arr[i].pos.y
        typedArray[i * 3 + 2] = arr[i].radius
    }
    return typedArray
}

onmessage = function ( e ) {
    const type = e.data.type
    const data = e.data.data
    switch ( type ) {
        case M.pushCircle:
            gameObjects.push( Circle.fromObject( data ) )
            break

        case M.setTickrate:
            TICKRATE = +data
            break
        case M.setTimescale:
            TIMESCALE = +data
            break
        case M.setGravity:
            GRAVITY = new vec2( data )
            break


        case M.start:
            STATE = true
            __tick(0)
            break
        case M.pause:
            STATE = false
            break
        case M.reset:
            gameObjects = []
            break

        default:
            console.warn( "Physics Worker:", "Unrecognized Message from Main Thread:", e.data )
    }
}

function render( millis ) {

    for ( let i = 0; i < gameObjects.length; i++ ) {
        const circle = gameObjects[i]

        circle.acc.add( GRAVITY )
        circle.vel.add( circle.acc.copy().mul( TIMESCALE * TICKRATE / 1000 ) )
        circle.pos.add( circle.vel.copy().mul( TIMESCALE * TICKRATE / 1000 ) )

        circle.acc.reset()
    }

    const serializedObjects = serialize( gameObjects )
    postMessage( ...Message( M.renderData, serializedObjects, [serializedObjects.buffer] ) )
}























// Dispatch ticks at a target tickrate
//   Will hold tickrate while execution time < tick rate,
//    independent of execution time fluctuations
//   Does not pile up when execution time > tick rate

// Tick dispatcher
function __tick( timeout ) {
    setTimeout( function () {
        // Measure execution time of update()
        const callTime = performance.now()
        render( callTime )
        const execTime = performance.now()

        // Calculate remaining time in the tick
        // If execution took too long, clamp delay at 0ms
        const timeout = Math.max( 0, TICKRATE - ( execTime - callTime ) )
        // Dispatch next tick
        if (STATE) __tick( timeout )
    }, timeout )
}

// Tick dispatcher ( with timing benchmarks )
let lastCall = NaN
let lastExec = NaN
let lastDisp = NaN
function __tick_logger( timeout ) {
    setTimeout( function ( dispatchTime ) {

        const callTime = performance.now()
        render( callTime )

        const tickLength = dispatchTime - lastDisp
        const execLength = lastExec - lastCall
        const idleLength = callTime - dispatchTime

            ; ( tickLength > TICKRATE + 5 && tickLength > TICKRATE * 1.1 ? console.warn : console.log )(
                `${execLength}ms exec (${Math.round( execLength / TICKRATE * 100 )}%), ` +
                `${idleLength}ms idle (${Math.round( idleLength / TICKRATE * 100 )}%), ` +
                `${tickLength}ms tick (${Math.round( tickLength / TICKRATE * 100 )}%)`
            )

        const execTime = performance.now()

        lastCall = callTime
        lastExec = execTime
        lastDisp = dispatchTime

        const timeout = Math.max( 0, TICKRATE - ( execTime - callTime ) )
        if (STATE) __tick_logger( timeout )
    }, timeout, performance.now() )
}