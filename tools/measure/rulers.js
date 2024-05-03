import { SVG, Vector2D as vec } from "../../svg/svg.js"
import { Line } from "./primitives.js"

export function LineRuler( svg, start = vec.zero, end = start ) {
    const line = Line( svg, start, end )
    const text = new SVG.text().text( "Test" ).pos( ...start )

    const ele = new SVG.g().add( text, line )
    return ele
}