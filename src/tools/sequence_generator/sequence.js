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

function sequenceToString( sequence ) {
    return `[ ${sequence.join( ", " )} ]`
}
function sequenceToHTML( sequence, warnColor ) {
    return "[ " + sequence.map( x => x.warning
        ? `<span style="color:${warnColor};">${x}</span>`
        : x
    ).join( ", " ) + " ]"
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
    const length = ~~form.sequence_length.value
    const eval = form.sequence_eval.value
    const precision = ~~form.precision.value
    const exact = form.exact.checked
    const trailing = form.trailing.checked

    const evalFunction = new Function( 'x', 'return ' + eval )
    const rawSequence = Array.from( { length }, ( _, i ) => evalFunction( i ) )

    const sequence = rawSequence.map( ( x, i, arr ) => {
        const prev = arr[i - 1], next = arr[i + 1]
        const number = new Number( x )

        number.pPrecision = 21
        number.fPrecision = precision
        number.toString = function () {
            let n = +this
            n = +n.toPrecision( this.pPrecision )
            n = n.toFixed( this.fPrecision )
            if ( trailing ) n = ( +n ).toFixed( precision )
            return n
        }

        if ( !exact && x === 0 ) {
            number.precision = 0
        } else if ( !exact ) {
            let p = prev ?? 0
            let n = next ?? 0
            let c = x

            let pPrecision = 21
            while ( pPrecision > 1 ) {
                let ps = p.toPrecision( pPrecision - 1 )
                let ns = n.toPrecision( pPrecision - 1 )
                let cs = c.toPrecision( pPrecision - 1 )

                if ( ps !== ns && ns !== cs && cs !== ps ) {
                    pPrecision--
                } else break
            }

            p = +p.toPrecision( pPrecision )
            n = +n.toPrecision( pPrecision )
            c = +c.toPrecision( pPrecision )

            let fPrecision = 20
            while ( fPrecision > 0 ) {
                let ps = p.toFixed( fPrecision - 1 )
                let ns = n.toFixed( fPrecision - 1 )
                let cs = c.toFixed( fPrecision - 1 )

                if ( ps !== ns && ns !== cs && cs !== ps ) {
                    fPrecision--
                } else break
            }

            number.pPrecision = Math.min( number.pPrecision, pPrecision )
            number.fPrecision = Math.min( number.fPrecision, fPrecision )
        }

        return number
    } ).map( ( number, i, arr ) => {
        const prev = arr[i - 1], next = arr[i + 1]
        number.warning =
            number.toString() === prev?.toString() ||
            number.toString() === next?.toString()
        return number
    } )

    let outputHTML = sequenceToHTML( sequence, "rgb(240,160,0)" )

    if ( form.auto_copy.checked ) {
        // Without warnings so HTML tags won't get copied
        navigator.clipboard.writeText( sequenceToString( sequence ) )
    }

    document.getElementById( out_id ).innerHTML = outputHTML
}