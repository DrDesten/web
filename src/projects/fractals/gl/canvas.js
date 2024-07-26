/**
 * @typedef {Object} CanvasOptions
 * @property {number} [resolutionScale]
 * @property {boolean} [resizeAsync]
 */

export class Canvas {
    /** @param {HTMLCanvasElement} element @param {CanvasOptions} [opts] */
    constructor( element, opts = {} ) {
        if ( !( element instanceof HTMLCanvasElement ) ) {
            throw new TypeError( "Context element must be canvas" )
        }
        this.canvas = element
        this.resolutionScale = opts.resolutionScale ?? 1
        this.resizeAsync = opts.resizeAsync ?? false

        this.onResize = null
        this.onResizeRequest = null
        this.targetSize = null

        if ( this.resizeAsync ) {
            // Set initial size
            this.requestCanvasSize(
                element.clientWidth * devicePixelRatio,
                element.clientHeight * devicePixelRatio
            )
            // Hook into ResizeObserver
            this.observer = new ResizeObserver( ( [entry] ) => {
                this.requestCanvasSize(
                    entry.devicePixelContentBoxSize[0].inlineSize,
                    entry.devicePixelContentBoxSize[0].blockSize
                )
            } ).observe( element, { box: "device-pixel-content-box" } )

        } else {
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
    }

    get width() { return this.canvas.width }
    get height() { return this.canvas.height }

    requestResize() {
        if ( this.targetSize ) {
            this.setCanvasSize( ...this.targetSize )
            this.targetSize = null
        }
    }

    /** @param {number} width @param {number} height */
    requestCanvasSize( width, height ) {
        this.targetSize = [width, height]
        this.onResizeRequest?.(
            width * this.resolutionScale,
            height * this.resolutionScale,
            this.canvas
        )
    }

    /** @param {number} width @param {number} height */
    setCanvasSize( width, height ) {
        const scaledWidth = width * this.resolutionScale
        const scaledHeight = height * this.resolutionScale
        this.canvas.width = scaledWidth
        this.canvas.height = scaledHeight
        this.onResize?.( scaledWidth, scaledHeight, this.canvas )
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