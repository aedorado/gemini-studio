/**
 * Test Suite 4: Ashtakavarga (BAV & SAV Calculations)
 * Benchmarked directly against official AstroSage calculations for Anurag Sharma.
 * Verifies:
 * - Bhinnashtakavarga (BAV) bindus for each of the 7 planets across all 12 signs (Aries to Pisces).
 * - Sarvashtakavarga (SAV) bindu sum per sign across all 12 signs:
 *   [29, 24, 31, 27, 29, 30, 27, 31, 32, 26, 27, 24]
 * - Total Sarvashtakavarga bindu sum = 337.
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { calculateAshtakavarga } from '../js/ashtakavarga.js';
import { ANURAG_SHARMA_PROFILE, ANURAG_ASHTAKAVARGA_BENCHMARK } from './fixtures/anurag_sharma.js';

const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];

export function runAshtakavargaTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 4: ASHTAKAVARGA (BAV & SAV CALCULATIONS)');
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
  const ashtaka = calculateAshtakavarga(parsed);

  console.log('--- 4.1 Bhinnashtakavarga (BAV) by Planet & Sign (1 to 12) ---');
  for (const pKey of PLANET_KEYS) {
    const actRow = ashtaka.bav[pKey];
    const expRow = ANURAG_ASHTAKAVARGA_BENCHMARK.bav[pKey];

    assert(!!actRow, `BAV row for planet ${pKey} must exist`);
    assert(actRow.length === 12, `BAV row for planet ${pKey} must contain 12 signs`);

    for (let s = 0; s < 12; s++) {
      const actVal = actRow[s];
      const expVal = expRow[s];
      assert(actVal === expVal, `[${pKey}] Sign ${s + 1} BAV Bindu: Expected ${expVal}, got ${actVal}`);
    }

    const pSum = actRow.reduce((a, b) => a + b, 0);
    const expSum = expRow.reduce((a, b) => a + b, 0);
    assert(pSum === expSum, `[${pKey}] Total BAV Points: Expected ${expSum}, got ${pSum}`);

    console.log(`  ✓ ${pKey.padEnd(5)} BAV: [${actRow.join(' ')}] (Total: ${pSum}) -> 100% MATCH`);
  }

  console.log('\n--- 4.2 Sarvashtakavarga (SAV) per Sign (1 to 12) & Total ---');
  // Compute SAV per sign by summing 7 planets
  const actSAVBySign = [];
  for (let s = 0; s < 12; s++) {
    let sum = 0;
    for (const pKey of PLANET_KEYS) {
      sum += ashtaka.bav[pKey][s];
    }
    actSAVBySign.push(sum);

    const expVal = ANURAG_ASHTAKAVARGA_BENCHMARK.savBySign[s];
    assert(sum === expVal, `Sign ${s + 1} SAV Bindus: Expected ${expVal}, got ${sum}`);
  }

  console.log(`  ✓ SAV by Sign (Aries to Pisces): [${actSAVBySign.join(' ')}] -> 100% MATCH`);

  // Total SAV
  assert(ashtaka.totalSAV === ANURAG_ASHTAKAVARGA_BENCHMARK.totalSAV, `Total SAV: Expected ${ANURAG_ASHTAKAVARGA_BENCHMARK.totalSAV}, got ${ashtaka.totalSAV}`);
  console.log(`  ✓ Total Sarvashtakavarga Bindus: ${ashtaka.totalSAV} / 337 -> EXACT MATCH`);

  console.log(`\n🎉 SUITE 4 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_ashtakavarga.js')) {
  runAshtakavargaTests();
}
