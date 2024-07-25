import { mat3, mat4 } from "../../../../svg/jvec/bin/mat.js"
import { vec2, vec3, vec4 } from "../../../../svg/jvec/bin/vec.js"
import { Mouse } from "../mouse.js"

/**
 * 
 */

export class Camera {
    /** @param {HTMLCanvasElement} canvas */
    constructor( canvas ) {
        this.canvas = canvas
        this.position = new vec2
        this.scale = 1
    }

    getCameraMatrix() {
        const { position, scale } = this
        const aspect = this.canvas.width / this.canvas.height
        const matrix = mat3.scaleTranslate( [scale * aspect * 0.5, scale * 0.5], position )
        return matrix
    }
    getViewMatrix() {
        return this.getCameraMatrix().inverse()
    }
    getMatrices() {
        const cameraMatrix = this.getCameraMatrix()
        const viewMatrix = cameraMatrix.clone().inverse()
        return {
            camera: cameraMatrix,
            view: viewMatrix,
        }
    }

    getScreenspaceMatrixInverse() {
        return this.getCameraMatrix()
            .mmul( mat3.scaleTranslate( [2, 2], [-1, -1] ) )
    }
    getScreenspaceMatrix() {
        return this.getScreenspaceMatrixInverse().inverse()
    }
    getViewportMatrixInverse() {
        return this.getCameraMatrix()
            .mmul( mat3.scaleTranslate( [2 / this.canvas.width, -2 / this.canvas.height], [-1, 1] ) )
    }
    getViewportMatrix() {
        return this.getViewportMatrixInverse().inverse()
    }

    getViewFrustum() {
        const ssmi = this.getScreenspaceMatrixInverse()
        const left = ssmi[6]
        const bottom = ssmi[7]
        const right = left + ssmi[0]
        const top = bottom + ssmi[4]
        return { left, right, bottom, top }
    }
}

export class CameraControls {
    /** @param {Camera} camera @param {{zoomSensitivity?:number}} [opts] */
    constructor( camera, opts = {} ) {
        this.camera = camera
        this.canvas = camera.canvas
        this.mouse = new Mouse( this.canvas )
        this.opts = { zoomSensitivity: 0.001, ...opts }

        this.listeners = new Set
        this.lastPos = vec2.NaN

        this.ungrab()
        this.canvas.addEventListener( 'mousedown', this.grab.bind( this ) )
        this.canvas.addEventListener( 'mouseup', this.ungrab.bind( this ) )
        this.canvas.addEventListener( 'wheel', this.zoom.bind( this ) )
        this.canvas.addEventListener( 'mousemove', this.move.bind( this ) )
    }

    addEventListener( listener ) {
        this.listeners.add( listener )
    }
    removeEventListener( listener ) {
        this.listeners.delete( listener )
    }
    triggerEvent() {
        for ( const listener of this.listeners ) listener( this )
    }

    grab() {
        this.canvas.style.cursor = "grabbing"
    }
    ungrab() {
        this.canvas.style.cursor = "grab"
    }

    /** @param {vec2} position  */
    projectScreen( position ) {
        return new vec3( position.x, position.y, 1 )
            .mmul( this.camera.getScreenspaceMatrixInverse() ).xy
    }

    /** @param {WheelEvent} event */
    zoom( { deltaY } ) {
        const zoomSensitivity = 1 + this.opts.zoomSensitivity
        const zoomScale = zoomSensitivity ** deltaY
        const pMousePos = this.projectScreen( this.mouse.relativeWebglPosition )
        this.camera.scale *= zoomScale
        const pnewMousePos = this.projectScreen( this.mouse.relativeWebglPosition )
        this.camera.position.add( vec2.vsub( pMousePos, pnewMousePos ).mul( 0.5 ) )
        this.triggerEvent()
    }

    /** @param {MouseEvent} event */
    move( { buttons, screenX, screenY } ) {
        if ( vec2.isnan( this.lastPos ).any() ) {
            this.lastPos.set( screenX, screenY )
        }
        const currentPos = new vec2( screenX, screenY )
        if ( buttons & 1 ) {
            const movement = vec2.vsub( currentPos, this.lastPos )
            this.camera.position.x -= movement.x * this.camera.scale / this.canvas.clientHeight / 2
            this.camera.position.y += movement.y * this.camera.scale / this.canvas.clientHeight / 2
            this.triggerEvent()
        }
        this.lastPos.set( currentPos )
    }
}