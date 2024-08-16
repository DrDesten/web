/** @returns {{[id: string]: HTMLInputElement|HTMLButtonElement}} */
export function getInputs() {
    function makeCamelCase( string ) {
        string = string.replace( /^[^a-zA-Z_$]*|[^a-zA-Z_$0-9]*$/g, "" )
        string = string.replace( /[ -]+[a-z]/g, s => s[s.length - 1].toUpperCase() )
        return string
    }
    const inputs = Object.fromEntries(
        [...document.querySelectorAll( "input, button, *[contenteditable=\"true\"]" )]
            .filter( input => input.id
                || console.warn( "Input element", input, "does not have an id. Ignoring..." )
            )
            .map( input => [makeCamelCase( input.id ), input] )
    )
    return inputs
}