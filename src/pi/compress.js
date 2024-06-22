class uint32 {
    constructor(number) {
        if (typeof(number) == "number") {

            number = Math.max(number, 0);
            this.n1 = number & 0b1111111111111111 // Lower 16 Bits
            this.n2 = Math.floor(number / (2**16)) & 0b1111111111111111 // Upper 16 Bits

        } else if (typeof(number) == "object") {

            this.n1 = (number[1] << 8) + number[0]
            this.n2 = (number[3] << 8) + number[2]

        }
    }

    splitBytes() {
        return [
            this.n1 & 0b11111111,
            this.n1 >> 8,
            this.n2 & 0b11111111,
            this.n2 >> 8
        ]
    }

    toNum() {
        return this.n2 * (2**16) + this.n1
    }
}

function compressNumString(str = "") {
    str.replace(/[^0-9]/g, "")
    cl(str)

    compressedString = ""
    while (str.length > 0) {
        chunk = str.slice(0,9)
        str   = str.slice(9)
 
        chunkBytes = new uint32(parseFloat(chunk)).splitBytes()
        chars      = String.fromCharCode(...chunkBytes)
        compressedString += chars
    }

    return compressedString
}

function uncompressNumString(str = "") {
    uncompressedString = ""

    while (str.length > 0) {
        chunk = str.slice(0,4)
        str   = str.slice(4)

        chunkBytes = [...chunk].map(char => char.charCodeAt(0))
        uncompressedString += String(new uint32(chunkBytes).toNum())
    }

    return uncompressedString
}