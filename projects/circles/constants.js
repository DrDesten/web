const M = Object.freeze({
    pushCircle: "pushCircle",
    renderData: "renderData",

    setBoundries: "setBoundries",

    setTickrate: "setTickrate",
    setTimescale: "setTimescale",
    setGravity: "setGravity",

    start: "start",
    pause: "pause",
    reset: "reset",
})

function Message( type, data, tranferables ) {
    return {
        type: type,
        data: data,
        *[Symbol.iterator]() {
            yield ( { type: type, data: data } )
            yield tranferables
        }
    }
}