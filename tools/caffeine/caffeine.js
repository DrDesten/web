class Entry {
    constructor(grams = 0, time = Date.now()) {
        this.grams = grams 
        this.time = time
    }
}

const Entries = []

const Config = {
    substance: "caffeine",
    halflife: 6 * 3600,
    metabolites: [],
}

