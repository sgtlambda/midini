'use strict';

const {filter, map} = require('lodash');
const midiUtil      = require('./midiUtil');

class Tracker {

    constructor(stream) {
        this.currentNotes = [];

        // @TODO add debounce

        stream.filter(midiUtil.isNoteOn).onValue(e => this.on(e));
        stream.filter(midiUtil.isNoteOff).onValue(e => this.off(e));
    }

    on(e) {
        this.currentNotes.push(e);
    }

    off(e) {
        this.currentNotes = filter(this.currentNotes, currentNote => {
            return midiUtil.key(currentNote) !== midiUtil.key(e);
        });
    }

    notes() {
        return map(this.currentNotes, midiUtil.key);
    }
}

module.exports = Tracker;