/**
 * Unit Test Suite: Shani Sade Sati Classical Mitigations & Bhava Siddhi Kala
 * Provenance: APA (Advanced Predictive Astrology) Hindi Notes, pp. 172–177
 */

import { calculateSadeSati } from '../js/sadeSati.js';
import { calculateBhavaSiddhi, calculateAllBhavasSiddhi, analyzeTransits } from '../js/transits.js';
import { ANURAG_SHARMA_PROFILE } from './fixtures/anurag_sharma.js';
import { parsePlanetaryInput } from '../js/parser.js';
import { calculateTransits } from '../js/ephemeris.js';

console.log('======================================================');
console.log('🧪 SUITE: APA CLASSICAL SADE SATI & BHAVA SIDDHI KALA');
console.log('======================================================');

let assertions = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  assertions++;
  console.log(`  ✓ ${msg}`);
}

// ---------------------------------------------------------------------------
// 1. Shani Sade Sati Tests (APA Notes, pp. 175-177)
// ---------------------------------------------------------------------------
console.log('\n--- 1. Sade Sati Trikona Lordship & Elemental Mitigations ---');

// Benchmark 1.1: Taurus Lagna (Saturn is 9th Lord & Yogakaraka)
const taurusLagna = { key: 'ASC', signId: 2, signIndex: 1, longitude: 45.0 }; // Taurus
const ariesMoon = { key: 'Moon', signId: 1, signIndex: 0, longitude: 10.0 }; // Aries
const ariesSaturnTransit = { key: 'Saturn', signId: 1, signIndex: 0, longitude: 15.0 }; // Janma Shani in Aries

const ssTaurus = calculateSadeSati(ariesMoon, ariesSaturnTransit, null, taurusLagna);
assert(ssTaurus.isSadeSati === true, 'Sade Sati correctly identified as active');
assert(ssTaurus.phaseNum === 2, 'Core Phase 2 (Janma Shani) detected');
assert(ssTaurus.hasTrikonaMitigation === true, 'Trikona Lord mitigation detected for Taurus Lagna');
assert(ssTaurus.isSaturnTrikonaLord === true, 'Saturn recognized as 9th Lord / Yogakaraka');
assert(ssTaurus.severity.includes('Trikona'), `Severity tempered by Trikona lordship: ${ssTaurus.severity}`);
assert(ssTaurus.isAgniLagna === false, 'Taurus is Earth lagna (not Agni)');

// Benchmark 1.2: Leo Lagna (Fire / Agni Tatwa - Heightened Friction)
const leoLagna = { key: 'ASC', signId: 5, signIndex: 4, longitude: 130.0 }; // Leo
const ssLeo = calculateSadeSati(ariesMoon, ariesSaturnTransit, null, leoLagna);
assert(ssLeo.isAgniLagna === true, 'Leo recognized as Agni Tatwa Lagna');
assert(ssLeo.elementalCommentary.includes('Agni Tatwa'), 'Agni Tatwa commentary generated');

// Benchmark 1.3: Dual Perspective (Moon vs Lagna Gochar)
assert(ssTaurus.houseFromMoon === 1, 'Saturn is 1st from Moon');
assert(ssTaurus.houseFromLagna === 12, 'Saturn is 12th from Lagna');
assert(ssTaurus.dualGocharNote.includes('House 1 from Natal Moon') && ssTaurus.dualGocharNote.includes('House 12 from Natal Lagna'), 'Dual Gochar perspective computed accurately');

// ---------------------------------------------------------------------------
// 2. Bhava Siddhi Kala Event Timing Tests (APA Notes, pp. 172-175)
// ---------------------------------------------------------------------------
console.log('\n--- 2. Bhava Siddhi Kala (Event Manifestation Timing) ---');

const natalPlanets = parsePlanetaryInput(ANURAG_SHARMA_PROFILE.rawInput);
const transitRes = calculateTransits(new Date());
const transitPlanets = transitRes.planets;

const allSiddhi = calculateAllBhavasSiddhi(natalPlanets, transitPlanets);
assert(allSiddhi.bhavas.length === 12, 'All 12 Bhavas evaluated for Bhava Siddhi');

// Verify structure of each bhava evaluation
for (let b of allSiddhi.bhavas) {
  assert(b.houseNum >= 1 && b.houseNum <= 12, `House ${b.houseNum} valid index`);
  assert(typeof b.bhavesha === 'string' && b.bhavesha.length > 0, `House ${b.houseNum} has Bhavesha`);
  assert(typeof b.lagnesha === 'string' && b.lagnesha.length > 0, `House ${b.houseNum} has Lagnesha`);
  assert(typeof b.karaka === 'string' && b.karaka.length > 0, `House ${b.houseNum} has Sthira Karaka`);
  assert(b.siddhiScore >= 0 && b.siddhiScore <= 100, `House ${b.houseNum} score in [0, 100]`);
}

// Verify House 3 (Sahaja Bhava has active conjunction or trine triggers)
const h3 = calculateBhavaSiddhi(natalPlanets, transitPlanets, 3);
assert(h3.houseNum === 3, 'House 3 correctly delineated');
assert(h3.bhavesha === 'Sun', 'House 3 lord for Gemini Lagna is Sun');
assert(h3.triggers.length > 0, 'House 3 has classical transit triggers');

// Verify Bhava Haani detection (Saturn in Pisces activating 8th or 12th lords from vulnerable houses)
const haaniCount = allSiddhi.haaniBhavas.length;
assert(haaniCount > 0, `Bhava Haani correctly detected for houses under Saturnine testing (${haaniCount} houses)`);

// Verify analyzeTransits integration
const transitAnalysis = analyzeTransits(natalPlanets, transitPlanets, null);
assert(transitAnalysis.bhavaSiddhi !== undefined, 'Bhava Siddhi integrated into analyzeTransits output');

console.log(`\n🎉 SUITE PASSED: ${assertions} assertions passed, 0 failures!`);

