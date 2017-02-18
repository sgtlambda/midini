const ee    = new (require('events').EventEmitter)();
const tonal = require('tonal');

const {forEach, fromPairs, map, sortBy, take} = require('lodash');

const keyboard = require('./components/keyboard');
const midi     = require('./../midi');

const logLines = [];

ee.on('debug', logLine => {
    logLines.push(logLine);
    if (logLines.length > 17)
        logLines.shift();
});

let pressed = [];
ee.on('pressed', notes => pressed = notes);

let augmented = [];
ee.on('augmented', notes => augmented = notes);

let currentChord = null;
ee.on('chord', chord => currentChord = chord);

let possibilities = [];
ee.on('possibilities', p => possibilities = p);

function setup() {
    createCanvas(640, 450);
    frameRate(30);

    midi({ee});
}

const drawLog = logLines => {

    noStroke();
    fill('white');
    rect(0, 0, 240, 240);
    translate(10, 16);

    textSize(11);
    textFont("monospace");
    fill('black');
    forEach(logLines, (logLine, y) => {
        text(logLine, 0, y * 13);
    });
};

const getIndication = chord => {
    return `${tonal.note.pc(tonal.note.fromMidi(chord.root))} ${chord.type}`;
};

const drawPossibilities = possibilities => {

    possibilities = take(sortBy(possibilities, ({rating}) => -rating), 10);

    noStroke();
    fill('white');
    rect(0, 0, 320, 240);
    translate(10, 16);
    textSize(11);
    textFont('sans-serif');
    textStyle(BOLD);
    fill('black');
    text('Computed possibilities', 0, 0);
    textStyle(NORMAL);
    forEach(possibilities, (possible, idx) => {
        fill(idx ? 'grey' : 'black');
        const y = (idx + 1) * 17;
        // text(y + 1, 0, y * 13);
        text(getIndication(possible), 0, y);
        text(`Score: ${Math.floor(possible.rating)}`, 60, y);
        if (possible.cadenseBonus) {
            const cadense = `${possible.cadense.current} > +${possible.cadense.diff} > ${possible.cadense.other}`;
            text(`(${possible.cadenseBonus}) via cadense [${cadense}]`, 120, y);
        }
        // text(JSON.stringify(possible), 20, y * 13);
        // text()
    });
};

const drawCurrentChord = chord => {
    noStroke();
    fill('darkblue');
    rect(0, 0, 160, 60);
    translate(10, 16);
    textSize(11);
    textFont('sans-serif');
    fill('white');
    text('Current chord', 0, 0);
    translate(0, 30);
    textSize(24);
    text(chord ? chord : '-', 0, 0);
};

function draw() {

    background(200);

    translate(16, 16);
    drawLog(logLines);
    resetMatrix();

    translate(264, 16);
    drawPossibilities(possibilities);
    resetMatrix();

    translate(16, 264);
    drawCurrentChord(currentChord);
    resetMatrix();

    let highlights = map(pressed, numKey => ({numKey, color: 'rgba(255,100,100,0.5)'}));

    if (augmented.length)
        highlights = highlights.concat(map(augmented, numKey => ({numKey, color: 'rgba(100, 100, 255, .5)'})))

    translate(16, 480 - 140);
    keyboard({
        numKeys:   61,
        keyWidth:  16.85,
        keyHeight: 100,
        lineWidth: 1,
        highlights,
    });
    resetMatrix();
}
