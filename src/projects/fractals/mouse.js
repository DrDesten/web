import { vec2 } from "../../../svg/jvec/bin/vec.js"

class MouseHook {
    /** @param {HTMLElement|Window} [element=window]  */
    constructor( element = window ) {
        this.element = element
        this.position = vec2.NaN
        this.relativePosition = vec2.NaN
        this.webglPosition = vec2.NaN
        this.relativeWebglPosition = vec2.NaN

        this.buttons = {
            primary: false,
            secondary: false,
            middle: false,
        }

        /** @type {Map<number,{touch:Touch,history:Touch[]}>} */
        this.touches = new Map()

        const eventTarget = this.element instanceof Window ? document : this.element
        eventTarget.addEventListener( "mouseenter", e => this.mouseMovement( e ) )
        eventTarget.addEventListener( "mousemove", e => this.mouseMovement( e ) )
        eventTarget.addEventListener( "mousedown", e => this.mouseButton( e ) )
        eventTarget.addEventListener( "mouseup", e => this.mouseButton( e ) )

        eventTarget.addEventListener( "touchstart", e => this.touchStart( e ) )
        eventTarget.addEventListener( "touchmove", e => this.touchChange( e ) )
        eventTarget.addEventListener( "touchend", e => this.touchEnd( e ) )
        eventTarget.addEventListener( "touchcancel", e => this.touchEnd( e ) )
    }

    stats() {
        const { x, y, width, height } = this.element instanceof Window
            ? { x: 0, y: 0, width: this.element.innerWidth, height: this.element.innerHeight, }
            : this.element.getBoundingClientRect()
        return { x, y, width, height }
    }

    /** @param {MouseEvent} event */
    mouseButton( event ) {
        //console.log("mouse click")
        this.buttons.primary = !!( event.buttons & 1 )
        this.buttons.secondary = !!( event.buttons & 2 )
        this.buttons.middle = !!( event.buttons & 4 )
    }

    /** @param {MouseEvent} event */
    mouseMovement( event ) {
        //console.log("mouse movement")
        const { x, y, width, height } = this.stats()
        const { clientX: mouseX, clientY: mouseY } = event
        this.position.set( mouseX - x, mouseY - y )
        this.relativePosition.set( this.position.x / width, this.position.y / height )
        this.webglPosition.set( this.position.x, height - this.position.y )
        this.relativeWebglPosition.set( this.relativePosition.x, 1 - this.relativePosition.y )
    }

    /** @param {TouchEvent} event */
    touchStart( event ) {
        for ( const touch of event.changedTouches ) {
            this.touches.set( touch.identifier, { touch, history: [touch] } )
        }
    }

    /** @param {TouchEvent} event */
    touchChange( event ) {
        for ( const touch of event.touches ) {
            const object = this.touches.get( touch.identifier )
            object.touch = touch
            object.history.push( touch )
        }
    }

    /** @param {TouchEvent} event */
    touchEnd( event ) {
        for ( const touch of event.changedTouches ) {
            this.touches.delete( touch.identifier )
        }
    }
}

/** @type {typeof MouseHook} */
export const Mouse = new Proxy( MouseHook, {
    cache: new WeakMap(),
    construct( target, [element = window] ) {
        if ( this.cache.has( element ) ) return this.cache.get( element )
        const instance = new target( element )
        this.cache.set( element, instance )
        return instance
    }
} )