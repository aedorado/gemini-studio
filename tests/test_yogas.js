/**
 * Test Suite 9: Classical Vedic Yogas & Formations (D-A-R-E Engine & Raman 300)
 * Evaluates:
 * 1. [D] Dhana Yogas (Wealth & Assets): Lakshmi Yoga, Major Gains, Abundant Windfall
 * 2. [A] Arishta & Daridra Yogas: Kemadruma cancellations, Shakata, Daridra, Kaal Sarpa
 * 3. [R] Raja Yogas: Kendra-Trikona, Dharma-Karmadhipati, Pancha Mahapurusha, NBRY, Viparita
 * 4. [E] Exchanges (Parivartana): Maha Yoga, Kahala Yoga, Dainya Yoga
 * 5. [N] Nabhas & Special Formations: Ashraya, Sankhya, Solar, Lunar, Stelliums
 * 6. BV Raman 300 Catalog Integration
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { detectYogas, loadRaman300Database, matchRaman300Catalog } from '../js/yogas.js';
import { ANURAG_SHARMA_PROFILE } from './fixtures/anurag_sharma.js';
import { PRASHANT_KUMAR_PROFILE } from './fixtures/prashant_kumar.js';
import { SHANTAL_RAJ_PROFILE } from './fixtures/shantal_raj.js';
import { SHALINI_SHARMA_PROFILE } from './fixtures/shalini_sharma.js';

export async function runYogasTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 9: CLASSICAL YOGAS (D-A-R-E & RAMAN 300)');
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

  // 1. Anurag Sharma Yogas
  console.log('--- 9.1 Anurag Sharma Profile (D-A-R-E Verification) ---');
  const anuragPlanets = parsePlanetaryInput(ANURAG_SHARMA_PROFILE.rawInput);
  const anuragYogas = detectYogas(anuragPlanets, { gender: 'male' });

  assert(anuragYogas.length >= 12, `Expected at least 12 yogas for Anurag, got ${anuragYogas.length}`);

  // Test [E] Exchanges
  const mahaYoga = anuragYogas.find(y => y.dare === 'E' && y.subCategory === 'Maha Parivartana');
  assert(Boolean(mahaYoga), 'Anurag chart must possess Maha Parivartana Yoga (H5 ⇄ H7)');
  console.log(`  ✓ [E] Exchange: ${mahaYoga.name}`);

  // Test [R] Raja Yogas
  const malavya = anuragYogas.find(y => y.name.includes('Malavya'));
  assert(Boolean(malavya), 'Anurag chart must possess Malavya Mahapurusha Yoga (Venus in Pisces H10)');
  console.log(`  ✓ [R] Mahapurusha: ${malavya.name} (${malavya.strength})`);

  const ktRaja = anuragYogas.filter(y => y.dare === 'R' && y.subCategory === 'Kendra-Trikona Union');
  assert(ktRaja.length >= 3, `Expected at least 3 Kendra-Trikona Raja Yogas, got ${ktRaja.length}`);
  console.log(`  ✓ [R] Kendra-Trikona Raja Yogas: ${ktRaja.length} distinct formations identified`);

  // Test [D] Dhana Yogas
  const lakshmi = anuragYogas.find(y => y.name.includes('Lakshmi Yoga'));
  assert(Boolean(lakshmi), 'Anurag chart must possess Lakshmi Yoga');
  console.log(`  ✓ [D] Dhana Yoga: ${lakshmi.name}`);

  // Test [N] Nabhas & Special
  const gajakesari = anuragYogas.find(y => y.name.includes('Gajakesari'));
  assert(Boolean(gajakesari), 'Anurag chart must possess Gajakesari Yoga (Jupiter 7th from Moon)');
  console.log(`  ✓ [N] Lunar Yoga: ${gajakesari.name}`);

  const stellium = anuragYogas.find(y => y.subCategory === 'Multi-Planet Stellium');
  assert(Boolean(stellium) && stellium.houses.includes(9), 'Anurag chart must possess Stellium in House 9');
  console.log(`  ✓ [N] Stellium: ${stellium.name}`);

  // 2. Prashant Kumar (Dharma-Karma & NBRY & Viparita)
  console.log('--- 9.2 Prashant Kumar Profile (Dharma-Karma & NBRY & Viparita) ---');
  const prashantPlanets = parsePlanetaryInput(PRASHANT_KUMAR_PROFILE.rawInput);
  const prashantYogas = detectYogas(prashantPlanets, { gender: 'male' });

  const dharmaKarma = prashantYogas.find(y => y.subCategory === 'Dharma-Karmadhipati');
  assert(Boolean(dharmaKarma), 'Prashant chart must possess Dharma-Karmadhipati Supreme Raja Yoga');
  console.log(`  ✓ [R] Supreme Raja: ${dharmaKarma.name}`);

  const nbryMoon = prashantYogas.find(y => y.subCategory === 'Neecha Bhanga Raja Yoga' && y.planets.includes('Moon'));
  assert(Boolean(nbryMoon), 'Prashant chart must possess Neecha Bhanga Raja Yoga for Moon in Scorpio');
  console.log(`  ✓ [R] Neecha Bhanga: ${nbryMoon.name}`);

  const harsha = prashantYogas.find(y => y.name.includes('Harsha Yoga'));
  assert(Boolean(harsha), 'Prashant chart must possess Harsha Viparita Raja Yoga');
  console.log(`  ✓ [R] Viparita: ${harsha.name}`);

  // 3. Shantal Raj (Hamsa Mahapurusha & NBRY Mars)
  console.log('--- 9.3 Shantal Raj Profile (Hamsa Mahapurusha & Parivartana) ---');
  const shantalPlanets = parsePlanetaryInput(SHANTAL_RAJ_PROFILE.rawInput);
  const shantalYogas = detectYogas(shantalPlanets, { gender: 'female' });

  const hamsa = shantalYogas.find(y => y.name.includes('Hamsa'));
  assert(Boolean(hamsa), 'Shantal chart must possess Hamsa Mahapurusha Yoga (Jupiter in Cancer H10)');
  console.log(`  ✓ [R] Mahapurusha: ${hamsa.name}`);

  const nbryMars = shantalYogas.find(y => y.subCategory === 'Neecha Bhanga Raja Yoga' && y.planets.includes('Mars'));
  assert(Boolean(nbryMars), 'Shantal chart must possess Neecha Bhanga Raja Yoga for Mars in Cancer');
  console.log(`  ✓ [R] Neecha Bhanga: ${nbryMars.name}`);

  // 4. BV Raman 300 Integration
  console.log('--- 9.4 BV Raman 300 Yogas Catalog Integration ---');
  const db300 = await loadRaman300Database();
  assert(db300.length === 300, `Expected 300 yogas in Raman DB, got ${db300.length}`);
  const matched = matchRaman300Catalog(anuragYogas, db300);
  assert(matched.length === 300, `Catalog match output must have 300 items, got ${matched.length}`);
  const activeCount = matched.filter(m => m.isDetected).length;
  assert(activeCount >= 5, `Expected at least 5 Raman detected yogas, got ${activeCount}`);
  console.log(`  ✓ Verified Raman 300 dataset: ${activeCount} active detected in Anurag chart`);

  console.log(`\n🎉 SUITE 9 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}
