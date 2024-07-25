export class Canvas {
    constructor( element, resolutionScale = 1 ) {
        if ( !( element instanceof HTMLCanvasElement ) ) {
            throw new TypeError( "Context element must be canvas" )
        }
        this.canvas = element
        this.resolutionScale = resolutionScale
        this.onResize = null

        // Hook into ResizeObserver
        this.observer = new ResizeObserver( ( [entry] ) => {
            this.setCanvasSize(
                entry.devicePixelContentBoxSize[0].inlineSize,
                entry.devicePixelContentBoxSize[0].blockSize
            )
        } ).observe( element, { box: "device-pixel-content-box" } )

        // Set initial size
        this.setCanvasSize(
            element.clientWidth * devicePixelRatio,
            element.clientHeight * devicePixelRatio
        )
    }

    get width() { return this.canvas.width }
    get height() { return this.canvas.height }
    
    /** @param {number} width @param {number} height */
    setCanvasSize( width, height ) {
        const scaledWidth = width * this.resolutionScale
        const scaledHeight = height * this.resolutionScale
        this.canvas.width = scaledWidth
        this.canvas.height = scaledHeight
        if ( this.onResize ) this.onResize( scaledWidth, scaledHeight, this.canvas )
    }

    /** @param {number} scale */
    setResolutionScale( scale ) {
        this.resolutionScale = scale
        this.setCanvasSize(
            this.canvas.clientWidth * devicePixelRatio,
            this.canvas.clientHeight * devicePixelRatio
        )
    }
}