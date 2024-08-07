


const Absorption = {
    simpleDecay( seconds, halflife ) {
        return 2 ** ( -seconds / halflife )
    },
    peakDecay( seconds, maxplasma, halflife ) {
        // Solves for o such that the maximum is reached at maxplasma seconds
        let o = -lambertWm1( -( 2 ** ( -maxplasma / halflife ) * maxplasma * Math.LN2 ) / halflife ) / ( maxplasma * Math.LN2 ) - 1 / halflife

        // Has a smooth onset but approaches a regular decay quickly
        const func = x => ( 1 - 2 ** ( -o * x ) ) * 2 ** ( -x / halflife )
        let value = func( seconds )

        // Compute peak of function to normalize
        let peak = func( maxplasma )
        value /= peak

        return value
    },
}



// Save state

function stringifyEntries() {
    return JSON.stringify( Entries.filter( entry => entry.grams > 0 ) )
}
function stringifyConfig() {
    return JSON.stringify( Config )
}

function save() {
    localStorage.setItem( "entries", stringifyEntries() )
    localStorage.setItem( "config", stringifyConfig() )
}
function loadEntries( string ) {
    return JSON.parse( string ?? localStorage.getItem( "entries" ) ?? "[]" )
        .map( entry => new Entry( entry.grams, entry.time ) )
}
function loadConfig( string ) {
    return JSON.parse( string ?? localStorage.getItem( "config" ) ?? "{}" )
}

function copyEntries() {
    navigator.clipboard.writeText( stringifyEntries() )
}
function copyConfig() {
    navigator.clipboard.writeText( stringifyConfig() )
}
function pasteEntries() {
    const div = document.body.appendChild( document.createElement( "div" ) )
    div.classList.add( "top" )
    div.addEventListener( "click", e => {
        e.stopPropagation()
        if ( e.target === div ) div.remove()
    } )

    const section = div.appendChild( document.createElement( "section" ) )
    section.classList.add( "paragraph", "color-variation-dark" )
    section.innerHTML
        = `<h3 class="paragraph">Load Entries</h3>`
        + `<div style="text-align: center;">Paste JSON Here</div>`
        + `<textarea id="entry-data"></textarea>`
        + `<button onclick="Entries = loadEntries(document.getElementById('entry-data').value)">Load</button>`

    navigator.clipboard.readText?.().then( string => {
        // Only autofill string if it's valid JSON 
        if ( JSON.parse( string ) instanceof Array )
            document.getElementById( "entry-data" ).value = string
    } )
}
function pasteConfig() {
    const div = document.body.appendChild( document.createElement( "div" ) )
    div.classList.add( "top" )
    div.addEventListener( "click", e => {
        e.stopPropagation()
        if ( e.target === div ) div.remove()
    } )

    const section = div.appendChild( document.createElement( "section" ) )
    section.classList.add( "paragraph", "color-variation-dark" )
    section.innerHTML
        = `<h3 class="paragraph">Load Simulation Parameters</h3>`
        + `<div style="text-align: center;">Paste JSON Here</div>`
        + `<textarea id="config-data"></textarea>`
        + `<button onclick="Config.update(loadConfig(document.getElementById('config-data').value)); ">Load</button>`

    navigator.clipboard.readText?.().then( string => {
        // Only autofill string if it's valid JSON 
        if ( JSON.parse( string ) instanceof Object )
            document.getElementById( "config-data" ).value = string
    } )
}

// Set up globals

class Entry {
    constructor( grams = 0, time = Date.now() / 1000 ) {
        this.grams = grams
        this.time = time
    }

    get milligrams() {
        return this.grams * 1000
    }
    get milliseconds() {
        return this.time * 1000
    }
}

/** @type {Entry[]} */
let Entries = loadEntries()

let Config = {
    substance: "caffeine",
    halflife: 5 * 60 * 60,
    peak: 90 * 60,
    metabolites: [],

    update( params = {} ) {
        for ( const key in params ) {
            if ( key in Config )
                Config[key] = params[key]
        }
        updateConfigDisplay()
        save()
    }
}
Config.update( loadConfig() )

// Logic

function updateConfigDisplay() {
    const form = document.getElementById( "config" )
    form.halflife.value = Config.halflife / ( 60 * 60 )
    form.peakplasma.value = Config.peak / 60
}

function addEntry( form ) {
    const milligrams = +form.intake.value
    const elapsedTime = +form.time.value
    const timeunit = +form.timeunit.value

    if ( !isFinite( milligrams ) || milligrams <= 0 )
        return
    if ( !isFinite( elapsedTime ) || elapsedTime < 0 )
        return
    if ( !isFinite( timeunit ) || timeunit <= 0 )
        return

    const time = Date.now() - ( elapsedTime * timeunit * 1000 )
    const entry = new Entry( milligrams / 1000, time / 1000 ) // convert milligrams to grams and milliseconds to seconds
    Entries.push( entry )

    form.intake.value = "0"
    form.time.value = "0"

    updateCurrentCaffeine()
    generateEntryList()
    save()
}

function removeEntry( index ) {
    Entries.splice( index, 1 )
    updateCurrentCaffeine()
    generateEntryList()
    save()
}

function calculateCurrentCaffeine() {
    const time = Date.now() / 1000
    const total = Entries.map(
        entry => entry.grams * Absorption.peakDecay( time - entry.time, Config.peak, Config.halflife )
    ).reduce( ( a, b ) => a + b, 0 )
    return total
}

function updateCurrentCaffeine() {
    document.getElementById( "output" ).innerHTML = Math.round( calculateCurrentCaffeine() * 1000 ) + " mg"
}


function dateDifference( date1, date2 ) {
    const milliseconds = Math.floor( Math.abs( date2 - date1 ) )
    const seconds = Math.floor( milliseconds / 1000 )
    const minutes = Math.floor( seconds / 60 )
    const hours = Math.floor( minutes / 60 )
    const days = Math.floor( hours / 24 )

    return [
        { unit: days == 1 ? "day" : "days", value: days },
        { unit: hours == 1 ? "hour" : "hours", value: hours % 24 },
        { unit: minutes == 1 ? "minute" : "minutes", value: minutes % 60 },
        { unit: seconds == 1 ? "second" : "seconds", value: seconds % 60 },
        { unit: milliseconds == 1 ? "millisecond" : "milliseconds", value: milliseconds % 1000 }
    ]
}

function generateEntryList() {
    const table = document.getElementById( "list" )
    table.innerHTML = `<tr><th>Intake</th><th>Time</th><th>Remaining</th><th></th></tr`
    for ( let i = Entries.length - 1; i >= 0; i-- ) {
        const entry = Entries[i]

        let row = document.createElement( "tr" )

        let cell = document.createElement( "td" )
        cell.innerHTML = entry.milligrams + " mg"
        row.appendChild( cell )

        cell = document.createElement( "td" )
        let diff = dateDifference( Date.now(), entry.milliseconds ).find( x => x.value > 0 )
        cell.innerHTML = diff.value + " " + diff.unit + " ago"
        row.appendChild( cell )

        cell = document.createElement( "td" )
        const caffeineLevel = Math.round( Absorption.peakDecay( Date.now() / 1000 - entry.time, Config.peak, Config.halflife ) * entry.milligrams )
        cell.innerHTML = caffeineLevel == 0 ? "nothing" : caffeineLevel + " mg"
        row.appendChild( cell )

        cell = document.createElement( "td" )
        cell.innerHTML = `<button onclick="removeEntry(${i})">Delete Entry</button>`
        row.appendChild( cell )

        table.appendChild( row )
    }
}

updateConfigDisplay()
updateCurrentCaffeine()
generateEntryList()

setInterval( updateCurrentCaffeine, 100 )
setInterval( generateEntryList, 1000 )