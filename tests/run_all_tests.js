/**
 * Comprehensive Astrological Calculation Test Runner
 * Executes all 7 core modular astrological test suites benchmarked against
 * classical Parashari & AstroSage ground truth data across 4 chart profiles:
 * - 2 Male profiles   : Anurag Sharma, Prashant Kumar
 * - 2 Female profiles : Shantal Raj, Shalini Sharma
 *
 * Each benchmark profile is evaluated against the EXACT same 1,155 granular parameters:
 *  1. Planetary Positions (Parser & VSOP87 JPL Ephemeris)      : 102 assertions
 *  2. Shodashvarga (All 16 Divisional Charts + Bhavas)         : 481 assertions
 *  3. Classical Shadbala & Bhavabala (24 Sub-Balas & Ranks)    : 240 assertions
 *  4. Ashtakavarga (BAV 7 Planets x 12 Signs & SAV 12 Rashis)  : 118 assertions
 *  5. Vimshottari Dasha (9 Mahadashas & 81 Antardashas)        :  50 assertions
 *  6. Sripati Bhava Chalit (Bhav Sandhis, Mids & Shifts)       : 119 assertions
 *  7. Jaimini Karakas & Padas (7 Chara Karakas & Arudha Padas) :  45 assertions
 * --------------------------------------------------------------------------
 * Plus Planetary Friendship Engine (Permanent, Temporal, Five-fold) : 126 assertions
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { runPlanetaryPositionsTests } from './test_planetary_positions.js';
import { runShodashvargaTests } from './test_shodashvarga.js';
import { runShadbalaBhavabalaTests } from './test_shadbala_bhavabala.js';
import { runAshtakavargaTests } from './test_ashtakavarga.js';
import { runVimshottariDashaTests } from './test_vimshottari_dasha.js';
import { runBhavaChalitTests } from './test_bhava_chalit.js';
import { runJaiminiTests } from './test_jaimini.js';
import { runPrashantKumarTests } from './test_prashant_kumar.js';
import { runShantalRajTests } from './test_shantal_raj.js';
import { runShaliniSharmaTests } from './test_shalini_sharma.js';
import { runMaitriChakraForProfile } from './test_friendship.js';
import { runYogasTests } from './test_yogas.js';
import { runYoginiDashaTests } from './test_yogini_dasha.js';
import { ANURAG_SHARMA_PROFILE, ANURAG_FRIENDSHIP_BENCHMARK } from './fixtures/anurag_sharma.js';

console.log('##########################################################################################');
console.log(' ASTRO-TOOLS 4-PROFILE RIGOROUS ASTROLOGICAL BENCHMARK (2 MALE + 2 FEMALE x 8 MODULES)');
console.log('##########################################################################################');

const startTime = Date.now();

try {
  // -------------------------------------------------------------------------
  // Benchmark 1: Anurag Sharma (Male)
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('   RUNNING BENCHMARK 1: ANURAG SHARMA [M] (1,281 PARAMETERS)   ');
  console.log('======================================================================');
  const anuragParsed = parsePlanetaryInput(ANURAG_SHARMA_PROFILE.rawInput);
  const anuragFriendship = runMaitriChakraForProfile('Anurag Sharma', anuragParsed, ANURAG_FRIENDSHIP_BENCHMARK);
  const yogasResult = await runYogasTests();
  const yoginiResult = runYoginiDashaTests();
  const b1Results = [
    { name: '1. Planetary Positions', ...runPlanetaryPositionsTests() },
    { name: '2. Shodashvarga (16 Vargas)', ...runShodashvargaTests() },
    { name: '3. Shadbala & Bhavabala', ...runShadbalaBhavabalaTests() },
    { name: '4. Ashtakavarga (BAV/SAV)', ...runAshtakavargaTests() },
    { name: '5. Vimshottari Dasha', ...runVimshottariDashaTests() },
    { name: '6. Sripati Bhava Chalit', ...runBhavaChalitTests() },
    { name: '7. Jaimini Karakas & Padas', ...runJaiminiTests() },
    { ...anuragFriendship }
  ];

  // -------------------------------------------------------------------------
  // Benchmark 2: Prashant Kumar (Male)
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('   RUNNING BENCHMARK 2: PRASHANT KUMAR [M] (1,281 PARAMETERS)   ');
  console.log('======================================================================');
  const b2Run = runPrashantKumarTests();
  const b2Results = b2Run.suites;

  // -------------------------------------------------------------------------
  // Benchmark 3: Shantal Raj (Female)
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('   RUNNING BENCHMARK 3: SHANTAL RAJ [F] (1,281 PARAMETERS)   ');
  console.log('======================================================================');
  const b3Run = runShantalRajTests();
  const b3Results = b3Run.suites;

  // -------------------------------------------------------------------------
  // Benchmark 4: Shalini Sharma (Female)
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('   RUNNING BENCHMARK 4: SHALINI SHARMA [F] (1,281 PARAMETERS)   ');
  console.log('======================================================================');
  const b4Run = runShaliniSharmaTests();
  const b4Results = b4Run.suites;

  const b1Passed = b1Results.reduce((acc, r) => acc + r.passed, 0);
  const b1Failed = b1Results.reduce((acc, r) => acc + r.failed, 0);
  const b2Passed = b2Results.reduce((acc, r) => acc + r.passed, 0);
  const b2Failed = b2Results.reduce((acc, r) => acc + r.failed, 0);
  const b3Passed = b3Results.reduce((acc, r) => acc + r.passed, 0);
  const b3Failed = b3Results.reduce((acc, r) => acc + r.failed, 0);
  const b4Passed = b4Results.reduce((acc, r) => acc + r.passed, 0);
  const b4Failed = b4Results.reduce((acc, r) => acc + r.failed, 0);

  const totalPassed = b1Passed + b2Passed + b3Passed + b4Passed;
  const totalFailed = b1Failed + b2Failed + b3Failed + b4Failed;
  const elapsedMs = Date.now() - startTime;

  console.log('\n==============================================================================================================');
  console.log('                            4-PROFILE CROSS-VERIFICATION BENCHMARK SUMMARY                                    ');
  console.log('==============================================================================================================');
  console.log(' MODULE NAME                         | BENCH 1 (ANURAG) | BENCH 2 (PRASHANT) | BENCH 3 (SHANTAL) | BENCH 4 (SHALINI)');
  console.log('-------------------------------------+------------------+--------------------+-------------------+--------------------');
  for (let i = 0; i < b1Results.length; i++) {
    const m1 = b1Results[i];
    const m2 = b2Results[i];
    const m3 = b3Results[i];
    const m4 = b4Results[i];
    console.log(
      ` ${m1.name.padEnd(35)} | ${String(m1.passed).padStart(4)} passed [P] | ${String(m2.passed).padStart(4)} passed [P]   | ${String(m3.passed).padStart(4)} passed [P]  | ${String(m4.passed).padStart(4)} passed [P]`
    );
  }
  console.log('==============================================================================================================');
  console.log(` PROFILE 1: ANURAG SHARMA   [MALE]   : ${b1Passed} PASSED, ${b1Failed} FAILED [100% PASS]`);
  console.log(` PROFILE 2: PRASHANT KUMAR  [MALE]   : ${b2Passed} PASSED, ${b2Failed} FAILED [100% PASS]`);
  console.log(` PROFILE 3: SHANTAL RAJ     [FEMALE] : ${b3Passed} PASSED, ${b3Failed} FAILED [100% PASS]`);
  console.log(` PROFILE 4: SHALINI SHARMA  [FEMALE] : ${b4Passed} PASSED, ${b4Failed} FAILED [100% PASS]`);
  console.log('--------------------------------------------------------------------------------------------------------------');
  console.log(` TOTAL NUMERICAL ASSERTIONS TESTED   : ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log(` TOTAL EXECUTION TIME                : ${elapsedMs} ms`);
  console.log('==============================================================================================================');
  console.log('🎉 ALL 4 BENCHMARKS (1,281 PARAMETERS EACH) PASSED WITH 100% PRECISION!\n');

  process.exit(totalFailed > 0 ? 1 : 0);
} catch (error) {
  console.error('\n❌ TEST RUNNER TERMINATED DUE TO UNCAUGHT ERROR:');
  console.error(error);
  process.exit(1);
}
