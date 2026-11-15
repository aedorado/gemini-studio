// Astrological Analytics & Databank Research Engine
import { SIGNS, PLANETS, NAKSHATRAS } from './constants.js';
import { calculateChartFromBirthDetails } from './ephemeris.js';
import { parsePlanetaryInput } from './parser.js';
import { getProfiles } from './storage.js';
import { calculateAshtakavarga } from './ashtakavarga.js';
import { calculateShadbala, MIN_SHADBALA_REQUIREMENTS } from './shadbala.js';
import { calculateShodashvargaMatrix } from './shodashvarga.js';

const CACHE_KEY = 'jyotish_analytics_cache_v4';

// Classical Parashari Exaltation & Debilitation Degrees
export const EXALTATION_DATA = {
  Sun:   { exaltSign: 0, deepDeg: 10, debilSign: 6, deepDebilDeg: 10 },  // Aries / Libra
  Moon:  { exaltSign: 1, deepDeg: 3,  debilSign: 7, deepDebilDeg: 3 },   // Taurus / Scorpio
  Mars:  { exaltSign: 9, deepDeg: 28, debilSign: 3, deepDebilDeg: 28 },  // Capricorn / Cancer
  Merc:  { exaltSign: 5, deepDeg: 15, debilSign: 11, deepDebilDeg: 15 }, // Virgo / Pisces
  Jupt:  { exaltSign: 3, deepDeg: 5,  debilSign: 9, deepDebilDeg: 5 },   // Cancer / Capricorn
  Venu:  { exaltSign: 11, deepDeg: 27, debilSign: 5, deepDebilDeg: 27 }, // Pisces / Virgo
  Satn:  { exaltSign: 6, deepDeg: 20, debilSign: 0, deepDebilDeg: 20 },  // Libra / Aries
  Rahu:  { exaltSign: 1, deepDeg: 15, debilSign: 7, deepDebilDeg: 15 },  // Taurus / Scorpio
  Ketu:  { exaltSign: 7, deepDeg: 15, debilSign: 1, deepDebilDeg: 15 }   // Scorpio / Taurus
};

// Own Signs (Swakshetra)
export const OWN_SIGNS = {
  Sun:  [4],       // Leo
  Moon: [3],       // Cancer
  Mars: [0, 7],    // Aries, Scorpio
  Merc: [2, 5],    // Gemini, Virgo
  Jupt: [8, 11],   // Sagittarius, Pisces
  Venu: [1, 6],    // Taurus, Libra
  Satn: [9, 10],   // Capricorn, Aquarius
  Rahu: [10],      // Aquarius (co-ruler)
  Ketu: [7]        // Scorpio (co-ruler)
};

// Moolatrikona Ranges: { sign, startDeg, endDeg }
export const MOOLATRIKONA_RANGES = {
  Sun:  { sign: 4, startDeg: 0,  endDeg: 20 },  // Leo 0-20°
  Moon: { sign: 1, startDeg: 3,  endDeg: 30 },  // Taurus 3-30°
  Mars: { sign: 0, startDeg: 0,  endDeg: 12 },  // Aries 0-12°
  Merc: { sign: 5, startDeg: 15, endDeg: 20 },  // Virgo 15-20°
  Jupt: { sign: 8, startDeg: 0,  endDeg: 10 },  // Sagittarius 0-10°
  Venu: { sign: 6, startDeg: 0,  endDeg: 15 },  // Libra 0-15°
  Satn: { sign: 10, startDeg: 0, endDeg: 20 }   // Aquarius 0-20°
};

// Natural Planetary Friendships (Naisargika Maitri)
export const NATURAL_FRIENDSHIPS = {
  Sun:  { Moon: 1, Mars: 1, Jupt: 1, Merc: 0, Venu: -1, Satn: -1, Rahu: -1, Ketu: -1 },
  Moon: { Sun: 1, Merc: 1, Mars: 0, Jupt: 0, Venu: 0, Satn: 0, Rahu: -1, Ketu: -1 },
  Mars: { Sun: 1, Moon: 1, Jupt: 1, Venu: 0, Satn: 0, Merc: -1, Rahu: -1, Ketu: 0 },
  Merc: { Sun: 1, Venu: 1, Mars: 0, Jupt: 0, Satn: 0, Moon: -1, Rahu: 0, Ketu: 0 },
  Jupt: { Sun: 1, Moon: 1, Mars: 1, Satn: 0, Merc: -1, Venu: -1, Rahu: 0, Ketu: 1 },
  Venu: { Merc: 1, Satn: 1, Mars: 0, Jupt: 0, Sun: -1, Moon: -1, Rahu: 1, Ketu: 0 },
  Satn: { Merc: 1, Venu: 1, Jupt: 0, Sun: -1, Moon: -1, Mars: -1, Rahu: 1, Ketu: -1 },
  Rahu: { Venu: 1, Satn: 1, Merc: 0, Jupt: 0, Sun: -1, Moon: -1, Mars: -1, Ketu: -1 },
  Ketu: { Mars: 1, Jupt: 1, Venu: 0, Satn: 0, Merc: 0, Sun: -1, Moon: -1, Rahu: -1 }
};

// Combustion Orbs (Degrees from Sun)
export const COMBUSTION_ORBS = {
  Moon: 12,
  Mars: 17,
  Merc: 14,
  Jupt: 11,
  Venu: 10,
  Satn: 15
};

export const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn', 'Rahu', 'Ketu'];
export const SHADBALA_PLANETS = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];

// Classical Yogas / Meanings for 2-Planet Conjunctions
export const CLASSICAL_CONJUNCTION_YOGAS = {
  'Merc_Sun': { name: 'Budhaditya Yoga', tag: '✨ Budhaditya', desc: 'Supreme intellect, analytical eloquence, administrative brilliance.' },
  'Jupt_Moon': { name: 'Gajakesari Yoga', tag: '👑 Gajakesari', desc: 'Royal stature, lasting virtue, scholarly wisdom, unshakeable renown.' },
  'Mars_Moon': { name: 'Chandra-Mangala Yoga', tag: '💰 Chandra-Mangala', desc: 'Commercial ingenuity, real estate prosperity, energetic enterprise.' },
  'Jupt_Rahu': { name: 'Guru-Chandal Yoga', tag: '⚠️ Guru-Chandal', desc: 'Unconventional philosophies, iconoclastic inquiry, boundary-breaking knowledge.' },
  'Rahu_Satn': { name: 'Shrapit Yoga', tag: '🌑 Shrapit', desc: 'Heavy karmic endurance, profound tenacity, transformative life hurdles.' },
  'Mars_Satn': { name: 'Kroora / Agni-Marut Yuti', tag: '⚔️ Agni-Marut', desc: 'Dynamic friction between fire & discipline, surgical precision, immense grit.' },
  'Merc_Venu': { name: 'Lakshmi-Narayan Yoga', tag: '💎 Lakshmi-Narayan', desc: 'Artistic perfection, aesthetic diplomacy, charming communication, luxury.' },
  'Satn_Sun': { name: 'Surya-Shani Yuti', tag: '⚖️ Surya-Shani', desc: 'Father-son tension, philosophical maturity, unyielding discipline.' },
  'Mars_Venu': { name: 'Bhrigu-Mangala Yoga', tag: '🔥 Bhrigu-Mangala', desc: 'High creative passion, magnetism, aesthetic drive, marital dynamism.' },
  'Jupt_Mars': { name: 'Guru-Mangala Yoga', tag: '🛡️ Guru-Mangala', desc: 'Righteous courage, executive authority, commanding moral leadership.' },
  'Mars_Sun': { name: 'Tejaswi / Veerya Yoga', tag: '☀️ Tejaswi', desc: 'Intense vital aura, warrior ethos, commanding decisiveness.' },
  'Moon_Venu': { name: 'Bhrigu-Chandra Yoga', tag: '🌺 Bhrigu-Chandra', desc: 'Gentle grace, social charm, artistic sensibility, vehicular gains.' },
  'Jupt_Sun': { name: 'Shiva-Guru Yoga', tag: '🔱 Shiva-Guru', desc: 'Spiritual dignity, moral authority, noble paternal lineage.' },
  'Jupt_Merc': { name: 'Saraswati Yoga Influence', tag: '📖 Saraswati', desc: 'Scholarly dexterity, multilingual mastery, advisory wisdom.' },
  'Jupt_Satn': { name: 'Brahma Yoga Influence', tag: '🏛️ Brahma-Shani', desc: 'Deep philosophical patience, institutional architect, enduring achievements.' },
  'Jupt_Venu': { name: 'Dvimukhi Acharya Yoga', tag: '✨ Dvimukhi Acharya', desc: 'Combined knowledge of spiritual (Brihaspati) and material (Shukra) realms.' },
  'Mars_Rahu': { name: 'Angaraka Yoga', tag: '⚡ Angaraka', desc: 'Fierce competitive fire, technological mastery, bold breakthrough instinct.' },
  'Rahu_Sun': { name: 'Surya Grahan Yuti', tag: '🌘 Surya Grahan', desc: 'Karmic ego metamorphosis, obsession with sovereignty and high recognition.' },
  'Moon_Rahu': { name: 'Chandra Grahan Yuti', tag: '🌊 Chandra Grahan', desc: 'Hyper-intuitive sensitivity, intense emotional depths, psychological insight.' },
  'Ketu_Sun': { name: 'Surya-Ketu Moksha Yuti', tag: '🧘 Surya-Ketu', desc: 'Renunciation of superficial vanity, spiritual detachment, deep self-realization.' },
  'Ketu_Moon': { name: 'Chandra-Ketu Yuti', tag: '👁️ Chandra-Ketu', desc: 'Psychic perception, solitude, meditative detachment, clairvoyance.' },
  'Jupt_Ketu': { name: 'Ganesha / Kula-Deepaka Yoga', tag: '📿 Kula-Deepaka', desc: 'Spiritual light of the family, philosophical liberation (Moksha).' },
  'Satn_Venu': { name: 'Bhargava-Shani Yuti', tag: '🎨 Bhargava-Shani', desc: 'Structured artistic mastery, enduring relationships, architectural balance.' },
  'Merc_Satn': { name: 'Budha-Shani Yuti', tag: '📐 Budha-Shani', desc: 'Methodical scientific reasoning, rigorous calculation, pragmatic problem-solving.' },
  'Moon_Satn': { name: 'Punarphoo / Visha Yoga', tag: '🏔️ Visha Yuti', desc: 'Emotional solemnity, profound resilience through delays, philosophical peace.' }
};

/**
 * Determine Classical Dignity for a Planet
 */
export function calculatePlanetDignity(pKey, signIndex, degInSign, sunPlacement, isRetro) {
  if (pKey === 'ASC') return 'Neutral';

  // 1. Combustion check (if close to Sun)
  if (sunPlacement && COMBUSTION_ORBS[pKey] !== undefined) {
    const sunTotal = sunPlacement.signIndex * 30 + sunPlacement.degInSign;
    const planetTotal = signIndex * 30 + degInSign;
    let dist = Math.abs(sunTotal - planetTotal);
    if (dist > 180) dist = 360 - dist;

    let orb = COMBUSTION_ORBS[pKey];
    if (isRetro && (pKey === 'Merc' || pKey === 'Venu')) {
      orb -= 2;
    }
    if (dist <= orb) {
      return 'Combust';
    }
  }

  const exaltInfo = EXALTATION_DATA[pKey];
  if (exaltInfo) {
    // 2. Exaltation & Deep Exaltation
    if (signIndex === exaltInfo.exaltSign) {
      if (Math.abs(degInSign - exaltInfo.deepDeg) <= 1.0) return 'Deep Exalt';
      return 'Exalted';
    }
    // 3. Debilitation & Deep Debilitation
    if (signIndex === exaltInfo.debilSign) {
      if (Math.abs(degInSign - exaltInfo.deepDebilDeg) <= 1.0) return 'Deep Debi';
      return 'Debilitated';
    }
  }

  // 4. Moolatrikona
  const mtInfo = MOOLATRIKONA_RANGES[pKey];
  if (mtInfo && signIndex === mtInfo.sign && degInSign >= mtInfo.startDeg && degInSign <= mtInfo.endDeg) {
    return 'Moola';
  }

  // 5. Own Sign (Swakshetra)
  const ownList = OWN_SIGNS[pKey];
  if (ownList && ownList.includes(signIndex)) {
    return 'Own';
  }

  // 6. Sign Lord Relationship
  const signLordName = SIGNS[signIndex]?.lord;
  const lordKeyMap = {
    Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Merc', Jupiter: 'Jupt', Venus: 'Venu', Saturn: 'Satn'
  };
  const lordKey = lordKeyMap[signLordName];
  if (lordKey && NATURAL_FRIENDSHIPS[pKey]) {
    const naturalRel = NATURAL_FRIENDSHIPS[pKey][lordKey] || 0;
    if (naturalRel === 1) return 'Friendly';
    if (naturalRel === -1) return 'Enemy';
    return 'Neutral';
  }

  return 'Neutral';
}

/**
 * Computes natal placements, Ashtakavarga, Shadbala, and House Lords for a single profile
 */
export function computeProfileNatal(profile) {
  try {
    let planets = [];
    if (profile.mode === 'birth' && profile.birthDate) {
      const [year, month, day] = profile.birthDate.split('-').map(Number);
      const timeParts = (profile.birthTime || '12:00:00').split(':').map(Number);
      const hour = timeParts[0] || 0;
      const minute = timeParts[1] || 0;
      const second = timeParts[2] || 0;
      const lat = parseFloat(profile.lat) || 28.6139;
      const lon = parseFloat(profile.lon) || 77.2090;
      const tz = parseFloat(profile.tz) !== undefined ? parseFloat(profile.tz) : 5.5;

      const res = calculateChartFromBirthDetails({
        year, month, day, hour, minute, second, lat, lon, tz
      });
      planets = res.planets;
    } else if (profile.rawInput) {
      planets = parsePlanetaryInput(profile.rawInput);
    }

    if (!planets || planets.length === 0) return null;

    const asc = planets.find(p => p.key === 'ASC') || planets[0];
    const ascSignIndex = asc.signIndex;

    const sunPlanet = planets.find(p => p.key === 'Sun');
    const sunPlacement = sunPlanet ? { signIndex: sunPlanet.signIndex, degInSign: sunPlanet.degInSign } : null;

    // Ashtakavarga & Shadbala
    const savRes = calculateAshtakavarga(planets);
    const shodash = calculateShodashvargaMatrix(planets);
    const birthDateObj = profile.birthDate ? new Date(profile.birthDate) : new Date();
    const sbRes = calculateShadbala(planets, shodash.matrix, profile.birthTime || '12:00', birthDateObj);

    const processedPlanets = {};
    const houseOccupants = Array.from({ length: 12 }, () => []);
    const rashiOccupants = Array.from({ length: 12 }, () => []);
    const nakshatraOccupants = Array.from({ length: 27 }, () => []);
    const vargottamaPlanets = [];

    PLANET_KEYS.forEach(k => {
      const p = planets.find(item => item.key === k);
      if (!p) return;

      const house = (p.signIndex - ascSignIndex + 12) % 12 + 1;
      const dignity = calculatePlanetDignity(k, p.signIndex, p.degInSign, sunPlacement, p.isRetro);
      const totalDeg = p.absLongitude !== undefined ? p.absLongitude : (p.signIndex * 30 + p.degInSign);

      const nakIndex = Math.min(26, Math.max(0, Math.floor(totalDeg / (360 / 27))));
      const nakPada = Math.min(4, Math.max(1, Math.floor((totalDeg % (360 / 27)) / (360 / 108)) + 1));
      const nakObj = NAKSHATRAS[nakIndex];

      // Vargottama check (D1 sign equals D9 sign)
      const vRec = shodash.matrix ? shodash.matrix.find(r => r.key === k) : null;
      const isVargottama = !!(vRec && vRec.isVargottama);
      if (isVargottama) {
        vargottamaPlanets.push(k);
      }

      // Shadbala values
      const sbPlanet = sbRes.planets ? sbRes.planets.find(pl => pl.key === k) : null;
      const shadbalaVirupas = sbPlanet ? sbPlanet.totalVirupas : null;
      const shadbalaRank = sbPlanet ? sbPlanet.rank : null;
      const shadbalaRupas = sbPlanet ? sbPlanet.totalRupas : null;

      const pData = {
        key: k,
        name: p.name,
        signIndex: p.signIndex,
        signName: p.signName,
        degInSign: p.degInSign,
        totalDeg,
        house,
        isRetro: !!p.isRetro,
        dignity,
        nakshatraIndex: nakIndex,
        nakshatraName: nakObj ? nakObj.name : 'Unknown',
        nakshatraLord: nakObj ? nakObj.lord : 'Unknown',
        pada: nakPada,
        isVargottama,
        shadbalaVirupas,
        shadbalaRank,
        shadbalaRupas
      };

      processedPlanets[k] = pData;
      houseOccupants[house - 1].push(k);
      rashiOccupants[p.signIndex].push(k);
      nakshatraOccupants[nakIndex].push(k);
    });

    // Check ASC Vargottama
    const ascVRec = shodash.matrix ? shodash.matrix.find(r => r.key === 'ASC') : null;
    const isAscVargottama = !!(ascVRec && ascVRec.isVargottama);
    if (isAscVargottama) {
      vargottamaPlanets.push('ASC');
    }

    // 12 House Lords (Bhaveshas 1–12) Placements
    const lordKeyMap = {
      Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Merc', Jupiter: 'Jupt', Venus: 'Venu', Saturn: 'Satn'
    };
    const houseLords = [];
    for (let h = 0; h < 12; h++) {
      const houseNum = h + 1;
      const rashiIndex = (ascSignIndex + h) % 12;
      const lordName = SIGNS[rashiIndex].lord;
      const lordKey = lordKeyMap[lordName];
      const lordPlanet = planets.find(p => p.key === lordKey);
      if (lordPlanet) {
        const lordHouse = (lordPlanet.signIndex - ascSignIndex + 12) % 12 + 1;
        houseLords.push({
          houseNum,
          bhavaSignIndex: rashiIndex,
          bhavaSignName: SIGNS[rashiIndex].name,
          lordKey,
          lordName: lordPlanet.name,
          targetHouse: lordHouse,
          targetSignIndex: lordPlanet.signIndex,
          targetSignName: lordPlanet.signName,
          deg: lordPlanet.degInSign,
          isRetro: !!lordPlanet.isRetro,
          dignity: calculatePlanetDignity(lordKey, lordPlanet.signIndex, lordPlanet.degInSign, sunPlacement, lordPlanet.isRetro)
        });
      }
    }

    const moon = planets.find(p => p.key === 'Moon');
    const moonTotalDeg = moon ? (moon.absLongitude !== undefined ? moon.absLongitude : (moon.signIndex * 30 + moon.degInSign)) : 0;
    const moonNakIndex = moon ? Math.min(26, Math.max(0, Math.floor(moonTotalDeg / (360 / 27)))) : null;
    const yob = profile.birthDate ? parseInt(profile.birthDate.split('-')[0], 10) : null;

    // Ashtakavarga house points array (H1 to H12)
    const savByHouse = savRes.savByHouse ? savRes.savByHouse.map(h => h.points) : new Array(12).fill(28);

    return {
      id: profile.id,
      name: profile.name,
      gender: profile.gender || 'male',
      yob,
      birthDate: profile.birthDate || '',
      city: profile.city || '',
      ascSignIndex,
      ascSignName: asc.signName,
      moonSignIndex: moon ? moon.signIndex : null,
      moonSignName: moon ? moon.signName : 'Unknown',
      moonNakshatraIndex: moonNakIndex,
      moonNakshatra: moonNakIndex !== null && NAKSHATRAS[moonNakIndex] ? NAKSHATRAS[moonNakIndex].name : (moon ? moon.nakshatra : 'Unknown'),
      planets: processedPlanets,
      houseOccupants,     // Array of 12 houses with planet keys
      rashiOccupants,     // Array of 12 signs with planet keys
      nakshatraOccupants, // Array of 27 nakshatras with planet keys
      houseLords,         // 12 House Lords (Bhaveshas) placements
      savByHouse,         // 12 integers for H1..H12
      vargottamaPlanets,  // Keys of planets that are Vargottama
      shadbalaSummary: sbRes.planets || []
    };
  } catch (err) {
    console.error(`Failed to compute profile ${profile.id}:`, err);
    return null;
  }
}

/**
 * Computes full aggregated dataset across all databank profiles
 */
export function generateAnalyticsData(profiles) {
  const startTime = performance.now();
  const validCharts = [];

  for (const prof of profiles) {
    const computed = computeProfileNatal(prof);
    if (computed) validCharts.push(computed);
  }

  const totalCharts = validCharts.length;

  // 1. Demographics & Distributions
  const yobDist = {};
  const decadeDist = {
    '<1970': { count: 0, profileIds: [] },
    '1970-1979': { count: 0, profileIds: [] },
    '1980-1989': { count: 0, profileIds: [] },
    '1990-1999': { count: 0, profileIds: [] },
    '2000-2009': { count: 0, profileIds: [] },
    '2010+': { count: 0, profileIds: [] }
  };
  const ascDist = Array.from({ length: 12 }, (_, i) => ({ signIndex: i, name: SIGNS[i].name, symbol: SIGNS[i].symbol, count: 0, profileIds: [] }));
  const moonDist = Array.from({ length: 12 }, (_, i) => ({ signIndex: i, name: SIGNS[i].name, symbol: SIGNS[i].symbol, count: 0, profileIds: [] }));
  
  // 27 Nakshatras distribution
  const nakshatraDist = Array.from({ length: 27 }, (_, i) => ({
    nakIndex: i,
    name: NAKSHATRAS[i].name,
    lord: NAKSHATRAS[i].lord,
    deity: NAKSHATRAS[i].deity,
    moonCount: 0,
    totalPlanetsCount: 0,
    profileIds: []
  }));

  const retroPerChart = { '0 Retro': 0, '1 Retro': 0, '2 Retro': 0, '3 Retro': 0, '4+ Retro': 0 };
  const retroPlanets = {
    Mars: { count: 0, profileIds: [] },
    Merc: { count: 0, profileIds: [] },
    Jupt: { count: 0, profileIds: [] },
    Venu: { count: 0, profileIds: [] },
    Satn: { count: 0, profileIds: [] }
  };
  let maleCount = 0;
  let femaleCount = 0;

  // Chart lookup map for instant drilldown inspection
  const chartMap = {};

  // 2. Matrices:
  // - Planet × House
  // - Planet × Rashi
  // - Planet × Nakshatra
  // - House × Rashi (12 Houses × 12 Rashis: Planetary Density)
  // - House Lords in Houses (Bhavesha in Bhava: 12 Lords × 12 Houses)
  // - House Lords in Rashis (Bhavesha in Rashi: 12 Lords × 12 Rashis)
  const planetHouseMatrix = {};
  const planetRashiMatrix = {};
  const planetNakshatraMatrix = {};

  PLANET_KEYS.forEach(k => {
    planetHouseMatrix[k] = Array.from({ length: 12 }, () => []);
    planetRashiMatrix[k] = Array.from({ length: 12 }, () => []);
    planetNakshatraMatrix[k] = Array.from({ length: 27 }, () => []);
  });

  const houseRashiMatrix = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => []));
  const lordHouseMatrix = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => []));
  const lordRashiMatrix = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => []));

  // 3. Dignities Frequency
  const DIGNITY_TYPES = ['Deep Exalt', 'Exalted', 'Own', 'Moola', 'Friendly', 'Neutral', 'Enemy', 'Debilitated', 'Deep Debi', 'Combust'];
  const dignityCounts = {};
  PLANET_KEYS.forEach(k => {
    dignityCounts[k] = {};
    DIGNITY_TYPES.forEach(d => { dignityCounts[k][d] = { count: 0, profileIds: [] }; });
  });

  // 4. Exhaustive 2-Planet Conjunctions (Yutis) - all 36 pairs
  const conjunctionPairs = {};
  for (let i = 0; i < PLANET_KEYS.length; i++) {
    for (let j = i + 1; j < PLANET_KEYS.length; j++) {
      const p1 = PLANET_KEYS[i];
      const p2 = PLANET_KEYS[j];
      const pairKey = [p1, p2].sort().join('_');
      const classical = CLASSICAL_CONJUNCTION_YOGAS[pairKey] || null;

      conjunctionPairs[pairKey] = {
        p1,
        p2,
        pairKey,
        sameHouseCount: 0,
        sameRashiCount: 0,
        tightCount: 0,        // <= 5° orb
        grahaYuddhaCount: 0,  // <= 1° orb between Mars, Merc, Jupt, Venu, Satn
        profileIds: [],       // Same house
        tightProfileIds: [],  // Tight <= 5°
        yuddhaProfileIds: [], // Graha yuddha
        yogaName: classical ? classical.name : '',
        yogaTag: classical ? classical.tag : '',
        yogaDesc: classical ? classical.desc : ''
      };
    }
  }

  // 5. Stelliums (3+ Planets in One House)
  const stelliums = {
    '3 Planets': [],
    '4 Planets': [],
    '5+ Planets': [],
    'all': []
  };

  // 6. Ashtakavarga Aggregates (H1 to H12)
  const savHouseTotals = new Array(12).fill(0);
  const savHouseExtremes = Array.from({ length: 12 }, () => ({
    maxPts: -1,
    maxProfile: null,
    minPts: 999,
    minProfile: null,
    distribution: []
  }));

  // 7. Shadbala Aggregates (7 Grahas)
  const shadbalaStats = {};
  SHADBALA_PLANETS.forEach(k => {
    const reqObj = MIN_SHADBALA_REQUIREMENTS[k] || { rupas: 5.0, virupas: 300 };
    shadbalaStats[k] = {
      key: k,
      totalVirupas: 0,
      minVirupas: 9999,
      maxVirupas: 0,
      required: reqObj.virupas,
      requiredRupas: reqObj.rupas,
      meetingRequirementCount: 0,
      rank1Count: 0,
      rank7Count: 0,
      profiles: []
    };
  });

  // 8. Vargottama Counts
  const vargottamaStats = {
    ASC: { count: 0, profileIds: [] }
  };
  PLANET_KEYS.forEach(k => {
    vargottamaStats[k] = { count: 0, profileIds: [] };
  });

  const TARA_GRAHAS = ['Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];

  // Populate data across all valid native charts
  validCharts.forEach(c => {
    chartMap[c.id] = c;

    // Gender
    if (c.gender === 'female') femaleCount++; else maleCount++;

    // YOB & Decades
    if (c.yob) {
      yobDist[c.yob] = (yobDist[c.yob] || 0) + 1;
      let decKey = '2010+';
      if (c.yob < 1970) decKey = '<1970';
      else if (c.yob < 1980) decKey = '1970-1979';
      else if (c.yob < 1990) decKey = '1980-1989';
      else if (c.yob < 2000) decKey = '1990-1999';
      else if (c.yob < 2010) decKey = '2000-2009';

      decadeDist[decKey].count++;
      decadeDist[decKey].profileIds.push(c.id);
    }

    // Ascendant & Moon
    ascDist[c.ascSignIndex].count++;
    ascDist[c.ascSignIndex].profileIds.push(c.id);

    if (c.moonSignIndex !== null) {
      moonDist[c.moonSignIndex].count++;
      moonDist[c.moonSignIndex].profileIds.push(c.id);
    }
    if (c.moonNakshatraIndex !== null && nakshatraDist[c.moonNakshatraIndex]) {
      nakshatraDist[c.moonNakshatraIndex].moonCount++;
      if (!nakshatraDist[c.moonNakshatraIndex].profileIds.includes(c.id)) {
        nakshatraDist[c.moonNakshatraIndex].profileIds.push(c.id);
      }
    }

    // Retrogrades (classical 5 observable planets)
    let chartRetroCount = 0;
    ['Mars', 'Merc', 'Jupt', 'Venu', 'Satn'].forEach(k => {
      if (c.planets[k] && c.planets[k].isRetro) {
        chartRetroCount++;
        retroPlanets[k].count++;
        retroPlanets[k].profileIds.push(c.id);
      }
    });
    if (chartRetroCount === 0) retroPerChart['0 Retro']++;
    else if (chartRetroCount === 1) retroPerChart['1 Retro']++;
    else if (chartRetroCount === 2) retroPerChart['2 Retro']++;
    else if (chartRetroCount === 3) retroPerChart['3 Retro']++;
    else retroPerChart['4+ Retro']++;

    // Vargottama planets tracking
    if (c.vargottamaPlanets) {
      c.vargottamaPlanets.forEach(k => {
        if (vargottamaStats[k]) {
          vargottamaStats[k].count++;
          vargottamaStats[k].profileIds.push(c.id);
        }
      });
    }

    // Ashtakavarga house accumulation
    if (c.savByHouse && c.savByHouse.length === 12) {
      c.savByHouse.forEach((pts, hIdx) => {
        savHouseTotals[hIdx] += pts;
        savHouseExtremes[hIdx].distribution.push({ id: c.id, name: c.name, points: pts });

        if (pts > savHouseExtremes[hIdx].maxPts) {
          savHouseExtremes[hIdx].maxPts = pts;
          savHouseExtremes[hIdx].maxProfile = { id: c.id, name: c.name, points: pts };
        }
        if (pts < savHouseExtremes[hIdx].minPts) {
          savHouseExtremes[hIdx].minPts = pts;
          savHouseExtremes[hIdx].minProfile = { id: c.id, name: c.name, points: pts };
        }
      });
    }

    // Shadbala accumulation
    SHADBALA_PLANETS.forEach(k => {
      const pl = c.planets[k];
      if (pl && pl.shadbalaVirupas !== null) {
        const virupas = pl.shadbalaVirupas;
        const rank = pl.shadbalaRank;
        const rupas = pl.shadbalaRupas;
        const stat = shadbalaStats[k];

        stat.totalVirupas += virupas;
        if (virupas < stat.minVirupas) stat.minVirupas = virupas;
        if (virupas > stat.maxVirupas) stat.maxVirupas = virupas;
        if (virupas >= stat.required) stat.meetingRequirementCount++;
        if (rank === 1) stat.rank1Count++;
        if (rank === 7) stat.rank7Count++;

        stat.profiles.push({
          id: c.id,
          name: c.name,
          gender: c.gender,
          virupas,
          rank,
          rupas
        });
      }
    });

    // Populate Matrices, Dignities, and Nakshatras
    PLANET_KEYS.forEach(k => {
      const p = c.planets[k];
      if (!p) return;

      // Planet × House
      planetHouseMatrix[k][p.house - 1].push({
        id: c.id,
        name: c.name,
        gender: c.gender,
        sign: p.signName,
        deg: p.degInSign,
        isRetro: p.isRetro,
        dignity: p.dignity,
        nakshatra: p.nakshatraName
      });

      // Planet × Rashi
      planetRashiMatrix[k][p.signIndex].push({
        id: c.id,
        name: c.name,
        gender: c.gender,
        house: p.house,
        deg: p.degInSign,
        isRetro: p.isRetro,
        dignity: p.dignity,
        nakshatra: p.nakshatraName
      });

      // House × Rashi (Planetary Density coordinate)
      houseRashiMatrix[p.house - 1][p.signIndex].push({
        id: c.id,
        name: c.name,
        gender: c.gender,
        planetKey: k,
        planetName: p.name,
        deg: p.degInSign,
        isRetro: p.isRetro,
        dignity: p.dignity
      });

      // Planet × Nakshatra
      if (p.nakshatraIndex !== undefined && planetNakshatraMatrix[k][p.nakshatraIndex]) {
        planetNakshatraMatrix[k][p.nakshatraIndex].push({
          id: c.id,
          name: c.name,
          gender: c.gender,
          house: p.house,
          sign: p.signName,
          deg: p.degInSign,
          pada: p.pada,
          isRetro: p.isRetro,
          dignity: p.dignity
        });
        nakshatraDist[p.nakshatraIndex].totalPlanetsCount++;
      }

      // Dignities
      if (dignityCounts[k][p.dignity]) {
        dignityCounts[k][p.dignity].count++;
        dignityCounts[k][p.dignity].profileIds.push(c.id);
      }
    });

    // House Lords (Bhaveshas 1–12) Placement Accumulation
    if (c.houseLords) {
      c.houseLords.forEach(hl => {
        const hIdx = hl.houseNum - 1; // 0 to 11
        const targetHouseIdx = hl.targetHouse - 1; // 0 to 11
        const targetSignIdx = hl.targetSignIndex; // 0 to 11

        lordHouseMatrix[hIdx][targetHouseIdx].push({
          id: c.id,
          name: c.name,
          gender: c.gender,
          lordKey: hl.lordKey,
          lordName: hl.lordName,
          bhavaSignName: hl.bhavaSignName,
          targetHouse: hl.targetHouse,
          targetSignName: hl.targetSignName,
          deg: hl.deg,
          isRetro: hl.isRetro,
          dignity: hl.dignity
        });

        lordRashiMatrix[hIdx][targetSignIdx].push({
          id: c.id,
          name: c.name,
          gender: c.gender,
          lordKey: hl.lordKey,
          lordName: hl.lordName,
          bhavaSignName: hl.bhavaSignName,
          targetHouse: hl.targetHouse,
          targetSignName: hl.targetSignName,
          deg: hl.deg,
          isRetro: hl.isRetro,
          dignity: hl.dignity
        });
      });
    }

    // Conjunctions & Degree Orbs Analysis
    for (let i = 0; i < PLANET_KEYS.length; i++) {
      for (let j = i + 1; j < PLANET_KEYS.length; j++) {
        const p1Key = PLANET_KEYS[i];
        const p2Key = PLANET_KEYS[j];
        const p1 = c.planets[p1Key];
        const p2 = c.planets[p2Key];
        if (!p1 || !p2) continue;

        const pairKey = [p1Key, p2Key].sort().join('_');
        const pair = conjunctionPairs[pairKey];
        if (!pair) continue;

        // Same house check
        if (p1.house === p2.house) {
          pair.sameHouseCount++;
          pair.profileIds.push(c.id);
        }

        // Same Rashi check
        if (p1.signIndex === p2.signIndex) {
          pair.sameRashiCount++;
        }

        // Degree distance orb
        let diff = Math.abs(p1.totalDeg - p2.totalDeg);
        if (diff > 180) diff = 360 - diff;

        // Tight conjunction <= 5°
        if (diff <= 5.0) {
          pair.tightCount++;
          pair.tightProfileIds.push({ id: c.id, name: c.name, orb: diff, house: p1.house, sign: p1.signName });

          // Graha Yuddha check (<= 1° between Tara Grahas: Mars, Mercury, Jupiter, Venus, Saturn)
          if (diff <= 1.0 && TARA_GRAHAS.includes(p1Key) && TARA_GRAHAS.includes(p2Key)) {
            pair.grahaYuddhaCount++;
            pair.yuddhaProfileIds.push({ id: c.id, name: c.name, orb: diff, house: p1.house, sign: p1.signName });
          }
        }
      }
    }

    // Stelliums by House (3+ Planets)
    c.houseOccupants.forEach((occupants, hIndex) => {
      const houseNum = hIndex + 1;
      const count = occupants.length;

      if (count >= 3) {
        // Compute degree span
        const degs = occupants.map(k => c.planets[k]?.degInSign || 0);
        const minDeg = Math.min(...degs);
        const maxDeg = Math.max(...degs);
        const degreeSpan = (maxDeg - minDeg).toFixed(2);
        const signIndex = c.planets[occupants[0]]?.signIndex || 0;
        const signName = SIGNS[signIndex]?.name || '';

        const stObj = {
          id: c.id,
          name: c.name,
          gender: c.gender,
          house: houseNum,
          signName,
          planets: occupants,
          count,
          degreeSpan
        };

        stelliums['all'].push(stObj);
        if (count === 3) {
          stelliums['3 Planets'].push(stObj);
        } else if (count === 4) {
          stelliums['4 Planets'].push(stObj);
        } else if (count >= 5) {
          stelliums['5+ Planets'].push(stObj);
        }
      }
    });
  });

  // Finalize Ashtakavarga house averages
  const savAverages = savHouseTotals.map(tot => totalCharts > 0 ? parseFloat((tot / totalCharts).toFixed(2)) : 28.0);
  const savBenchmarkDiff = savAverages.map(avg => parseFloat((avg - 28.0).toFixed(2)));
  const labhaAvg = savAverages[10] || 28; // House 11
  const vyayaAvg = savAverages[11] || 28; // House 12
  const labhaVyayaRatio = vyayaAvg > 0 ? parseFloat((labhaAvg / vyayaAvg).toFixed(2)) : 1.0;

  // Finalize Shadbala statistics
  SHADBALA_PLANETS.forEach(k => {
    const s = shadbalaStats[k];
    s.avgVirupas = totalCharts > 0 ? parseFloat((s.totalVirupas / totalCharts).toFixed(2)) : 0;
    s.rupasAvg = parseFloat((s.avgVirupas / 60).toFixed(2));
    s.ratio = s.required > 0 ? parseFloat((s.avgVirupas / s.required).toFixed(2)) : 1.0;
    s.passRate = totalCharts > 0 ? parseFloat(((s.meetingRequirementCount / totalCharts) * 100).toFixed(1)) : 0;
    s.profiles.sort((a, b) => b.virupas - a.virupas);
  });

  // Sort stelliums by planet count descending, then native name
  stelliums['all'].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const durationMs = Math.round(performance.now() - startTime);

  return {
    timestamp: new Date().toISOString(),
    durationMs,
    totalCharts,
    maleCount,
    femaleCount,
    chartMap,
    distributions: {
      yobDist,
      decadeDist,
      ascDist,
      moonDist,
      nakshatraDist,
      retroPerChart,
      retroPlanets
    },
    planetHouseMatrix,
    planetRashiMatrix,
    planetNakshatraMatrix,
    houseRashiMatrix,
    lordHouseMatrix,
    lordRashiMatrix,
    dignityCounts,
    conjunctionPairs,
    stelliums,
    ashtakavargaNorms: {
      houseAverages: savAverages,
      benchmarkDiff: savBenchmarkDiff,
      extremes: savHouseExtremes,
      labhaAvg,
      vyayaAvg,
      labhaVyayaRatio
    },
    shadbalaNorms: shadbalaStats,
    vargottamaStats,
    profileIndex: validCharts.map(c => ({ id: c.id, name: c.name, gender: c.gender, birthDate: c.birthDate, city: c.city }))
  };
}

/**
 * Computes a lightweight fingerprint hash of profiles to check cache staleness
 */
export function getProfilesHash(profiles) {
  return profiles.length + '_' + profiles.map(p => `${p.id}_${p.updatedAt || ''}`).join('|').slice(0, 200);
}

/**
 * Get cached analytics or compute on demand
 */
export function getAnalyticsData() {
  const profiles = getProfiles();
  const currentHash = getProfilesHash(profiles);

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached && cached.profilesHash === currentHash && cached.totalCharts === profiles.length && cached.houseRashiMatrix && cached.lordHouseMatrix) {
        cached.fromCache = true;
        return cached;
      }
    }
  } catch (err) {
    console.error('Failed to read analytics cache:', err);
  }

  // Compute fresh
  const freshData = generateAnalyticsData(profiles);
  freshData.profilesHash = currentHash;
  freshData.fromCache = false;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
  } catch (err) {
    console.warn('Failed to cache analytics in localStorage (quota exceeded?):', err);
  }

  return freshData;
}

/**
 * Force manual rebuild of analytics cache
 */
export function rebuildAnalyticsCache() {
  const profiles = getProfiles();
  const currentHash = getProfilesHash(profiles);
  const freshData = generateAnalyticsData(profiles);
  freshData.profilesHash = currentHash;
  freshData.fromCache = false;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
  } catch (err) {
    console.error('Failed to save rebuilt analytics cache:', err);
  }

  return freshData;
}
