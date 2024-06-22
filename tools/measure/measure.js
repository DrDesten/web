import { SVG, Vector2D as vec } from "../../svg/svg.js"
import { Line, SquarePlane } from "./primitives.js"
import { LineRuler } from "./rulers.js"

const Mouse = function ( callback ) {
    const pos = { "-2": vec.NaN, "-1": vec.NaN, "0": vec.NaN }
    const out = { acc: vec.NaN, vel: vec.NaN, pos: vec.NaN }
    document.addEventListener( "mousemove", ( { clientX, clientY } ) => {
        pos[-2].xy = pos[-1]
        pos[-1].xy = pos[0]
        pos[0].xy = new vec( clientX, clientY )

        out.pos.xy = pos[0]
        out.vel.xy = pos[0].sub( pos[-1] )
        out.acc.xy = out.vel.sub( pos[-1].sub( pos[-2] ) )

        if ( typeof callback === "function" ) {
            callback( { ...pos, ...out } )
        }
    } )
    return out
}

const canvas = document.getElementById( "canvas" )

canvas.style.width = "100%"
canvas.style.height = "50vh"

const svg = new SVG( canvas, "fit" )

const mmPos = vec.NaN
Mouse( ( { pos } ) => mmPos.xy = svg.mapMouse( pos ) )

const plane = SquarePlane( svg, vec.new( 50 ) )
//svg.add( plane )

const line = LineRuler( svg, vec.new( 25 ) )
svg.add( line )

function draw( millis ) {
    plane.update()
    line.update()
}

function frame( millis ) {
    draw( millis )
    requestAnimationFrame( frame )
}
requestAnimationFrame( frame )