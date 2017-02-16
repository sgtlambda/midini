const {
          getInversions,
          findChords,
          getNonZeroInversions,
          getInversionsForChord,
          getNextChord
      }        = require('./index');
const chords   = require('./chords.json');
const cadenses = require('./cadenses.json');

// console.log(getInversions([0, 5, 9]));

// console.log(findChords(chords, [0, 3, 7]));

// console.log(getNextChord({type: 'maj', root: 8}, cadenses, chords, [0, 3, 7]));

// const maj7 = [[0, 10, 7, 4], [2, 5]];

// console.log(getInversionsForChord([0, 3, 7], maj7, 1));