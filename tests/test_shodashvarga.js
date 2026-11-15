/**
 * Test Suite 2: Shodashvarga (16 Divisional Charts)
 * Verifies all 16 classical Parashari vargas for Lagna and 9 planets:
 * D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60
 * Checks both divisional sign numbers (1-12) and divisional house (Bhava) numbers.
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { calculateShodashvargaMatrix } from '../js/shodashvarga.js';
import { ANURAG_SHARMA_PROFILE, ANURAG_SHODASHVARGA_BENCHMARK } from './fixtures/anurag_sharma.js';

const PLANET_ORDER = ['ASC', 'Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn', 'Rahu', 'Ketu'];

const VARGA_NAMES = {
  D1: 'D1 - Rashi (Birth Chart)',
  D2: 'D2 - Hora (Wealth & Prosperity)',
  D3: 'D3 - Drekkana (Siblings & Courage)',
  D4: 'D4 - Chaturthamsha (Fortune & Property)',
  D7: 'D7 - Saptamamsha (Children & Progeny)',
  D9: 'D9 - Navamsha (Dharma, Soul & Marriage)',
  D10: 'D10 - Dashamamsha (Profession & Career)',
  D12: 'D12 - Dwadashamamsha (Parents & Lineage)',
  D16: 'D16 - Shodashamsha (Vehicles & Happiness)',
  D20: 'D20 - Vimshamsha (Spiritual Progress)',
  D24: 'D24 - Chaturvimshamsha (Learning & Intellect)',
  D27: 'D27 - Saptavimshamsha (Strength & Weakness)',
  D30: 'D30 - Trimshamsha (Misfortune & Evils)',
  D40: 'D40 - Khavedamsha (Auspicious Effects)',
  D45: 'D45 - Akshavedamsha (Character & Integrity)',
  D60: 'D60 - Shashtiamsha (Past Karma Root)'
};

export function runShodashvargaTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 2: SHODASHVARGA (16 DIVISIONAL CHARTS)');
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
  const shodashResult = calculateShodashvargaMatrix(parsed);

  for (const [vKey, expectedSigns] of Object.entries(ANURAG_SHODASHVARGA_BENCHMARK)) {
    const vName = VARGA_NAMES[vKey] || vKey;
    const vargaLagnaSign = expectedSigns[0]; // Lagna sign in this varga

    const actualSigns = [];
    const actualBhavas = [];

    for (let i = 0; i < PLANET_ORDER.length; i++) {
      const pKey = PLANET_ORDER[i];
      const planetRow = shodashResult.matrix.find(p => p.key === pKey);
      assert(!!planetRow, `Planet ${pKey} must exist in Shodashvarga matrix`);

      const actSign = planetRow.vargas[vKey];
      const expSign = expectedSigns[i];

      assert(actSign === expSign, `[${vKey}] ${pKey} Sign: Expected ${expSign}, got ${actSign}`);

      // Calculate Bhava from Lagna in this varga
      const actBhava = ((actSign - vargaLagnaSign + 12) % 12) + 1;
      const expBhava = ((expSign - vargaLagnaSign + 12) % 12) + 1;
      assert(actBhava === expBhava, `[${vKey}] ${pKey} Bhava: Expected ${expBhava}, got ${actBhava}`);

      actualSigns.push(actSign);
      actualBhavas.push(actBhava);
    }

    console.log(`  ✓ ${vKey.padEnd(4)} (${vName.padEnd(35)}): Signs [${actualSigns.join(' ')}] | Bhavas [${actualBhavas.join(' ')}] -> 100% MATCH`);
  }

  // Check Vargottama detection (Moon in Aries in D1 and D9)
  assert(shodashResult.vargottamaList.includes('Moon'), 'Moon must be detected as Vargottama');
  console.log(`  ✓ Vargottama Planets: ${shodashResult.vargottamaList.join(', ')} -> MATCH`);

  console.log(`\n🎉 SUITE 2 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_shodashvarga.js')) {
  runShodashvargaTests();
}
