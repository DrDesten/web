
const svg = new SVG( "#canvas" )
const cache = new Array( 1000 ).fill().map( ( _, i ) => [i + 4] )

const stepSize = 0.9
const stepAngle = 0.17

const startPos = [50, 5]
const startAngle = 0

for ( const sequence of cache ) {

    let number = sequence[0]

    while ( number > 1 ) {
        if ( number % 2 == 0 ) sequence.push( number /= 2 )
        else sequence.push( number = ( number * 3 + 1 ) / 2 )
    }

    sequence.reverse()

}

for ( const sequence of cache ) {
    const path = new SVG.path().width( .75 )
    let pos = startPos
    let ang = startAngle
    for ( const n of sequence ) {

        if ( n % 2 ) ang -= stepAngle
        else ang += stepAngle
        pos = [pos[0] + Math.sin( ang ) * stepSize, pos[1] + Math.cos( ang ) * stepSize]

        path.point( ...pos )

    }

    path.color( `rgba(${255 * Math.sin( sequence.length * 0.1 ) ** 2},0,${255 * Math.sin( sequence.length * 0.1 + 0.5 ) ** 2},0.1)` )
    path.update()
    svg.add( path )
}