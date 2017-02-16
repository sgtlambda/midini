'use strict';

const _        = require('lodash');
const midiUtil = require('./midiUtil');
const Key      = require('./Key');

/**
 * Collection of 128 virtual keys
 */
class Keyboard {

    /**
     * @param {Stream} writeStream Output (MIDI) stream to write to
     * @param {Number} channel The channel to operate on
     */
    constructor(writeStream, channel, retrigger) {
        this.writeStream = writeStream;
        this.channel     = channel;
        this.keys        = _.times(128, n => {
            let key = new Key(n, retrigger);
            key.on('on', () => this.on(key));
            key.on('off', () => this.off(key));
            return key;
        });
    }

    /**
     * Send the note on event for the specified key to the writeStream
     * @param {Key} key
     */
    on(key) {
        this.writeStream.push(midiUtil.create.note(true, this.channel, key.key, key.velocity));
    }

    /**
     * Send the note off event for the specified key to the writeStream
     * @param note
     */
    off(note) {
        this.writeStream.push(midiUtil.create.note(false, this.channel, note.key, note.velocity));
    }

    /**
     * Get the key associated with the given note number
     * @param {Number} n
     * @returns {Key}
     */
    getKey(n) {
        return this.keys[n];
    }
}

module.exports = Keyboard;