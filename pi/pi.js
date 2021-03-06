const PiMioURL = "https://raw.githubusercontent.com/DrDesten/web/main/pi/PiMio.txt"

var piString = "3.1415926535897932384626433832795028841971693993751058209749445923078164"

var PiHTML = document.getElementById("pi")
var piSearchOut = document.getElementById("pi-search-display")
var piIndexOut = document.getElementById("pi-index-display")

PiHTML.innerHTML = piString

fetch(PiMioURL)
    .then(request => request.text())
    .then(text => piString = text)


var previousIndex = 0
function searchPi(text = "") {
    text = text.replace(/[^0-9]/g, "")
    if (text.length == 0) { // Empty Text
        piSearchOut.innerHTML = "Search"
        piSearchOut.style.color = "inherit"
        piSearchOut.style.opacity = "0.5"
        piIndexOut.innerHTML = "#???"
        piIndexOut.style.color = "rgb(0, 206, 86)"
        return
    } else {
        piSearchOut.innerHTML = text
        piSearchOut.style.opacity = "1.0"
    }

    var match = piString.match(text)
    if (match == null) { // No match
        piSearchOut.style.color = "red"
        piIndexOut.innerHTML = "No Match"
        piIndexOut.style.color = "red"
        return
    } else {
        piSearchOut.style.color = "inherit"
        piIndexOut.innerHTML = `#${Math.max(0, match.index - 1)}`
        piIndexOut.style.color = "rgb(0, 206, 86)"
    }

    var index = match.index
    var displayString = piString.slice(Math.max(index - 100, 0), Math.min(index + 100, piString.length))

    var charOffset  = (text.length * 0.5)
    var displayStringIndexOffset = Math.min(index - 100, 0) * 0.5 - Math.max(index + 100 - piString.length, 0) * -0.5
    var translation = -((displayString.length * 0.5 + (charOffset + displayStringIndexOffset)) / displayString.length) * 100;

    var lastPositionRelative = (index - previousIndex) / displayString.length
    var lastPositionRelativeTranslation = -Math.min(Math.max(lastPositionRelative * 100 - translation, -75), 75)

    PiHTML.innerHTML = displayString
    PiHTML.style.transition = "transform 0.0s"
    PiHTML.style.transform = `translateX(${lastPositionRelativeTranslation}%)`
    PiHTML.style.transition = "transform 0.2s"
    const styleTimeout = setTimeout(() => PiHTML.style.transform = `translateX(${translation}%)`, 25)
    
    previousIndex = index
}