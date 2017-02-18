const {includes, range, filter, negate, forEach, find} = require('lodash');

const whiteKeys = [0, 2, 4, 5, 7, 9, 11];

const blackKeys = [1, 3, 6, 8, 10];

const blackKeyOffset = {
    [blackKeys[0]]: .45,
    [blackKeys[1]]: 1.55,
    [blackKeys[2]]: 3.42,
    [blackKeys[3]]: 4.5,
    [blackKeys[4]]: 5.58,
};

const getWhiteKeyOffset = numKey => {
    const offsetInOctave = numKey % 12;
    const octave         = (numKey - offsetInOctave) / 12;
    return octave * 7 + whiteKeys.indexOf(offsetInOctave);
};

const getBlackKeyOffset = numKey => {
    const offsetInOctave = numKey % 12;
    const octave         = (numKey - offsetInOctave) / 12;
    return octave * 7 + blackKeyOffset[offsetInOctave];
};

const isWhiteKey = numKey => includes(whiteKeys, numKey % 12);
const isBlackKey = negate(isWhiteKey);

const highlightPadding = 2;

const drawKeys = ({keys, getOffset, highlights, transpose, fillColor, strokeColor, getCoords}) => {
    fill(fillColor);
    stroke(strokeColor);
    forEach(keys, numKey => {
        const x      = getOffset(numKey);
        const coords = getCoords(x);
        rect(...coords);
        const thisHighlights = filter(highlights, {numKey: numKey + transpose});
        forEach(thisHighlights, thisHighlight => {
            fill(thisHighlight.color);
            noStroke();
            rect(
                coords[0] + highlightPadding,
                coords[1] + highlightPadding,
                coords[2] - highlightPadding*2 + 1,
                coords[3] - highlightPadding*2 + 1);
            fill(fillColor);
            stroke(strokeColor);
        });
    });
};

const drawKeyboard = ({
    numKeys = 12,
    highlights,
    keyWidth = 20,
    keyHeight = 100,
    lineWidth = 2,
    transpose = 36,
} = {}) => {

    const blackKeyWidth  = keyWidth * .6;
    const blackKeyHeight = keyHeight * .6;

    const keys = range(numKeys);

    const whiteKeys = filter(keys, isWhiteKey);
    const blackKeys = filter(keys, isBlackKey);

    fill('white');
    stroke(40);
    strokeWeight(lineWidth);

    drawKeys({
        keys:        whiteKeys,
        getOffset:   getWhiteKeyOffset,
        highlights,
        transpose,
        fillColor:   'white',
        strokeColor: 40,
        getCoords:   x => [x * keyWidth, 0, keyWidth, keyHeight],
    });

    drawKeys({
        keys:        blackKeys,
        getOffset:   getBlackKeyOffset,
        highlights,
        transpose,
        fillColor:   50,
        strokeColor: 40,
        getCoords:   x => [(x + .5) * keyWidth - (blackKeyWidth / 2), 0, blackKeyWidth, blackKeyHeight],
    });
};

module.exports = drawKeyboard;