// Get All relevant elements ///////////////////////////////////////
////////////////////////////////////////////////////////////////////

const elements3d = [...document.querySelectorAll( `[box-3d]` )].map( element => ( {
    element,
    wrapper: document.createElement( "div" ),
    faces: {
        front: element,
        back: document.createElement( "div" ),
        left: document.createElement( "div" ),
        right: document.createElement( "div" ),
        top: document.createElement( "div" ),
        bottom: document.createElement( "div" ),
    }
} ) )

const containers3d = document.querySelectorAll( ".container-3d" )

// Create 3D Box ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

for ( const element of elements3d ) {

    const width = element.element.clientWidth, height = element.element.clientHeight

    // Set wrapper element
    element.element.parentElement.insertBefore( element.wrapper, element.element )
    element.wrapper.appendChild( element.element )
    element.wrapper.style.width = width + "px"
    element.wrapper.style.height = height + "px"

    // Add the 3d element class and set up coordinate space
    element.wrapper.classList.add( "element-3d" )
    element.wrapper.style.setProperty( "--origin", `${width / 2}px ${height / 2}px ${-width / 2}px` )

    // Add user defined classes to the wrapper object
    const classList = ( element.element.getAttribute( "wrapper-3d-class" ) || "" ).split( /\s+/g ).filter( x => x.trim() )
    if ( classList.length )
        for ( const className of classList )
            element.wrapper.classList.add( className )

    element.faces.back.style.width = `${width}px`, element.faces.back.style.height = `${height}px`
    element.faces.left.style.width = `${width}px`, element.faces.left.style.height = `${height}px`
    element.faces.right.style.width = `${width}px`, element.faces.right.style.height = `${height}px`

    element.faces.top.style.width = `${width}px`, element.faces.top.style.height = `${width}px`
    element.faces.bottom.style.width = `${width}px`, element.faces.bottom.style.height = `${width}px`

    element.faces.front.style.transform = `translate3d(0px,0px,0px)`
    element.faces.back.style.transform = `translate3d(0px,0px,${-width}px) rotate3d(0,1,0,180deg)`

    element.faces.left.style.transform = `translate3d(${-width / 2}px,0px,${-width / 2}px) rotate3d(0,1,0,-90deg)`
    element.faces.right.style.transform = `translate3d(${width / 2}px,0px,${-width / 2}px)  rotate3d(0,1,0,90deg)`

    element.faces.top.style.transform = `translate3d(0px,${-width / 2}px,${-width / 2}px) rotate3d(1,0,0,90deg)`
    element.faces.bottom.style.transform = `translate3d(0px,${-width / 2 + height}px,${-width / 2}px) rotate3d(1,0,0,-90deg)`

    const shadeFaces = element.element.hasAttribute( "shade-3d" )
    for ( const face in element.faces ) {
        if ( Object.hasOwnProperty.call( element.faces, face ) ) {
            const shade = { front: 0, back: 0.075, top: 0.05, bottom: 0.2, left: 0.1, right: 0.1 }[face]
            if ( shadeFaces ) element.faces[face].style.filter = `brightness(${1 - shade})`

            element.faces[face].style.backgroundColor = `var(--face-bg, #ddd)`
            element.faces[face].classList.add( "face-3d" )
            element.wrapper.appendChild( element.faces[face] )
        }
    }

}


// Apply changes when resizing /////////////////////////////////////
////////////////////////////////////////////////////////////////////

const elementMap = new WeakMap()
for ( const element of elements3d ) {
    elementMap.set( element.element, element )
}

const observer = new ResizeObserver( function ( entries ) {
    for ( const entry of entries ) {
        const element = elementMap.get( entry.target )
        if ( element == undefined ) throw new Error( "Couldn't retrive element data from Map" )

        const width = element.element.clientWidth, height = element.element.clientHeight

        element.wrapper.style.setProperty( "--origin", `${width / 2}px ${height / 2}px ${-width / 2}px` )
        element.wrapper.style.width = width + "px"
        element.wrapper.style.height = height + "px"

        element.faces.back.style.width = `${width}px`, element.faces.back.style.height = `${height}px`
        element.faces.left.style.width = `${width}px`, element.faces.left.style.height = `${height}px`
        element.faces.right.style.width = `${width}px`, element.faces.right.style.height = `${height}px`

        element.faces.top.style.width = `${width}px`, element.faces.top.style.height = `${width}px`
        element.faces.bottom.style.width = `${width}px`, element.faces.bottom.style.height = `${width}px`

        element.faces.front.style.transform = `translate3d(0px,0px,0px)`
        element.faces.back.style.transform = `translate3d(0px,0px,${-width}px) rotate3d(0,1,0,180deg)`

        element.faces.left.style.transform = `translate3d(${-width / 2}px,0px,${-width / 2}px) rotate3d(0,1,0,-90deg)`
        element.faces.right.style.transform = `translate3d(${width / 2}px,0px,${-width / 2}px)  rotate3d(0,1,0,90deg)`

        element.faces.top.style.transform = `translate3d(0px,${-width / 2}px,${-width / 2}px) rotate3d(1,0,0,90deg)`
        element.faces.bottom.style.transform = `translate3d(0px,${-width / 2 + height}px,${-width / 2}px) rotate3d(1,0,0,-90deg)`
    }
} )
for ( const element of elements3d ) {
    observer.observe( element.element )
}


// Update perspective on Scroll and Resize /////////////////////////
////////////////////////////////////////////////////////////////////

function recalculatePerspective() {
    const center = [window.innerWidth / 2, window.innerHeight / 2]
    for ( const container of containers3d ) {
        const rect = container.getBoundingClientRect()
        const position = [rect.left, rect.top]

        const relativeOffset = [
            center[0] - position[0],
            center[1] - position[1],
        ]
        container.style.perspectiveOrigin = `${relativeOffset[0]}px ${relativeOffset[1]}px`
    }
}
document.addEventListener( "scroll", recalculatePerspective )
window.addEventListener( "resize", recalculatePerspective )
recalculatePerspective() // Set up Perspective initially