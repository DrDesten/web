const globalSVG = new SVG( "#canvas", "cover" )

const angle = Math.PI / 4
const lines = []
{
    const maxWidth = 1
    const maxLength = 10
    const minLength = 1

    for ( let i = 0; i < 25; i++ ) {
        const line = new SVG.line().color("#bbb")

        const length = Math.random() ** 2 * (maxLength - minLength) + minLength
        line.width( length / maxLength * maxWidth )
        line.opacity( (length / (maxLength + minLength) + minLength ) ** .1 )

        if (length > 7) line.color("#fe2")
        if (length < 2) line.color("#9af")

        const start = new SVG.vector( Math.random(), Math.random() ).mul(100)
        const end   = start.add( new SVG.vector( Math.sin(angle), Math.cos(angle) ).mul(length) )

        line.start(start.x, start.y).end(end.x, end.y)

        line.onUpdate((line, time) => {
            const angleVector  = new SVG.vector( Math.sin(angle), Math.cos(angle) )
            const offsetVector = angleVector.mul(time / 1000 * length )
            const lineStart = start.add( offsetVector )
            lineStart.x = lineStart.x % (100 + length) - length
            lineStart.y = lineStart.y % (100 + length) - length
            const lineEnd   = lineStart.add( angleVector.mul(length) )
            line.start(lineStart.x, lineStart.y)
            line.end(lineEnd.x, lineEnd.y)
        })

        lines.push(line)
    }
}

globalSVG.add(...lines)
requestAnimationFrame( update = function(time){
    lines.forEach( line => line.update(time) )
    requestAnimationFrame( update )
})
