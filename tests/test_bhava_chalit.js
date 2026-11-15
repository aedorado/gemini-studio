/**
 * Test Suite 6: Sripati Bhava Chalit Calculations
 * Benchmarked directly against official AstroSage Chalit Table for Anurag Sharma.
 * Verifies:
 * - Sripati unequal quadrant trisection and Bhav Madhya (Mid Bhav) calculations.
 * - Bhav Sandhi (Bhav Begin / Arambha) circular midpoints.
 * - Exact Sign & DMS matching for all 12 Bhavas against the benchmark table.
 * - Planet allocations into Chalit houses and detection of classical house shifts
 *   (e.g., Mars & Saturn shifting from H9 in Rashi to H10 in Bhava Chalit).
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { calculateBhavaChalit } from '../js/bhavaChalit.js';
import {
  ANURAG_SHARMA_PROFILE,
  ANURAG_CHALIT_BENCHMARK,
  ANURAG_CHALIT_SHIFTS_BENCHMARK
} from './fixtures/anurag_sharma.js';

export function runBhavaChalitTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 6: SRIPATI BHAVA CHALIT CALCULATIONS');
  console.log('======================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error(`  ❌ FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const parsed = parsePlanetaryInput(ANURAG_SHARMA_PROFILE.rawInput);

  // Anurag Sharma Benchmark Mid Bhav 10 (MC): Aquarius 23° 36' 26" = 323.607222°
  const mcDeg = 300 + 23 + 36 / 60 + 26 / 3600;

  const chalit = calculateBhavaChalit(parsed, { mcDeg });
  assert(chalit.houses.length === 12, `Must produce 12 Bhavas, got ${chalit.houses.length}`);

  console.log('--- 6.1 Bhava Chalit Table Verification (Houses 1 to 12) ---');
  console.log('Bhav | Sign Bhav Begin   (Actual) | Sign Mid Bhav     (Actual) | Status');

  for (let h = 1; h <= 12; h++) {
    const actHouse = chalit.houses[h - 1];
    const expHouse = ANURAG_CHALIT_BENCHMARK[h - 1];

    // Verify House number
    assert(actHouse.house === expHouse.house, `House index mismatch: ${actHouse.house} vs ${expHouse.house}`);

    // Verify Bhav Begin Sign
    const beginSignMatch = actHouse.bhavBegin.signName.toLowerCase() === expHouse.beginSign.toLowerCase() ||
                           (expHouse.altBeginSign && actHouse.bhavBegin.signName.toLowerCase() === expHouse.altBeginSign.toLowerCase());
    assert(beginSignMatch, `H${h} Begin Sign: Expected ${expHouse.beginSign}, got ${actHouse.bhavBegin.signName}`);

    // Verify Bhav Begin DMS (within 1 second tolerance)
    const [expBD, expBM, expBS] = expHouse.beginDms.split('.').map(Number);
    const actBD = actHouse.bhavBegin.degDms.deg;
    const actBM = actHouse.bhavBegin.degDms.min;
    const actBS = actHouse.bhavBegin.degDms.sec;
    assert(actBD === expBD, `H${h} Begin Deg: Expected ${expBD}, got ${actBD}`);
    assert(actBM === expBM, `H${h} Begin Min: Expected ${expBM}, got ${actBM}`);
    assert(Math.abs(actBS - expBS) <= 1, `H${h} Begin Sec: Expected ${expBS}, got ${actBS}`);

    // Verify Mid Bhav Sign
    const midSignMatch = actHouse.midBhav.signName.toLowerCase() === expHouse.midSign.toLowerCase() ||
                         (expHouse.altMidSign && actHouse.midBhav.signName.toLowerCase() === expHouse.altMidSign.toLowerCase());
    assert(midSignMatch, `H${h} Mid Sign: Expected ${expHouse.midSign}, got ${actHouse.midBhav.signName}`);

    // Verify Mid Bhav DMS (within 1 second tolerance)
    const [expMD, expMM, expMS] = expHouse.midDms.split('.').map(Number);
    const actMD = actHouse.midBhav.degDms.deg;
    const actMM = actHouse.midBhav.degDms.min;
    const actMS = actHouse.midBhav.degDms.sec;
    assert(actMD === expMD, `H${h} Mid Deg: Expected ${expMD}, got ${actMD}`);
    assert(actMM === expMM, `H${h} Mid Min: Expected ${expMM}, got ${actMM}`);
    assert(Math.abs(actMS - expMS) <= 1, `H${h} Mid Sec: Expected ${expMS}, got ${actMS}`);

    console.log(`  ${String(h).padStart(2)} | ${actHouse.bhavBegin.dmsDotFormatted.padEnd(26)} | ${actHouse.midBhav.dmsDotFormatted.padEnd(26)} | ✓ MATCH`);
  }

  console.log('\n--- 6.2 Planet Chalit Placements & House Shifts ---');
  for (const shift of ANURAG_CHALIT_SHIFTS_BENCHMARK) {
    const pPlacement = chalit.planetPlacements.find(p => p.key === shift.planet);
    assert(!!pPlacement, `Planet ${shift.planet} must exist in Chalit placements`);
    assert(pPlacement.rashiHouse === shift.rashiHouse,
      `[${shift.planet}] Rashi House: Expected H${shift.rashiHouse}, got H${pPlacement.rashiHouse}`);
    assert(pPlacement.chalitHouse === shift.chalitHouse,
      `[${shift.planet}] Chalit House: Expected H${shift.chalitHouse}, got H${pPlacement.chalitHouse}`);
    assert(pPlacement.isShifted === true, `[${shift.planet}] must be marked as shifted`);

    console.log(`  ✓ ${pPlacement.shiftDescription} -> 100% VERIFIED`);
  }

  // Verify non-shifted planet placements
  const sunPlacement = chalit.planetPlacements.find(p => p.key === 'Sun');
  assert(sunPlacement.chalitHouse === 10, `Sun Chalit House: Expected 10, got ${sunPlacement.chalitHouse}`);
  console.log(`  ✓ Sun in Chalit H${sunPlacement.chalitHouse} (Mid Bhav 10 = Aquarius 23.36, Pisces 00.40 falls into H10)`);

  const moonPlacement = chalit.planetPlacements.find(p => p.key === 'Moon');
  assert(moonPlacement.chalitHouse === 11, `Moon Chalit House: Expected 11, got ${moonPlacement.chalitHouse}`);
  console.log(`  ✓ Moon in Chalit H${moonPlacement.chalitHouse} (Mid Bhav 11 = Pisces 28.44, Aries 03.17 falls into H11)`);

  console.log(`\n🎉 SUITE 6 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_bhava_chalit.js')) {
  runBhavaChalitTests();
}
