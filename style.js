const tw_delay = 1
const tw_speed_header = 0.15
const tw_speed_p = 0.04




// HEADER ANIMATION (typewriter + arrow) /////////////////////////////////////////////////////////////////////////

let typewriter_elements = document.getElementsByClassName( "typewriter" )
let typewriterAnimationLength = 0
for ( let i = 0; i < typewriter_elements.length; i++ ) {
    let ele = typewriter_elements[i]
    let char_length = ele.innerHTML.length
    if ( ele.tagName == "H1" ) {
        ele.style.setProperty( "--tw-anim-before", `typewriter-animation ${tw_speed_header * char_length}s steps(${char_length}) ${tw_delay}s backwards` )
        ele.style.setProperty( "--tw-anim-after", `typewriter-animation ${tw_speed_header * char_length}s steps(${char_length}) ${tw_delay}s backwards` )
        typewriterAnimationLength = Math.max( typewriterAnimationLength, tw_speed_header * char_length )
    } else {
        ele.style.setProperty( "--tw-anim-before", `typewriter-animation ${tw_speed_p * char_length}s steps(${char_length}) ${tw_delay}s backwards` )
        ele.style.setProperty( "--tw-anim-after", `typewriter-animation ${tw_speed_p * char_length}s steps(${char_length}) ${tw_delay}s backwards` )
    }
}

let header_bottom = document.getElementsByClassName( "fillscreen-bottom" )[0]
if ( header_bottom != undefined ) {
    header_bottom.style.animation = `fadeInDown 2s ease ${typewriterAnimationLength + ( tw_delay * 2 )}s backwards`
}


// NAVIGATION BAR /////////////////////////////////////////////////////////////////////////

// Adds shadow to navbar when scrolled past some amount
window.addEventListener( "scroll", e => {
    let nav = document.querySelector( "table.nav" )
    if ( window.scrollY >= window.innerHeight * 0.2 ) {
        nav.classList.add( "nav-shadow" )
    } else {
        nav.classList.remove( "nav-shadow" )
    }
} )


// PARAGRAPH SECTIONS /////////////////////////////////////////////////////////////////////////

// Add Alternating Colors to sections
const c = [
    { h: 202, s: 35, l: 20 },
    { h: 185, s: 45, l: 20 },
    { h: 226, s: 30, l: 20 },
    { h: 334, s: 60, l: 20 },
    { h: 110, s: 50, l: 18 },
]
let index = Math.round( Math.random() * 2 ** 53 ) % c.length
document.querySelectorAll( "section.paragraph" ).forEach( ele => {
    const color = c[~~index]
    ele.classList.add( "color-variation-dark" )
    ele.style.setProperty( "--bg-random", `linear-gradient(165deg, hsl(${color.h},${color.s}%,${color.l}%) 0%, hsl(${( color.h + 60 ) % 360},${color.s + 10}%,${color.l - 5}%) 100%)` )
    //ele.style.setProperty("--bg-random-trans", `linear-gradient(165deg, hsla(${color.h},${color.s}%,${color.l}%,0.55) 0%, hsl(${(color.h + 60) % 360},${color.s + 10}%,${color.l - 5}%,0.7) 100%)`)
    index = ( index + 0.6180339887498948 * c.length ) % c.length
    console.log( color )
} )


/* Function to update amount of rows in textareas automatically
** <textarea/> "row" attribute sets the minimum amount of rows, while "maxrows" sets the maximum amount of rows */
document.querySelectorAll( "textarea[type=text]" ).forEach( ele => {
    const minrows = ele.rows
    const maxrows = ele.getAttribute( "maxrows" ) ?? 1000
    ele.addEventListener( "input", e => {
        let lineBreakAmount = occurrences( ele.value, "\n" )
        ele.rows = Math.min( Math.max( lineBreakAmount + 1, minrows ), maxrows )
    } )
} )

// Fade in paragrapth blocks
const observer = new IntersectionObserver( ( entries, observer ) => {
    entries.forEach( entry => {
        if ( entry.intersectionRatio > 0 ) {
            entry.target.classList.remove( "paragraph-hidden" )
            entry.target.classList.add( "paragraph-visible" )
        }
    } )
}, { root: null, threshold: 0.0 } )
document.querySelectorAll( "section.paragraph" ).forEach( ele => {
    let rect = ele.getBoundingClientRect()
    let height = Math.max( document.documentElement.clientHeight, window.innerHeight )
    if ( rect.top > height || rect.bottom < 0 ) { // If the element is currently off-screen
        ele.classList.add( "paragraph-hidden" )
        observer.observe( ele )
    }
} )


// RETRACTABLE PARAGRAPHS

document.querySelectorAll( "section.retractable" ).forEach( ele => {
    ele.setAttribute( "retracted", ele.getAttribute( "retracted" ) === "true" ? "true" : "false" )
    /* ele.addEventListener( "click", e => {
        ele.setAttribute( "retracted", ele.getAttribute( "retracted" ) === "true" ? "false" : "true" )
    } ) */
    ele.firstElementChild?.addEventListener( "click", e => {
        ele.setAttribute( "retracted", ele.getAttribute( "retracted" ) === "true" ? "false" : "true" )
    } )
} )