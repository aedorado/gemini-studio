/**
 * Test Suite 1: Planetary Positions & Ephemeris Calculations
 * Verifies:
 * 1. Parser extraction of Rashi signs, degrees, minutes, seconds, nakshatras, padas, and retrograde flags.
 * 2. High-precision VSOP87 JPL Ephemeris calculations from date, time, and coordinates against benchmarks.
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { calculateChartFromBirthDetails } from '../js/ephemeris.js';
import { ANURAG_SHARMA_PROFILE, ANURAG_PLANETARY_BENCHMARK } from './fixtures/anurag_sharma.js';

export function runPlanetaryPositionsTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 1: PLANETARY POSITIONS (PARSER & EPHEMERIS)');
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

  // 1. Test Parser Extraction
  console.log('--- 1.1 Parsing Planetary Input Table ---');
  const parsed = parsePlanetaryInput(ANURAG_SHARMA_PROFILE.rawInput);
  assert(parsed.length === 13, `Parsed body count should be 13, got ${parsed.length}`);

  for (const exp of ANURAG_PLANETARY_BENCHMARK) {
    const act = parsed.find(p => p.key === exp.key);
    assert(!!act, `Body ${exp.key} must be found in parsed planets`);

    // Match sign
    const signMatch = act.signName.toLowerCase() === exp.sign.toLowerCase() ||
                      (exp.altSign && act.signName.toLowerCase() === exp.altSign.toLowerCase());
    assert(signMatch, `${exp.key} Sign: Expected ${exp.sign}, got ${act.signName}`);

    // Match Deg, Min, Sec
    assert(act.degDms.deg === exp.deg, `${exp.key} Deg: Expected ${exp.deg}, got ${act.degDms.deg}`);
    assert(act.degDms.min === exp.min, `${exp.key} Min: Expected ${exp.min}, got ${act.degDms.min}`);
    const secDiff = Math.abs(act.degDms.sec - exp.sec);
    assert(secDiff <= 1, `${exp.key} Sec: Expected ${exp.sec}, got ${act.degDms.sec} (diff: ${secDiff})`);

    // Match Nakshatra & Pada
    const nakClean = act.nakshatraName.replace(/\s+/g, '').toLowerCase();
    const expClean = exp.nakshatra.replace(/\s+/g, '').toLowerCase();
    const expAltClean = exp.altNakshatra ? exp.altNakshatra.replace(/\s+/g, '').toLowerCase() : '';
    const nakMatch = nakClean === expClean || nakClean === expAltClean ||
                     nakClean.includes(expClean) || expClean.includes(nakClean);
    assert(nakMatch, `${exp.key} Nakshatra: Expected ${exp.nakshatra}, got ${act.nakshatraName}`);
    assert(act.pada === exp.pada, `${exp.key} Pada: Expected ${exp.pada}, got ${act.pada}`);

    // Match Retrograde flag
    assert(act.isRetro === exp.isRetro, `${exp.key} Retrograde: Expected ${exp.isRetro}, got ${act.isRetro}`);

    console.log(`  ✓ [PARSER] ${exp.key.padEnd(5)}: ${act.signName.padEnd(10)} ${act.dmsFormatted} | ${act.nakshatraName} Pada ${act.pada} ${act.isRetro ? '[R]' : ''}`);
  }

  // 2. Test JPL Ephemeris Calculation from Birth Details
  console.log('\n--- 1.2 VSOP87 JPL Ephemeris Calculation from Birth Details ---');
  const ephemChart = calculateChartFromBirthDetails({
    year: 1994, month: 3, day: 15,
    hour: 12, minute: 1, second: 0,
    lat: ANURAG_SHARMA_PROFILE.lat,
    lon: ANURAG_SHARMA_PROFILE.lon,
    tz: ANURAG_SHARMA_PROFILE.tz
  });

  assert(ephemChart.planets && ephemChart.planets.length >= 10, 'Ephemeris must calculate at least 10 planetary bodies');
  console.log(`  Computed Lahiri Ayanamsha: ${ephemChart.ayanamsha.toFixed(4)}°`);

  for (const exp of ANURAG_PLANETARY_BENCHMARK) {
    const act = ephemChart.planets.find(p => p.key === exp.key);
    if (!act) continue;

    // Ephemeris vs AstroSage tolerance: within ~3 arcminutes (0.05°)
    const expDeg = exp.deg + exp.min / 60 + exp.sec / 3600;
    const actDeg = act.degInSign;
    const degDiffArcMin = Math.abs(actDeg - expDeg) * 60;

    assert(degDiffArcMin < 3.0, `Ephemeris ${exp.key} within 3 arcmin: Diff is ${degDiffArcMin.toFixed(2)}'`);
    assert(act.isRetro === exp.isRetro, `Ephemeris ${exp.key} Retrograde match: Expected ${exp.isRetro}, got ${act.isRetro}`);

    console.log(`  ✓ [EPHEMERIS] ${exp.key.padEnd(5)}: ${act.signName.padEnd(10)} ${act.dmsFormatted} (delta: ${degDiffArcMin.toFixed(2)} arcmin)`);
  }

  console.log(`\n🎉 SUITE 1 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_planetary_positions.js')) {
  runPlanetaryPositionsTests();
}
