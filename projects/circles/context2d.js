class Canvas2dDrawWrapper {
    /** @param {CanvasRenderingContext2D} ctx */
    constructor( ctx ) {
        this.ctx = ctx
    }

    setFill( color ) {
        this.ctx.fillStyle = color
    }
    setStroke( color ) {
        this.ctx.strokeStyle = color
    }

    fill( color ) {
        if (color) this.ctx.fillStyle = color
        this.ctx.fillRect(-Number.MAX_SAFE_INTEGER / 2, -Number.MAX_SAFE_INTEGER / 2, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
    }

    circle( pos, radius, color ) {
        if (color) this.ctx.fillStyle = color
        this.ctx.beginPath()
        this.ctx.arc( ...pos, radius, 0, 2 * Math.PI )
        this.ctx.fill()
    }
}