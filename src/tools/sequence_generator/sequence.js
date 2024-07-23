function generateTransform( linearity = 0 ) {
    function transformFactor( x ) {
        return 1 / ( 1 - x ) - 1
    }

    if ( linearity == 0 )
        return function ( x = 0 ) {
            return x
        }
    if ( linearity > 0 )
        return function ( x = 0 ) {
            let d = 1 / transformFactor( linearity )
            let i = 0.5 + Math.sqrt( 0.25 + d )
            return d / ( i - x ) - ( i - 1 )
        }
    if ( linearity < 0 )
        return function ( x = 0 ) {
            let d = 1 / transformFactor( -linearity )
            let o = ( 0.5 + Math.sqrt( 0.25 + d ) ) - 1
            return 1 - ( d / ( x + o ) ) + o
        }
}

function generateSequence( count = 1, start = 0, end = 1, linearity = 0 ) {
    const transform = generateTransform( linearity )
    let seq = []
    for ( let i = 0; i < count; i++ ) {
        let val = transform( i / ( count - 1 ) ) * ( count - 1 )
        val *= Math.abs( end - start ) / ( count - 1 )
        //val = transform( val )
        val += Math.min( end, start )
        seq.push( val )
    }
    return seq
}

function arrToString( arr = [], brackets = "[]", separator = ", " ) {
    return brackets[0] + arr.join( separator ) + brackets[1]
}
function arrToString( arr = [], warnings = [], brackets = "[]", separator = ", ", warnColor = "orange" ) {
    return brackets[0] + ( arr.map( ( x, i ) => warnings[i] ? `<span style="color:${warnColor};">` + x + '</span>' : x ) ).join( separator ) + brackets[1]
}

function roundHuman( n = 1, digits = 1, factor = 2 ) {
    /* "Human" rounding of numbers
    1.01 -> 1.0
    1.03 -> 1.05
    */

    n *= factor * ( 10 ** ( digits ) )
    n = Math.round( n )
    n /= factor * ( 10 ** ( digits ) )
    return n
}

function calculateSequence( form, out_id = "" ) {
    const n = parseInt( form.sequence_length.value )
    const start = parseFloat( form.sequence_start.value )
    const end = parseFloat( form.sequence_end.value )
    const round = parseInt( form.precision.value )
    const lin = parseFloat( form.sequence_lin.value )

    let sequence = generateSequence( n, start, end, lin )
    if ( form.round_human.checked ) sequence = sequence.map( x => roundHuman( x, round, 2 ).toFixed( round + 1 ) )
    else sequence = sequence.map( x => parseFloat( x.toFixed( round ) ).toFixed( round ) )

    let warnings = sequence.map( ( x, i, arr ) => x == arr[i - 1] || x == arr[i + 1] )

    let outputHTML = arrToString( sequence, warnings, "[]", " ", "rgb(240,160,0)" )

    if ( form.auto_copy.checked ) {
        // Without warnings so HTML tags won't get copied
        navigator.clipboard.writeText( arrToString( sequence, "[]", " " ) )
    }

    document.getElementById( out_id ).innerHTML = outputHTML
}