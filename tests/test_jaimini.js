/**
 * Test Suite 7: Jaimini Astrology (7 Chara Karakas & Special Arudha Padas)
 * Benchmarked for Profile 1: Anurag Sharma
 * Verifies:
 * 1. 7 Chara Karakas (AK, AmK, BK, MK, PK, GK, DK) sorted strictly descending by degree within sign.
 * 2. Arudha Lagna (AL) - Pada of House 1:
 *    - Gemini H1 lord is Mercury located in Aquarius (9 houses away).
 *    - Counting 9 houses from Aquarius lands in Libra (House 5).
 * 3. Upapada Lagna (UL) - Pada of House 12:
 *    - Taurus H12 lord is Venus located in Pisces (11 houses away).
 *    - Counting 11 houses from Pisces lands in Capricorn (House 8).
 * 4. Darapada (A7) - Pada of House 7:
 *    - Sagittarius H7 lord is Jupiter located in Libra (11 houses away).
 *    - Counting 11 houses from Libra lands in Leo (House 3).
 * 5. Regression Check: Verifies that AL, UL, and A7 do NOT falsely collapse into Pisces (House 10).
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { calculateCharaKarakas, calculateJaiminiPadas } from '../js/jaimini.js';
import {
  ANURAG_SHARMA_PROFILE,
  ANURAG_CHARA_KARAKAS_BENCHMARK,
  ANURAG_JAIMINI_PADAS_BENCHMARK
} from './fixtures/anurag_sharma.js';

export function runJaiminiTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 7: JAIMINI ASTROLOGY (KARAKAS & ARUDHA PADAS)');
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

  // 1. Test 7 Chara Karakas
  console.log('--- 7.1 Seven Chara Karakas (Descending Degrees) ---');
  const karakas = calculateCharaKarakas(parsed);
  assert(karakas.length === 7, `Must calculate 7 Chara Karakas, got ${karakas.length}`);

  for (let i = 0; i < 7; i++) {
    const act = karakas[i];
    const exp = ANURAG_CHARA_KARAKAS_BENCHMARK[i];

    assert(act.karakaKey === exp.karakaKey, `Karaka Key #${i + 1}: Expected ${exp.karakaKey}, got ${act.karakaKey}`);
    assert(act.planet === exp.planet, `Karaka ${exp.karakaKey} Planet: Expected ${exp.planet}, got ${act.planet}`);
    assert(act.signName === exp.signName, `Karaka ${exp.karakaKey} Sign: Expected ${exp.signName}, got ${act.signName}`);

    // Verify degree monotonicity
    if (i > 0) {
      const prev = karakas[i - 1];
      assert(prev.degInSign >= act.degInSign, `Degree monotonicity: ${prev.karakaKey} (${prev.degInSign}°) must be >= ${act.karakaKey} (${act.degInSign}°)`);
    }

    console.log(`  ✓ ${act.karakaKey.padEnd(4)} (${act.karakaName.padEnd(14)}): ${act.planet.padEnd(8)} in ${act.signName.padEnd(10)} at ${act.degInSignFormatted}`);
  }

  // 2. Test Arudha Padas (AL, UL, A7)
  console.log('\n--- 7.2 Jaimini Arudha Padas (AL, UL, A7) ---');
  const lagnaSignIndex = 2; // Gemini
  const padas = calculateJaiminiPadas(lagnaSignIndex, parsed);

  for (const [padaKey, exp] of Object.entries(ANURAG_JAIMINI_PADAS_BENCHMARK)) {
    const act = padas[padaKey];
    assert(!!act, `Pada ${padaKey} must be calculated`);
    assert(act.signName === exp.signName, `[${padaKey}] Sign: Expected ${exp.signName}, got ${act.signName}`);
    assert(act.houseNumber === exp.houseNumber, `[${padaKey}] House: Expected House ${exp.houseNumber}, got House ${act.houseNumber}`);
    assert(act.signIndex === exp.signIndex, `[${padaKey}] Sign Index: Expected ${exp.signIndex}, got ${act.signIndex}`);

    console.log(`  ✓ ${padaKey.padEnd(3)} (${act.label.padEnd(22)}): ${act.signName} (House ${act.houseNumber}) -> 100% MATCH`);
  }

  // 3. Regression test against false Pisces collapse
  console.log('\n--- 7.3 Regression Test: Distinct Non-Collapsing Arudha Padas ---');
  assert(padas.AL.signName !== 'Pisces', 'Arudha Lagna (AL) must not falsely collapse to Pisces');
  assert(padas.A7.signName !== 'Pisces', 'Darapada (A7) must not falsely collapse to Pisces');
  assert(padas.AL.houseNumber === 5, 'AL must be in House 5 (Libra) for Gemini Lagna with Mercury in Aquarius');
  assert(padas.UL.houseNumber === 8, 'UL must be in House 8 (Capricorn) for Taurus H12 with Venus in Pisces');
  assert(padas.A7.houseNumber === 3, 'A7 must be in House 3 (Leo) for Sagittarius H7 with Jupiter in Libra');

  console.log('  ✓ Verified Arudha Padas correctly distribute across distinct houses (H5 Libra, H8 Capricorn, H3 Leo).');

  console.log(`\n🎉 SUITE 7 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_jaimini.js')) {
  runJaiminiTests();
}
