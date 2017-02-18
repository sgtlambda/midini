const midi  = require('midiguchi');
const tonal = require('tonal');

const magic    = require('./lib/index');
const chords   = require('./chords.json');
const cadenses = require('./cadenses.json');

const midiUtil = require('./lib/midiUtil');
const Tracker  = require('./lib/Tracker');
const Keyboard = require('./lib/Keyboard');

module.exports = ({ee}) => {

    const debug = msg => {
        console.log(msg);
        ee.emit('debug', msg);
    };

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
            debug(`[SILENT] > ${getIndication(chord)}`);
        }
        else if (chord) {
            let diff = chord.root - lastChord.root;
            if (diff > 0) diff = ` > +${diff} `;
            else if (diff < 0) diff = ` > ${diff} `;
            else diff = ' > - ';
            debug(`${getIndication(lastChord)}${diff} > ${getIndication(chord)}`);
        } else {
            debug(`${getIndication(lastChord)} > [SILENT]`)
        }

        currentChord = chord;
        lastChord    = chord;

        if (chord) {
            let bassNote = getBassNote(currentChord);
            ee.emit('augmented', [bassNote]);
            ee.emit('chord', getIndication(chord));
            keyboard.getKey(bassNote).down(100);
        } else {
            ee.emit('augmented', []);
            ee.emit('chord', null);
            // console.log('Released chord');
        }
    };

    input.filter(midiUtil.isNote).onValue(() => {

        ee.emit('pressed', tracker.notes());
    });

    input.filter(midiUtil.isNote).debounce(200).onValue(() => {

        const notes = tracker.notes();
        if (!notes.length) return playNext(null);
        const {nextChord, possibilities} = magic.getNextChord(lastChord, cadenses, chords, notes);
        ee.emit('possibilities', possibilities);
        playNext(nextChord);
    });

    debug('Smart Harmonizer TM 4000');
};