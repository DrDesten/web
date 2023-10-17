function sleep( ms ) {
    return new Promise( resolve => setTimeout( resolve, ms ) )
}

/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 */
function occurrences( string, subString, allowOverlapping = false ) {

    string += ""
    subString += ""
    if ( subString.length <= 0 ) return ( string.length + 1 )

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length

    while ( true ) {
        pos = string.indexOf( subString, pos )
        if ( pos >= 0 ) {
            ++n
            pos += step
        } else break
    }
    return n
}

// SITE NAVIGATION ////////////////////////////////////////////////////////////////////////

var hasScrolled = false
if ( window.scrollY >= window.innerHeight * 0.75 ) {
    hasScrolled = true
}
window.addEventListener( "scroll", ( e ) => {
    if ( window.scrollY >= window.innerHeight * 0.5 ) {
        hasScrolled = true
    }
} )

setTimeout( ( e ) => {
    let main_content = document.getElementById( "main-content" )
    if ( hasScrolled == false && main_content != null ) {
        main_content.scrollIntoView( { behavior: "smooth" } )
    }
}, 17000 ) // 15s delay
