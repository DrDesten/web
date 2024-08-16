/**
 * @typedef {(...args) => void} EventListener
 */

/**
 * @template {string} T
 */
export class EventHandler {
    /** @param {...T} events */
    constructor( ...events ) {
        /** @type {{ [K in T]: Set<EventListener> }} */
        this.listeners = Object.setPrototypeOf( Object.fromEntries( events.map( e => [e, new Set()] ) ), null )
    }

    /** @param {T} event @param {EventListener} listener */
    addEventListener( event, listener ) {
        this.listeners[event].add( listener )
    }
    /** @param {T} event @param {EventListener} listener */
    removeEventListener( event, listener ) {
        this.listeners[event].delete( listener )
    }
    /** @param {T} event @param {...any} args */
    dispatchEvent( event, ...args ) {
        this.listeners[event].forEach( listener => listener( ...args ) )
    }
}