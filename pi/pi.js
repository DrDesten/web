const PiMioURL = "https://raw.githubusercontent.com/DrDesten/web/main/pi/PiMio.txt"

var piString = "3.1415926535897932384626433832795028841971693993751058209749445923078164"

var PiHTML = document.getElementById("pi")
var piSearchOut = document.getElementById("pi-search-display")

PiHTML.innerHTML = piString

fetch(PiMioURL)
    .then(request => request.text())
    .then(text => piString = text)


function searchPi(text = "") {
    text = text.replace(/[^0-9]/g, "")
    if (text.length == 0) { // Empty Text
        piSearchOut.innerHTML = "Search"
        piSearchOut.style.opacity = "0.5"
        return
    } else {
        piSearchOut.innerHTML = text
        piSearchOut.style.opacity = "1.0"
    }

    var match = piString.match(text)
    if (match == null) { // No match
        piSearchOut.style.color = "red"
        return
    } else {
        piSearchOut.style.color = "inherit"
    }

    var index = match.index
    var displayString = piString.slice(Math.max(index - 100, 0), Math.min(index + 100, piString.length))

    var charOffset  = (text.length * 0.5)
    var displayStringIndexOffset = Math.min(index - 100, 0) * 0.5 - Math.max(index + 100 - piString.length, 0) * -0.5
    var translation = ((displayString.length * 0.5 + (charOffset + displayStringIndexOffset)) / displayString.length) * 100;

    console.log(translation)
    console.log(displayString.length)
    console.log(displayStringIndexOffset)

    PiHTML.innerHTML = displayString
    PiHTML.style.transform = "translateX(-75%)"
    const styleTimeout = setTimeout(() => PiHTML.style.transform = `translateX(-${translation}%)`, 100)
}