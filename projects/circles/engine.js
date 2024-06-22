importScripts( "./constants.js", "./vector.js", "./circle.js" )


let TICKRATE = 1000
let TIMESCALE = 1.0
let GRAVITY = new vec2

let STATE = false
let BOUNDRIES = {
    top: Infinity,
    bottom: 0,
    left: -Infinity,
    right: Infinity,
}

const gameObjects = []

function serialize( arr ) {
    const typedArray = new Float64Array( arr.length * renderDataObjectSize )
    for ( let i = 0; i < arr.length; i++ ) {
        typedArray[i * renderDataObjectSize] = arr[i].id
        typedArray[i * renderDataObjectSize + 1] = arr[i].pos.x
        typedArray[i * renderDataObjectSize + 2] = arr[i].pos.y
        typedArray[i * renderDataObjectSize + 3] = arr[i].radius
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

        case M.setBoundries:
            BOUNDRIES = data
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

function update( millis ) {

    for ( let i = 0; i < gameObjects.length; i++ ) {
        const circle = gameObjects[i]
        circle.lastPos = circle.pos.copy()

        for ( let o = i + 1; o < gameObjects.length; o++ ) {
            const other = gameObjects[o]

            // Check for collision
            const overlap = vec2.dist(circle.pos, other.pos) - (circle.radius + other.radius)
            if ( overlap >= 0 )
                continue
            if ( isNaN(overlap) ) {
                console.error(circle, other)
                throw new Error("Physics Worker: Engine Error: Encountered NaN")
            }
            
            // Points from circle to other
            const diff = other.pos.copy().sub(circle.pos)
            let normal = vec2.normalize(diff)

            if ( vec2.isNaN(normal) ) {
                normal = vec2.add(circle.vel, other.vel).mul(0.5).rot90().normalize()
                if ( vec2.isNaN(normal) )
                    normal = vec2.random.unit()
                //console.warn("NaN-Normal Handled")
            }


            // Reflect velocities along normal and transfer them (100% elastic at this point)
            const transferCircle = vec2.dot(other.vel, normal)
            const transferOther = vec2.dot(circle.vel, normal)
            circle.vel.add(vec2.mul(normal, transferCircle))
            other.vel.add(vec2.mul(normal, transferOther))
            circle.vel.sub(vec2.mul(normal, transferOther))
            other.vel.sub(vec2.mul(normal, transferCircle))

            // Move out of the way
            const ratio = circle.radius / (circle.radius + other.radius)
            circle.pos.add(normal.copy().mul(ratio * overlap))
            other.pos.add(normal.copy().mul((1-ratio) * -overlap))
        }

        circle.acc.add( GRAVITY )
        circle.vel.add( circle.acc.copy().mul( TIMESCALE * TICKRATE / 1000 ) )
        circle.pos.add( circle.vel.copy().mul( TIMESCALE * TICKRATE / 1000 ) )

        if (circle.pos.y > BOUNDRIES.top - circle.radius) {
            circle.pos.y = BOUNDRIES.top - circle.radius
            circle.vel.y = -Math.abs(circle.vel.y) * circle.bounce
        }
        if (circle.pos.y < BOUNDRIES.bottom + circle.radius) {
            circle.pos.y = BOUNDRIES.bottom + circle.radius
            circle.vel.y = +Math.abs(circle.vel.y) * circle.bounce
        }

        if (circle.pos.x < BOUNDRIES.left + circle.radius) {
            circle.pos.x = BOUNDRIES.left + circle.radius
            circle.vel.x = +Math.abs(circle.vel.x) * circle.bounce
        }
        if (circle.pos.x > BOUNDRIES.right - circle.radius) {
            circle.pos.x = BOUNDRIES.right - circle.radius
            circle.vel.x = -Math.abs(circle.vel.x) * circle.bounce
        }

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
        update( callTime )
        const execTime = performance.now()

        // Calculate remaining time in the tick
        // If execution took too long, clamp delay at 0ms
        const timeout = Math.max( 0, TICKRATE - ( execTime - callTime ) )
        // Dispatch next tick
        if (STATE) __tick( timeout )
    }, timeout )
}

// Tick dispatcher ( with timing benchmarks )
let lastDispatch = 0
let lastCall = NaN
let lastExec = NaN
let lastDisp = NaN
function __tick_logger( timeout ) {
    setTimeout( function ( dispatchTime ) {

        const callTime = performance.now()
        update( callTime )

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