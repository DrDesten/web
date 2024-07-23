import { SVG, vec2, vec3 } from "../svg/svg.js"

const date = new Date
const background = document.getElementById( "background" )
const svg = new SVG( background, "cover" )

function pride() {
    const colors = [
        new vec3( 228, 3, 3 ).div( 255 ),
        new vec3( 255, 140, 0 ).div( 255 ),
        new vec3( 255, 237, 0 ).div( 255 ),
        new vec3( 0, 128, 38 ).div( 255 ),
        new vec3( 0, 76, 255 ).div( 255 ),
        new vec3( 115, 41, 130 ).div( 255 ),
    ]

    const stripes = []
    stripes.push( new SVG.rect()
        .width( 0 )
        .fill( colors[0].toCSSColor() )
        .position( -100, 0 )
        .dimensions( 200, 100 )
    )
    stripes.push( new SVG.rect()
        .width( 0 )
        .fill( colors[colors.length - 1].toCSSColor() )
        .position( -100, -100 )
        .dimensions( 200, 100 )
    )
    for ( const [i, color] of colors.slice( 1, -1 ).reverse().entries() ) {
        const count = colors.length - 2
        const ypos = i / ( count + 1 ) + ( 0.5 / ( count + 1 ) )

        const rect = new SVG.rect().width( 0 ).fill( color.toCSSColor() )
        rect.position( -100, ypos * 100 - 50 )
        rect.dimensions( 200, 100 / ( count + 1 ) )

        stripes.push( rect )
    }
    /* stripes.push( new SVG.rect().mode("center")
        .width( 0 )
        .position(0, 0)
        .dimensions( 25, 25)
        .update()
    ) */

    const angle = 60 + ( Math.random() * 20 - 10 )
    const flag = new SVG.g()
    flag.add( ...stripes )
    flag.transformAttributes = { translate: [50, 50], rotate: [angle] }
    flag.applyTransforms()
    flag.update()

    svg.add( flag )
}

if ( date.getMonth() === 5 ) pride()