//=============================================================================
// KunTimer.js
//=============================================================================
/*:
 * @plugindesc Just a test timer
 * @author JayaKun
 * 
 * @help
 * Create a timer and subscribe events to fire when updated
 * 
 * 
 * 
 */

/**
 * @param {Number} fpt 
 */
function KunTimeController(fpt) {
    this._ticks = 0;
    this._limit = fpt || 60;
    this._events = {};
    this._running = true;
    /**
     * @returns KunTimeController
     */
    this.stop = function () {
        this._running = false;
        return this;
    };
    /**
     * @returns Boolean
     */
    this.updateCounter = function () {
        return (++this._ticks % this._limit) === 0;
    };
    /**
     * @returns Boolean
     */
    this.update = function () {
        if (this.updateCounter()) {
            this.runEvents();
            return true;
        }
        return false;
    };
    /**
     * @returns KunTimeController
     */
    this.runEvents = function () {
        Object.values(this._events).forEach(function (event) {
            if (typeof event === 'function') {
                event();
            }
        });
        return this;
    };
    /**
     * @param {String} symbol 
     * @param {Function} event 
     * @returns KunTimeController
     */
    this.subscribe = function (symbol, event) {
        if (!this.has(symbol) && typeof event === 'function') {
            this._events[symbol] = event;
        }
        return this;
    };
    /**
     * @param {String} symbol 
     * @returns Boolean
     */
    this.has = function (symbol) {
        return this._events.hasOwnProperty(symbol);
    };
}
