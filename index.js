const {
          sumBy,
          includes,
          forEach,
          map,
          uniq,
          maxBy,
          filter,
          find,
          uniqWith,
          isEqual,
          without
      } = require('lodash');

const deepUniq = arr => uniqWith(arr, isEqual);

/**
 * @param {Number[]} notes Notes currently being played
 * @param {Number[][]} chord Chord descriptor
 */
const rateChord = (notes, chord) => {

    // Parts contain "essential" chord notes, additions are optional decoration tones such as the 2 and the 4
    const [parts, additions] = chord;

    let sum = sumBy(notes, note => {
        if (includes(parts, note)) return 3;
        if (includes(additions, note)) return 2;
        return -10;
    });

    forEach(parts, part => {
        if (!includes(notes, part)) {
            // subtract points for each "normal" chord tone not included
            // depending on what chord tone we're talking about

            // we actually like it if the 0 is missing out
            if (part === 0) sum += 1;

            // we don't really care about the 5
            else if (part === 7) sum -= 1;

            // the 3 is a bit more important
            else if (part === 3 || part === 4) sum -= 3;

            // other characteristics are even more important
            else sum -= 8;
        }
    });

    return sum;
};

/**
 * Transpose the note number so that it is anywhere within the given range of octaves
 * @param note
 * @param {Number} octaves
 * @return {number|*}
 */
const wrapAround = (note, octaves = 1) => {
    const range = octaves * 12;
    note        = note % range;
    if (note < 0) note += range;
    return note;
};

/**
 * Invert the notes according to the given root note
 * @param notes
 * @param root
 * @param octaves
 */
const invert = (notes, root, octaves) => {
    // for each note, assume it as 0 and "wrapAround" the rest to the octave range
    return uniq(map(notes, note => {
        const relative = note - root;
        return wrapAround(relative, octaves);
    })).sort();
};

/**
 * Given the note numbers, get all possible inversions spanning the given number of octaves
 * @param notes
 * @param octaves
 * @param subtract Lower the root tone (for non-0 inversions)
 * @return [{root, notes}]
 */
const getInversions = (notes, octaves = 1, subtract = 0) => {

    return deepUniq(map(notes, root => {

        root = wrapAround(root - subtract);

        return {root, notes: invert(notes, root, octaves)};
    }));
};

const getNonZeroInversions = (notes, octaves, chordTone) => {

    let inversions = getInversions(notes, octaves, chordTone);

    inversions = filter(inversions, ({notes}) => !includes(notes, 0));

    return inversions;
};

/**
 * Given the chord and the currently pressed notes,
 * Get all "basic" inversions (just based on the given notes)
 * But also the "non-zero" chord inversions (where the inversion might make for a combinations of notes in the chord
 * that doesn't include the 0)
 * @param notes
 * @param chord
 * @param octaves
 * @return {{root, notes}[]}
 */
const getInversionsForChord = (notes, chord, octaves = 1) => {

    let inversions = getInversions(notes, octaves); // Basic chord inversions where there is a note at 0

    forEach(without(chord[0], 0), chordTone => {
        // The "chord root" is any of relative chord tone (expect 0)
        // try inversions of the chord
        inversions = inversions.concat(getNonZeroInversions(notes, octaves, chordTone));
    });

    return deepUniq(inversions);
};

/**
 * Given the chord "library" and the currently pressed notes (absolute),
 * Determine viable chords, their transposition from 0 and their rating
 * @param chords
 * @param notes
 * @param octaves
 */
const findChords = (chords, notes, octaves = 1) => {

    let possibilities = [];

    forEach(chords, (chord, type) => {

        const inversions = getInversionsForChord(notes, chord, octaves);

        forEach(inversions, inversion => {

            const {notes, root} = inversion;
            const rating        = rateChord(notes, chord);
            possibilities.push({type, root, rating});
        });
    });

    return possibilities;
};


/**
 * Given the array of cadenses specified as: [
 *  [first chord type, second chord type, relative interval, "extra" bonus]
 * ]
 * Determine what would be the possible bonuses given the current chord
 * @param {*[][]} cadenses
 * @param {String} current
 * @return {Array}
 */
const getCadenseBonuses = (cadenses, current) => {

    const bonuses = [];

    forEach(cadenses, ([chord1, chord2, diff, score = 2]) => {
        let other = null;
        if (current === chord1) {
            other = chord2;
        }
        else if (current === chord2) {
            other = chord1;
            diff  = -diff;
        }
        else return;
        bonuses.push({other, diff: wrapAround(diff), score});
    });

    return bonuses;
};

/**
 * Given the current chord, the cadenses library and the "possibilities" up next, apply cadense scores
 * @param currentChord
 * @param cadenses
 * @param possibilities
 */
const applyCadenseBonuses = (currentChord, cadenses, possibilities) => {

    const {type, root} = currentChord;

    const cadenseBonuses = getCadenseBonuses(cadenses, type);

    forEach(possibilities, possibility => {

        const diff  = wrapAround(possibility.root - root);
        const bonus = find(cadenseBonuses, {diff, other: possibility.type});
        if (bonus) {
            // console.log(`Applying cadense bonus [${type}-${bonus.other} with +${bonus.diff}]:` +
            //     ` ${bonus.score} points`);
            possibility.rating += bonus.score;
        }
    });

    return possibilities;
};

const getNextChord = (currentChord = null, cadenses, chords, notes, octaves = 1) => {

    // @TODO
    // Assign bonus for the current chord (timeSinceLastChord = low: higher bonus)
    // Subtract points for the same chord if timeSinceLastChord = high

    let possibilities = findChords(chords, notes, octaves);

    if (currentChord) possibilities = applyCadenseBonuses(currentChord, cadenses, possibilities);

    return maxBy(possibilities, 'rating');
};

module.exports = {
    rateChord,
    wrapAround,
    getInversions,
    findChords,
    getNonZeroInversions,
    getInversionsForChord,
    getNextChord
};