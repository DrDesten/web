function generateSequence( count = 1, start = 0, end = 1, linearity = 0 ) {
    let transformFact = x => 1 / ( 1 - x ) - 1
    let transform
    if ( linearity == 0 ) transform = x => x
    if ( linearity > 0 ) transform = x => {
        let d = 1 / transformFact( linearity )
        let i = 0.5 + Math.sqrt( 0.25 + d )
        return d / ( i - x ) - ( i - 1 )
    }
    if ( linearity < 0 ) transform = x => {
        let d = 1 / transformFact( -linearity )
        let o = ( 0.5 + Math.sqrt( 0.25 + d ) ) - 1
        return 1 - ( d / ( x + o ) ) + o
    }
    console.log( transform.toString(), linearity )

    let seq = []
    for ( let i = 0; i < count; i++ ) {
        let val = i
        val *= Math.abs( end - start ) / ( count - 1 )
        val = transform( val )
        val += Math.min( end, start )
        seq.push( val )
    }
    return seq
}

function arrToString( arr = [], brackets = "[]", separator = ", " ) {
    return brackets[0] + arr.join( separator ) + brackets[1]
}

function calculateSequence( form, out_id = "" ) {
    const n = parseInt( form.sequence_length.value )
    const start = parseInt( form.sequence_start.value )
    const end = parseInt( form.sequence_end.value )
    const round = parseInt( form.precision.value )
    const lin = parseFloat( form.sequence_lin.value )

    let sequence = generateSequence( n, start, end, lin )
    sequence = sequence.map( x => parseFloat( x.toFixed( round ) ).toFixed( round ) )

    let output = arrToString( sequence )

    if ( form.auto_copy.checked ) {
        navigator.clipboard.writeText( output )
    }

    document.getElementById( out_id ).innerHTML = output
}