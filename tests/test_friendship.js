/**
 * Test Suite: Classical Parashari Planetary Friendship (Maitri Chakra)
 * Verifies:
 * 1. Permanent / Natural Friendship (Naisargika Maitri) 7x7 matrix (42 relations)
 * 2. Temporal Friendship (Tatkalika Maitri) 7x7 matrix (42 relations benchmarked against AstroSage)
 * 3. Five-Fold Compound Friendship (Panchadha Maitri) 7x7 matrix (42 relations benchmarked against AstroSage)
 * Total Assertions: 126
 */

import { parsePlanetaryInput } from '../js/parser.js';
import {
  CLASSICAL_PLANETS,
  PERMANENT_FRIENDSHIPS,
  calculateTemporalFriendship,
  calculateFiveFoldFriendship,
  calculateAllFriendshipTables
} from '../js/friendship.js';
import {
  SHALINI_SHARMA_PROFILE,
  SHALINI_FRIENDSHIP_BENCHMARK
} from './fixtures/shalini_sharma.js';

export function runMaitriChakraForProfile(profileName, planets, benchmarkData) {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error(`  ❌ FAILED [${profileName}]: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Permanent / Natural Friendship (42 assertions)
  for (const p1 of CLASSICAL_PLANETS) {
    for (const p2 of CLASSICAL_PLANETS) {
      if (p1 === p2) continue;
      const val = PERMANENT_FRIENDSHIPS[p1][p2];
      assert(
        ['Friend', 'Neutral', 'Enemy'].includes(val),
        `Permanent relation ${p1} -> ${p2} must be Friend/Neutral/Enemy, got ${val}`
      );
    }
  }

  // 2. Temporal Friendship against AstroSage Benchmark (42 assertions)
  const temporal = calculateTemporalFriendship(planets);
  for (const p1 of CLASSICAL_PLANETS) {
    for (const p2 of CLASSICAL_PLANETS) {
      if (p1 === p2) continue;
      const act = temporal[p1][p2];
      const exp = benchmarkData.temporal[p1][p2];
      assert(
        act === exp,
        `[Temporal - ${profileName}] ${p1} -> ${p2}: Expected ${exp}, got ${act}`
      );
    }
  }

  // 3. Five-Fold Compound Friendship against AstroSage Benchmark (42 assertions)
  const fiveFold = calculateFiveFoldFriendship(planets);
  for (const p1 of CLASSICAL_PLANETS) {
    for (const p2 of CLASSICAL_PLANETS) {
      if (p1 === p2) continue;
      const act = fiveFold[p1][p2];
      const exp = benchmarkData.fiveFold[p1][p2];
      assert(
        act === exp,
        `[Five-Fold - ${profileName}] ${p1} -> ${p2}: Expected ${exp}, got ${act}`
      );
    }
  }

  return { name: '8. Maitri Chakra (Friendship)', passed, failed };
}

export function runFriendshipTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE: PLANETARY FRIENDSHIP TABLES (MAITRI CHAKRA)');
  console.log('======================================================');
  const parsed = parsePlanetaryInput(SHALINI_SHARMA_PROFILE.rawInput);
  const res = runMaitriChakraForProfile('Shalini Sharma', parsed, SHALINI_FRIENDSHIP_BENCHMARK);
  console.log(`\n🎉 FRIENDSHIP SUITE PASSED: ${res.passed} assertions passed, ${res.failed} failures!`);
  return res;
}

// Allow standalone execution
if (process.argv[1].endsWith('test_friendship.js')) {
  runFriendshipTests();
}

