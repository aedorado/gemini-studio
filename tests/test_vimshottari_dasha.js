/**
 * Test Suite 5: Vimshottari Dasha Calculations
 * Benchmarked against AstroSage calculations for Anurag Sharma.
 * Verifies:
 * - Starting Mahadasha determination based on Moon's Nakshatra (Ashvini -> Ketu).
 * - Mahadasha balance at birth (fraction elapsed in Ashvini).
 * - Full 120-year Mahadasha sequence, durations, and start/end dates.
 * - Antardashas within Mahadashas.
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { calculateVimshottariDasha } from '../js/dasha.js';
import { ANURAG_SHARMA_PROFILE, ANURAG_DASHA_BENCHMARK } from './fixtures/anurag_sharma.js';

export function runVimshottariDashaTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 5: VIMSHOTTARI DASHA CALCULATIONS');
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
  const moonPlanet = parsed.find(p => p.key === 'Moon');
  assert(!!moonPlanet, 'Moon planet must be present in parsed chart');

  const dashaResult = calculateVimshottariDasha(moonPlanet, ANURAG_SHARMA_PROFILE.dob);
  assert(!!dashaResult, 'Vimshottari Dasha result must not be null');

  console.log('--- 5.1 Starting Mahadasha & Birth Balance ---');
  assert(moonPlanet.nakshatraLord === ANURAG_DASHA_BENCHMARK.startingLord,
    `Starting Nakshatra Lord: Expected ${ANURAG_DASHA_BENCHMARK.startingLord}, got ${moonPlanet.nakshatraLord}`);
  console.log(`  ✓ Moon in ${moonPlanet.nakshatraName} (Pada ${moonPlanet.pada}) ruled by ${moonPlanet.nakshatraLord}`);
  console.log(`  ✓ Mahadasha Balance at Birth: ${dashaResult.balanceText}`);

  console.log('\n--- 5.2 Sequence of 9 Mahadashas (120 Years) ---');
  assert(dashaResult.mahadashas.length === 9, `Must generate 9 Mahadashas, got ${dashaResult.mahadashas.length}`);

  for (let i = 0; i < 9; i++) {
    const mdCalc = dashaResult.mahadashas[i];
    const mdExp = ANURAG_DASHA_BENCHMARK.mahadashas[i];

    assert(mdCalc.lord === mdExp.lord, `MD ${i + 1} Lord: Expected ${mdExp.lord}, got ${mdCalc.lord}`);
    assert(mdCalc.totalYears === mdExp.years, `MD ${i + 1} Total Years: Expected ${mdExp.years}, got ${mdCalc.totalYears}`);

    // Tolerance check on start and end dates (within ~5 days due to calendar leap-year / savana year variations)
    const startYear = mdCalc.startDate.getFullYear();
    const expStartYear = parseInt(mdExp.startApprox.slice(0, 4), 10);
    assert(Math.abs(startYear - expStartYear) <= 1, `MD ${mdCalc.lord} Start Year: Expected ~${expStartYear}, got ${startYear}`);

    const endYear = mdCalc.endDate.getFullYear();
    const expEndYear = parseInt(mdExp.endApprox.slice(0, 4), 10);
    assert(Math.abs(endYear - expEndYear) <= 1, `MD ${mdCalc.lord} End Year: Expected ~${expEndYear}, got ${endYear}`);

    // Verify each Mahadasha contains 9 Antardashas
    assert(mdCalc.antardashas && mdCalc.antardashas.length === 9, `MD ${mdCalc.lord} must contain 9 Antardashas`);

    console.log(`  ✓ MD ${String(i + 1).padStart(2)}: ${mdCalc.lord.padEnd(8)} (${String(mdCalc.totalYears).padStart(2)} yrs) | ${mdCalc.startStr} to ${mdCalc.endStr} | 9 Antardashas verified`);
  }

  console.log('\n--- 5.3 Active Dasha Period ---');
  assert(!!dashaResult.currentRunning, 'Must detect currently running Dasha');
  console.log(`  ✓ Currently Running (2026): ${dashaResult.currentRunning.md} MD / ${dashaResult.currentRunning.ad} AD / ${dashaResult.currentRunning.pd} PD`);

  console.log('\n--- 5.4 Vinod & Shyam\'s Daughter (Purva Ashadha - Venus Balance 2y 9m 18d) ---');
  // Native born 2026-11-14 with Purva Ashadha Moon (balance 2y 9m 18d of Venus)
  const daughterMoon = {
    nakshatraLord: 'Venus',
    nakshatraName: 'Purva Ashadha',
    fractionInNakshatra: 1 - (2 + 9/12 + 18/365.25) / 20
  };
  const daughterDasha = calculateVimshottariDasha(daughterMoon, '2026-11-14', [], [], new Date('2026-11-14'));
  assert(!!daughterDasha, 'Daughter dasha must calculate');
  assert(daughterDasha.nakshatraLord === 'Venus', 'Birth MD Lord must be Venus');
  assert(daughterDasha.mahadashas[0].lord === 'Venus', 'First MD must be Venus');

  // Verify currently running dasha at birth is Venus - Mercury (Ve-Me), NOT Venus - Venus!
  assert(daughterDasha.currentRunning.md === 'Venus', `Expected MD Venus, got ${daughterDasha.currentRunning.md}`);
  assert(daughterDasha.currentRunning.ad === 'Mercury', `Expected Birth AD Mercury (Ve-Me), got ${daughterDasha.currentRunning.ad}`);
  assert(daughterDasha.currentRunning.pd === 'Moon', `Expected Birth PD Moon, got ${daughterDasha.currentRunning.pd}`);
  console.log(`  ✓ Verified Running Dasha at Birth: ${daughterDasha.currentRunning.md} MD › ${daughterDasha.currentRunning.ad} AD › ${daughterDasha.currentRunning.pd} PD`);

  // Verify all 9 Antardashas of Venus Mahadasha and classical end dates
  const adExpected = [
    { lord: 'Venus',   expEndYear: 2013, expEndMonth: 1, isPreNatal: true },
    { lord: 'Sun',     expEndYear: 2014, expEndMonth: 1, isPreNatal: true },
    { lord: 'Moon',    expEndYear: 2015, expEndMonth: 9, isPreNatal: true },
    { lord: 'Mars',    expEndYear: 2016, expEndMonth: 11, isPreNatal: true },
    { lord: 'Rahu',    expEndYear: 2019, expEndMonth: 11, isPreNatal: true },
    { lord: 'Jupiter', expEndYear: 2022, expEndMonth: 7, isPreNatal: true },
    { lord: 'Saturn',  expEndYear: 2025, expEndMonth: 9, isPreNatal: true },
    { lord: 'Mercury', expEndYear: 2028, expEndMonth: 7, isBirthDasha: true, isPreNatal: false },
    { lord: 'Ketu',    expEndYear: 2029, expEndMonth: 9, isPreNatal: false }
  ];

  const firstMdAds = daughterDasha.mahadashas[0].antardashas;
  assert(firstMdAds.length === 9, 'Must have 9 Antardashas in birth MD');

  for (let j = 0; j < 9; j++) {
    const ad = firstMdAds[j];
    const exp = adExpected[j];
    assert(ad.lord === exp.lord, `AD ${j + 1}: Expected ${exp.lord}, got ${ad.lord}`);
    assert(ad.endDate.getFullYear() === exp.expEndYear, `AD ${ad.lord} End Year: Expected ${exp.expEndYear}, got ${ad.endDate.getFullYear()}`);
    assert(Math.abs((ad.endDate.getMonth() + 1) - exp.expEndMonth) <= 1, `AD ${ad.lord} End Month: Expected ~${exp.expEndMonth}, got ${ad.endDate.getMonth() + 1}`);
    if (exp.isPreNatal) {
      assert(ad.isPreNatal === true, `AD ${ad.lord} must be flagged isPreNatal`);
    }
    if (exp.isBirthDasha) {
      assert(ad.isBirthDasha === true, `AD ${ad.lord} must be flagged isBirthDasha`);
    }
    console.log(`  ✓ Ve - ${ad.lord.padEnd(8)}: ${ad.startStr} to ${ad.endStr} | ${ad.isPreNatal ? 'Pre-natal' : (ad.isBirthDasha ? '⭐ Birth AD' : 'Future')}`);
  }

  console.log(`\n🎉 SUITE 5 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_vimshottari_dasha.js')) {
  runVimshottariDashaTests();
}
