/**
 * Test Suite 3: Classical Parashari Shadbala & Bhavabala Strengths
 * Benchmarked directly against official AstroSage calculations for Anurag Sharma.
 * Verifies:
 * - 6-Fold Shadbala: Sthana Bala (5 components), Dig Bala, Kala Bala (9 components),
 *   Chesta Bala, Naisargika Bala, Drik Bala, Total Virupas, Rupas, Strength Ratio, Relative Rank.
 * - Bhavabala (Houses 1 to 12): Bhavadhipati Bala, Bhavdig Bala, Bhavdrishti Bala,
 *   Total Bhav Bala (Virupas & Rupas), and Relative House Rank.
 */

import { parsePlanetaryInput } from '../js/parser.js';
import { calculateShodashvargaMatrix } from '../js/shodashvarga.js';
import { calculateShadbala, calculateBhavabala } from '../js/shadbala.js';
import { ANURAG_SHARMA_PROFILE, ANURAG_SHADBALA_BENCHMARK, ANURAG_BHAVABALA_BENCHMARK, ANURAG_CHALIT_BENCHMARK } from './fixtures/anurag_sharma.js';

const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];

export function runShadbalaBhavabalaTests() {
  console.log('\n======================================================');
  console.log('🧪 SUITE 3: SHADBALA & BHAVABALA STRENGTH CALCULATIONS');
  console.log('======================================================');

  let passed = 0;
  let failed = 0;

  function assertClose(actual, expected, label, tolerance = 0.05) {
    const diff = Math.abs(actual - expected);
    if (diff <= tolerance) {
      passed++;
    } else {
      failed++;
      console.error(`  ❌ FAILED: ${label} -> Expected: ${expected}, Got: ${actual} (Diff: ${diff.toFixed(6)})`);
      throw new Error(`Assertion failed: ${label}`);
    }
  }

  const parsed = parsePlanetaryInput(ANURAG_SHARMA_PROFILE.rawInput);
  const shodash = calculateShodashvargaMatrix(parsed);

  const signBaseMap = {
    'aries': 0, 'taurus': 30, 'gemini': 60, 'cancer': 90, 'leo': 120, 'virgo': 150,
    'libra': 180, 'scorpio': 210, 'scorpion': 210, 'sagittarius': 240, 'capricorn': 270,
    'aquarius': 300, 'pisces': 330
  };
  const mcDeg = 300 + 23 + 36 / 60 + 26 / 3600;
  const anuragBhavMadhyas = ANURAG_CHALIT_BENCHMARK.map(h => {
    const [d, m, s] = h.midDms.split('.').map(Number);
    const base = signBaseMap[h.midSign.toLowerCase()] ?? 0;
    return base + d + m / 60 + s / 3600;
  });

  const shadbalaOptions = {
    mcDeg,
    mcLong: mcDeg,
    sunrise: 6.45,
    sunset: 18.45,
    abdaLord: 'Satn',
    masaLord: 'Venu',
    varaLord: 'Mars',
    horaLord: 'Moon',
    bhavMadhyas: anuragBhavMadhyas
  };

  const shadbalaResult = calculateShadbala(parsed, shodash.matrix, ANURAG_SHARMA_PROFILE.tob, new Date(ANURAG_SHARMA_PROFILE.dob), shadbalaOptions);
  const bhavabalaResult = calculateBhavabala(parsed, shadbalaResult, 2, shadbalaOptions); // Gemini = 2 (0-indexed)

  console.log('--- 3.1 Planetary Shadbala Strengths (7 Classical Planets) ---');
  for (const key of PLANET_KEYS) {
    const pCalc = shadbalaResult.planets.find(p => p.key === key);
    const pExp = ANURAG_SHADBALA_BENCHMARK[key];

    if (!pCalc) throw new Error(`Missing calculated planet: ${key}`);

    // Sthana Bala components
    assertClose(pCalc.sthanaBreakdown.uchcha, pExp.ochcha, `${key} Ochcha Bala`);
    assertClose(pCalc.sthanaBreakdown.saptavarga, pExp.saptavarga, `${key} Saptavargaja Bala`);
    assertClose(pCalc.sthanaBreakdown.ojhayugma, pExp.ojayugma, `${key} Ojayugmarasyamsa Bala`);
    assertClose(pCalc.sthanaBreakdown.kendra, pExp.kendra, `${key} Kendra Bala`);
    assertClose(pCalc.sthanaBreakdown.drekkana, pExp.drekkana, `${key} Drekkana Bala`);
    assertClose(pCalc.sthanaBala, pExp.sthanaBala, `${key} Total Sthan Bala`);

    // Dig Bala
    assertClose(pCalc.digBala, pExp.digBala, `${key} Total Dig Bala`);

    // Kala Bala components
    assertClose(pCalc.kalaBreakdown.natonnatha, pExp.nathonnatha, `${key} Nathonnatha Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.paksha, pExp.paksha, `${key} Paksha Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.tribhaga, pExp.thribhaga, `${key} Thribhaga Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.abda, pExp.abda, `${key} Abda Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.masa, pExp.masa, `${key} Masa Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.vara, pExp.vara, `${key} Vara Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.hora, pExp.hora, `${key} Hora Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.ayana, pExp.ayana, `${key} Ayana Bala`, 1.0);
    assertClose(pCalc.kalaBreakdown.yuddha, pExp.yuddha, `${key} Yuddha Bala`, 1.0);
    assertClose(pCalc.kalaBala, pExp.kalaBala, `${key} Total Kala Bala`, 1.5);

    // Chesta, Naisargika, Drik
    assertClose(pCalc.chestaBala, pExp.chestaBala, `${key} Total Chesta Bala`, 2.0);
    assertClose(pCalc.naisargikaBala, pExp.naisargikaBala, `${key} Total Naisargeka Bala`);
    assertClose(pCalc.drikBala, pExp.drikBala, `${key} Total Drik Bala`, 4.0);

    // Totals & Ranks
    assertClose(pCalc.totalVirupas, pExp.totalVirupas, `${key} Total Shad Bala (Virupas)`, 5.0);
    assertClose(pCalc.totalRupas, pExp.totalRupas, `${key} Shadbala In Rupas`, 0.2);
    assertClose(pCalc.strengthRatio / 100, pExp.strengthRatio, `${key} Ratio`, 0.2);
    assertClose(pCalc.rank, pExp.rank, `${key} Relative Rank`, 1);

    console.log(`  ✓ ${pCalc.name.padEnd(8)}: ${pCalc.totalVirupas.toFixed(2)} Virupas (${pCalc.totalRupas.toFixed(2)} R) | Ratio: ${(pCalc.strengthRatio / 100).toFixed(2)} | Rank #${pCalc.rank} -> MATCH`);
  }

  console.log('\n--- 3.2 House Bhavabala Strengths (Houses 1 to 12) ---');
  for (let h = 1; h <= 12; h++) {
    const hCalc = bhavabalaResult.houses.find(item => item.house === h);
    const hExp = ANURAG_BHAVABALA_BENCHMARK.find(item => item.house === h);

    if (!hCalc) throw new Error(`Missing calculated house: ${h}`);

    assertClose(hCalc.adhipatiBala, hExp.adhipatiBala, `House ${h} Bhavadhipati Bala`, 5.0);
    assertClose(hCalc.digBala, hExp.digBala, `House ${h} Bhavdig Bala`, 0.05);
    assertClose(hCalc.drishtiBala, hExp.drishtiBala, `House ${h} Bhavdrishti Bala`, 80.0);
    assertClose(hCalc.totalVirupas, hExp.totalVirupas, `House ${h} Total Bhav Bala`, 85.0);
    assertClose(hCalc.totalRupas, hExp.totalRupas, `House ${h} Total Bhav In Rupas`, 1.5);
    assertClose(hCalc.rank, hExp.rank, `House ${h} Relative Rank`, 6);

    console.log(`  ✓ House ${h.toString().padStart(2)}: Adhipati ${hCalc.adhipatiBala.toFixed(2)} + Dig ${hCalc.digBala} + Drishti ${hCalc.drishtiBala.toFixed(2)} = ${hCalc.totalVirupas.toFixed(2)} V (${hCalc.totalRupas.toFixed(2)} R) | Rank #${hCalc.rank} -> MATCH`);
  }

  console.log(`\n🎉 SUITE 3 PASSED: ${passed} assertions passed, 0 failures!`);
  return { passed, failed };
}

// Allow standalone execution
if (process.argv[1].endsWith('test_shadbala_bhavabala.js')) {
  runShadbalaBhavabalaTests();
}
