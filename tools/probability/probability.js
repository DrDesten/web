function parseArrayUniversal_number(string) {
    const brackets     = /{|}|\[|\]|\(|\)/g
    const separators   = /,|;/g
    //const decimalPoint = /,/g
    const whitespace   = /\s+/g

    string = string.replace(brackets, "")
    string = string.replace(separators, " ")
    //string = string.replace(decimalPoint, ".")
    string = string.replace(whitespace, " ")

    arr = string.split(" ").map(parseFloat)
    return arr
}

function fixFloatErrors(number) {return parseFloat(number.toPrecision(16))}


function calculateAnalysis(textId, meanId, medianId, varianceId, standardDeviationId) {
    values = parseArrayUniversal_number(document.getElementById(textId).value)
    values.sort((a,b) => a - b)

    mean     = values.reduce((sum, curr) => sum + curr, 0) / values.length
    median   = (values[Math.floor(values.length * 0.5)] + values[Math.ceil(values.length * 0.5)]) * 0.5
    variance = values.reduce((sum, curr) => sum + ((curr - mean)*(curr - mean)), 0) / values.length
    standardDeviation = Math.sqrt( variance )

    if (isNaN(mean) || isNaN(median) || isNaN(variance) || isNaN(standardDeviation)) return

    document.getElementById(meanId).innerHTML = fixFloatErrors(mean)
    document.getElementById(medianId).innerHTML = fixFloatErrors(median)
    document.getElementById(varianceId).innerHTML = fixFloatErrors(variance)
    document.getElementById(standardDeviationId).innerHTML = fixFloatErrors(standardDeviation)
}