const midi  = require('midiguchi');
const tonal = require('tonal');
const {map} = require('lodash');

const magic    = require('./index');
const chords   = require('./chords.json');
const cadenses = require('./cadenses.json');

const midiUtil = require('./lib/midiUtil');
const Tracker  = require('./lib/Tracker');
const Keyboard = require('./lib/Keyboard');

const debug = console.log;

const getInput = () => {

    return midi.input.virtual('midini in');
};

const getOutput = () => {

    return midi.output.virtual('midini out');
};

const input  = getInput();
const output = getOutput();

const tracker  = new Tracker(input);
const keyboard = new Keyboard(output);

let currentChord = null;
let lastChord    = null;

const getBassNote = chord => {
    return chord.root + 12 * 3;
};

const getIndication = chord => {
    return `${tonal.note.pc(tonal.note.fromMidi(chord.root))} ${chord.type}`;
};

const playNext = chord => {

    if (currentChord) {
        keyboard.getKey(getBassNote(currentChord)).up();
    }

    if (chord && !lastChord) {
        debug(`[SILENT] -> ${getIndication(chord)}`);
    }
    else if (chord) {
        console.log(`${getIndication(lastChord)} -> ${getIndication(chord)}`);
    } else {
        console.log(`${getIndication(lastChord)} -> [SILENT]`)
    }

    currentChord = chord;
    lastChord    = chord;

    if (chord) {
        // console.log(`New chord: ${chord.type} in ${tonal.note.pc(tonal.note.fromMidi(chord.root))}`);
        let bassNote = getBassNote(currentChord);
        // console.log(`Playing bass note ${tonal.note.fromMidi(bassNote)}`);
        keyboard.getKey(bassNote).down(100);
    } else {
        // console.log('Released chord');
    }
};

// input.subscribe(() => {
input.filter(midiUtil.isNote).debounce(100).onValue(() => {

    console.log('Currently pressed: ', map(tracker.notes(), tonal.note.fromMidi));

    const notes = tracker.notes();

    if (!notes.length) return playNext(null);

    const nextChord = magic.getNextChord(lastChord, cadenses, chords, notes);

    playNext(nextChord);
});

debug('Smart Harmonizer TM 4000');