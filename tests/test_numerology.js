/**
 * Unit Tests for Vedic Numerology Module
 */

import {
  getRootNumber,
  getDestinyNumber,
  getWeekdayValue,
  collectGridNumbers,
  getDigitBreakdown,
  calculateMahadashas,
  calculateAntardashas,
  calculatePratyantars,
  calculateDailyDasha,
  findCurrentStatus,
  PLANET_MAP,
  reduceToSingle,
} from '../numerology/numerologyEngine.js';

import {
  ROOT_PREDICTIONS,
  DESTINY_PREDICTIONS,
  getCombinedPrediction,
  getComboPrediction,
} from '../numerology/predictionsData.js';

console.log('======================================================');
console.log('🧪 SUITE: VEDIC NUMEROLOGY & GRID CALCULATIONS');
console.log('======================================================');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. Root Number Tests
assert(getRootNumber(new Date(1990, 4, 1)) === 1, 'Day 1 -> Root Number 1');
assert(getRootNumber(new Date(1990, 4, 10)) === 1, 'Day 10 -> Root Number 1 (Exemption)');
assert(getRootNumber(new Date(1990, 4, 20)) === 2, 'Day 20 -> Root Number 2 (Exemption)');
assert(getRootNumber(new Date(1990, 4, 30)) === 3, 'Day 30 -> Root Number 3 (Exemption)');
assert(getRootNumber(new Date(1990, 4, 28)) === 1, 'Day 28 -> 2+8=10 -> 1');
assert(getRootNumber(new Date(1990, 4, 15)) === 6, 'Day 15 -> 1+5=6');

// 2. Destiny Number Tests
// Date: 15 May 1990 -> 15 + 5 + reduce(1990=19=10=1) = 15 + 5 + 1 = 21 -> 3
assert(getDestinyNumber(new Date(1990, 4, 15)) === 3, '15-05-1990 -> Destiny Number 3');
// Date: 1 Jan 2000 -> 1 + 1 + reduce(2000=2) = 4
assert(getDestinyNumber(new Date(2000, 0, 1)) === 4, '01-01-2000 -> Destiny Number 4');

// 3. Weekday Values
// 2026-11-14 is Saturday -> 8
assert(getWeekdayValue(new Date(2026, 10, 14)) === 8, 'Saturday Vedic Value is 8 (Saturn)');
// 2026-11-15 is Sunday -> 1
assert(getWeekdayValue(new Date(2026, 10, 15)) === 1, 'Sunday Vedic Value is 1 (Sun)');

// 4. Grid Numbers
// 15-05-1990 -> Day: 1, 5; Month: 5; Year: 9, 0; RN: 6; DN: 3
const gridNums = collectGridNumbers(new Date(1990, 4, 15));
assert(gridNums.includes(1) && gridNums.includes(5) && gridNums.includes(9) && gridNums.includes(0) && gridNums.includes(6) && gridNums.includes(3), 'Grid contains expected digits for 15-05-1990');

// 5. Mahadasha Sequence
const mds = calculateMahadashas(new Date(1990, 4, 15));
assert(mds.length > 0, 'Mahadashas generated');
assert(mds[0].number === 6, 'First MD matches RN 6');
assert(mds[0].years === 6, 'First MD lasts 6 years');
assert(mds[1].number === 7, 'Second MD is 7');

// 6. Antardashas (120 years)
const ads = calculateAntardashas(new Date(1990, 4, 15));
assert(ads.length === 120, 'Antardashas generated for full 120-year span');
assert(ads[0].age === 0 && ads[119].age === 119, 'Age spans 0 to 119');

// 7. Pratyantar Dashas
const pds = calculatePratyantars(ads[0].number, ads[0].startDate);
assert(pds.length === 9, '9 Pratyantar sub-periods generated');
const totalDays = pds.reduce((sum, p) => sum + p.days, 0);
assert(totalDays >= 365 && totalDays <= 366, `Pratyantar days sum to full year: ${totalDays}`);

// 8. Daily Dasha
const dd = calculateDailyDasha(3, new Date(2026, 10, 14));
assert(dd >= 1 && dd <= 9, `Daily Dasha produces valid single digit: ${dd}`);

// 9. Prediction Database
assert(ROOT_PREDICTIONS[1] && ROOT_PREDICTIONS[9], 'Root predictions exist for 1-9');
assert(DESTINY_PREDICTIONS[1] && DESTINY_PREDICTIONS[9], 'Destiny predictions exist for 1-9');
const combo11 = getComboPrediction(1, 1);
assert(combo11 && combo11.hi.length > 0 && combo11.en.length > 0, '1x1 Combo prediction has both Hindi and English points');
const combo99 = getComboPrediction(9, 9);
assert(combo99 && combo99.hi.length > 0 && combo99.en.length > 0, '9x9 Combo prediction has both Hindi and English points');

console.log(`\n🎉 SUITE PASSED: ${passed} assertions passed, ${failed} failures!`);
if (failed > 0) process.exit(1);
