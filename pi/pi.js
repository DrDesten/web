const PiMioURL = "https://raw.githubusercontent.com/DrDesten/web/main/pi/PiMio.txt"

var piString = "3.1415926535897932384626433832795028841971693993751058209749445923078164"

var PiHTML = document.getElementById("pi")
PiHTML.innerHTML = piString

fetch(PiMioURL)
   .then( request => request.text() )
   .then( text =>    piString = text )


function searchPi(text = "") {
    text = text.replace(/[^0-9]/g, "")
    if (text.length == 0) text = "abc" // Instantly causes null
    
    var match = piString.match(text)
    if (match == null) return

    var index = match.index
    var displayString = piString.slice(Math.max(index - 100, 0), Math.min(index + 100, piString.length))

    PiHTML.innerHTML = displayString
    PiHTML.style.transform = "translateX(-50%)"

    console.log(displayString)
}