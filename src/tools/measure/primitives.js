import { SVG, Vector2D as vec } from "../../svg/svg.js"

export function Line( svg, start = vec.zero, end = start ) {
    const points = [start.xy, end.xy]
    let activeHandle = -1
    const handles = points.map( ( p, i ) =>
        new SVG.circle()
            .center( ...p )
            .radius( 5 )
            .fill( "rgba(255, 0, 0, 0)" )
    )
    const line = new SVG.line()
        .start( ...points[0] )
        .end( ...points[1] )
        .fill( "black" )
        .width( 2 )

    handles.forEach( ( handle, i ) =>
        handle.ele.addEventListener( "mousedown", () => activeHandle = i )
    )
    document.addEventListener( "mousemove", function ( e ) {
        if ( activeHandle !== -1 ) {
            const mmPos = svg.mapMouse( new vec( e.clientX, e.clientY ) ).mul( 100 )
            points[activeHandle].xy = mmPos
            handles[activeHandle].center( ...mmPos )
            line.start( ...points[0] )
            line.end( ...points[1] )
        }
    } )
    document.addEventListener( "mouseup", () => activeHandle = -1 )

    const ele = new SVG.g()
    ele.add( line, ...handles )
    return ele
}

export function SquarePlane( svg, pos = vec.zero ) {
    const corners = Array.from( { length: 4 } ).map( () => pos.xy )

    let activeHandle = -1
    const handles = corners.map( p =>
        new SVG.circle()
            .center( ...p )
            .radius( 5 )
            .fill( "rgba(255,0,0,0)" )
    )
    const lines = corners.map( ( _, i ) =>
        new SVG.line()
            .start( ...corners[i] )
            .end( ...corners[( i + 1 ) % 4] )
            .fill( "black" )
            .width( 2 )
    )

    handles.forEach( ( handle, i ) =>
        handle.ele.addEventListener( "mousedown", () => activeHandle = i )
    )
    document.addEventListener( "mousemove", function ( e ) {
        if ( activeHandle !== -1 ) {
            const mmPos = svg.mapMouse( new vec( e.clientX, e.clientY ) ).mul( 100 )
            corners[activeHandle].xy = mmPos
            handles[activeHandle].center( ...mmPos )
            lines[activeHandle].end( ...mmPos )
            lines[( activeHandle + 1 ) % 4].start( ...mmPos )
        }
    } )
    document.addEventListener( "mouseup", () => activeHandle = -1 )

    const ele = new SVG.g()
    ele.add( ...lines, ...handles )
    return ele
}