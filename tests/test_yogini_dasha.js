/**
 * Test Suite 9: Yogini Dasha Calculations & Mehta Classical Rules
 * Benchmarked against M.S. Mehta Chapter XVI (Analysing Horoscope Through Modern Techniques).
 *
 * Verifies:
 * 1. Mother Teresa case study from Mehta p. 378 (Bharani Nakshatra -> Bhadrika starting, 90 days balance).
 * 2. Swati Nakshatra example from Mehta p. 378 (Nakshatra #15 -> Pingala starting).
 * 3. Anurag Sharma chart (Ashvini Nakshatra #1 -> Bhramari starting).
 * 4. Mathematical integrity of 36-year cycles and 8 proportional Antardashas.
 * 5. Full 64 sub-period classical prediction dictionary coverage.
 * 6. Dasha Chidra and MD-AD Sambandha metrics.
 */

import { calculateYoginiDasha, YOGINI_ORDER, YOGINI_SUBPERIOD_RESULTS, TOTAL_YOGINI_CYCLE_YEARS } from '../js/yogini.js';
import { parsePlanetaryInput } from '../js/parser.js';
import { calculateVimshottariDasha } from '../js/dasha.js';
import { ANURAG_SHARMA_PROFILE } from './fixtures/anurag_sharma.js';

export function runYoginiDashaTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 9: YOGINI DASHA (MEHTA CH. XVI BENCHMARKS)');
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

  // --- 9.1 Mother Teresa Benchmark from Mehta Chapter XVI (p. 378) ---
  console.log('--- 9.1 Mother Teresa Benchmark (Mehta p. 378) ---');
  // Moon in Bharani at 26°00' Aries. Bharani is Nakshatra 2 (13°20' to 26°40').
  // Remaining arc = 26°40' - 26°00' = 40 minutes out of 800 minutes.
  const motherTeresaMoon = {
    nakshatraId: 2,
    nakshatraName: 'Bharani',
    fractionInNakshatra: (800 - 40) / 800 // 760/800 elapsed, 40/800 remaining = 0.05
  };
  const mtResult = calculateYoginiDasha(motherTeresaMoon, '1910-08-26', 3);
  assert(!!mtResult, 'Yogini calculation for Mother Teresa must succeed');
  assert(mtResult.startingYogini === 'Bhadrika', `Starting Yogini: Expected Bhadrika, got ${mtResult.startingYogini}`);
  assert(mtResult.startingLord === 'Mercury', `Starting Lord: Expected Mercury, got ${mtResult.startingLord}`);
  // Balance should be exactly 0.25 years = 90 days
  assert(Math.abs(mtResult.balanceYears - 0.25) < 0.01, `Balance years: Expected 0.25 (~90 days), got ${mtResult.balanceYears}`);
  console.log(`  ✓ Starting Yogini: ${mtResult.startingYogini} (${mtResult.startingLord})`);
  console.log(`  ✓ Birth Balance: ${mtResult.balanceText} (Mehta exact match: 90 days)`);

  // --- 9.2 Swati Nakshatra Example from Mehta Chapter XVI (p. 378) ---
  console.log('\n--- 9.2 Swati Nakshatra Benchmark (Mehta p. 378) ---');
  const swatiMoon = {
    nakshatraId: 15,
    nakshatraName: 'Svati',
    fractionInNakshatra: 0.25
  };
  const swatiResult = calculateYoginiDasha(swatiMoon, '1990-01-01', 1);
  assert(swatiResult.startingYogini === 'Pingala', `Swati Starting Yogini: Expected Pingala, got ${swatiResult.startingYogini}`);
  assert(swatiResult.startingLord === 'Sun', `Swati Starting Lord: Expected Sun, got ${swatiResult.startingLord}`);
  console.log(`  ✓ Nakshatra 15 (Swati) + 3 = 18. 18 % 8 = 2 -> ${swatiResult.startingYogini} (${swatiResult.startingLord})`);

  // --- 9.3 Anurag Sharma Profile Benchmark ---
  console.log('\n--- 9.3 Anurag Sharma Profile Yogini Timeline ---');
  const parsed = parsePlanetaryInput(ANURAG_SHARMA_PROFILE.rawInput);
  const anuragMoon = parsed.find(p => p.key === 'Moon');
  assert(!!anuragMoon, 'Moon planet must be present');

  const anuragYogini = calculateYoginiDasha(anuragMoon, ANURAG_SHARMA_PROFILE.dob, 3);
  // Ashvini is Nakshatra 1 -> (1 + 3) % 8 = 4 -> Bhramari (Mars)
  assert(anuragYogini.startingYogini === 'Bhramari', `Starting Yogini for Ashvini: Expected Bhramari, got ${anuragYogini.startingYogini}`);
  assert(anuragYogini.startingLord === 'Mars', `Starting Lord: Expected Mars, got ${anuragYogini.startingLord}`);
  assert(anuragYogini.cycles.length === 3, 'Must produce 3 36-year cycles');
  assert(!!anuragYogini.currentRunning, 'Must identify current running Yogini period');
  console.log(`  ✓ Ashvini Nakshatra: Starting Yogini ${anuragYogini.startingYogini} (${anuragYogini.startingLord})`);
  console.log(`  ✓ Currently Running (2026): ${anuragYogini.currentRunning.mdName} MD (${anuragYogini.currentRunning.mdLord}) / ${anuragYogini.currentRunning.adName} AD (${anuragYogini.currentRunning.adLord}) [Cycle ${anuragYogini.currentRunning.cycle}]`);
  console.log(`  ✓ Classical Reading: "${anuragYogini.currentRunning.classicalReading}"`);

  // --- 9.4 Cycle & Antardasha Mathematical Integrity ---
  console.log('\n--- 9.4 Mathematical Verification (36-Year Cycles & Proportions) ---');
  assert(TOTAL_YOGINI_CYCLE_YEARS === 36, 'Yogini cycle must be exactly 36 years');
  const sumOrderYears = YOGINI_ORDER.reduce((acc, y) => acc + y.years, 0);
  assert(sumOrderYears === 36, `Sum of 8 Yoginis: Expected 36, got ${sumOrderYears}`);

  // Test full cycle 2 mahadashas (where all durations are full)
  const cycle2 = anuragYogini.cycles[1];
  assert(cycle2.mahadashas.length === 8, 'Cycle 2 must contain exactly 8 Mahadashas');
  for (let md of cycle2.mahadashas) {
    assert(md.antardashas.length === 8, `MD ${md.name} must contain 8 Antardashas`);
    const adYearsSum = md.antardashas.reduce((acc, ad) => acc + ad.years, 0);
    assert(Math.abs(adYearsSum - md.totalYears) < 0.05, `AD sum for ${md.name} (${adYearsSum}) must match MD total years (${md.totalYears})`);
  }
  console.log('  ✓ Verified 8 Antardashas for each of the 8 Mahadashas sum to exact MD duration');

  // --- 9.5 Classical 64 Sub-period Prediction Coverage ---
  console.log('\n--- 9.5 64 Classical Sub-period Coverage ---');
  let comboCount = 0;
  for (let m of YOGINI_ORDER) {
    for (let a of YOGINI_ORDER) {
      const key = `${m.name}-${a.name}`;
      assert(!!YOGINI_SUBPERIOD_RESULTS[key], `Classical reading must exist for ${key}`);
      comboCount++;
    }
  }
  assert(comboCount === 64, `Must cover all 64 combinations, checked ${comboCount}`);
  console.log(`  ✓ All ${comboCount} classical Yogini sub-period predictions verified in dictionary`);

  // --- 9.6 Dasha Chidra & MD-AD Sambandha Metrics ---
  console.log('\n--- 9.6 Dasha Chidra & Sambandha Engine (Mehta Ch. XV) ---');
  const vimshottari = calculateVimshottariDasha(anuragMoon, ANURAG_SHARMA_PROFILE.dob, parsed);
  assert(!!vimshottari.currentRunning, 'Vimshottari current running must be detected');
  assert(!!vimshottari.currentRunning.sambandha, 'Current running must contain Sambandha assessment');
  console.log(`  ✓ Active Vimshottari: ${vimshottari.currentRunning.md} MD / ${vimshottari.currentRunning.ad} AD`);
  console.log(`  ✓ Mutual Sambandha: ${vimshottari.currentRunning.sambandha.label} (${vimshottari.currentRunning.sambandha.type})`);

  // Check penultimate and terminal chidra flags
  const testMd = vimshottari.mahadashas[0];
  const penultAd = testMd.antardashas[7];
  const termAd = testMd.antardashas[8];
  assert(penultAd.chidraStatus && penultAd.chidraStatus.isChidra, '7th index AD must be flagged as Chidra');
  assert(termAd.chidraStatus && termAd.chidraStatus.isChidra, '8th index AD must be flagged as Chidra');
  console.log(`  ✓ Penultimate AD (7): ${penultAd.chidraStatus.phase}`);
  console.log(`  ✓ Ultimate AD (8): ${termAd.chidraStatus.phase}`);

  console.log(`\n🎉 SUITE 9 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_yogini_dasha.js')) {
  runYoginiDashaTests();
}
