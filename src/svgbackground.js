const globalSVG = new SVG( "#canvas", "cover" )

const angle = Math.PI / 4
const lines = []
{
    const maxWidth = 1
    const maxLength = 10
    const minLength = 1

    for ( let i = 0; i < 25; i++ ) {
        const line = new SVG.line().color( "#bbb" )

        const length = Math.random() ** 2 * ( maxLength - minLength ) + minLength
        line.width( length / maxLength * maxWidth )
        line.opacity( ( length / ( maxLength + minLength ) + minLength ) ** .1 )

        if ( length > 7 ) line.color( "#fe2" )
        if ( length < 2 ) line.color( "#9af" )

        const start = new SVG.vector( Math.random(), Math.random() ).mul( 100 )
        const end = start.add( new SVG.vector( Math.sin( angle ), Math.cos( angle ) ).mul( length ) )

        line.start( start.x, start.y ).end( end.x, end.y )

        line.onUpdate( ( line, time ) => {
            const angleVector = new SVG.vector( Math.sin( angle ), Math.cos( angle ) )
            const offsetVector = angleVector.mul( time / 1000 * length )
            const lineStart = start.add( offsetVector )
            lineStart.x = lineStart.x % ( 100 + length ) - length
            lineStart.y = lineStart.y % ( 100 + length ) - length
            const lineEnd = lineStart.add( angleVector.mul( length ) )
            line.start( lineStart.x, lineStart.y )
            line.end( lineEnd.x, lineEnd.y )
        } )

        lines.push( line )
    }
}

const boids = []
{
    for ( let i = 0; i < 100; i++ ) {

        const point = new SVG.circle().radius( .2 ).fill( "#000" )

        let pos, vel, acc
        pos = SVG.vector.random().mul( 50 ).add( 50 )
        vel = new SVG.vector()
        acc = new SVG.vector()

        let lastMillis = NaN
        point.onUpdate( ( point, millis ) => {
            const deltaTime = millis - lastMillis || 0

            const drag = vel.mul( vel ).mul( .1 )
            acc = acc.sub( drag )

            vel = vel.add( acc.mul( deltaTime / 1000 ) )
            pos = pos.add( vel.mul( deltaTime / 1000 ) )
            lastMillis = millis

            point.center( ...pos )
        } )

        boids.push( point )
    }
}

globalSVG.add( ...lines, )
requestAnimationFrame( update = function ( time ) {
    lines.forEach( line => line.update( time ) )
    boids.forEach( boid => boid.update( time ) )
    requestAnimationFrame( update )
} )

/**
 * @param {number} start 
 * @param {number} end 
 * @param {number} step 
 */
function range( start, end, step = 1 ) {
    return end === undefined
        ? {
            *[Symbol.iterator]() {
                for ( let i = 0; i < start; i++ ) yield i
            }
        }
        : {
            *[Symbol.iterator]() {
                for ( let i = start; i < end; i += step ) yield i
            }
        }
}
/**
 * @template Tr
 * @template Tg
 * @param {(arg:Tr)=>Tg} func 
 * @param {Generator<Tr,void,unknown>} range
 */
function Gen( func, range ) {
    return {
        *[Symbol.iterator]() {
            for ( const x of range ) yield func( x )
        }
    }
}