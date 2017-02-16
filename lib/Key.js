'use strict';

// const KeyOffCallback = require('./KeyOffCallback');
const EventEmitter   = require('events').EventEmitter;

class Key extends EventEmitter {

    constructor(key, retrigger) {
        super();
        this.key          = key;
        this.isOn         = false;
        this.retrigger    = retrigger;
        this.velocity     = 0;
        this.lastCallback = null;
    }

    /**
     * Release the key
     */
    up() {
        this.isOn = false;
        this.emit('off');
    }

    /**
     * Press the key
     * @param {Number} velocity
     */
    down(velocity) {
        if (!this.retrigger && this.isOn) return;
        if (this.isOn) this.up();
        this.isOn     = true;
        this.velocity = velocity;
        this.emit('on');
    }

    // /**
    //  * Make the key release after the given promise by assigning a new callback. Cancels previously pending callbacks.
    //  * @param {Promise} promise
    //  */
    // setUpPending(promise) {
    //     if (this.lastCallback !== null && this.lastCallback.pending)
    //         this.lastCallback.deactivate();
    //     let callback      = new KeyOffCallback(this);
    //     let callbackFn    = () => callback.call();
    //     this.lastCallback = callback;
    //     promise.then(callbackFn);
    // }
}

module.exports = Key;