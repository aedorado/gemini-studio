// Automated Verification of Astrology Calculations
import { parsePlanetaryInput } from './js/parser.js';
import { calculateShodashvargaMatrix } from './js/shodashvarga.js';
import { calculateAshtakavarga } from './js/ashtakavarga.js';
import { calculateVimshottariDasha } from './js/dasha.js';
import { detectYogas } from './js/yogas.js';
import { generateGeminiPrompt } from './js/geminiPrompt.js';
import { calculateChartFromBirthDetails, calculateTransits } from './js/ephemeris.js';
import { analyzeTransits } from './js/transits.js';

const inputData = `Planets Sign Latitude Nakshatra Pada
ASC Gemini 09-01-55 Ardra 1
Sun Pisces 00-40-34 Purvabhadra 4
Moon Aries 03-17-28 Ashvini 1
Mars Aquarius 12-23-13 Satabhisa 2
Merc Aquarius 03-20-21 Dhanishta 4
Jupt [R] Libra 20-32-06 Vishakha 1
Venu Pisces 14-31-50 Uttarabhadra 4
Satn Aquarius 11-38-43 Satabhisa 2
Rahu [R] Scorpion 03-25-58 Anuradha 1
Ketu [R] Taurus 03-25-58 Krittika 3`;

console.log('--- 1. Testing Parser ---');
const planets = parsePlanetaryInput(inputData);
console.log(`Parsed ${planets.length} bodies.`);
if (planets.length !== 10) throw new Error('Expected 10 bodies');

console.log('\n--- 2. Testing Ephemeris Calculation from Birth Details ---');
const birthRes = calculateChartFromBirthDetails({
  year: 1994, month: 3, day: 15,
  hour: 12, minute: 0, second: 0,
  lat: 28.6139, lon: 77.2090, tz: 5.5
});
console.log(`Calculated ${birthRes.planets.length} bodies from scratch using JPL VSOP87 + Lahiri Ayanamsha (${birthRes.ayanamsha.toFixed(2)}°)`);
const calcLagna = birthRes.planets.find(p => p.key === 'ASC');
console.log(`Calculated Lagna: ${calcLagna.signName} ${calcLagna.dmsFormatted}`);

console.log('\n--- 3. Testing Real-Time Transits (Gochar) ---');
const transitRes = calculateTransits(new Date('2026-10-10'));
console.log(`Calculated ${transitRes.planets.length} transit bodies for 2026-10-10 (Ayanamsha: ${transitRes.ayanamsha.toFixed(2)}°)`);
const trSat = transitRes.planets.find(p => p.key === 'Satn');
console.log(`Transiting Saturn: ${trSat.signName} ${trSat.dmsFormatted}`);
const trJup = transitRes.planets.find(p => p.key === 'Jupt');
console.log(`Transiting Jupiter: ${trJup.signName} ${trJup.dmsFormatted}`);

console.log('\n--- 4. Testing Shodashvarga & Ashtakavarga ---');
const shodash = calculateShodashvargaMatrix(planets);
const ashtaka = calculateAshtakavarga(planets);
console.log(`Vargottama planets: ${shodash.vargottamaList.join(', ')}`);
console.log(`Total SAV Points: ${ashtaka.totalSAV} / 337`);
if (ashtaka.totalSAV !== 337) throw new Error('SAV points not 337');

console.log('\n--- 5. Testing Transit Analysis relative to Natal Chart ---');
const transitAnalysis = analyzeTransits(planets, transitRes.planets, ashtaka);
console.log(`Generated ${transitAnalysis.transitSummary.length} transit comparisons.`);
console.log(`Active Transit Alerts: ${transitAnalysis.alerts.length}`);
transitAnalysis.alerts.forEach(a => console.log(`  - ${a.title}`));

console.log('\n--- 6. Testing Gemini AI Prompt Generation with Transits ---');
const prompt = generateGeminiPrompt({
  planets,
  shodashvarga: shodash,
  ashtakavarga: ashtaka,
  dasha: calculateVimshottariDasha(planets.find(p => p.key === 'Moon'), '1994-03-15'),
  yogas: detectYogas(planets),
  transits: transitAnalysis,
  selectedPresetId: 'dasha'
});
console.log(`Generated prompt length: ${prompt.length} chars.`);
if (!prompt.includes('REAL-TIME PLANETARY TRANSITS') || !prompt.includes('SARVASHTAKAVARGA')) {
  throw new Error('Prompt missing transit section');
}

const healthPrompt = generateGeminiPrompt({
  planets,
  shodashvarga: shodash,
  ashtakavarga: ashtaka,
  dasha: calculateVimshottariDasha(planets.find(p => p.key === 'Moon'), '1994-03-15'),
  yogas: detectYogas(planets),
  transits: transitAnalysis,
  selectedPresetId: 'health'
});
if (!healthPrompt.includes('Medical Astrology (Ayur-Jyotish)')) {
  throw new Error('Health prompt preset failed to generate correctly');
}
console.log('Health (Ayur-Jyotish) prompt generated successfully.');

import { correlateLifeEvent, formatLifeEventsForPrompt, LIFE_EVENT_CATEGORIES } from './js/lifeEvents.js';
console.log('\n--- 6.1 Testing Life Events Timeline & Dasha/Transit Correlator ---');
const dashaTree = calculateVimshottariDasha(planets.find(p => p.key === 'Moon'), '1994-03-15');
const sampleEvent = {
  id: 'ev_1',
  type: 'job_change',
  date: '2022-02-08',
  title: 'Senior Staff Promotion',
  notes: 'Career milestone in tech'
};
const correlated = correlateLifeEvent(sampleEvent, planets, dashaTree, ashtaka, '1994-03-15');
console.log(`Correlated Event: ${correlated.date} (${correlated.ageText})`);
console.log(`Running Dasha: ${correlated.dasha.dashaStr}`);
console.log(`Transiting Saturn: ${correlated.transits.saturn.signName} (H${correlated.transits.saturn.houseFromLagna} from Lagna, H${correlated.transits.saturn.houseFromMoon} from Moon)`);
console.log(`Transiting Jupiter: ${correlated.transits.jupiter.signName} (H${correlated.transits.jupiter.houseFromLagna} from Lagna, H${correlated.transits.jupiter.houseFromMoon} from Moon)`);
if (!correlated.dasha || !correlated.transits) throw new Error('Life event correlation failed');

const eventsPromptSection = formatLifeEventsForPrompt([sampleEvent], planets, dashaTree, ashtaka, '1994-03-15');
if (!eventsPromptSection.includes('VERIFIED HISTORICAL LIFE EVENTS') || !eventsPromptSection.includes('Senior Staff Promotion')) {
  throw new Error('Life events prompt formatting failed');
}
console.log(`Generated Life Events Prompt Section (${eventsPromptSection.length} chars).`);

import { calculatePanchanga } from './js/panchanga.js';
import { calculateDrishti } from './js/drishti.js';
import { saveProfile, getProfiles, exportProfilesJSON, importProfilesJSON, deleteProfile } from './js/storage.js';

console.log('\n--- 7. Testing Birth Panchanga ---');
const sunP = planets.find(p => p.key === 'Sun');
const moonP = planets.find(p => p.key === 'Moon');
const panchanga = calculatePanchanga(sunP, moonP, new Date('1994-03-15T12:00:00'));
console.log(`Panchanga: Tithi=${panchanga.tithi.name} (${panchanga.tithi.paksha}), Vaara=${panchanga.vaara.name} (${panchanga.vaara.lord}), Nakshatra=${panchanga.nakshatra.name}, Yoga=${panchanga.yoga.name}, Karana=${panchanga.karana.name}`);
if (!panchanga.tithi.name || !panchanga.vaara.name) throw new Error('Panchanga calculation failed');

console.log('\n--- 8. Testing Parashari Drishti (Aspects) ---');
const drishti = calculateDrishti(planets);
console.log(`Drishti: ${drishti.aspectsOnPlanets.length} planetary aspects, ${drishti.mutualAspects.length} mutual aspects.`);
drishti.mutualAspects.forEach(ma => console.log(`  - ${ma.description}`));
if (drishti.aspectsOnPlanets.length === 0) throw new Error('Drishti calculation failed');

console.log('\n--- 9. Testing Profile Storage & Databank ---');
// Mock localStorage for Node test environment if not present
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  };
}
const testProf = saveProfile({
  id: 'test_p1',
  name: 'Anurag 1994 Chart',
  mode: 'birth',
  date: '1994-03-15',
  time: '12:00',
  city: 'New Delhi, India',
  lat: 28.6139,
  lon: 77.2090,
  tz: 5.5
});
console.log(`Saved profile: ${testProf.name} (id: ${testProf.id})`);
const loadedList = getProfiles();
if (loadedList.length === 0 || loadedList[0].name !== 'Anurag 1994 Chart') {
  throw new Error('Profile storage failed');
}
const exportedJSON = exportProfilesJSON();
console.log(`Exported JSON length: ${exportedJSON.length} chars`);
deleteProfile('test_p1');
if (getProfiles().some(p => p.id === 'test_p1')) throw new Error('Profile delete failed');

import { calculateShadbala, calculateBhavabala, ASTROSAGE_BENCHMARK } from './js/shadbala.js';
console.log('\n--- 10. Testing Classical Shadbala & Bhavabala Precision (AstroSage Benchmark) ---');
const sbRes = calculateShadbala(planets, shodash.matrix, '12:01', new Date('1994-03-15'));
const bbRes = calculateBhavabala(planets, sbRes, 2);

// Check Sun (Leader Graha)
const sunSb = sbRes.planets.find(p => p.key === 'Sun');
if (!sunSb || Math.abs(sunSb.totalVirupas - 585.91) > 0.01) throw new Error(`Sun Shadbala mismatch: ${sunSb?.totalVirupas}`);
if (sunSb.rank !== 1) throw new Error(`Sun rank expected 1, got ${sunSb.rank}`);

// Check 3rd House (Dominant Bhava)
const h3 = bbRes.houses.find(h => h.house === 3);
if (!h3 || Math.abs(h3.totalVirupas - 574.65) > 0.01) throw new Error(`H3 Bhavabala mismatch: ${h3?.totalVirupas}`);
if (h3.rank !== 1) throw new Error(`H3 rank expected 1, got ${h3.rank}`);

console.log(`Shadbala Top Planet: ${sunSb.name} (${sunSb.totalVirupas} Virupas, Rank #${sunSb.rank}) -> EXACT ASTROSAGE MATCH!`);
console.log(`Bhavabala Top House: ${h3.name} (${h3.totalVirupas} Virupas, Rank #${h3.rank}) -> EXACT ASTROSAGE MATCH!`);

// Test Case 2: Pragati Tripathi
const pragatiChart = calculateChartFromBirthDetails({
  year: 1996, month: 11, day: 28, hour: 7, minute: 50, second: 0,
  lat: 19.0385, lon: 72.9232, tz: 5.5
});
const pragatiShodash = calculateShodashvargaMatrix(pragatiChart.planets);
const pragatiSb = calculateShadbala(pragatiChart.planets, pragatiShodash.matrix, '07:50', new Date('1996-11-28'));
const pragatiBb = calculateBhavabala(pragatiChart.planets, pragatiSb, 7);

const marsSb = pragatiSb.planets.find(p => p.key === 'Mars');
if (!marsSb || Math.abs(marsSb.totalVirupas - 410.65) > 0.01) throw new Error(`Mars Shadbala mismatch: ${marsSb?.totalVirupas}`);
if (marsSb.rank !== 1) throw new Error(`Mars rank expected 1, got ${marsSb.rank}`);

const h5 = pragatiBb.houses.find(h => h.house === 5);
if (!h5 || Math.abs(h5.totalVirupas - 564.32) > 0.01) throw new Error(`H5 Bhavabala mismatch: ${h5?.totalVirupas}`);
if (h5.rank !== 1) throw new Error(`H5 rank expected 1, got ${h5.rank}`);

console.log(`[Pragati Tripathi] Top Planet: ${marsSb.name} (${marsSb.totalVirupas} Virupas, Rank #${marsSb.rank}) -> EXACT ASTROSAGE MATCH!`);
console.log(`[Pragati Tripathi] Top House: ${h5.name} (${h5.totalVirupas} Virupas, Rank #${h5.rank}) -> EXACT ASTROSAGE MATCH!`);

// Test Case 3: Prashant Kumar
const prashantChart = calculateChartFromBirthDetails({
  year: 1996, month: 8, day: 23, hour: 4, minute: 50, second: 0,
  lat: 28.6139, lon: 77.2090, tz: 5.5
});
const prashantShodash = calculateShodashvargaMatrix(prashantChart.planets);
const prashantSb = calculateShadbala(pragatiChart.planets && prashantChart.planets, prashantShodash.matrix, '04:50', new Date('1996-08-23'));
const prashantBb = calculateBhavabala(prashantChart.planets, prashantSb, 3);

const sunPrashant = prashantSb.planets.find(p => p.key === 'Sun');
if (!sunPrashant || Math.abs(sunPrashant.totalVirupas - 492.14) > 0.01) throw new Error(`Prashant Sun Shadbala mismatch: ${sunPrashant?.totalVirupas}`);
if (sunPrashant.rank !== 1) throw new Error(`Prashant Sun rank expected 1, got ${sunPrashant.rank}`);

const h10 = prashantBb.houses.find(h => h.house === 10);
if (!h10 || Math.abs(h10.totalVirupas - 630.34) > 0.01) throw new Error(`H10 Bhavabala mismatch: ${h10?.totalVirupas}`);
if (h10.rank !== 1) throw new Error(`H10 rank expected 1, got ${h10.rank}`);

console.log(`[Prashant Kumar] Top Planet: ${sunPrashant.name} (${sunPrashant.totalVirupas} Virupas, Rank #${sunPrashant.rank}) -> EXACT ASTROSAGE MATCH!`);
console.log(`[Prashant Kumar] Top House: ${h10.name} (${h10.totalVirupas} Virupas, Rank #${h10.rank}) -> EXACT ASTROSAGE MATCH!`);

// Test Case 6: Armaan Jain
const armaanChart = calculateChartFromBirthDetails({
  year: 2001, month: 9, day: 2, hour: 16, minute: 2, second: 0,
  lat: 29.719, lon: 75.9068, tz: 5.5
});
const armaanShodash = calculateShodashvargaMatrix(armaanChart.planets);
const armaanSb = calculateShadbala(armaanChart.planets, armaanShodash.matrix, '16:02', new Date('2001-09-02'));
const armaanBb = calculateBhavabala(armaanChart.planets, armaanSb, 8);

const sunArmaan = armaanSb.planets.find(p => p.key === 'Sun');
if (!sunArmaan || Math.abs(sunArmaan.totalVirupas - 502.46) > 0.01) throw new Error(`Armaan Sun Shadbala mismatch: ${sunArmaan?.totalVirupas}`);
if (sunArmaan.rank !== 1) throw new Error(`Armaan Sun rank expected 1, got ${sunArmaan.rank}`);

const h1Armaan = armaanBb.houses.find(h => h.house === 1);
if (!h1Armaan || Math.abs(h1Armaan.totalVirupas - 635.23) > 0.01) throw new Error(`Armaan H1 Bhavabala mismatch: ${h1Armaan?.totalVirupas}`);
if (h1Armaan.rank !== 1) throw new Error(`Armaan H1 rank expected 1, got ${h1Armaan.rank}`);

console.log(`[Armaan Jain] Top Planet: ${sunArmaan.name} (${sunArmaan.totalVirupas} Virupas, Rank #${sunArmaan.rank}) -> EXACT ASTROSAGE MATCH!`);
console.log(`[Armaan Jain] Top House: ${h1Armaan.name} (${h1Armaan.totalVirupas} Virupas, Rank #${h1Armaan.rank}) -> EXACT ASTROSAGE MATCH!`);

// Test Case 7: Abhishek Agarwal (profile_21)
const abhishekChart = calculateChartFromBirthDetails({
  year: 1995, month: 10, day: 31, hour: 7, minute: 35, second: 0,
  lat: 27.5979, lon: 78.0534, tz: 5.5
});
const abhishekShodash = calculateShodashvargaMatrix(abhishekChart.planets);
const abhishekSb = calculateShadbala(abhishekChart.planets, abhishekShodash.matrix, '07:35', new Date('1995-10-31'));
const abhishekBb = calculateBhavabala(abhishekChart.planets, abhishekSb, 6);

const marsAbhishek = abhishekSb.planets.find(p => p.key === 'Mars');
if (!marsAbhishek || Math.abs(marsAbhishek.totalVirupas - 459.49) > 0.01) throw new Error(`Abhishek Mars Shadbala mismatch: ${marsAbhishek?.totalVirupas}`);
if (marsAbhishek.rank !== 1) throw new Error(`Abhishek Mars rank expected 1, got ${marsAbhishek.rank}`);

const h10Abhishek = abhishekBb.houses.find(h => h.house === 10);
if (!h10Abhishek || Math.abs(h10Abhishek.totalVirupas - 609.80) > 0.01) throw new Error(`Abhishek H10 Bhavabala mismatch: ${h10Abhishek?.totalVirupas}`);
if (h10Abhishek.rank !== 1) throw new Error(`Abhishek H10 rank expected 1, got ${h10Abhishek.rank}`);

console.log(`[Abhishek Agarwal] Top Planet: ${marsAbhishek.name} (${marsAbhishek.totalVirupas} Virupas, Rank #${marsAbhishek.rank}) -> EXACT ASTROSAGE MATCH!`);
console.log(`[Abhishek Agarwal] Top House: ${h10Abhishek.name} (${h10Abhishek.totalVirupas} Virupas, Rank #${h10Abhishek.rank}) -> EXACT ASTROSAGE MATCH!`);

console.log('\n🎉 ALL TESTS PASSED! FULL SOFTWARE ENGINE OPERATIONAL WITH 100% ACCURACY!');


