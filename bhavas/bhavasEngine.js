// 🏛️ Bhavas Delineation Engine
// Ground truth based on MS Mehta's "Advanced Techniques of Predictive Astrology"
// Compatible with both Browser (ESM) and Node.js (CommonJS / ESM)

import { SIGNS, PLANETS } from '../js/constants.js';
import { calculateTransits } from '../js/ephemeris.js';
import { house1Data } from './house_1.js';
import { house2Data } from './house_2.js';
import { house3Data } from './house_3.js';
import { house4Data } from './house_4.js';
import { house5Data } from './house_5.js';
import { house6Data } from './house_6.js';
import { house7Data } from './house_7.js';
import { house8Data } from './house_8.js';
import { house9Data } from './house_9.js';
import { house10Data } from './house_10.js';
import { house11Data } from './house_11.js';
import { house12Data } from './house_12.js';
import { calculateJaiminiPadas } from '../js/jaimini.js';
import { calculateFiveFoldFriendship } from '../js/friendship.js';

// Registry of loaded house definitions
const HOUSE_DATA_MAP = {
  1: house1Data,
  2: house2Data,
  3: house3Data,
  4: house4Data,
  5: house5Data,
  6: house6Data,
  7: house7Data,
  8: house8Data,
  9: house9Data,
  10: house10Data,
  11: house11Data,
  12: house12Data
};

/**
 * Normalizes planet names and returns planet key
 */
function getPlanetKey(nameOrKey) {
  const clean = String(nameOrKey).trim().toLowerCase();
  if (['sun', 'su', 'surya'].includes(clean)) return 'Sun';
  if (['moon', 'mo', 'chandra'].includes(clean)) return 'Moon';
  if (['mars', 'ma', 'mangala', 'mangal', 'kuja'].includes(clean)) return 'Mars';
  if (['merc', 'mercury', 'me', 'budha', 'budh'].includes(clean)) return 'Merc';
  if (['jupt', 'jupiter', 'jup', 'ju', 'guru', 'brihaspati'].includes(clean)) return 'Jupt';
  if (['venu', 'venus', 've', 'shukra', 'shukr'].includes(clean)) return 'Venu';
  if (['satn', 'saturn', 'sat', 'sa', 'shani'].includes(clean)) return 'Satn';
  if (['rahu', 'ra'].includes(clean)) return 'Rahu';
  if (['ketu', 'ke'].includes(clean)) return 'Ketu';
  if (['asc', 'ascendant', 'lagna'].includes(clean)) return 'ASC';
  return nameOrKey;
}

/**
 * Natural Benefics and Malefics in Jyotish
 */
export const NATURAL_BENEFICS = ['Jupt', 'Venu', 'Moon', 'Merc'];
export const NATURAL_MALEFICS = ['Satn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

/**
 * Exaltation and Debilitation signs (1-based signId)
 */
const EXALTATION_SIGNS = {
  'Sun': 1,   // Aries
  'Moon': 2,  // Taurus
  'Mars': 10, // Capricorn
  'Merc': 6,  // Virgo
  'Jupt': 4,  // Cancer
  'Venu': 12, // Pisces
  'Satn': 7,  // Libra
  'Rahu': 2,  // Taurus (classical)
  'Ketu': 8   // Scorpio (classical)
};

const DEBILITATION_SIGNS = {
  'Sun': 7,   // Libra
  'Moon': 8,  // Scorpio
  'Mars': 4,  // Cancer
  'Merc': 12, // Pisces
  'Jupt': 10, // Capricorn
  'Venu': 6,  // Virgo
  'Satn': 1,  // Aries
  'Rahu': 8,  // Scorpio
  'Ketu': 2   // Taurus
};

const OWN_SIGNS = {
  'Sun': [5],
  'Moon': [4],
  'Mars': [1, 8],
  'Merc': [3, 6],
  'Jupt': [9, 12],
  'Venu': [2, 7],
  'Satn': [10, 11],
  'Rahu': [11], // Kumbha as co-lord
  'Ketu': [8]   // Vrischika as co-lord
};

/**
 * Normalizes planet names and returns full or short key for metadata lookup
 */
export function findPlanetMeta(planetsInHouse, planetKeyOrName) {
  if (!planetsInHouse) return null;
  const pKey = getPlanetKey(planetKeyOrName);
  const fullNameMap = {
    'Sun': 'Sun',
    'Moon': 'Moon',
    'Mars': 'Mars',
    'Merc': 'Mercury',
    'Jupt': 'Jupiter',
    'Venu': 'Venus',
    'Satn': 'Saturn',
    'Rahu': 'Rahu',
    'Ketu': 'Ketu'
  };
  const shortNameMap = {
    'Mercury': 'Merc',
    'Jupiter': 'Jupt',
    'Venus': 'Venu',
    'Saturn': 'Satn'
  };
  const full = fullNameMap[pKey] || planetKeyOrName;
  const short = shortNameMap[full] || pKey;
  return planetsInHouse[full] || planetsInHouse[pKey] || planetsInHouse[short] || planetsInHouse[planetKeyOrName] || null;
}

/**
 * Returns houses ruled by a given planet from the Ascendant (1 to 12)
 */
export function getRuledHouses(pKey, ascSignId) {
  const normKey = getPlanetKey(pKey);
  if (['Rahu', 'Ketu', 'ASC'].includes(normKey)) return [];
  const signs = (OWN_SIGNS[normKey] || []);
  return signs.map(signId => (((signId - ascSignId + 12) % 12) + 1));
}

/**
 * Evaluates dignity of a planet in a sign
 */
export function getPlanetaryDignity(planetKey, signId) {
  const normKey = getPlanetKey(planetKey);
  if (EXALTATION_SIGNS[normKey] === signId) return 'Exalted (Ucha)';
  if (DEBILITATION_SIGNS[normKey] === signId) return 'Debilitated (Neecha)';
  if (OWN_SIGNS[normKey] && OWN_SIGNS[normKey].includes(signId)) return 'Own Sign (Swakshetra)';
  return 'Normal';
}

/**
 * Calculates Drishti (Vedic Planetary Aspects) onto a target house
 */
export function getAspectsOnHouse(planets, targetHouseNum, ascSignId) {
  const aspects = [];

  for (const p of planets) {
    const pKey = getPlanetKey(p.key || p.name);
    if (pKey === 'ASC') continue;

    const pSignId = p.signId;
    const pHouse = ((pSignId - ascSignId + 12) % 12) + 1;
    const distance = ((targetHouseNum - pHouse + 12) % 12) + 1;

    let hasAspect = false;
    let aspectType = '';

    // 7th full aspect (all planets)
    if (distance === 7) {
      hasAspect = true;
      aspectType = '7th Full Aspect (Saptama Drishti)';
    }

    // Special aspects:
    // Mars: 4th and 8th
    if (pKey === 'Mars' && (distance === 4 || distance === 8)) {
      hasAspect = true;
      aspectType = `${distance}th Special Aspect (Kuja Drishti)`;
    }

    // Jupiter, Rahu, Ketu: 5th and 9th
    if (['Jupt', 'Rahu', 'Ketu'].includes(pKey) && (distance === 5 || distance === 9)) {
      hasAspect = true;
      aspectType = `${distance}th Special Trikona Aspect`;
    }

    // Saturn: 3rd and 10th
    if (pKey === 'Satn' && (distance === 3 || distance === 10)) {
      hasAspect = true;
      aspectType = `${distance}th Special Aspect (Shani Drishti)`;
    }

    if (hasAspect) {
      aspects.push({
        planetKey: pKey,
        name: p.name || pKey,
        fromHouse: pHouse,
        aspectType,
        isBenefic: NATURAL_BENEFICS.includes(pKey),
        isMalefic: NATURAL_MALEFICS.includes(pKey)
      });
    }
  }

  return aspects;
}

/**
 * Checks for Pap Kartari or Shubh Kartari Yoga on a house
 */
export function checkKartariYoga(planets, targetHouseNum, ascSignId) {
  const prevHouse = targetHouseNum === 1 ? 12 : targetHouseNum - 1;
  const nextHouse = targetHouseNum === 12 ? 1 : targetHouseNum + 1;

  const prevOccupants = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    return (((p.signId - ascSignId + 12) % 12) + 1) === prevHouse;
  });

  const nextOccupants = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    return (((p.signId - ascSignId + 12) % 12) + 1) === nextHouse;
  });

  const prevHasMalefic = prevOccupants.some(p => NATURAL_MALEFICS.includes(getPlanetKey(p.key || p.name)));
  const nextHasMalefic = nextOccupants.some(p => NATURAL_MALEFICS.includes(getPlanetKey(p.key || p.name)));

  const prevHasBenefic = prevOccupants.some(p => NATURAL_BENEFICS.includes(getPlanetKey(p.key || p.name)));
  const nextHasBenefic = nextOccupants.some(p => NATURAL_BENEFICS.includes(getPlanetKey(p.key || p.name)));

  if (prevHasMalefic && nextHasMalefic && !prevHasBenefic && !nextHasBenefic) {
    return {
      type: 'Pap Kartari',
      description: 'House is hemmed between natural malefics, causing internal stress, delays, or vulnerability for its significations.'
    };
  }

  if (prevHasBenefic && nextHasBenefic && !prevHasMalefic && !nextHasMalefic) {
    return {
      type: 'Shubh Kartari',
      description: 'House is fortified by natural benefics flanking both sides, providing a protective cushion and auspicious fruition.'
    };
  }

  return { type: 'None', description: 'No pure Kartari yoga active on this house.' };
}

/**
 * Checks special Yogas for the 1st House (Lagna)
 */
function checkFirstHouseYogas(planets, ascSignId, lagnaLordKey, lagnaLordHouse, lagnaLordSignId) {
  const activeYogas = [];
  const lagnaOccupants = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && (((p.signId - ascSignId + 12) % 12) + 1) === 1;
  });

  const hasBeneficInLagna = lagnaOccupants.some(p => NATURAL_BENEFICS.includes(getPlanetKey(p.key || p.name)));
  const lagnaLordDignity = getPlanetaryDignity(lagnaLordKey, lagnaLordSignId);
  const isKendraOrTrikona = [1, 4, 5, 7, 9, 10].includes(lagnaLordHouse);

  // 1. Chamara Yoga
  if (hasBeneficInLagna && (lagnaLordDignity.includes('Exalted') || lagnaLordDignity.includes('Own')) && isKendraOrTrikona) {
    activeYogas.push({
      name: 'Chamara Yoga',
      condition: 'Benefic in Lagna and Lagna Lord exalted/own sign in Kendra or Trikona.',
      effects: 'Bestows fame, wealth, kingly status, and long life. Native rises steadily to high social honor.',
      source: 'Mehta, Ch. 1, p. 40'
    });
  }

  // 2. Parvata Yoga (Variant A: Lagna Lord exalted/own in Kendra/Trikona)
  if ((lagnaLordDignity.includes('Exalted') || lagnaLordDignity.includes('Own')) && isKendraOrTrikona) {
    activeYogas.push({
      name: 'Parvata Yoga',
      condition: 'Lagna Lord exalted or in own sign in a Kendra or Trikona.',
      effects: 'Endows virtue, philanthropy, humility, lasting fame, and kingly fortune.',
      source: 'Phala Deepika & Mehta, Ch. 1, p. 41'
    });
  }

  // 3. Parijata Yoga
  // Dispositor of Lagna Lord in Kendra/Trikona or exalted
  const lagnaLordSignObj = SIGNS[lagnaLordSignId - 1];
  const dispositorLord = lagnaLordSignObj.lord;
  const dispositorPlanet = planets.find(p => getPlanetKey(p.key || p.name) === getPlanetKey(dispositorLord));
  if (dispositorPlanet) {
    const dispHouse = (((dispositorPlanet.signId - ascSignId + 12) % 12) + 1);
    const dispDignity = getPlanetaryDignity(dispositorPlanet.key || dispositorPlanet.name, dispositorPlanet.signId);
    if ([1, 4, 5, 7, 9, 10].includes(dispHouse) || dispDignity.includes('Exalted') || dispDignity.includes('Own')) {
      activeYogas.push({
        name: 'Parijata Yoga',
        condition: `Dispositor of Lagna Lord (${dispositorPlanet.name || dispositorLord}) is well placed in House ${dispHouse} (${dispDignity}).`,
        effects: 'Ensures eminence, respect across circles, and worldly achievement in the mature years.',
        source: 'Mehta, Ch. 1, p. 41'
      });
    }
  }

  // 4. Vimala Yoga (Lagna Lord in 12th)
  if (lagnaLordHouse === 12) {
    activeYogas.push({
      name: 'Vimala Yoga (Lagna Lord Variant)',
      condition: 'Lagna Lord placed in the 12th house (Moksha Sthana).',
      effects: 'Brings spiritual leanings, charitable nature, foreign travels/residence, and preservation of honor.',
      source: 'Mehta, Ch. 1, p. 31'
    });
  }

  return activeYogas;
}

/**
 * Planetary Kalas for Indu Lagna calculation (Mehta Ch. 2, p. 41)
 */
export const INDU_KALAS = {
  'Sun': 30,
  'Moon': 16,
  'Mars': 6,
  'Merc': 8,
  'Jupt': 10,
  'Venu': 12,
  'Satn': 1
};

/**
 * Calculates Indu Lagna (Dhana Lagna / Visesha Chandra Yoga)
 */
export function calculateInduLagna(planets, ascSignId) {
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  if (!moon) return null;

  // 9th from Lagna
  const h9FromLagnaSignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9FromLagnaLord = SIGNS[h9FromLagnaSignId - 1].lord;
  const kalas1 = INDU_KALAS[getPlanetKey(h9FromLagnaLord)] || 0;

  // 9th from Moon
  const h9FromMoonSignId = ((moon.signId - 1 + 8) % 12) + 1;
  const h9FromMoonLord = SIGNS[h9FromMoonSignId - 1].lord;
  const kalas2 = INDU_KALAS[getPlanetKey(h9FromMoonLord)] || 0;

  const totalKalas = kalas1 + kalas2;
  const rem = (totalKalas % 12) === 0 ? 12 : (totalKalas % 12);

  // Count remainder houses from natal Moon
  const induSignId = ((moon.signId - 1 + (rem - 1)) % 12) + 1;
  const induSignObj = SIGNS[induSignId - 1];
  const induHouseFromLagna = ((induSignId - ascSignId + 12) % 12) + 1;

  // Occupants in Indu Lagna
  const occupants = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && p.signId === induSignId;
  });

  // Aspects on Indu Lagna
  const aspects = getAspectsOnHouse(planets, induHouseFromLagna, ascSignId);

  // Check Koteshwara Yoga
  const hasBeneficOccupant = occupants.some(p => NATURAL_BENEFICS.includes(getPlanetKey(p.key || p.name)));
  const hasBeneficAspect = aspects.some(a => a.isBenefic);
  const hasExaltedPlanet = occupants.some(p => getPlanetaryDignity(p.key || p.name, p.signId).includes('Exalted'));

  const isKoteshwaraActive = hasBeneficOccupant || hasBeneficAspect || hasExaltedPlanet;

  return {
    h9FromLagna: { sign: SIGNS[h9FromLagnaSignId - 1].name, lord: h9FromLagnaLord, kalas: kalas1 },
    h9FromMoon: { sign: SIGNS[h9FromMoonSignId - 1].name, lord: h9FromMoonLord, kalas: kalas2 },
    totalKalas,
    remainder: rem,
    sign: {
      id: induSignId,
      name: induSignObj.name,
      sanskrit: induSignObj.sanskrit,
      symbol: induSignObj.symbol,
      lord: induSignObj.lord
    },
    houseFromLagna: induHouseFromLagna,
    occupants: occupants.map(p => ({
      name: p.name || p.key,
      dignity: getPlanetaryDignity(p.key || p.name, p.signId)
    })),
    aspects,
    isKoteshwaraActive,
    summary: isKoteshwaraActive
      ? 'Koteshwara Yoga Active: Indu Lagna is fortified by benefic influences or exaltation, granting multi-millionaire wealth potential during relevant planetary dashas.'
      : 'Indu Lagna is established; wealth fruition operates according to the dignity of its dispositor and transits.'
  };
}

/**
 * Checks special Yogas for the 2nd House (Dhana Bhava)
 */
function checkSecondHouseYogas(planets, ascSignId, h2LordKey, h2LordHouse, h2LordSignId, induLagnaReport) {
  const yogas = [];

  // 11th lord
  const h11SignId = ((ascSignId - 1 + 10) % 12) + 1;
  const h11LordName = SIGNS[h11SignId - 1].lord;
  const h11LordKey = getPlanetKey(h11LordName);
  const h11LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h11LordKey);
  const h11LordHouse = h11LordPlanet ? (((h11LordPlanet.signId - ascSignId + 12) % 12) + 1) : 11;

  // 1. Maha Dhana Parivartana Yoga (2nd & 11th lords)
  if (h2LordHouse === 11 && h11LordHouse === 2) {
    yogas.push({
      name: 'Maha Dhana Parivartana Yoga',
      condition: 'Mutual exchange (Parivartana) between the 2nd lord of accumulated wealth and 11th lord of continuous gains.',
      effects: 'One of the highest classical wealth yogas. Native commands vast fortunes, banking success, and endless income streams.',
      source: 'Mehta, Ch. 2, p. 40 & BPHS'
    });
  } else if ((h2LordHouse === 11) || (h11LordHouse === 2) || (h2LordHouse === h11LordHouse && h2LordHouse !== 6 && h2LordHouse !== 8 && h2LordHouse !== 12)) {
    yogas.push({
      name: 'Dhana Yoga (2nd & 11th Lords Association)',
      condition: `2nd Lord (${h2LordKey}) and 11th Lord (${h11LordKey}) are mutually connected in House ${h2LordHouse}.`,
      effects: 'Abundant prosperity, financial gains through trade, banking, and elder siblings.',
      source: 'Mehta, Ch. 2, p. 40'
    });
  }

  // 2. 5th & 2nd connection
  const h5SignId = ((ascSignId - 1 + 4) % 12) + 1;
  const h5LordKey = getPlanetKey(SIGNS[h5SignId - 1].lord);
  const h5LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h5LordKey);
  const h5LordHouse = h5LordPlanet ? (((h5LordPlanet.signId - ascSignId + 12) % 12) + 1) : 5;

  if (h2LordHouse === 5 || h5LordHouse === 2 || (h2LordHouse === h5LordHouse && [1, 4, 5, 9, 10, 11].includes(h2LordHouse))) {
    yogas.push({
      name: 'Lakshmi Dhana Yoga (2nd & 5th Association)',
      condition: '2nd Lord connected with 5th house of Purva Punya and high intellect.',
      effects: 'Wealth through investments, speculation, children, and divine grace.',
      source: 'Mehta, Ch. 2, p. 39'
    });
  }

  // 3. Koteshwara Yoga via Indu Lagna
  if (induLagnaReport && induLagnaReport.isKoteshwaraActive) {
    yogas.push({
      name: 'Koteshwara Yoga (Indu Lagna Fortification)',
      condition: `Indu Lagna in ${induLagnaReport.sign.name} is fortified by benefics or exalted grahas.`,
      effects: 'Classical combination for extreme wealth, millionaire status, and vast material assets during operating Dashas.',
      source: 'Mehta, Ch. 2, p. 43 & Parashara'
    });
  }

  // 4. 2nd & 12th exchange (Nirdhan Yoga)
  const h12SignId = ((ascSignId - 1 + 11) % 12) + 1;
  const h12LordKey = getPlanetKey(SIGNS[h12SignId - 1].lord);
  const h12LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h12LordKey);
  const h12LordHouse = h12LordPlanet ? (((h12LordPlanet.signId - ascSignId + 12) % 12) + 1) : 12;

  if (h2LordHouse === 12 && h12LordHouse === 2) {
    yogas.push({
      name: 'Nirdhan Yoga (2nd & 12th Exchange)',
      condition: 'Exchange of houses between the 2nd lord (savings) and 12th lord (expenditure).',
      effects: 'Income is quickly dissolved by uncontrollable expenses or debts unless neutralized by strong Jupiter.',
      source: 'Bhavartha Ratnakara & Mehta, Ch. 2, p. 48'
    });
  }

  return yogas;
}

/**
 * Evaluates Third House Yogas (Parakrama, Sibling, Artistic, Upachaya Valour)
 * Ground truth: MS Mehta Ch. 3 (pp. 61-72) & K.N. Rao
 */
function checkThirdHouseYogas(planets, ascSignId, h3LordKey, h3LordHouse, h3LordSignId, savPoints) {
  const yogas = [];

  // Planets occupying 3rd house
  const h3Planets = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    const pHouse = (((p.signId - ascSignId + 12) % 12) + 1);
    return pHouse === 3;
  });

  // 1. Nerves of Steel & Upachaya Valour (Malefics in 3rd)
  const maleficsIn3 = h3Planets.filter(p => NATURAL_MALEFICS.includes(getPlanetKey(p.key || p.name)));
  if (maleficsIn3.length > 0) {
    const names = maleficsIn3.map(p => p.name || p.key).join(', ');
    yogas.push({
      name: 'Nerves of Steel & Upachaya Valour',
      condition: `Natural malefic(s) (${names}) occupying the 3rd house of valour.`,
      effects: 'Bestows intrepid courage, formidable fighting willpower, and "killer instinct" vital for athletic champions, military commanders, and decisive leadership.',
      source: 'Mehta, Ch. 3, pp. 63-64 & K.N. Rao (Ups and Downs in Career)'
    });
  }

  // 2. Saraswati / Gandharva Artistic & Vocal Talents
  const artisticPlanets = ['Venu', 'Merc', 'Moon', 'Jupt'];
  const artisticIn3 = h3Planets.filter(p => artisticPlanets.includes(getPlanetKey(p.key || p.name)));
  const isLordArtistic = artisticPlanets.includes(h3LordKey);

  // Check aspects from artistic planets onto 3rd house
  const h3SignId = ((ascSignId - 1 + 2) % 12) + 1;
  const aspectsOn3 = getAspectsOnHouse(planets, 3, ascSignId);
  const artisticAspects = aspectsOn3.filter(a => artisticPlanets.includes(a.planetKey));

  if (artisticIn3.length > 0 || isLordArtistic || artisticAspects.length > 0) {
    const components = [];
    if (artisticIn3.length > 0) components.push(`occupant ${artisticIn3.map(p => p.name || p.key).join(', ')}`);
    if (isLordArtistic) components.push(`3rd lord ${h3LordKey}`);
    if (artisticAspects.length > 0) components.push(`aspect from ${artisticAspects.map(a => a.name).join(', ')}`);

    yogas.push({
      name: 'Saraswati Vocal & Performing Arts Combination',
      condition: `Artistic graha connection with 3rd house: ${components.join('; ')}.`,
      effects: 'Endows native with melodious voice, talent in performing arts (singing, devotional Sangeet / Bhajans, acting, dance, or musical instruments).',
      source: 'Mehta, Ch. 3, pp. 61-63 (Lata Mangeshkar & Swami Prabhupada cases)'
    });
  }

  // 3. Mars in 3rd House — Sibling Denial / Relentless Pioneer
  const marsIn3 = h3Planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  if (marsIn3) {
    const binduNote = (savPoints !== null && savPoints >= 5) 
      ? ` Endowed with high Ashtakavarga strength (${savPoints} bindus), strongly activating Mehta's denial rule.` 
      : '';
    yogas.push({
      name: 'Kuja in Sahaja Bhava (Pioneer / Sibling Denial Combination)',
      condition: `Mars (Karaka of 3rd) occupies the 3rd house itself.${binduNote}`,
      effects: 'Confers unmatched bravery, manual power, and royal favor, but classically denies younger brothers or causes sibling estrangement (Karako Bhava Nashaya).',
      source: 'Mehta, Ch. 3, pp. 66-67 (Pt. Jawaharlal Nehru case study)'
    });
  }

  // 4. Vipreeta Raja Yogas
  if (h3LordHouse === 6) {
    yogas.push({
      name: 'Harsha Vipreeta Raja Yoga (3rd Lord in 6th)',
      condition: '3rd lord occupies the 6th Dusthana house.',
      effects: 'Triumph over competitors and adversaries, prosperity, physical stamina; brothers excel in medicine, surgery, or defense.',
      source: 'Mehta, Ch. 3, pp. 64-65 & Phala Deepika'
    });
  } else if (h3LordHouse === 8) {
    yogas.push({
      name: 'Sarala Vipreeta Raja Yoga (3rd Lord in 8th)',
      condition: '3rd lord occupies the 8th Dusthana house.',
      effects: 'Exceptional capacity for research, occult or scientific breakthroughs, and longevity; but demands health care if afflicted.',
      source: 'Mehta, Ch. 3, p. 65'
    });
  } else if (h3LordHouse === 12) {
    yogas.push({
      name: 'Vimala Vipreeta Raja Yoga (3rd Lord in 12th)',
      condition: '3rd lord occupies the 12th Dusthana house.',
      effects: 'Wealth through foreign connections, overseas mobility, independent lifestyle, and noble charitable expenses.',
      source: 'Mehta, Ch. 3, p. 65'
    });
  }

  // 5. Satyacharya Theatrical / Artistic Stardom Yoga (3rd lord in 10th in Mercury/Venus signs)
  if (h3LordHouse === 10 && [2, 3, 6, 7].includes(h3LordSignId)) {
    yogas.push({
      name: "Satyacharya's Professional Stardom Yoga",
      condition: `3rd lord occupies the 10th house in ${SIGNS[h3LordSignId - 1].name} (ruled by Mercury/Venus).`,
      effects: 'Sage Satyacharya declares this makes the native an eminent singer, actor, dancer, or instrumental artist whose talent commands national renown.',
      source: 'Sage Satyacharya & Mehta, Ch. 3, p. 65'
    });
  }

  // 6. Mental Makeup from 3rd Lord Conjunctions (Sarvartha Chintamani & Mehta p. 72)
  const conjoinedWithLord = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC' || k === h3LordKey) return false;
    const pHouse = (((p.signId - ascSignId + 12) % 12) + 1);
    return pHouse === h3LordHouse;
  });

  if (conjoinedWithLord.length > 0) {
    const planetaryTraits = {
      'Sun': 'Heroic bravery and bold initiatives',
      'Moon': 'Mental patience, deep composure, and reflective mood',
      'Mars': 'Fiery temper, wrathful determination, and quick reaction',
      'Merc': 'Satvik intellect, articulate wit, and analytical mind',
      'Jupt': 'Profound wisdom, noble character, and philosophic understanding',
      'Venu': 'Aesthetic refinement, romantic charm, and artistic taste',
      'Satn': 'Serious contemplation, stoicism, or periods of melancholic caution',
      'Rahu': 'Fearless exterior bravado, daring unorthodox strategies',
      'Ketu': 'Spiritual introspection, ascetic tendencies, or sudden sharp impulses'
    };

    conjoinedWithLord.forEach(p => {
      const pKey = getPlanetKey(p.key || p.name);
      if (planetaryTraits[pKey]) {
        yogas.push({
          name: `Mental Disposition: 3rd Lord conjoining ${p.name || pKey}`,
          condition: `3rd lord (${h3LordKey}) is conjunct ${p.name || pKey} in House ${h3LordHouse}.`,
          effects: planetaryTraits[pKey],
          source: 'Sarvartha Chintamani & Mehta, Ch. 3, p. 72'
        });
      }
    });
  }

  return yogas;
}

/**
 * Evaluates Fourth House Yogas (Sukha, Real Estate, Mansions, Mother, Parliamentary Career)
 * Ground truth: MS Mehta Ch. 4 (pp. 73-88), Phala Deepika & K.N. Rao
 */
function checkFourthHouseYogas(planets, ascSignId, h4LordKey, h4LordHouse, h4LordSignId, savPoints) {
  const yogas = [];

  // Planets occupying 4th house
  const h4Planets = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    const pHouse = (((p.signId - ascSignId + 12) % 12) + 1);
    return pHouse === 4;
  });

  const h4PlanetKeys = h4Planets.map(p => getPlanetKey(p.key || p.name));

  // 1. Anand Bhawan Heritage (Venus & Mercury in 4th - Pt. Nehru Signature)
  if (h4PlanetKeys.includes('Venu') && h4PlanetKeys.includes('Merc')) {
    const savNote = (savPoints !== null && savPoints >= 28) 
      ? ` Endowed with high Ashtakavarga strength (${savPoints} bindus), replicating Pt. Nehru's 30-bindu Anand Bhawan matrix.` 
      : '';
    yogas.push({
      name: 'Anand Bhawan Heritage (Palatial Estate & Idyllic Mansions)',
      condition: `Venus (luxuries & conveyances) and Mercury (intellect & arts) conjoined in the 4th house of residence.${savNote}`,
      effects: 'Destined to live in palatial mansions with gardens, luxury conveyances, swimming pools, and idyllic surroundings, bringing immense fortune to the family line.',
      source: 'Mehta, Ch. 4, pp. 67-68 (Pt. Jawaharlal Nehru landmark case)'
    });
  }

  // 2. Uttama Griha Yoga (4th Lord in Kendra/Trikona joined by benefics)
  const isKendraTrikona = [1, 4, 5, 7, 9, 10].includes(h4LordHouse);
  const beneficsWith4thLord = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC' || k === h4LordKey) return false;
    const pHouse = (((p.signId - ascSignId + 12) % 12) + 1);
    return pHouse === h4LordHouse && NATURAL_BENEFICS.includes(k);
  });

  if (isKendraTrikona && beneficsWith4thLord.length > 0) {
    const bNames = beneficsWith4thLord.map(p => p.name || p.key).join(', ');
    yogas.push({
      name: 'Uttama Griha Yoga (Prestigious Harmonious Home)',
      condition: `4th Lord placed in House ${h4LordHouse} (Kendra/Trikona) conjoining natural benefic(s) (${bNames}).`,
      effects: 'Guarantees the acquisition of an auspicious, durable, and prestigious residence with peaceful domestic comforts.',
      source: 'Mehta, Ch. 4, p. 70'
    });
  }

  // 3. Kendra-Trikona Raj Yoga (4th & 5th Connection / Parivartana)
  const h5SignId = ((ascSignId - 1 + 4) % 12) + 1;
  const h5LordKey = getPlanetKey(SIGNS[h5SignId - 1].lord);
  const h5LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h5LordKey);
  const h5LordHouse = h5LordPlanet ? (((h5LordPlanet.signId - ascSignId + 12) % 12) + 1) : 5;

  if (h4LordHouse === 5 || h5LordHouse === 4 || (h4LordHouse === 5 && h5LordHouse === 4)) {
    const isParivartana = (h4LordHouse === 5 && h5LordHouse === 4);
    yogas.push({
      name: isParivartana ? 'Maha Raj Yoga: 4th & 5th Lords Parivartana' : 'Kendra-Trikona Raj Yoga (4th & 5th Connection)',
      condition: isParivartana ? 'Mutual exchange of houses between 4th lord and 5th lord.' : 'Direct connection between 4th lord of foundations and 5th lord of Purva Punya.',
      effects: 'Confers national political fame, ministerial authority, high academic honors, palatial estates, and grace of rulers.',
      source: 'Mehta, Ch. 4, p. 64'
    });
  }

  // 4. Parliamentary Career & Mass Mandate Yoga (4th & 10th / Lagna Connection)
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10LordKey = getPlanetKey(SIGNS[h10SignId - 1].lord);
  const h10LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);
  const h10LordHouse = h10LordPlanet ? (((h10LordPlanet.signId - ascSignId + 12) % 12) + 1) : 10;

  if (h4LordHouse === 10 || h10LordHouse === 4 || (h4LordHouse === h10LordHouse)) {
    yogas.push({
      name: 'Parliamentary Career & Mass Mandate Yoga',
      condition: 'Direct connection between 4th house/lord (mass popular base) and 10th house/lord (executive governance).',
      effects: 'Propels the native to national legislative elections, parliamentary membership, and a strong grassroots constituency.',
      source: 'K.N. Rao (Ups and Downs in Career) & Mehta, Ch. 4, p. 63'
    });
  }

  // 5. Agni Bhaya / Fire Sensitivity Alert (Sun & Mars in 4th - Phala Deepika)
  const hasMars = h4PlanetKeys.includes('Mars');
  const hasSun = h4PlanetKeys.includes('Sun');
  if (hasMars && hasSun) {
    yogas.push({
      name: 'Agni Bhaya Yoga (Fire & Electrical Hazard Alert)',
      condition: 'Fiery planets Sun and Mars both occupying the 4th house of residence.',
      effects: 'Classical warning regarding fire outbreaks, electrical hazards, or sudden destructive property damage unless protected by Jupiter.',
      source: 'Phala Deepika & Mehta, Ch. 4, pp. 64-65'
    });
  }

  // 6. Matru Sukha / Long-Lived Mother Yoga
  const moonPlanet = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  if (moonPlanet) {
    const moonDignity = getPlanetaryDignity('Moon', moonPlanet.signId);
    const moonHouse = (((moonPlanet.signId - ascSignId + 12) % 12) + 1);
    if ((moonDignity.includes('Exalted') || moonDignity.includes('Own') || [1, 4, 5, 9, 10].includes(moonHouse)) && [1, 4, 5, 9, 10].includes(h4LordHouse)) {
      yogas.push({
        name: 'Matru Dirghayu Yoga (Long-Lived & Affectionate Mother)',
        condition: 'Both 4th Lord and Karaka Moon are well-disposed in auspicious angles or trines.',
        effects: 'Ensures longevity, robust health, and enduring blessings from the mother, granting peaceful domestic stability.',
        source: 'Mehta, Ch. 4, p. 76'
      });
    }
  }

  return yogas;
}

/**
 * Calculates Beeja Sphuta (for males) and Kshetra Sphuta (for females)
 * Formula from Mehta Ch. 5, pp. 86-88 & Jataka Parijata
 */
export function calculateBeejaKshetraSphuta(planets, gender = 'male') {
  const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const mars = planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');

  const getAbsLon = (p) => {
    if (!p) return 0;
    if (typeof p.absLongitude === 'number') return p.absLongitude;
    if (typeof p.longitude === 'number') return p.longitude;
    const signId = p.signId || 1;
    const deg = p.degInSign || 15;
    return (signId - 1) * 30 + deg;
  };

  const sunLon = getAbsLon(sun);
  const venLon = getAbsLon(venus);
  const jupLon = getAbsLon(jupiter);
  const marLon = getAbsLon(mars);
  const mooLon = getAbsLon(moon);

  // Beeja Sphuta = Sun + Venus + Jupiter (mod 360)
  const beejaDeg = ((sunLon + venLon + jupLon) % 360 + 360) % 360;
  const beejaSignId = Math.floor(beejaDeg / 30) + 1;
  const beejaDegInSign = beejaDeg % 30;
  const beejaSignObj = SIGNS[beejaSignId - 1];
  const beejaIsOdd = (beejaSignId % 2 !== 0);
  const beejaNavamsaSignId = (Math.floor(beejaDeg / (30 / 9)) % 12) + 1;
  const beejaNavamsaIsOdd = (beejaNavamsaSignId % 2 !== 0);

  let beejaStatus = '';
  if (beejaIsOdd && beejaNavamsaIsOdd) {
    beejaStatus = 'Fortified & Highly Fertile (Strong Procreative Vitality - Both Rasi and Navamsa in masculine signs)';
  } else if (beejaIsOdd || beejaNavamsaIsOdd) {
    beejaStatus = 'Mixed / Moderate Vitality (Delay in childbirth indicated; auspicious remedies recommended)';
  } else {
    beejaStatus = 'Afflicted Seed / Deficient Vitality (Both Rasi and Navamsa in feminine signs; medical consultation & classical remedies advised)';
  }

  // Kshetra Sphuta = Mars + Moon + Jupiter (mod 360)
  const kshetraDeg = ((marLon + mooLon + jupLon) % 360 + 360) % 360;
  const kshetraSignId = Math.floor(kshetraDeg / 30) + 1;
  const kshetraDegInSign = kshetraDeg % 30;
  const kshetraSignObj = SIGNS[kshetraSignId - 1];
  const kshetraIsEven = (kshetraSignId % 2 === 0);
  const kshetraNavamsaSignId = (Math.floor(kshetraDeg / (30 / 9)) % 12) + 1;
  const kshetraNavamsaIsEven = (kshetraNavamsaSignId % 2 === 0);

  let kshetraStatus = '';
  if (kshetraIsEven && kshetraNavamsaIsEven) {
    kshetraStatus = 'Fortified & Highly Receptive (Strong Procreative Field - Both Rasi and Navamsa in feminine signs)';
  } else if (kshetraIsEven || kshetraNavamsaIsEven) {
    kshetraStatus = 'Mixed / Moderate Receptivity (Conception requires patient timing & nourishing regimen)';
  } else {
    kshetraStatus = 'Afflicted Field / Deficient Kshetra (Both Rasi and Navamsa in masculine signs; hormonal/uterine remedies advised)';
  }

  const isMale = (String(gender).toLowerCase() !== 'female');

  const beejaData = {
    name: 'Beeja Sphuta (Seed Vitality)',
    sanskrit: 'बीज स्फुट',
    targetGender: 'male',
    formula: 'Sun + Venus + Jupiter (mod 360°)',
    rationale: 'Sun & Venus rule vitality and semen, Jupiter rules progeny.',
    longitude: beejaDeg,
    signId: beejaSignId,
    signName: beejaSignObj.name,
    sanskritSign: beejaSignObj.sanskrit,
    degFormatted: `${Math.floor(beejaDegInSign)}° ${Math.floor((beejaDegInSign % 1) * 60)}'`,
    isOddSign: beejaIsOdd,
    navamsaSign: SIGNS[beejaNavamsaSignId - 1].name,
    navamsaIsOdd: beejaNavamsaIsOdd,
    status: beejaStatus
  };

  const kshetraData = {
    name: 'Kshetra Sphuta (Field / Womb Receptivity)',
    sanskrit: 'क्षेत्र स्फुट',
    targetGender: 'female',
    formula: 'Mars + Moon + Jupiter (mod 360°)',
    rationale: 'Mars & Moon rule ovum/blood and menstrual cycles, Jupiter rules progeny.',
    longitude: kshetraDeg,
    signId: kshetraSignId,
    signName: kshetraSignObj.name,
    sanskritSign: kshetraSignObj.sanskrit,
    degFormatted: `${Math.floor(kshetraDegInSign)}° ${Math.floor((kshetraDegInSign % 1) * 60)}'`,
    isEvenSign: kshetraIsEven,
    navamsaSign: SIGNS[kshetraNavamsaSignId - 1].name,
    navamsaIsEven: kshetraNavamsaIsEven,
    status: kshetraStatus
  };

  return {
    gender: isMale ? 'male' : 'female',
    isMale,
    primarySphuta: isMale ? beejaData : kshetraData,
    partnerSphuta: isMale ? kshetraData : beejaData,
    beeja: beejaData,
    kshetra: kshetraData
  };
}

/**
 * Calculates Progeny Childbirth Transit Windows (Ages 18 to 50)
 * Using K.N. Rao's Classical Double Transit Technique (Mehta Ch. 5, pp. 97-99)
 */
export function calculateProgenyTransitWindows(planets, ascSignId, birthDateStr, options = {}) {
  const startAge = options.startAge || 18;
  const endAge = options.endAge || 50;

  // 1. Identify 4 Sensitive Points:
  // H5: 5th House sign
  // L5: 5th Lord's sign
  // H9: 9th House sign
  // L9: 9th Lord's sign
  const h5SignId = ((ascSignId - 1 + 4) % 12) + 1;
  const h5LordKey = getPlanetKey(SIGNS[h5SignId - 1].lord);
  const h5LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h5LordKey);
  const l5SignId = h5LordPlanet ? h5LordPlanet.signId : h5SignId;

  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9LordKey = getPlanetKey(SIGNS[h9SignId - 1].lord);
  const h9LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const l9SignId = h9LordPlanet ? h9LordPlanet.signId : h9SignId;

  const sensitivePoints = [
    { type: '5th House', signId: h5SignId, signName: SIGNS[h5SignId - 1].name },
    { type: `5th Lord (${h5LordKey})`, signId: l5SignId, signName: SIGNS[l5SignId - 1].name },
    { type: '9th House', signId: h9SignId, signName: SIGNS[h9SignId - 1].name },
    { type: `9th Lord (${h9LordKey})`, signId: l9SignId, signName: SIGNS[l9SignId - 1].name }
  ];

  // 2. Parse Birth Date
  let bDate = null;
  if (birthDateStr) {
    const parsed = new Date(birthDateStr);
    if (!isNaN(parsed.getTime())) bDate = parsed;
  }
  if (!bDate) {
    const currentYear = new Date().getFullYear();
    bDate = new Date(`${currentYear - 28}-01-01T00:00:00Z`);
  }

  // 3. Aspects helper
  const getSaturnAspects = (satSignId, isRetro) => {
    const set = new Set();
    const addAspects = (baseSign) => {
      set.add(baseSign); // 1st / conjunct
      set.add(((baseSign - 1 + 2) % 12) + 1); // 3rd aspect
      set.add(((baseSign - 1 + 6) % 12) + 1); // 7th aspect
      set.add(((baseSign - 1 + 9) % 12) + 1); // 10th aspect
    };
    addAspects(satSignId);
    if (isRetro) {
      const prevSign = ((satSignId - 2 + 12) % 12) + 1;
      addAspects(prevSign);
    }
    return set;
  };

  const getJupiterAspects = (jupSignId, isRetro) => {
    const set = new Set();
    const addAspects = (baseSign) => {
      set.add(baseSign); // 1st / conjunct
      set.add(((baseSign - 1 + 4) % 12) + 1); // 5th aspect
      set.add(((baseSign - 1 + 6) % 12) + 1); // 7th aspect
      set.add(((baseSign - 1 + 8) % 12) + 1); // 9th aspect
    };
    addAspects(jupSignId);
    if (isRetro) {
      const prevSign = ((jupSignId - 2 + 12) % 12) + 1;
      addAspects(prevSign);
    }
    return set;
  };

  // 4. Sample monthly (step = 1/12 years = 1 month) across ages [startAge..endAge]
  const step = 1 / 12;
  const sampleHits = [];
  const nowDate = new Date();

  for (let age = startAge; age <= endAge; age += step) {
    const targetMs = bDate.getTime() + (age * 365.25 * 24 * 3600 * 1000);
    const sampleDate = new Date(targetMs);

    let tr = null;
    try {
      tr = calculateTransits(sampleDate);
    } catch (e) {
      continue;
    }
    if (!tr || !tr.planets) continue;

    const trSat = tr.planets.find(p => p.key === 'Satn');
    const trJup = tr.planets.find(p => p.key === 'Jupt');
    if (!trSat || !trJup) continue;

    const satAspects = getSaturnAspects(trSat.signId, trSat.isRetro);
    const jupAspects = getJupiterAspects(trJup.signId, trJup.isRetro);

    const satHits = sensitivePoints.filter(pt => satAspects.has(pt.signId));
    const jupHits = sensitivePoints.filter(pt => jupAspects.has(pt.signId));

    const satTouches5th = satHits.some(h => h.type.includes('5th'));
    const jupTouches5th = jupHits.some(h => h.type.includes('5th'));
    const satTouches9th = satHits.some(h => h.type.includes('9th'));
    const jupTouches9th = jupHits.some(h => h.type.includes('9th'));

    // Classical K.N. Rao Progeny Convergence (Mehta Ch. 5, pp. 97–99):
    // Tier 1 (Direct 5th House/Lord): BOTH Saturn and Jupiter must activate {5th House OR 5th Lord}.
    // Tier 2 (5th–9th Dual Axis): One activates {5th House OR 5th Lord} and the other activates {9th House OR 9th Lord}.
    // Activation of 9th house alone by both without 5th house/lord does not govern progeny.
    const isTier1 = (satTouches5th && jupTouches5th);
    const isTier2 = (satTouches5th && jupTouches9th) || (satTouches9th && jupTouches5th);

    if (isTier1 || isTier2) {
      sampleHits.push({
        age,
        date: sampleDate,
        tier: isTier1 ? 1 : 2,
        satSignId: trSat.signId,
        satSignName: trSat.signName,
        satRetro: trSat.isRetro,
        satHits: satHits.map(h => h.type),
        jupSignId: trJup.signId,
        jupSignName: trJup.signName,
        jupRetro: trJup.isRetro,
        jupHits: jupHits.map(h => h.type),
        isCurrent: (Math.abs(sampleDate.getTime() - nowDate.getTime()) < 20 * 24 * 3600 * 1000)
      });
    }
  }

  // 5. Cluster strictly by exact Saturn sign and Jupiter sign pairings
  // A transit window in Vedic astrology is physically bound to the specific Rasi placements of Saturn and Jupiter.
  // When either planet ingresses into a new sign, its aspects change completely.
  const windows = [];
  let currentWindow = null;

  for (let i = 0; i < sampleHits.length; i++) {
    const s = sampleHits[i];
    if (!currentWindow) {
      currentWindow = {
        startAge: s.age,
        endAge: s.age + step,
        startDate: s.date,
        endDate: s.date,
        saturnSign: s.satSignName,
        jupiterSign: s.jupSignName,
        saturnHits: s.satHits,
        jupiterHits: s.jupHits,
        bestTier: s.tier,
        sampleCount: 1,
        containsNow: s.isCurrent
      };
    } else {
      const timeGap = s.age - currentWindow.endAge;
      const sameSigns = (s.satSignName === currentWindow.saturnSign && s.jupSignName === currentWindow.jupiterSign);

      if (timeGap <= 0.12 && sameSigns) {
        currentWindow.endAge = s.age + step;
        currentWindow.endDate = s.date;
        if (s.tier < currentWindow.bestTier) currentWindow.bestTier = s.tier;
        if (s.isCurrent) currentWindow.containsNow = true;
        currentWindow.sampleCount++;
      } else {
        if (currentWindow.sampleCount >= 2) {
          windows.push(currentWindow);
        }
        currentWindow = {
          startAge: s.age,
          endAge: s.age + step,
          startDate: s.date,
          endDate: s.date,
          saturnSign: s.satSignName,
          jupiterSign: s.jupSignName,
          saturnHits: s.satHits,
          jupiterHits: s.jupHits,
          bestTier: s.tier,
          sampleCount: 1,
          containsNow: s.isCurrent
        };
      }
    }
  }
  if (currentWindow && currentWindow.sampleCount >= 2) {
    windows.push(currentWindow);
  }

  // Format windows for user display
  const formattedWindows = windows.map((w, idx) => {
    const startYearMonth = `${w.startDate.toLocaleString('default', { month: 'short' })} ${w.startDate.getFullYear()}`;
    const endYearMonth = `${w.endDate.toLocaleString('default', { month: 'short' })} ${w.endDate.getFullYear()}`;
    const allHits = Array.from(new Set([...w.saturnHits, ...w.jupiterHits]));

    let status = 'Passed (Historical Window)';
    if (w.containsNow || (w.startDate <= nowDate && nowDate <= w.endDate)) {
      status = 'Active Right Now ⭐ (High Conception / Childbirth Window)';
    } else if (w.startDate > nowDate) {
      status = 'Upcoming Window';
    }

    const durationMonths = Math.max(1, Math.round((w.endAge - w.startAge) * 12));
    const rating = w.bestTier === 1 ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐';
    const tierName = w.bestTier === 1 ? 'Tier 1 (Direct 5th House / Lord Double Transit)' : 'Tier 2 (5th–9th Dual Axis Double Transit)';

    return {
      windowId: idx + 1,
      tier: w.bestTier,
      tierName,
      ageRange: `Age ${w.startAge.toFixed(1)} – ${w.endAge.toFixed(1)}`,
      dateRange: `${startYearMonth} – ${endYearMonth}`,
      duration: `${durationMonths} months`,
      saturnPlacement: w.saturnSign,
      saturnActivations: w.saturnHits,
      jupiterPlacement: w.jupiterSign,
      jupiterActivations: w.jupiterHits,
      targetsActivated: allHits,
      rating,
      status
    };
  });

  const activeWindow = formattedWindows.find(w => w.status.includes('Active Right Now'));
  const nextUpcomingWindow = formattedWindows.find(w => w.status === 'Upcoming Window');

  return {
    birthDate: bDate.toISOString().slice(0, 10),
    sensitivePoints,
    totalWindowsFound: formattedWindows.length,
    activeWindow,
    nextUpcomingWindow,
    windows: formattedWindows
  };
}

/**
 * Fifth House Special Yogas Evaluator (Mehta Ch. 5, pp. 89-113)
 */
function checkFifthHouseYogas(planets, ascSignId, h5LordKey, h5LordHouse, h5LordSignId, savPoints, beejaKshetra) {
  const yogas = [];
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const lagnaLord = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);

  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9LordKey = getPlanetKey(SIGNS[h9SignId - 1].lord);
  const h9Lord = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);

  const h8SignId = ((ascSignId - 1 + 7) % 12) + 1;
  const h8LordKey = getPlanetKey(SIGNS[h8SignId - 1].lord);
  const h8Lord = planets.find(p => getPlanetKey(p.key || p.name) === h8LordKey);

  const h5Lord = planets.find(p => getPlanetKey(p.key || p.name) === h5LordKey);
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const mercury = planets.find(p => getPlanetKey(p.key || p.name) === 'Merc');
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const saturn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const mars = planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');

  // 1. Maha Vigyan Yoga (5th + 9th + 8th Lord association)
  if (h5Lord && h9Lord && h8Lord) {
    const lordsInSameSign = (h5Lord.signId === h9Lord.signId && h9Lord.signId === h8Lord.signId);
    const lords5and9Linked = (h5Lord.signId === h9Lord.signId || h5LordHouse === 9 || (h9Lord.signId === h5LordSignId));
    if (lordsInSameSign || (lords5and9Linked && (h8Lord.signId === h5Lord.signId || h8Lord.signId === h9Lord.signId))) {
      yogas.push({
        name: 'Maha Vigyan Yoga (Profound Scientific & Occult Discovery)',
        description: 'Lords of the 5th (intellect), 9th (higher wisdom), and 8th (hidden research) combine. Grants deep penetrating scientific acumen, invention, research breakthroughs, or esoteric mastery.',
        type: 'Auspicious / Scientific',
        source: 'Mehta, Ch. 5, p. 90 & K.N. Rao'
      });
    }
  }

  // 2. Parashari Putra Santan Yoga (Lagna Lord & 5th Lord association)
  if (lagnaLord && h5Lord) {
    if (lagnaLord.signId === h5Lord.signId || (lagnaLord.signId === h5LordSignId && h5Lord.signId === lagnaLord.signId)) {
      yogas.push({
        name: 'Parashari Putra Santan Yoga (Blessing of Virtuous Children)',
        description: 'Lagna lord and 5th lord conjoin or exchange houses (Parivartana). Fosters deep mutual love between parent and children, conferring devoted progeny who achieve high standing.',
        type: 'Auspicious / Progeny',
        source: 'Mehta, Ch. 5, p. 89; Parashara, Ch. 24'
      });
    }
  }

  // 3. Teekshna Buddhi Yoga (High Memory & Retentive Intellect)
  if (mercury && jupiter) {
    const mercDignity = getPlanetaryDignity('Merc', mercury.signId);
    const mercStrong = mercDignity.includes('Exalted') || mercDignity.includes('Own Sign');
    const jupKendra = [1, 4, 7, 10, 5, 9].includes(((jupiter.signId - ascSignId + 12) % 12) + 1);
    if (mercStrong || (jupKendra && h5LordHouse <= 10 && h5LordHouse !== 6 && h5LordHouse !== 8 && h5LordHouse !== 12)) {
      yogas.push({
        name: 'Teekshna Buddhi Yoga (Sharp Intellect & Discriminating Wit)',
        description: 'Mercury and Jupiter are fortified in Kendra/Trikona while 5th house/lord is protected from malefic dusthanas. Bestows rapid comprehension, acute memory, and logical brilliance.',
        type: 'Auspicious / Intellect',
        source: 'Mehta, Ch. 5, pp. 83-84; Jaimini Sutras'
      });
    }
  }

  // 4. Granthakara Yoga (Authorship & Epic Composition)
  if (moon && (mercury || jupiter || venus)) {
    const h5SignId = ((ascSignId - 1 + 4) % 12) + 1;
    const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
    const moonIn5or9 = (moon.signId === h5SignId || moon.signId === h9SignId);
    const moonWithLiterary = (mercury && moon.signId === mercury.signId) || (venus && moon.signId === venus.signId) || (jupiter && moon.signId === jupiter.signId);
    if (moonIn5or9 || (moonWithLiterary && (h5LordHouse === 5 || h5LordHouse === 9 || h5LordHouse === 1 || h5LordHouse === 11))) {
      yogas.push({
        name: 'Granthakara & Saraswati Sahitya Yoga (Authorship & Literary Mastery)',
        description: 'Moon combines with literary planets (Mercury, Venus, or Jupiter) in trines or associations with the 5th house. Grants authorial eloquence, poetic inspiration, and publication of celebrated works.',
        type: 'Auspicious / Literary',
        source: 'Mehta, Ch. 5, pp. 82-83; Jaimini & Parashara'
      });
    }
  }

  // 5. Anapathya Yoga / Progeny Denial Warning
  if (saturn && moon) {
    const h5SignId = ((ascSignId - 1 + 4) % 12) + 1;
    if (saturn.signId === h5SignId) {
      const moonAspects = ((moon.signId - 1 + 6) % 12) + 1 === saturn.signId;
      if (moonAspects) {
        yogas.push({
          name: 'Anapathya Yoga Warning (Classical Child Delay / Obstacle Combination)',
          description: 'Saturn in 5th house aspected by the Moon. Classical texts (Mantreswara & Mehta) warn that this combination delays childbirth or brings anxieties regarding progeny longevity unless Jupiter casts protective aspect.',
          type: 'Inauspicious / Progeny Caution',
          source: 'Mehta, Ch. 5, p. 94; Mantreswara (Phala Deepika)'
        });
      }
    }
  }

  // 6. Sarpa Dosha / Rahu in 5th with Mars association
  if (rahu) {
    const h5SignId = ((ascSignId - 1 + 4) % 12) + 1;
    if (rahu.signId === h5SignId) {
      const isMarsSign = (h5SignId === 1 || h5SignId === 8);
      const marsAspects5 = mars && [1, 4, 7, 8].includes(((h5SignId - mars.signId + 12) % 12) + 1);
      if (isMarsSign || marsAspects5) {
        yogas.push({
          name: 'Sarpa Dosha / Rahu Putra Badha Yoga (Karmic Progeny Delay)',
          description: 'Rahu occupies 5th house in a sign of Mars or is aspected by Mars. Indicates ancestral or karmic delay in family continuation; propitiation of Lord Subramanya or classical remedies recommended.',
          type: 'Inauspicious / Karmic Debt',
          source: 'Mehta, Ch. 5, p. 94; Brihat Parashara'
        });
      }
    }
  }

  return yogas;
}

/**
 * Sixth House Special Yogas Evaluator (Mehta Ch. 6, pp. 114-123)
 */
function checkSixthHouseYogas(planets, ascSignId, h6LordKey, h6LordHouse, h6LordSignId, savPoints = null) {
  const yogas = [];
  const h6SignId = ((ascSignId - 1 + 5) % 12) + 1;
  const h6Lord = planets.find(p => getPlanetKey(p.key || p.name) === h6LordKey);
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const lagnaLord = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);

  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const saturn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const mars = planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');
  const ketu = planets.find(p => getPlanetKey(p.key || p.name) === 'Ketu');

  // 1. Harsha Vipareeta Raja Yoga (6th lord in 6th, 8th, or 12th)
  if (h6Lord && [6, 8, 12].includes(h6LordHouse)) {
    const kendraTrikonaLordKeys = [1, 4, 7, 10, 5, 9].map(h => {
      const sId = ((ascSignId - 1 + (h - 1)) % 12) + 1;
      return getPlanetKey(SIGNS[sId - 1].lord);
    }).filter(k => k !== h6LordKey);

    const conjoinedWithKendraTrikona = planets.some(p => {
      const k = getPlanetKey(p.key || p.name);
      return kendraTrikonaLordKeys.includes(k) && p.signId === h6Lord.signId && k !== lagnaLordKey;
    });

    const isPure = !conjoinedWithKendraTrikona;
    const cond = `6th Lord (${h6LordKey}) is posited in Dusthana House ${h6LordHouse}${isPure ? ' unassociated with Kendra/Trikona lords' : ''}.`;
    const eff = 'Destroys adversaries, grants sudden elevation, sound physical stamina, and victory in litigation or disputes.';
    yogas.push({
      name: isPure ? 'Harsha Vipareeta Raja Yoga (Triumph over Adversity)' : 'Harsha Yoga (Mixed Vipareeta Dynamics)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Vipareeta Raja Yoga',
      source: 'Phala Deepika, Ch. 6, Sl. 63; Mehta, Ch. 6, p. 116'
    });
  }

  // 2. Shatru Jayi Yoga (Natural Malefics in 6th House - Upachaya Valour)
  const maleficsIn6 = [];
  if (mars && mars.signId === h6SignId) maleficsIn6.push('Mars (Kuja)');
  if (saturn && saturn.signId === h6SignId) maleficsIn6.push('Saturn (Shani)');
  if (sun && sun.signId === h6SignId) maleficsIn6.push('Sun (Surya)');
  if (rahu && rahu.signId === h6SignId) maleficsIn6.push('Rahu');
  if (ketu && ketu.signId === h6SignId) maleficsIn6.push('Ketu');

  if (maleficsIn6.length > 0) {
    const cond = `Natural malefic (${maleficsIn6.join(' & ')}) posited in the 6th Upachaya house.`;
    const eff = 'Endows the native with supreme competitive grit, court triumphs, fearlessness against hostile forces, and ability to crush opposition (Mehta p. 114).';
    yogas.push({
      name: `Shatru Jayi Yoga (${maleficsIn6.join(' & ')} in Shatru Bhava)`,
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Upachaya Valour',
      source: 'Mehta, Ch. 6, p. 114; Parashara, Ch. 24'
    });
  }

  // 3. Guru in Shatru Bhava (The Great Healer & Career Catalyst - Nehru Combination)
  if (jupiter && jupiter.signId === h6SignId) {
    const cond = 'Jupiter resides in the 6th house casting its 5th trinal drishti on the 10th House of Karma.';
    const eff = 'Bestows political elevation, high public recognition, victory over enmity through moral prestige, and healing beneficence (as in Pt. Nehru\'s horoscope).';
    yogas.push({
      name: 'Guru in Shatru Bhava (The Great Healer & Career Catalyst)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Statesman & Healer',
      source: 'Mehta, Ch. 6, pp. 115, 119; Bhavartha Ratnakara'
    });
  }

  // 4. Venus in 6th House (Dhana Paradox & Renal Sensitivity)
  if (venus && venus.signId === h6SignId) {
    const isVenStrong = [2, 7, 12].includes(h6SignId);
    const cond = `Venus occupies the 6th house in ${isVenStrong ? 'own/exalted sign' : 'general sign'}.`;
    const eff = isVenStrong
      ? 'According to Bhavartha Ratnakara and Mehta (p. 115), Venus in 6th confers wealth, diplomatic brilliance, and cheerful victory.'
      : 'Generates proud adversaries and expenditures. Classical texts advise caution regarding renal, urinary, and reproductive balance (Mehta p. 119).';
    yogas.push({
      name: isVenStrong ? 'Shukra in 6th (Dhana Fruition in Swakshetra/Exaltation)' : 'Shukra in 6th (Competitive Enmity & Expenditure Paradox)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: isVenStrong ? 'Auspicious / Dhana' : 'Mixed / Health & Expenditure',
      source: 'Mehta, Ch. 6, pp. 115, 119; Bhavartha Ratnakara'
    });
  }

  // 5. Lagna Lord vs 6th Lord Competitive Balance (Cardinal Mehta Rule)
  if (lagnaLord && h6Lord) {
    const lagnaLordHouse = ((lagnaLord.signId - ascSignId + 12) % 12) + 1;
    const isLagnaLordInKendraTrikona = [1, 4, 7, 10, 5, 9, 11].includes(lagnaLordHouse);
    const isLagnaConjoined6th = lagnaLord.signId === h6Lord.signId;

    if (isLagnaConjoined6th) {
      const cond = `Lagna lord (${lagnaLordKey}) conjoins the 6th lord (${h6LordKey}) in House ${lagnaLordHouse}.`;
      const eff = 'Causes physical sensitivity or periodic litigation during mutual dasha periods, requiring mindful health maintenance (Mehta p. 120).';
      yogas.push({
        name: 'Lagna Lord & 6th Lord Conjunction (Physical Sensitivity & Sovereign Friction)',
        condition: cond,
        effects: eff,
        description: `${cond} ${eff}`,
        type: 'Inauspicious / Health & Dispute',
        source: 'Mehta, Ch. 6, p. 120; Parashara, Ch. 24'
      });
    } else if (isLagnaLordInKendraTrikona && (h6LordHouse === 6 || h6LordHouse === 8 || h6LordHouse === 12 || h6LordHouse === 3)) {
      const cond = `Ascendant lord in auspicious House ${lagnaLordHouse} while 6th lord is subdued in Dusthana/Upachaya House ${h6LordHouse}.`;
      const eff = 'Fulfills Mehta\'s cardinal rule (p. 114): Lagna dominates the 6th lord, ensuring the native ultimately prevails over all competitive obstacles, rivals, and health ailments.';
      yogas.push({
        name: 'Shatru Hanta Balance (Ascendant Lord Dominates 6th Lord)',
        condition: cond,
        effects: eff,
        description: `${cond} ${eff}`,
        type: 'Auspicious / Competitive Dominance',
        source: 'Mehta, Ch. 6, p. 114'
      });
    }
  }

  // 6. I.K. Gujral Combination (6th Lord in 11th House - High Judicial/State Authority)
  if (h6LordHouse === 11) {
    const cond = `6th lord (${h6LordKey}) is posited in the 11th house of gains.`;
    const eff = 'Bestows high academic and professional qualifications, executive efficiency, and authority in judicial, administrative, or state apparatus (e.g. former PM I.K. Gujral).';
    yogas.push({
      name: 'Upachaya Adhikara Yoga (6th Lord in 11th House)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Executive Authority',
      source: 'Mehta, Ch. 6, p. 117'
    });
  }

  return yogas;
}

/**
 * Classical Ayur-Jyotish Medical Vulnerability Evaluator (Mehta Ch. 6, pp. 118-120)
 */
export function calculateMedicalVulnerabilityProfile(planets, ascSignId, h6SignId, h6LordKey) {
  const h6Lord = planets.find(p => getPlanetKey(p.key || p.name) === h6LordKey);
  const h6Occupants = planets.filter(p => p.signId === h6SignId && getPlanetKey(p.key || p.name) !== 'ASC');

  const ORGAN_MAP = {
    'Sun': { dosha: 'Pitta (Fire)', organs: ['Heart & Circulation', 'Bones & Spine', 'Eyesight', 'General Vitality (Prana)'], risk: 'Inflammatory fevers, cardiac sensitivity, eye strain, sluggish convalescence if afflicted by Saturn.' },
    'Moon': { dosha: 'Kapha / Vata (Fluids)', organs: ['Lungs & Respiratory tract', 'Gastric secretions (Jatharagni)', 'Emotional serenity', 'Blood fluids'], risk: 'Phlegmatic congestion, digestive sluggishness, mental anxieties, Balaristha vulnerability in childhood.' },
    'Mars': { dosha: 'Pitta (Blood & Bile)', organs: ['Muscular system', 'Blood marrow (Rakta Dhatu)', 'Bile secretions', 'Head & Cranium'], risk: 'Acute fevers, inflammatory boils, muscular injury, surgical operations, accidental burns or cuts.' },
    'Merc': { dosha: 'Vata / Pitta (Nervous)', organs: ['Nervous system', 'Skin & Integumentary', 'Speech centers', 'Lower intestines & Bowels'], risk: 'Nervous exhaustion, tremors, skin eruptions, dyspepsia, generative system sensitivity.' },
    'Jupt': { dosha: 'Kapha (Growth & Lipids)', organs: ['Liver (Yakrit) & Gallbladder', 'Pancreas & Insulin', 'Arterial lipid balance', 'Ears & Hearing'], risk: 'Sluggish hepatic metabolism, diabetes, lipid/cholesterol imbalance, weak digestive assimilation.' },
    'Venu': { dosha: 'Vata / Kapha (Renal & Reproductive)', organs: ['Kidneys & Renal system', 'Ovaries & Reproductive fluids (Shukra)', 'Urinary bladder', 'Throat'], risk: 'Renal/kidney sensitivities, urinary tract irritation, reproductive fluid depletion from excess indulgence.' },
    'Satn': { dosha: 'Vata (Wind & Cold)', organs: ['Skeletal joints & Cartilage', 'Teeth & Knees', 'Large intestine & Colon', 'Neuromuscular stamina'], risk: 'Chronic rheumatic stiffness, arthritis, constipation, sluggish elimination, lingering conditions.' },
    'Rahu': { dosha: 'Vata / Environmental', organs: ['Immune defense against toxins', 'Rectal region', 'Teeth & Throat', 'Psychosomatic nerves'], risk: 'Unusual or undiagnosed allergic sensitivities, food/chemical toxicity, venom/insect sensitivity.' },
    'Ketu': { dosha: 'Pitta / Vata (Subtle)', organs: ['Microbial resistance', 'Spinal subtle channels', 'Abdominal appendix', 'Cellular regeneration'], risk: 'Sudden high fevers, mysterious diagnostic dilemmas, skin itchiness, microbial infections.' }
  };

  const primaryVulnerabilities = [];

  // Check occupants of 6th house
  for (const occ of h6Occupants) {
    const k = getPlanetKey(occ.key || occ.name);
    if (ORGAN_MAP[k]) {
      primaryVulnerabilities.push({
        source: `${occ.name || k} residing in 6th House`,
        dosha: ORGAN_MAP[k].dosha,
        organs: ORGAN_MAP[k].organs,
        clinicalNotes: ORGAN_MAP[k].risk
      });
    }
  }

  // Check 6th lord
  if (h6Lord) {
    const k = getPlanetKey(h6Lord.key || h6Lord.name);
    if (ORGAN_MAP[k] && !primaryVulnerabilities.some(v => v.source.includes(k))) {
      primaryVulnerabilities.push({
        source: `${h6Lord.name || k} as 6th House Lord`,
        dosha: ORGAN_MAP[k].dosha,
        organs: ORGAN_MAP[k].organs,
        clinicalNotes: `Governs primary constitutional disease potential: ${ORGAN_MAP[k].risk}`
      });
    }
  }

  const baseHouseOrgans = ['Lower Abdomen & Intestines', 'Kidneys & Renal System', 'Groin & Navel Region', 'Immune Cellular Defense'];

  return {
    houseSignName: SIGNS[h6SignId - 1].name,
    houseSignLord: h6LordKey,
    primaryHouseOrgans: baseHouseOrgans,
    vulnerabilities: primaryVulnerabilities
  };
}

/**
 * Classical K.N. Rao Double Transit Timing Engine for Marriage (Vivaha Samskara)
 * Ground truth: K.N. Rao & M.S. Mehta, Ch. 7, p. 147
 *
 * Scans ages 18 to 45 in 1-month discrete steps to detect simultaneous Saturn & Jupiter
 * aspects/transits to the 4 Marriage Sensitive Points:
 * 1. Lagna / Lagna Lord
 * 2. 7th House / 7th Lord
 * 3. Kalatra Karaka Venus (and Pati Karaka Jupiter in female charts)
 * 4. Upapada Lagna (UL)
 */
export function calculateMarriageTransitWindows(planets, ascSignId, birthDateStr, gender = 'male', startAge = 18, endAge = 45) {
  const l1LordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const l1Planet = planets.find(p => getPlanetKey(p.key || p.name) === l1LordKey);
  const l1SignId = l1Planet ? l1Planet.signId : ascSignId;

  const h7SignId = ((ascSignId - 1 + 6) % 12) + 1;
  const h7LordKey = getPlanetKey(SIGNS[h7SignId - 1].lord);
  const l7Planet = planets.find(p => getPlanetKey(p.key || p.name) === h7LordKey);
  const l7SignId = l7Planet ? l7Planet.signId : h7SignId;

  const venu = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const jupt = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');

  let ulSignId = null;
  try {
    const padas = calculateJaiminiPadas(ascSignId - 1, planets);
    if (padas && padas.UL) ulSignId = padas.UL.signIndex + 1;
  } catch (e) {}

  const sensitivePoints = [
    { type: '7th House', signId: h7SignId, signName: SIGNS[h7SignId - 1].name },
    { type: `7th Lord (${h7LordKey})`, signId: l7SignId, signName: SIGNS[l7SignId - 1].name },
    { type: '1st House (Lagna)', signId: ascSignId, signName: SIGNS[ascSignId - 1].name },
    { type: `Lagna Lord (${l1LordKey})`, signId: l1SignId, signName: SIGNS[l1SignId - 1].name },
    { type: 'Kalatra Karaka (Venus)', signId: venu ? venu.signId : h7SignId, signName: venu ? SIGNS[venu.signId - 1].name : SIGNS[h7SignId - 1].name }
  ];
  if (gender === 'female' && jupt) {
    sensitivePoints.push({ type: 'Pati Karaka (Jupiter)', signId: jupt.signId, signName: SIGNS[jupt.signId - 1].name });
  }
  if (ulSignId) {
    sensitivePoints.push({ type: 'Upapada Lagna (UL)', signId: ulSignId, signName: SIGNS[ulSignId - 1].name });
  }

  let bDate = null;
  if (birthDateStr) {
    const parsed = new Date(birthDateStr);
    if (!isNaN(parsed.getTime())) bDate = parsed;
  }
  if (!bDate) {
    const currentYear = new Date().getFullYear();
    bDate = new Date(`${currentYear - 25}-01-01T00:00:00Z`);
  }

  const getSaturnAspects = (satSignId, isRetro) => {
    const set = new Set();
    const addAspects = (baseSign) => {
      set.add(baseSign); // 1st / conjunct
      set.add(((baseSign - 1 + 2) % 12) + 1); // 3rd aspect
      set.add(((baseSign - 1 + 6) % 12) + 1); // 7th aspect
      set.add(((baseSign - 1 + 9) % 12) + 1); // 10th aspect
    };
    addAspects(satSignId);
    if (isRetro) {
      const prevSign = ((satSignId - 2 + 12) % 12) + 1;
      addAspects(prevSign);
    }
    return set;
  };

  const getJupiterAspects = (jupSignId, isRetro) => {
    const set = new Set();
    const addAspects = (baseSign) => {
      set.add(baseSign); // 1st / conjunct
      set.add(((baseSign - 1 + 4) % 12) + 1); // 5th aspect
      set.add(((baseSign - 1 + 6) % 12) + 1); // 7th aspect
      set.add(((baseSign - 1 + 8) % 12) + 1); // 9th aspect
    };
    addAspects(jupSignId);
    if (isRetro) {
      const prevSign = ((jupSignId - 2 + 12) % 12) + 1;
      addAspects(prevSign);
    }
    return set;
  };

  const step = 1 / 12;
  const sampleHits = [];
  const nowDate = new Date();

  for (let age = startAge; age <= endAge; age += step) {
    const targetMs = bDate.getTime() + (age * 365.25 * 24 * 3600 * 1000);
    const sampleDate = new Date(targetMs);

    let tr = null;
    try {
      tr = calculateTransits(sampleDate);
    } catch (e) {
      continue;
    }
    if (!tr || !tr.planets) continue;

    const trSat = tr.planets.find(p => p.key === 'Satn');
    const trJup = tr.planets.find(p => p.key === 'Jupt');
    if (!trSat || !trJup) continue;

    const satAspects = getSaturnAspects(trSat.signId, trSat.isRetro);
    const jupAspects = getJupiterAspects(trJup.signId, trJup.isRetro);

    const satHits = sensitivePoints.filter(pt => satAspects.has(pt.signId));
    const jupHits = sensitivePoints.filter(pt => jupAspects.has(pt.signId));

    if (satHits.length === 0 || jupHits.length === 0) continue;

    const satDirect = satHits.some(h => h.type.includes('7th') || h.type.includes('1st') || h.type.includes('Lagna'));
    const jupDirect = jupHits.some(h => h.type.includes('7th') || h.type.includes('1st') || h.type.includes('Lagna'));
    const satKaraka = satHits.some(h => h.type.includes('Karaka') || h.type.includes('Upapada'));
    const jupKaraka = jupHits.some(h => h.type.includes('Karaka') || h.type.includes('Upapada'));

    let tier = 0;
    let tierName = '';
    let ratingStars = '⭐⭐⭐';

    if (satDirect && jupDirect) {
      tier = 1;
      tierName = 'Direct 1st/7th Matrimonial Axis';
      ratingStars = '⭐⭐⭐⭐⭐';
    } else if ((satDirect && jupKaraka) || (satKaraka && jupDirect)) {
      tier = 2;
      tierName = 'Axis & Karaka/Upapada Dual Sanction';
      ratingStars = '⭐⭐⭐⭐';
    } else if (satKaraka && jupKaraka) {
      tier = 3;
      tierName = 'Karaka & Upapada Alignment';
      ratingStars = '⭐⭐⭐';
    }

    if (tier > 0) {
      sampleHits.push({
        age,
        date: sampleDate,
        satSignId: trSat.signId,
        satSignName: SIGNS[trSat.signId - 1].name,
        satActivations: Array.from(new Set(satHits.map(h => h.type))),
        jupSignId: trJup.signId,
        jupSignName: SIGNS[trJup.signId - 1].name,
        jupActivations: Array.from(new Set(jupHits.map(h => h.type))),
        tier,
        tierName,
        ratingStars
      });
    }
  }

  // Group continuous monthly samples with identical transit signs into discrete windows
  const windows = [];
  if (sampleHits.length > 0) {
    let curWindow = null;

    for (let i = 0; i < sampleHits.length; i++) {
      const hit = sampleHits[i];
      if (!curWindow) {
        curWindow = {
          startAge: hit.age,
          endAge: hit.age,
          startDate: hit.date,
          endDate: hit.date,
          satSignId: hit.satSignId,
          satSignName: hit.satSignName,
          satActivations: new Set(hit.satActivations),
          jupSignId: hit.jupSignId,
          jupSignName: hit.jupSignName,
          jupActivations: new Set(hit.jupActivations),
          tier: hit.tier,
          tierName: hit.tierName,
          ratingStars: hit.ratingStars
        };
      } else {
        const ageDiff = hit.age - curWindow.endAge;
        const sameSigns = hit.satSignId === curWindow.satSignId && hit.jupSignId === curWindow.jupSignId;

        if (ageDiff <= (step * 1.5) && sameSigns) {
          curWindow.endAge = hit.age;
          curWindow.endDate = hit.date;
          hit.satActivations.forEach(a => curWindow.satActivations.add(a));
          hit.jupActivations.forEach(a => curWindow.jupActivations.add(a));
          if (hit.tier < curWindow.tier) {
            curWindow.tier = hit.tier;
            curWindow.tierName = hit.tierName;
            curWindow.ratingStars = hit.ratingStars;
          }
        } else {
          windows.push(curWindow);
          curWindow = {
            startAge: hit.age,
            endAge: hit.age,
            startDate: hit.date,
            endDate: hit.date,
            satSignId: hit.satSignId,
            satSignName: hit.satSignName,
            satActivations: new Set(hit.satActivations),
            jupSignId: hit.jupSignId,
            jupSignName: hit.jupSignName,
            jupActivations: new Set(hit.jupActivations),
            tier: hit.tier,
            tierName: hit.tierName,
            ratingStars: hit.ratingStars
          };
        }
      }
    }
    if (curWindow) windows.push(curWindow);
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedWindows = windows.map((w, idx) => {
    const sMonth = monthNames[w.startDate.getMonth()];
    const sYear = w.startDate.getFullYear();
    const eMonth = monthNames[w.endDate.getMonth()];
    const eYear = w.endDate.getFullYear();

    const dateRange = (sYear === eYear && sMonth === eMonth)
      ? `${sMonth} ${sYear}`
      : `${sMonth} ${sYear} – ${eMonth} ${eYear}`;

    const durMonths = Math.max(1, Math.round((w.endAge - w.startAge) * 12) + 1);
    const duration = durMonths === 1 ? '1 month' : `${durMonths} months`;
    const ageRange = `Age ${w.startAge.toFixed(1)} – ${(w.endAge + step).toFixed(1)}`;

    const isActive = nowDate >= w.startDate && nowDate <= new Date(w.endDate.getTime() + (step * 365.25 * 24 * 3600 * 1000));
    const isUpcoming = w.startDate > nowDate;
    const status = isActive ? 'Active Right Now ⭐' : (isUpcoming ? 'Upcoming High Probability' : 'Passed / Historical');

    return {
      id: `m-window-${idx + 1}`,
      dateRange,
      ageRange,
      duration,
      saturnPlacement: `${w.satSignName}`,
      saturnActivations: Array.from(w.satActivations),
      jupiterPlacement: `${w.jupSignName}`,
      jupiterActivations: Array.from(w.jupActivations),
      tier: w.tier,
      tierName: w.tierName,
      rating: w.ratingStars,
      status,
      startDate: w.startDate,
      endDate: w.endDate
    };
  });

  const activeWindow = formattedWindows.find(w => w.status.includes('Active Right Now')) || null;
  const nextUpcomingWindow = formattedWindows.find(w => w.status.includes('Upcoming')) || null;

  return {
    totalWindowsFound: formattedWindows.length,
    sensitivePoints,
    activeWindow,
    nextUpcomingWindow,
    windows: formattedWindows
  };
}

/**
 * Classical Kuja Dosha (Manglik) Diagnostic Engine
 * Ground truth: Dr. B.V. Raman (Electional Astrology) & MS Mehta, Ch. 7, pp. 148-155
 */
export function calculateKujaDoshaProfile(planets, ascSignId) {
  const mars = planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  if (!mars) {
    return {
      hasKujaDosha: false,
      isCancelled: true,
      verdict: 'No Mars position identified',
      cancellationReasons: []
    };
  }

  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  const venu = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const jupt = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');

  const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

  const hFromLagna = (((mars.signId - ascSignId + 12) % 12) + 1);
  const isFromLagna = MANGLIK_HOUSES.includes(hFromLagna);

  let hFromMoon = null;
  let isFromMoon = false;
  if (moon) {
    hFromMoon = (((mars.signId - moon.signId + 12) % 12) + 1);
    isFromMoon = MANGLIK_HOUSES.includes(hFromMoon);
  }

  let hFromVenus = null;
  let isFromVenus = false;
  if (venu) {
    hFromVenus = (((mars.signId - venu.signId + 12) % 12) + 1);
    isFromVenus = MANGLIK_HOUSES.includes(hFromVenus);
  }

  const rawKujaDosha = isFromLagna || isFromMoon || isFromVenus;

  // Evaluate Classical Cancellations (Dr. B.V. Raman & Mehta pp. 150-151)
  const cancellationReasons = [];

  // 1. In 2nd house in Gemini (3) or Virgo (6)
  if (hFromLagna === 2 && [3, 6].includes(mars.signId)) {
    cancellationReasons.push('Mars in 2nd house occupies Gemini or Virgo (Mercury signs), nullifying Kuja Dosha (Raman Rule 1).');
  }

  // 2. In 4th house in Aries (1) or Scorpio (8)
  if (hFromLagna === 4 && [1, 8].includes(mars.signId)) {
    cancellationReasons.push('Mars in 4th house occupies its own sign (Aries/Scorpio), generating Ruchaka Yoga and canceling Kuja Dosha (Raman Rule 2).');
  }

  // 3. In 7th house in Cancer (4) or Capricorn (10)
  if (hFromLagna === 7 && [4, 10].includes(mars.signId)) {
    cancellationReasons.push('Mars in 7th occupies Cancer (debilitation) or Capricorn (exaltation), completely neutralizing Kuja Dosha (Raman Rule 3).');
  }

  // 4. In 8th house in Sagittarius (9) or Pisces (12)
  if (hFromLagna === 8 && [9, 12].includes(mars.signId)) {
    cancellationReasons.push('Mars in 8th house occupies signs of Jupiter (Sagittarius/Pisces), conferring Saubhagya and nullifying Kuja Dosha (Raman Rule 4).');
  }

  // 5. In 12th house in Taurus (2) or Libra (7)
  if (hFromLagna === 12 && [2, 7].includes(mars.signId)) {
    cancellationReasons.push('Mars in 12th house occupies Venusian signs (Taurus/Libra), preventing bed-pleasure affliction (Raman Rule 5).');
  }

  // 6. Mars in Leo (5) or Aquarius (11) in any house
  if ([5, 11].includes(mars.signId)) {
    cancellationReasons.push('Mars in Leo or Aquarius is considered harmless and free from Kuja Dosha across all treatises (Raman Rule 6).');
  }

  // 7. Mars in own house (1, 8) or exalted (10)
  if ([1, 8, 10].includes(mars.signId) && !cancellationReasons.some(r => r.includes('own sign') || r.includes('exaltation'))) {
    cancellationReasons.push('Mars is posited in its own Swakshetra (Aries/Scorpio) or Exalted (Capricorn), converting aggression into noble protection (Raman Rule 7).');
  }

  // 8. Conjunction of Mars with Jupiter or Moon
  if (jupt && jupt.signId === mars.signId) {
    cancellationReasons.push('Guru-Mangala Yoga: Conjunction of Mars with benefic Jupiter completely purifies Martian volatility (Raman Rule 6 & Mehta p. 151).');
  }
  if (moon && moon.signId === mars.signId) {
    cancellationReasons.push('Chandra-Mangala Yoga: Conjunction of Mars with Moon counteracts Kuja Dosha (Raman Rule 6).');
  }

  // 9. Aspect of Jupiter on Mars
  if (jupt && jupt.signId !== mars.signId) {
    const jupAspectDist = (((mars.signId - jupt.signId + 12) % 12) + 1);
    if ([5, 7, 9].includes(jupAspectDist)) {
      cancellationReasons.push(`Mars receives the divine ${jupAspectDist === 5 ? '5th' : (jupAspectDist === 7 ? '7th' : '9th')} trinal drishti of Jupiter, neutralizing Kuja Dosha (Mehta p. 151).`);
    }
  }

  const isCancelled = cancellationReasons.length > 0;
  let verdict = 'No Kuja Dosha';
  if (rawKujaDosha) {
    verdict = isCancelled
      ? 'Kuja Dosha Neutralized (Cancelled by Classical Exceptions)'
      : 'Active Kuja Dosha (Horoscope Matching Advised)';
  }

  return {
    hasKujaDosha: rawKujaDosha,
    isCancelled,
    cancellationReasons,
    fromLagna: { house: hFromLagna, isManglik: isFromLagna },
    fromMoon: { house: hFromMoon, isManglik: isFromMoon },
    fromVenus: { house: hFromVenus, isManglik: isFromVenus },
    marsSignName: SIGNS[mars.signId - 1].name,
    marsDignity: getPlanetaryDignity('Mars', mars.signId),
    verdict
  };
}

/**
 * Classical Marital Harmony & Partnership Evaluator
 * Ground truth: MS Mehta Ch. 7, pp. 132-138 & Maharishi Parashara
 */
export function calculateMaritalHarmonyProfile(planets, ascSignId, h7LordKey) {
  const l1Key = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const l1Planet = planets.find(p => getPlanetKey(p.key || p.name) === l1Key);
  const h7Planet = planets.find(p => getPlanetKey(p.key || p.name) === h7LordKey);
  const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const venu = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');

  let mutualDisposition = 'Neutral';
  let dispositionType = 'Harmonious';
  let dispositionNote = '';

  if (l1Planet && h7Planet) {
    const distFromL1 = (((h7Planet.signId - l1Planet.signId + 12) % 12) + 1);
    const distFromH7 = (((l1Planet.signId - h7Planet.signId + 12) % 12) + 1);

    if (distFromL1 === 6 || distFromL1 === 8) {
      mutualDisposition = '6/8 Shadashtaka';
      dispositionType = 'Discordant / Friction Warning';
      dispositionNote = `Lagna Lord (${l1Key}) and 7th Lord (${h7LordKey}) are in a 6/8 mutual disposition (${distFromL1}th & ${distFromH7}th from each other). Mehta notes on p. 135 that this creates ideological distance or marital friction unless fortified by benefics.`;
    } else if (distFromL1 === 2 || distFromL1 === 12) {
      mutualDisposition = '2/12 Dwirdwadasa';
      dispositionType = 'Mixed / Expenditure & Distance';
      dispositionNote = `Lagna Lord (${l1Key}) and 7th Lord (${h7LordKey}) are in a 2/12 relationship (${distFromL1}th & ${distFromH7}th), indicating domestic expenditures or travelling distance between partners.`;
    } else if (distFromL1 === 1) {
      mutualDisposition = '1/1 Conjunction (Yuti)';
      dispositionType = 'Intense Close Association';
      dispositionNote = `Lagna Lord (${l1Key}) and 7th Lord (${h7LordKey}) are conjunct in ${SIGNS[l1Planet.signId - 1].name}. Creates deep mutual entanglement and shared life path.`;
    } else if (distFromL1 === 7) {
      mutualDisposition = '1/7 Samasaptaka';
      dispositionType = 'Direct Mutual Attraction';
      dispositionNote = `Lagna Lord (${l1Key}) and 7th Lord (${h7LordKey}) directly face and aspect each other across the 1/7 axis, promoting mutual respect and natural attraction.`;
    } else if (distFromL1 === 5 || distFromL1 === 9) {
      mutualDisposition = '5/9 Navapanchama';
      dispositionType = 'Auspicious Dharma-Kama Harmony';
      dispositionNote = `Lagna Lord (${l1Key}) and 7th Lord (${h7LordKey}) are in trinal 5/9 disposition, indicating natural affection, mutual respect, and divine blessings for the union.`;
    } else if (distFromL1 === 3 || distFromL1 === 11) {
      mutualDisposition = '3/11 Trina-Ekadasha';
      dispositionType = 'Cooperative Growth & Friendship';
      dispositionNote = `Lagna Lord (${l1Key}) and 7th Lord (${h7LordKey}) form a 3/11 friendly bond, indicating mutual encouragement, financial synergy, and shared growth.`;
    } else if (distFromL1 === 4 || distFromL1 === 10) {
      mutualDisposition = '4/10 Kendra Alignment';
      dispositionType = 'Shared Duty & Public Status';
      dispositionNote = `Lagna Lord and 7th Lord are in mutual kendras (4th & 10th), fostering a strong public partnership and shared family obligations.`;
    }
  }

  // Karaka Venus Evaluation
  const venusHealth = [];
  if (venu) {
    if (sun && sun.signId === venu.signId) {
      const sunDeg = sun.degInSign !== undefined ? sun.degInSign : (sun.longitude ? (sun.longitude % 30) : 15);
      const venDeg = venu.degInSign !== undefined ? venu.degInSign : (venu.longitude ? (venu.longitude % 30) : 15);
      const diff = Math.abs(sunDeg - venDeg);
      if (diff <= 8) {
        const isFiery = [1, 5, 9].includes(venu.signId);
        venusHealth.push({
          status: isFiery ? 'Combust in Fiery Sign (Severe Astrological Caution)' : 'Combust with Sun (Astamgata)',
          note: isFiery
            ? `Venus is combust with Sun in fiery ${SIGNS[venu.signId - 1].name}. Mehta (p. 134) states Sun is the worst enemy of Venus in marital matters in fiery signs, requiring conscious patience during mutual Dashas.`
            : `Venus is within ${diff.toFixed(1)}° of the Sun. Classical texts advise balancing emotional expectations and nurturing spousal harmony.`
        });
      }
    }
    if ([2, 7, 12].includes(venu.signId)) {
      venusHealth.push({
        status: 'Fortified in Swakshetra / Exaltation',
        note: `Venus occupies ${SIGNS[venu.signId - 1].name}, blessing the native with romantic devotion, artistic taste, and gracious partner.`
      });
    } else if (venu.signId === 6) {
      venusHealth.push({
        status: 'Debilitated in Virgo (Neecha)',
        note: 'Venus occupies Virgo. Requires cultivating emotional contentment and avoiding hyper-critical tendencies in intimate relationships.'
      });
    }
  }

  // Upapada Lagna (UL) and Darapada (A7) from Jaimini
  let padas = null;
  let ulSustenanceNote = '';
  try {
    padas = calculateJaiminiPadas(ascSignId - 1, planets);
    if (padas && padas.UL) {
      const ulSignId = padas.UL.signIndex + 1;
      const h2FromULSignId = ((ulSignId) % 12) + 1;
      const occ2FromUL = planets.filter(p => p.signId === h2FromULSignId && getPlanetKey(p.key || p.name) !== 'ASC');
      const benefics2 = occ2FromUL.filter(p => NATURAL_BENEFICS.includes(getPlanetKey(p.key || p.name)));
      const malefics2 = occ2FromUL.filter(p => ['Sun', 'Mars', 'Satn', 'Rahu', 'Ketu'].includes(getPlanetKey(p.key || p.name)));

      if (benefics2.length > 0 && malefics2.length === 0) {
        ulSustenanceNote = `2nd from Upapada (${SIGNS[h2FromULSignId - 1].name}) is blessed by benefics (${benefics2.map(p => p.name || p.key).join(', ')}), ensuring lifelong sustenance, marital stability, and family harmony (Jaimini Sutras).`;
      } else if (malefics2.length > 0) {
        ulSustenanceNote = `2nd from Upapada (${SIGNS[h2FromULSignId - 1].name}) is occupied by malefics (${malefics2.map(p => p.name || p.key).join(', ')}). Jaimini and Mehta recommend classical remedies (such as fasting on the day of Upapada Lord) to protect marital longevity.`;
      } else {
        ulSustenanceNote = `2nd from Upapada is free from direct malefic occupation; marital longevity operates primarily through the dignity of the 7th and UL lords.`;
      }
    }
  } catch (e) {}

  return {
    mutualDisposition,
    dispositionType,
    dispositionNote,
    venusHealth,
    jaiminiPadas: padas,
    ulSustenanceNote
  };
}

/**
 * Classical Seventh House Yogas Evaluator (Mehta Ch. 7, pp. 124-164)
 */
function checkSeventhHouseYogas(planets, ascSignId, h7LordKey, h7LordHouse, h7LordSignId, extraContext = {}) {
  const yogas = [];
  const h7SignId = ((ascSignId - 1 + 6) % 12) + 1;
  const h7Lord = planets.find(p => getPlanetKey(p.key || p.name) === h7LordKey);
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const lagnaLord = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);

  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const saturn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const mars = planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');

  // 1. Malavya Mahapurusha Yoga (Venus in 7th Kendra in Taurus, Libra, or Pisces)
  if (venus && venus.signId === h7SignId && [2, 7, 12].includes(h7SignId)) {
    const cond = `Venus occupies the 7th house Kendra in its own/exaltation sign (${SIGNS[h7SignId - 1].name}).`;
    const eff = 'Supreme Pancha Mahapurusha Yoga. Confers magnificent beauty, romantic bliss, regal conveyances, artistic renown, and an exceptionally loving spouse (Mehta p. 133).';
    yogas.push({
      name: 'Malavya Mahapurusha Yoga (Supreme Venusian Splendor)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Mahapurusha Raja Yoga',
      source: 'Phala Deepika, Ch. 6; Mehta, Ch. 7, p. 133'
    });
  }

  // 2. Sasa Mahapurusha Yoga (Saturn in 7th Kendra in Libra, Capricorn, or Aquarius)
  if (saturn && saturn.signId === h7SignId && [7, 10, 11].includes(h7SignId)) {
    const cond = `Saturn occupies the 7th house Kendra in its exaltation/own sign (${SIGNS[h7SignId - 1].name}).`;
    const eff = 'Pancha Mahapurusha Sasa Yoga. Endows the native with immense command over people, enduring partnerships, profound maturity, and a faithful, hardworking partner.';
    yogas.push({
      name: 'Sasa Mahapurusha Yoga (Steadfast Sovereign Authority)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Mahapurusha Raja Yoga',
      source: 'Phala Deepika, Ch. 6; Mehta, Ch. 7, p. 130'
    });
  }

  // 3. Mehta's Rahu-Jupiter Marital Neutralization (Rahu in 7th blessed by Jupiter drishti)
  if (rahu && rahu.signId === h7SignId) {
    let hasJupDrishti = false;
    if (jupiter) {
      const dist = (((h7SignId - jupiter.signId + 12) % 12) + 1);
      if ([1, 5, 7, 9].includes(dist)) hasJupDrishti = true;
    }
    if (hasJupDrishti) {
      const cond = 'Rahu occupies the 7th house but receives the direct trinal or 7th aspect of benefic Jupiter.';
      const eff = 'Fulfills Mehta\'s cardinal rule (Ch. 7, pp. 131–132, Horoscope A): Rahu is rendered completely harmless and even promotes brilliant social elevation and foreign success.';
      yogas.push({
        name: 'Mehta\'s Rahu-Jupiter Neutralization (Protected 7th House)',
        condition: cond,
        effects: eff,
        description: `${cond} ${eff}`,
        type: 'Auspicious / Malefic Neutralization',
        source: 'Mehta, Ch. 7, pp. 131-132 (Horoscope A)'
      });
    } else {
      const cond = 'Rahu occupies the 7th house without benefic Jupiter drishti.';
      const eff = 'Mehta notes on p. 131 (Horoscope B) that afflicted Rahu in the 7th creates marital restlessness, unconventional deviations, or sudden matrimonial crises.';
      yogas.push({
        name: 'Rahu in Kalatra Bhava (Unconventional Marriage & Restlessness)',
        condition: cond,
        effects: eff,
        description: `${cond} ${eff}`,
        type: 'Challenging / Marital Testing',
        source: 'Mehta, Ch. 7, pp. 131-132 (Horoscope B)'
      });
    }
  }

  // 4. 7th Lord in 7th House Swakshetra
  if (h7LordHouse === 7) {
    const cond = `7th Lord (${h7LordKey}) is comfortably situated in its own Swakshetra 7th house.`;
    const eff = 'Mantreswara and Parashara emphasize that 7th lord in the 7th house ensures a charming, devoted spouse from a respectable family, diplomatic acumen, and flourishing partnerships.';
    yogas.push({
      name: 'Swakshetra Kalatra Yoga (Dignified Marital Sthiti)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Marital Stability',
      source: 'Phala Deepika & Mehta, Ch. 7, p. 126'
    });
  }

  // 5. Lagna Lord & 7th Lord Shadashtaka Discord (6/8)
  if (lagnaLord && h7Lord) {
    const dist = (((h7Lord.signId - lagnaLord.signId + 12) % 12) + 1);
    if (dist === 6 || dist === 8) {
      const cond = `Lagna Lord (${lagnaLordKey}) and 7th Lord (${h7LordKey}) are in 6/8 Shadashtaka disposition (${dist}th & ${14 - dist}th from each other).`;
      const eff = 'Classical indicator of temperamental dissonance or marital friction (Mehta p. 135 Lady\'s Chart). Advises patience, mutual communication, and remedial matching.';
      yogas.push({
        name: 'Lagna Lord & 7th Lord Shadashtaka (Temperamental Friction Warning)',
        condition: cond,
        effects: eff,
        description: `${cond} ${eff}`,
        type: 'Inauspicious / Marital Friction',
        source: 'Mehta, Ch. 7, p. 135'
      });
    }
  }

  // 6. Kuja Dosha (Manglik) Yoga
  const kuja = calculateKujaDoshaProfile(planets, ascSignId);
  if (kuja.hasKujaDosha) {
    yogas.push({
      name: kuja.isCancelled ? 'Kuja Dosha (Cancelled by Classical Exceptions)' : 'Kuja Dosha (Active Manglik Alignment)',
      condition: `Mars is posited in House ${kuja.fromLagna.house} from Lagna${kuja.fromMoon.isManglik ? ` and House ${kuja.fromMoon.house} from Moon` : ''}.`,
      effects: kuja.isCancelled
        ? `Neutralized: ${kuja.cancellationReasons.join(' ')}`
        : 'Classical texts advise matching horoscopes with another Manglik native to maintain energetic harmony and emotional longevity.',
      description: kuja.verdict,
      type: kuja.isCancelled ? 'Neutralized / Auspicious' : 'Challenging / Matching Advised',
      source: 'Dr. B.V. Raman & Mehta, Ch. 7, pp. 148-155'
    });
  }

  return yogas;
}

/**
 * 8.1 22nd Drekkana (Kharesh) & 64th Navamsa (Khara Navamsa) Calculator
 * Source: BPHS, Mehta Ch. 8, Phala Deepika
 */
export function calculateKhareshAndKharaNavamsa(planets, ascSignId) {
  const getAbsLon = (p) => {
    if (!p) return 0;
    if (typeof p.absLongitude === 'number') return p.absLongitude;
    if (typeof p.longitude === 'number') return p.longitude;
    const sId = p.signId || 1;
    const deg = (typeof p.degInSign === 'number') ? p.degInSign : 15;
    return (sId - 1) * 30 + deg;
  };

  const asc = planets.find(p => getPlanetKey(p.key || p.name) === 'ASC');
  const ascLon = asc ? getAbsLon(asc) : ((ascSignId - 1) * 30);
  const ascDeg = ascLon % 30;

  // 1. 22nd Drekkana (Kharesh) from Ascendant
  // 8th house sign index = (ascSignId - 1 + 7) % 12
  const h8SignId = ((ascSignId - 1 + 7) % 12) + 1;
  const p3 = Math.min(2, Math.floor(ascDeg / 10)); // 0 = 0-10°, 1 = 10-20°, 2 = 20-30°
  const d3SignId = ((h8SignId - 1 + p3 * 4) % 12) + 1;
  const khareshSign = SIGNS[d3SignId - 1];
  const khareshLordKey = getPlanetKey(khareshSign.lord);

  // 2. 64th Navamsa (Khara Navamsa) from Moon
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  const moonLon = moon ? getAbsLon(moon) : 0;
  // 63 navamsas = 210 degrees (7 signs)
  const khara64Lon = (moonLon + 210) % 360;
  const totalNavamsas = Math.floor(khara64Lon / (30 / 9));
  const d9SignId = (totalNavamsas % 12) + 1;
  const kharaSign = SIGNS[d9SignId - 1];
  const kharaLordKey = getPlanetKey(kharaSign.lord);

  // 3. 64th Navamsa from Ascendant (Secondary diagnostic)
  const asc64Lon = (ascLon + 210) % 360;
  const totalAscNav = Math.floor(asc64Lon / (30 / 9));
  const ascD9SignId = (totalAscNav % 12) + 1;
  const ascKharaSign = SIGNS[ascD9SignId - 1];
  const ascKharaLordKey = getPlanetKey(ascKharaSign.lord);

  return {
    kharesh: {
      signId: d3SignId,
      signName: khareshSign.name,
      sanskrit: khareshSign.sanskrit,
      lordName: khareshSign.lord,
      lordKey: khareshLordKey,
      drekkanaNumber: 22,
      partitionIndex: p3 + 1,
      partitionRange: `${p3 * 10}° – ${(p3 + 1) * 10}° of 8th House (${SIGNS[h8SignId - 1].name})`
    },
    kharaNavamsa: {
      signId: d9SignId,
      signName: kharaSign.name,
      sanskrit: kharaSign.sanskrit,
      lordName: kharaSign.lord,
      lordKey: kharaLordKey,
      reckonedFrom: 'Moon (Janma Rasi - Classical Standard)',
      navamsaNumber: 64,
      moonDegInSign: (moonLon % 30).toFixed(2) + '°'
    },
    ascKharaNavamsa: {
      signId: ascD9SignId,
      signName: ascKharaSign.name,
      lordName: ascKharaSign.lord,
      lordKey: ascKharaLordKey,
      reckonedFrom: 'Lagna (Ascendant)'
    }
  };
}

/**
 * 8.2 Longevity Kakshya Determination (Jaimini 3-Pairs Engine)
 * Source: Jaimini Upadesha Sutras, BPHS Ayurdaya, Mehta Ch. 8 (pp. 165-172)
 */
export function calculateLongevityProfile(planets, ascSignId, birthDate = null) {
  const getAbsLon = (p) => {
    if (!p) return 0;
    if (typeof p.absLongitude === 'number') return p.absLongitude;
    if (typeof p.longitude === 'number') return p.longitude;
    const sId = p.signId || 1;
    const deg = (typeof p.degInSign === 'number') ? p.degInSign : 15;
    return (sId - 1) * 30 + deg;
  };

  const getMobility = (signId) => SIGNS[signId - 1].mobility;

  const asc = planets.find(p => getPlanetKey(p.key || p.name) === 'ASC');
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const lagnaLord = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);
  const lagnaLordSignId = lagnaLord ? lagnaLord.signId : ascSignId;

  const h8SignId = ((ascSignId - 1 + 7) % 12) + 1;
  const h8LordKey = getPlanetKey(SIGNS[h8SignId - 1].lord);
  const h8Lord = planets.find(p => getPlanetKey(p.key || p.name) === h8LordKey);
  const h8LordSignId = h8Lord ? h8Lord.signId : h8SignId;

  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  const moonSignId = moon ? moon.signId : 1;

  const saturn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const saturnSignId = saturn ? saturn.signId : 1;

  const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const sunLon = sun ? getAbsLon(sun) : 0;
  const moonLon = moon ? getAbsLon(moon) : 0;

  // Pair Evaluator
  const evaluatePair = (m1, m2) => {
    if (m1 === m2) {
      if (m1 === 'Movable') return { kakshya: 'Purnayu', spanYears: '72–108 years', category: 'Long Life' };
      if (m1 === 'Fixed') return { kakshya: 'Alpayu', spanYears: '0–36 years', category: 'Short Life' };
      if (m1 === 'Dual') return { kakshya: 'Madhyayu', spanYears: '36–72 years', category: 'Medium Life' };
    }
    const pair = new Set([m1, m2]);
    if (pair.has('Movable') && pair.has('Fixed')) {
      return { kakshya: 'Madhyayu', spanYears: '36–72 years', category: 'Medium Life' };
    }
    if (pair.has('Movable') && pair.has('Dual')) {
      return { kakshya: 'Alpayu', spanYears: '0–36 years', category: 'Short Life' };
    }
    if (pair.has('Fixed') && pair.has('Dual')) {
      return { kakshya: 'Purnayu', spanYears: '72–108 years', category: 'Long Life' };
    }
    return { kakshya: 'Madhyayu', spanYears: '36–72 years', category: 'Medium Life' };
  };

  // Pair 1: Lagna Lord + 8th Lord
  const mobLagnaLord = getMobility(lagnaLordSignId);
  const mob8thLord = getMobility(h8LordSignId);
  const pair1 = {
    name: 'Pair 1: Lagna Lord & 8th Lord',
    p1Name: `${lagnaLordKey} (${SIGNS[lagnaLordSignId - 1].name})`,
    p2Name: `${h8LordKey} (${SIGNS[h8LordSignId - 1].name})`,
    mobilities: [mobLagnaLord, mob8thLord],
    ...evaluatePair(mobLagnaLord, mob8thLord)
  };

  // Pair 2: Lagna & Moon
  const mobLagna = getMobility(ascSignId);
  const mobMoon = getMobility(moonSignId);
  const pair2 = {
    name: 'Pair 2: Lagna & Chandra (Moon)',
    p1Name: `Lagna (${SIGNS[ascSignId - 1].name})`,
    p2Name: `Chandra (${SIGNS[moonSignId - 1].name})`,
    mobilities: [mobLagna, mobMoon],
    ...evaluatePair(mobLagna, mobMoon)
  };

  // Pair 3: Moon & Saturn (Universal Ayushkaraka)
  const mobSaturn = getMobility(saturnSignId);
  const pair3 = {
    name: 'Pair 3: Chandra & Shani (Ayushkaraka)',
    p1Name: `Chandra (${SIGNS[moonSignId - 1].name})`,
    p2Name: `Saturn (${SIGNS[saturnSignId - 1].name})`,
    mobilities: [mobMoon, mobSaturn],
    ...evaluatePair(mobMoon, mobSaturn)
  };

  // Consensus Calculation
  const tallies = { Purnayu: 0, Madhyayu: 0, Alpayu: 0 };
  [pair1, pair2, pair3].forEach(p => {
    tallies[p.kakshya] = (tallies[p.kakshya] || 0) + 1;
  });

  let baseKakshya = 'Madhyayu';
  let consensusRule = '';
  if (tallies.Purnayu >= 2) {
    baseKakshya = 'Purnayu';
    consensusRule = 'Majority Consensus: 2+ pairs indicate Purnayu (Long Life).';
  } else if (tallies.Madhyayu >= 2) {
    baseKakshya = 'Madhyayu';
    consensusRule = 'Majority Consensus: 2+ pairs indicate Madhyayu (Medium Life).';
  } else if (tallies.Alpayu >= 2) {
    baseKakshya = 'Alpayu';
    consensusRule = 'Majority Consensus: 2+ pairs indicate Alpayu (Short Life).';
  } else {
    // All 3 pairs disagree: Jaimini Upadesha Sutra 2.1.23
    const moonHouse = (((moonSignId - ascSignId + 12) % 12) + 1);
    if (moonHouse === 1 || moonHouse === 7) {
      baseKakshya = pair2.kakshya;
      consensusRule = 'Disagreement Tie-Breaker: Moon in 1st/7th Kendra house; Pair 2 (Lagna & Moon) prevails.';
    } else {
      baseKakshya = pair1.kakshya;
      consensusRule = 'Disagreement Tie-Breaker: All 3 pairs differ; Primary Pair 1 (Lagna Lord & 8th Lord) determines baseline Kakshya.';
    }
  }

  // Modifiers & Upgrades
  const modifiers = [];
  let finalKakshya = baseKakshya;

  // 1. Saturn Ayushkaraka in 8th house modifier
  const saturnHouse = saturn ? (((saturnSignId - ascSignId + 12) % 12) + 1) : 0;
  if (saturnHouse === 8) {
    modifiers.push({
      factor: 'Saturn in 8th House (Ayushkaraka Swakrupa)',
      effect: 'Saturn in the 8th house is universally exempt from Karako Bhavo Nashti and acts as a fortress of longevity, elevating lifespan into upper kakshya (Mehta Ch. 8, p. 165).'
    });
    if (finalKakshya === 'Alpayu') finalKakshya = 'Madhyayu';
    else if (finalKakshya === 'Madhyayu') finalKakshya = 'Purnayu';
  }

  // 2. Benefics in Kendras (Jupiter / Venus)
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const jupHouse = jupiter ? (((jupiter.signId - ascSignId + 12) % 12) + 1) : 0;
  const venHouse = venus ? (((venus.signId - ascSignId + 12) % 12) + 1) : 0;
  if ([1, 4, 7, 10].includes(jupHouse) || [1, 4, 7, 10].includes(venHouse)) {
    modifiers.push({
      factor: 'Benefic Grahas in Kendras (Kendra Shubha Graha)',
      effect: `Natural benefics in quadrant houses (${[jupHouse, venHouse].filter(h => [1,4,7,10].includes(h)).map(h => `House ${h}`).join(', ')}) safeguard vital Ojas and protect longevity.`
    });
  }

  // 3. Chandra Raksha (Moon as Ayur Protector - Mehta Ch. 8, p. 165)
  // Day birth with Dark Moon (Krishna Paksha) OR Night birth with Bright Moon (Shukla Paksha)
  const sunHouse = sun ? (((sun.signId - ascSignId + 12) % 12) + 1) : 1;
  const isDayBirth = [7, 8, 9, 10, 11, 12].includes(sunHouse);
  const elongation = ((moonLon - sunLon + 360) % 360);
  const isBrightMoon = elongation < 180;
  const isFarFromSun = elongation >= 30 && elongation <= 330;

  let chandraRaksha = false;
  if (isFarFromSun && ((isDayBirth && !isBrightMoon) || (!isDayBirth && isBrightMoon))) {
    chandraRaksha = true;
    modifiers.push({
      factor: 'Chandra Raksha (Celestial Lunar Shield - Mehta Ch. 8)',
      effect: `${isDayBirth ? 'Day birth with Krishna Paksha Moon' : 'Night birth with Shukla Paksha Moon'} (>30° from Sun). Classical life protector nullifying early Balarishta and sudden pediatric perils.`
    });
  }

  // Ayur Tatva (Transition Element & Quality)
  const h8Element = SIGNS[h8SignId - 1].element;
  const tatvaMap = {
    Fire: {
      tatva: 'Tejas (Agni Tatva)',
      description: 'Transformation through metabolic heat, fever, acute inflammatory or courageous sudden release.'
    },
    Earth: {
      tatva: 'Prithvi (Bhoomi Tatva)',
      description: 'Transformation through gradual bodily exhaustion, slow metabolic slowdown, peaceful quiet dissolution.'
    },
    Air: {
      tatva: 'Vayu (Marut Tatva)',
      description: 'Transformation through prana/respiratory stillness, sudden cardiac or nervous calmness.'
    },
    Water: {
      tatva: 'Jala (Apas Tatva)',
      description: 'Transformation through fluid balance, peaceful crossing, deep emotional/spiritual surrender, often in tranquil waters or holy peace.'
    }
  };

  const spanMap = {
    Purnayu: '72–108 years (Long Life)',
    Madhyayu: '36–72 years (Medium Life)',
    Alpayu: '0–36 years (Short Life)'
  };

  return {
    baseKakshya,
    finalKakshya,
    estimatedSpan: spanMap[finalKakshya] || spanMap[baseKakshya],
    consensusRule,
    pairs: [pair1, pair2, pair3],
    tallies,
    modifiers,
    chandraRaksha,
    tatva: tatvaMap[h8Element] || tatvaMap.Air,
    eighthHouseSign: SIGNS[h8SignId - 1].name,
    eighthHouseLord: h8LordKey
  };
}

/**
 * 8.3 Parashari 7 Chhidra Grahas Analyzer
 * Source: Brihat Parashara Hora Shastra, Ch. 44; Mehta Ch. 8 (p. 165)
 */
export function calculateChhidraGrahas(planets, ascSignId, h8LordKey, h8SignId, khareshKhara) {
  const chhidras = [];

  // 1. Lord of the 8th House
  const h8Lord = planets.find(p => getPlanetKey(p.key || p.name) === h8LordKey);
  const h8LordHouse = h8Lord ? (((h8Lord.signId - ascSignId + 12) % 12) + 1) : 8;
  chhidras.push({
    roleNumber: 1,
    roleTitle: '8th House Lord (Randhresha)',
    planets: [h8LordKey],
    details: `${h8LordKey} is the foundational lord of mortality and longevity, positioned in House ${h8LordHouse} (${h8Lord ? SIGNS[h8Lord.signId - 1].name : SIGNS[h8SignId - 1].name}).`
  });

  // 2. Occupants of 8th House
  const occupants = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    const pHouse = (((p.signId - ascSignId + 12) % 12) + 1);
    return pHouse === 8;
  }).map(p => getPlanetKey(p.key || p.name));
  chhidras.push({
    roleNumber: 2,
    roleTitle: '8th House Resident Grahas (Occupants)',
    planets: occupants.length > 0 ? occupants : ['None'],
    details: occupants.length > 0
      ? `${occupants.join(', ')} directly occupy the 8th house, intimately imprinting the longevity kakshya.`
      : 'No direct resident planets in the 8th house.'
  });

  // 3. Aspecting Grahas on 8th House
  const aspects = getAspectsOnHouse(planets, 8, ascSignId).map(a => `${a.name} (H${a.fromHouse})`);
  chhidras.push({
    roleNumber: 3,
    roleTitle: 'Grahas Aspecting 8th House (Drishti)',
    planets: aspects.length > 0 ? aspects : ['None'],
    details: aspects.length > 0
      ? `Aspects from ${aspects.join(', ')} cast their rays upon the 8th house.`
      : 'No planetary aspects upon the 8th house.'
  });

  // 4. Lord of 22nd Drekkana (Kharesh)
  const kharesh = khareshKhara?.kharesh;
  chhidras.push({
    roleNumber: 4,
    roleTitle: 'Lord of 22nd Drekkana (Kharesh)',
    planets: kharesh ? [kharesh.lordKey] : ['Unknown'],
    details: kharesh
      ? `${kharesh.lordName} rules the 22nd Drekkana (${kharesh.signName} in D3, ${kharesh.partitionRange}). Highly sensitive in dasha periods.`
      : 'Calculated from Ascendant degree in D3.'
  });

  // 5. Lord of 64th Navamsa from Moon (Khara Navamsa Lord)
  const khara = khareshKhara?.kharaNavamsa;
  chhidras.push({
    roleNumber: 5,
    roleTitle: 'Lord of 64th Navamsa (Khara Navamsa Lord)',
    planets: khara ? [khara.lordKey] : ['Unknown'],
    details: khara
      ? `${khara.lordName} rules the 64th Navamsa from Janma Rasi (${khara.signName} in D9). Cardinal Parashari transition indicator.`
      : 'Calculated from Moon absolute longitude in D9.'
  });

  // 6. Grahas Conjoining 8th House Lord
  const conj = h8Lord
    ? planets.filter(p => {
        const k = getPlanetKey(p.key || p.name);
        return k !== 'ASC' && k !== h8LordKey && p.signId === h8Lord.signId;
      }).map(p => getPlanetKey(p.key || p.name))
    : [];
  chhidras.push({
    roleNumber: 6,
    roleTitle: 'Grahas Conjoining 8th House Lord',
    planets: conj.length > 0 ? conj : ['None'],
    details: conj.length > 0
      ? `${conj.join(', ')} directly share the sign with 8th Lord ${h8LordKey}.`
      : `8th Lord ${h8LordKey} sits unconjoined in its sign.`
  });

  // 7. Bitter Enemy (Adhi Shatru) of 8th House Lord
  let bitterEnemies = [];
  try {
    const fiveFold = calculateFiveFoldFriendship(planets);
    if (fiveFold && fiveFold[h8LordKey]) {
      bitterEnemies = Object.keys(fiveFold[h8LordKey]).filter(k => fiveFold[h8LordKey][k] === 'Bitter');
    }
  } catch (e) {
    // Fallback if key missing in classical planets
  }
  chhidras.push({
    roleNumber: 7,
    roleTitle: 'Compound Bitter Enemy (Adhi Shatru) of 8th Lord',
    planets: bitterEnemies.length > 0 ? bitterEnemies : ['None'],
    details: bitterEnemies.length > 0
      ? `${bitterEnemies.join(', ')} possess compound natural + temporal bitter enmity against 8th Lord ${h8LordKey}.`
      : `No planet is in Adhi Shatru relationship to ${h8LordKey}.`
  });

  return chhidras;
}

/**
 * 8.4 Virasat & Daiva Labha (Unearned Wealth & Legacies) Analyzer
 * Source: Mehta Ch. 8, pp. 165-172
 */
export function calculateVirasatProfile(planets, ascSignId, h8LordKey, lordHouse) {
  const indications = [];
  let potentialScore = 0;

  // 1. 8th Lord in 2nd House
  if (lordHouse === 2) {
    potentialScore += 3;
    indications.push('8th Lord in 2nd House: Direct infusion of inheritance, legacy, wills, or spouse/family estate into personal accumulated wealth (Mehta p. 165).');
  }

  // 2. 8th Lord in 11th House
  if (lordHouse === 11) {
    potentialScore += 3;
    indications.push('8th Lord in 11th House: Substantial sudden windfalls, inheritances, or settlements fueling personal cashflow and aspirations.');
  }

  // 3. 8th Lord in 8th House Swakshetra
  if (lordHouse === 8) {
    potentialScore += 2;
    indications.push('8th Lord in 8th House: Solid preservation of family estates, deep research royalties, and protection against probate litigation.');
  }

  // 4. 2nd Lord or 11th Lord in 8th House
  const h2SignId = ((ascSignId - 1 + 1) % 12) + 1;
  const h2LordKey = getPlanetKey(SIGNS[h2SignId - 1].lord);
  const h2Lord = planets.find(p => getPlanetKey(p.key || p.name) === h2LordKey);
  const h2LordHouse = h2Lord ? (((h2Lord.signId - ascSignId + 12) % 12) + 1) : 0;
  if (h2LordHouse === 8) {
    potentialScore += 2;
    indications.push(`2nd Lord (${h2LordKey}) in 8th House: Native's accumulated wealth is intimately intertwined with partner's assets, wills, or unearned inheritances.`);
  }

  const h11SignId = ((ascSignId - 1 + 10) % 12) + 1;
  const h11LordKey = getPlanetKey(SIGNS[h11SignId - 1].lord);
  const h11Lord = planets.find(p => getPlanetKey(p.key || p.name) === h11LordKey);
  const h11LordHouse = h11Lord ? (((h11Lord.signId - ascSignId + 12) % 12) + 1) : 0;
  if (h11LordHouse === 8) {
    potentialScore += 2;
    indications.push(`11th Lord (${h11LordKey}) in 8th House: Financial gains and windfalls materialize from sudden unearned sources, insurance, or occult pursuits.`);
  }

  // 5. Benefics vs Malefics in 8th House
  const occupants = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    return (((p.signId - ascSignId + 12) % 12) + 1) === 8;
  });

  const hasBeneficIn8 = occupants.some(p => ['Jupt', 'Venu', 'Merc'].includes(getPlanetKey(p.key || p.name)));
  if (hasBeneficIn8) {
    potentialScore += 2;
    indications.push('Benefic Grahas in 8th House: Amicable acquisition of legacies without protracted litigation or familial acrimony.');
  }

  const hasMaleficIn8 = occupants.some(p => ['Mars', 'Satn', 'Rahu', 'Ketu'].includes(getPlanetKey(p.key || p.name)));
  if (hasMaleficIn8) {
    indications.push('Malefic Grahas in 8th House: Advises clear documentation, transparent wills, and estate planning to prevent contested claims or taxation hurdles.');
  }

  let potential = 'Moderate';
  if (potentialScore >= 4) potential = 'High (Substantial Legacies & Windfalls)';
  else if (potentialScore >= 2) potential = 'Moderate (Steady Inheritances / Partner Assets)';
  else potential = 'Normal / Self-Made (Focus on Earned Dhana)';

  return {
    potential,
    score: potentialScore,
    indications: indications.length > 0 ? indications : ['Standard 8th house configuration without direct 2nd/11th legacy linkage. Wealth is primarily self-generated.']
  };
}

/**
 * 8.5 House 8 Classical Yogas Evaluator
 * Source: Mehta Ch. 8, Phala Deepika, BPHS
 */
function checkEighthHouseYogas(planets, ascSignId, h8LordKey, h8LordHouse, h8LordSignId, extraContext = {}) {
  const yogas = [];
  const h8SignId = ((ascSignId - 1 + 7) % 12) + 1;
  const h8Lord = planets.find(p => getPlanetKey(p.key || p.name) === h8LordKey);
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const lagnaLord = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);

  // 1. Sarala Vipareeta Raja Yoga (8th Lord in 6th, 8th, or 12th Dusthana)
  if ([6, 8, 12].includes(h8LordHouse)) {
    const houseName = h8LordHouse === 6 ? '6th House (Shatru Bhava)' : (h8LordHouse === 8 ? '8th House (Swakshetra Randhra)' : '12th House (Vyaya Bhava)');
    const cond = `8th Lord (${h8LordKey}) is situated in Dusthana ${houseName}.`;
    const eff = 'Classical Sarala Vipareeta Raja Yoga (सरल विपरीत राजयोग). Makes the native fearless, long-lived, resolute, learned, highly respected, victorious over hidden adversaries, and blessed with sudden breakthroughs through crisis (Mehta p. 166; Phala Deepika 6.65).';
    yogas.push({
      name: 'Sarala Vipareeta Raja Yoga (Fearless Triumph & Unforeseen Elevation)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Vipareeta Raja Yoga',
      source: 'Phala Deepika, Ch. 6, Shloka 65; Mehta, Ch. 8, p. 166'
    });
  }

  // 2. Asura Yoga (Jupiter or Venus in 8th House)
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const jupHouse = jupiter ? (((jupiter.signId - ascSignId + 12) % 12) + 1) : 0;
  const venHouse = venus ? (((venus.signId - ascSignId + 12) % 12) + 1) : 0;

  if (jupHouse === 8 || venHouse === 8) {
    const planetNames = [jupHouse === 8 ? 'Jupiter' : null, venHouse === 8 ? 'Venus' : null].filter(Boolean).join(' and ');
    const cond = `${planetNames} posited in the 8th house.`;
    const eff = 'As natural benefics, they confer exceptional longevity and deep occult or philosophical intelligence. However, Mehta cautions that it can produce self-absorbed, secretive, or unearned-wealth-seeking inclinations (Asura nature) unless disciplined by spiritual sadhana or deep research (Mehta p. 167).';
    yogas.push({
      name: `Asura Yoga (${planetNames} in Randhra Bhava)`,
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Dual / Longevity & Philosophical Depth',
      source: 'Mehta, Ch. 8, p. 167'
    });
  }

  // 3. Aries & Libra Ascendants: Lagna/8th Lord Unity
  if ([1, 7].includes(ascSignId)) {
    const ruler = ascSignId === 1 ? 'Mars' : 'Venus';
    const cond = `For ${SIGNS[ascSignId - 1].name} Lagna, ${ruler} rules both the 1st House (Lagna) and the 8th House (Randhra).`;
    const eff = 'Fulfills Mehta\'s cardinal rule (p. 165): The planet is primarily the Ascendant Lord and is exempt from 8th house maleficence, promoting robust constitution, lands, and long life.';
    yogas.push({
      name: `Lagna/8th Lord Unity Exemption (${ruler} for ${SIGNS[ascSignId - 1].name})`,
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Functional Exemption',
      source: 'Mehta, Ch. 8, p. 165'
    });
  }

  // 4. Pisces Ascendant: 8th Lord Venus Exalted in 1st House
  if (ascSignId === 12 && venus && venus.signId === 12) {
    const cond = 'For Pisces Ascendant, 8th Lord Venus is exalted in the 1st House (Malavya Yoga component).';
    const eff = 'Mehta specifically highlights (p. 165): Exalted 8th Lord in Lagna nullifies maleficence, producing a radiant, handsome native, commanding presence, immense wealth, and long life.';
    yogas.push({
      name: 'Pisces Lagna Exalted Randhresha (Malavya Radiance)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Exalted Benefic',
      source: 'Mehta, Ch. 8, p. 165'
    });
  }

  // 5. Laxmanan's Bhava Dominance Rule (8th Lord stronger than 1st & 10th Lords)
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10LordKey = getPlanetKey(SIGNS[h10SignId - 1].lord);
  const h10Lord = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);
  const h10LordHouse = h10Lord ? (((h10Lord.signId - ascSignId + 12) % 12) + 1) : 0;
  const lagnaLordHouse = lagnaLord ? (((lagnaLord.signId - ascSignId + 12) % 12) + 1) : 1;

  if ([1, 4, 7, 10].includes(h8LordHouse) && ![1, 4, 7, 10].includes(lagnaLordHouse)) {
    const cond = `8th Lord (${h8LordKey}) occupies an angular Kendra (House ${h8LordHouse}) while Lagna Lord is in a weaker house (House ${lagnaLordHouse}).`;
    const eff = 'Laxmanan\'s Rule cited by Mehta (p. 165): When the 8th lord dominates over the 1st or 10th lord, the native is subject to sudden public humiliation, intrigues, or scandal (Apamana) during 8th lord periods. Cultivating integrity and spiritual remedies advised.';
    yogas.push({
      name: 'Laxmanan\'s Dominant Randhresha Warning (Vulnerability to Scandal)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Challenging / Reputational Caution',
      source: 'Laxmanan & Mehta, Ch. 8, p. 165'
    });
  }

  // 6. Swakshetra Randhra Yoga (8th Lord in 8th House)
  if (h8LordHouse === 8) {
    const cond = `8th Lord (${h8LordKey}) is comfortably situated in its own Swakshetra 8th house.`;
    const eff = 'Grants enduring longevity, deep research capabilities, interest in esoteric sciences (Jyotish, Vedanta), protection of legacy, and peaceful dissolution.';
    yogas.push({
      name: 'Swakshetra Randhra Yoga (Dignified Longevity & Esoteric Mastery)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Longevity Fortress',
      source: 'Phala Deepika & Mehta, Ch. 8, p. 165'
    });
  }

  return yogas;
}

/**
 * 9.1 Dharma-Karmadhipati Raja Yoga Engine (9th + 10th Lord Nexus)
 * Source: Brihat Parashara Hora Shastra, Phala Deepika Ch. 6, Mehta Ch. 9 (p. 176) & Ch. 10 (p. 182)
 */
export function calculateDharmaKarmaYoga(planets, ascSignId) {
  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;

  const h9LordKey = getPlanetKey(SIGNS[h9SignId - 1].lord);
  const h10LordKey = getPlanetKey(SIGNS[h10SignId - 1].lord);

  const p9 = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const p10 = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);

  // Single Planet Yogakaraka (e.g., Saturn for Taurus Lagna, ruling 9th & 10th)
  if (h9LordKey === h10LordKey) {
    const pHouse = p9 ? (((p9.signId - ascSignId + 12) % 12) + 1) : 9;
    const pDignity = p9 ? getPlanetaryDignity(h9LordKey, p9.signId) : 'Normal';
    const isFortified = [1, 4, 5, 7, 9, 10, 11].includes(pHouse);

    return {
      isFormed: true,
      sambandhaType: 'Unified Single Yogakaraka',
      title: `Single-Planet Dharma-Karmadhipati Yogakaraka (${h9LordKey})`,
      rating: isFortified ? '⭐⭐⭐⭐⭐ Supreme Sovereign Potency' : '⭐⭐⭐⭐ Fortified Raja Yoga',
      description: `For ${SIGNS[ascSignId - 1].name} Ascendant, ${h9LordKey} holds sole lordship of both the 9th Trikona and 10th Kendra, acting as the supreme functional benefic and prime king-maker of the horoscope (posited in House ${pHouse} with ${pDignity} dignity).`,
      effects: 'Bestows rapid professional elevation, sovereign leadership, moral rectitude, lasting renown, and unassailable administrative authority.',
      planetsInvolved: [h9LordKey],
      housesOccupied: [pHouse],
      source: 'BPHS Ch. 34 & Mehta Ch. 9, p. 176'
    };
  }

  if (!p9 || !p10) {
    return {
      isFormed: false,
      sambandhaType: 'None',
      title: 'Dharma-Karmadhipati Yoga Inactive',
      rating: '---',
      description: '9th and 10th house lords do not form classical mutual sambandha.',
      effects: 'Dharma and Karma lords operate independently through their respective dispositors.',
      planetsInvolved: [h9LordKey, h10LordKey],
      housesOccupied: [],
      source: 'BPHS Ch. 34 & Phala Deepika Ch. 6'
    };
  }

  const h9LordHouse = (((p9.signId - ascSignId + 12) % 12) + 1);
  const h10LordHouse = (((p10.signId - ascSignId + 12) % 12) + 1);

  // 1. Mutual Parivartana (Exchange of houses: 9th lord in 10th & 10th lord in 9th)
  if (h9LordHouse === 10 && h10LordHouse === 9) {
    return {
      isFormed: true,
      sambandhaType: 'Maha Parivartana (Mutual House Exchange)',
      title: 'Dharma-Karmadhipati Maha Parivartana Raja Yoga',
      rating: '⭐⭐⭐⭐⭐ Pinnacle Imperial Raja Yoga',
      description: `Supreme Raja Yoga: 9th Lord (${h9LordKey}) resides in the 10th house, while 10th Lord (${h10LordKey}) resides in the 9th house, forming the most powerful Parivartana recognized in classical Jyotish.`,
      effects: 'Confers sovereign stature, ministerial or presidential power, widespread philanthropy, and immortal historical fame (Mehta Ch. 9, p. 176).',
      planetsInvolved: [h9LordKey, h10LordKey],
      housesOccupied: [9, 10],
      source: 'Phala Deepika 6.32 & Mehta Ch. 9, p. 176'
    };
  }

  // 2. Conjunction (Yuti)
  if (p9.signId === p10.signId) {
    const isKendraOrKona = [1, 4, 5, 7, 9, 10].includes(h9LordHouse);
    return {
      isFormed: true,
      sambandhaType: 'Yuti (Direct Conjunction)',
      title: `Dharma-Karmadhipati Conjunction Yoga in House ${h9LordHouse}`,
      rating: isKendraOrKona ? '⭐⭐⭐⭐⭐ Paramount Executive Raja Yoga' : '⭐⭐⭐⭐ Auspicious Professional Alignment',
      description: `9th Lord (${h9LordKey}) and 10th Lord (${h10LordKey}) are directly conjoined in House ${h9LordHouse} (${SIGNS[p9.signId - 1].name}).`,
      effects: 'Elevates the native into executive prominence, high status, righteous professional leadership, and vast wealth.',
      planetsInvolved: [h9LordKey, h10LordKey],
      housesOccupied: [h9LordHouse],
      source: 'BPHS Ch. 34 & Mehta Ch. 9, p. 176'
    };
  }

  // 3. Mutual Aspect (Samasaptaka - 7th from each other)
  const separation = (((p10.signId - p9.signId + 12) % 12) + 1);
  if (separation === 7) {
    const isKendraOrKona = [1, 4, 5, 7, 9, 10].includes(h9LordHouse) && [1, 4, 5, 7, 9, 10].includes(h10LordHouse);
    return {
      isFormed: true,
      sambandhaType: 'Samasaptaka (Mutual 7th Aspect)',
      title: `Dharma-Karmadhipati Mutual Aspect Yoga (Houses ${h9LordHouse} & ${h10LordHouse})`,
      rating: isKendraOrKona ? '⭐⭐⭐⭐⭐ Dynamic Axis Raja Yoga' : '⭐⭐⭐⭐ Fortified Axis',
      description: `9th Lord (${h9LordKey} in House ${h9LordHouse}) and 10th Lord (${h10LordKey} in House ${h10LordHouse}) cast full mutual 7th aspects upon each other across the chart.`,
      effects: 'Integrates moral vision with professional execution; ensures success in administrative and public service arenas.',
      planetsInvolved: [h9LordKey, h10LordKey],
      housesOccupied: [h9LordHouse, h10LordHouse],
      source: 'Phala Deepika Ch. 6 & Mehta Ch. 9, p. 176'
    };
  }

  // 4. One Lord in the Other's House (Single Placement Nexus)
  if (h9LordHouse === 10) {
    return {
      isFormed: true,
      sambandhaType: 'Ekatarasthita (9th Lord in 10th House)',
      title: '9th Lord in 10th House Karma Bhava Raja Yoga',
      rating: '⭐⭐⭐⭐ Fortified Sovereign Nexus',
      description: `9th Lord (${h9LordKey}) occupies the 10th Kendra house of statecraft, infusing career and public status with pure Dharmic grace.`,
      effects: 'Righteous rise to power, ministerial authority, professional rectitude, and lasting repute (Mehta Ch. 9, p. 176).',
      planetsInvolved: [h9LordKey, h10LordKey],
      housesOccupied: [10],
      source: 'Mehta Ch. 9, p. 176; Parashara Ch. 24, Sl. 106'
    };
  }

  if (h10LordHouse === 9) {
    return {
      isFormed: true,
      sambandhaType: 'Ekatarasthita (10th Lord in 9th House)',
      title: '10th Lord in 9th House Dharma Bhava Raja Yoga',
      rating: '⭐⭐⭐⭐ Fortified Spiritual Leadership',
      description: `10th Lord (${h10LordKey}) occupies the 9th Trikona house of divine fortune, aligning one\'s life vocation with higher spiritual wisdom and societal welfare.`,
      effects: 'Success in higher education, philanthropic ventures, ethical commerce, and blessings from paternal mentors (Mehta Ch. 10, p. 184).',
      planetsInvolved: [h9LordKey, h10LordKey],
      housesOccupied: [9],
      source: 'Mehta Ch. 10, p. 184; Phala Deepika'
    };
  }

  return {
    isFormed: false,
    sambandhaType: 'None',
    title: 'Dharma-Karmadhipati Yoga Inactive',
    rating: '---',
    description: `9th Lord (${h9LordKey} in House ${h9LordHouse}) and 10th Lord (${h10LordKey} in House ${h10LordHouse}) operate independently without direct sambandha.`,
    effects: 'Vocational fortunes depend on individual planetary dignities and divisional chart Varga strengths.',
    planetsInvolved: [h9LordKey, h10LordKey],
    housesOccupied: [h9LordHouse, h10LordHouse],
    source: 'BPHS Ch. 34'
  };
}

/**
 * 9.2 Bhagya & Lakshmi Yoga Engine (Dispositor Bhagya Karta & Fortune Matrix)
 * Source: Mehta Ch. 9 (pp. 173-181), Bhavartha Ratnakara, Phala Deepika Ch. 6
 */
export function calculateBhagyaProfile(planets, ascSignId, h9LordKey, h9LordHouse, h9LordSignId) {
  const p9 = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const h9LordDignity = p9 ? getPlanetaryDignity(h9LordKey, p9.signId) : 'Normal';

  // 1. Bhagya Karta: Dispositor of the 9th Lord
  // Mehta p. 180: "Importance of Bhagya Karta. Dispositor of Lord of 9th. If it is well disposed also takes the individual to great heights. A favourable Bhagyapati in Kendra or Kona lifts a person from ordinary to great success."
  const targetSignId = p9 ? p9.signId : h9LordSignId;
  const kartaLordName = SIGNS[targetSignId - 1].lord;
  const kartaKey = getPlanetKey(kartaLordName);
  const kartaPlanet = planets.find(p => getPlanetKey(p.key || p.name) === kartaKey);
  const kartaHouse = kartaPlanet ? (((kartaPlanet.signId - ascSignId + 12) % 12) + 1) : 1;
  const kartaDignity = kartaPlanet ? getPlanetaryDignity(kartaKey, kartaPlanet.signId) : 'Normal';
  const isKartaKendraKona = [1, 4, 5, 7, 9, 10].includes(kartaHouse);

  // 2. Classical Lakshmi Yoga
  // Condition: 9th Lord is in Kendra or Trikona in own sign or exalted, AND Venus is in Kendra or Trikona in own sign or exalted.
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const venHouse = venus ? (((venus.signId - ascSignId + 12) % 12) + 1) : 0;
  const venDignity = venus ? getPlanetaryDignity('Venu', venus.signId) : 'Normal';

  const is9thLordFortified = [1, 4, 5, 7, 9, 10].includes(h9LordHouse) && (h9LordDignity.includes('Exalted') || h9LordDignity.includes('Own') || h9LordDignity.includes('Moolatrikona'));
  const isVenusFortified = [1, 4, 5, 7, 9, 10].includes(venHouse) && (venDignity.includes('Exalted') || venDignity.includes('Own') || venDignity.includes('Moolatrikona'));
  const hasLakshmiYoga = is9thLordFortified && isVenusFortified;

  // 3. 2nd & 9th House Maha Dhana Yoga (Parivartana / Link)
  const h2SignId = ((ascSignId - 1 + 1) % 12) + 1;
  const h2LordKey = getPlanetKey(SIGNS[h2SignId - 1].lord);
  const p2 = planets.find(p => getPlanetKey(p.key || p.name) === h2LordKey);
  const h2LordHouse = p2 ? (((p2.signId - ascSignId + 12) % 12) + 1) : 0;

  let mahaDhanaYoga = false;
  let dhanaDetails = '';
  if (h2LordHouse === 9 && h9LordHouse === 2) {
    mahaDhanaYoga = true;
    dhanaDetails = `Maha Parivartana between 2nd Lord (${h2LordKey}) and 9th Lord (${h9LordKey}): Supreme Dhana Yoga conferring vast multi-generational wealth.`;
  } else if (h9LordHouse === 2) {
    mahaDhanaYoga = true;
    dhanaDetails = `9th Lord (${h9LordKey}) sits in the 2nd Dhana Bhava: Infusion of divine providence into liquid accumulated wealth and banking.`;
  } else if (h2LordHouse === 9) {
    mahaDhanaYoga = true;
    dhanaDetails = `2nd Lord (${h2LordKey}) sits in the 9th Bhagya Bhava: Personal treasury enriched by paternal assets, high dharma, and university ventures.`;
  }

  // 4. Score & Verdict
  let score = 0;
  if ([1, 4, 5, 7, 9, 10].includes(h9LordHouse)) score += 3;
  if (h9LordDignity.includes('Exalted') || h9LordDignity.includes('Own') || h9LordDignity.includes('Moolatrikona')) score += 3;
  else if (h9LordDignity.includes('Debilitated')) score -= 2;

  if (isKartaKendraKona) score += 2;
  if (hasLakshmiYoga) score += 4;
  if (mahaDhanaYoga) score += 3;

  let verdict = 'Moderate Providential Support';
  let badgeColor = 'badge-gold';
  if (score >= 8) {
    verdict = 'Imperial Bhagya (Extraordinary Divine Grace & Fortune)';
    badgeColor = 'badge-green';
  } else if (score >= 5) {
    verdict = 'Fortified Bhagya (Substantial Providential Elevation)';
    badgeColor = 'badge-blue';
  } else if (score < 2) {
    verdict = 'Challenged Bhagya (Requires Ethical Diligence & Remedial Effort)';
    badgeColor = 'badge-red';
  }

  return {
    h9LordKey,
    h9LordHouse,
    h9LordDignity,
    bhagyaKarta: {
      lordName: kartaLordName,
      key: kartaKey,
      house: kartaHouse,
      dignity: kartaDignity,
      isKendraKona: isKartaKendraKona,
      note: isKartaKendraKona
        ? `Mehta Benchmark Proven: Dispositor ${kartaLordName} in House ${kartaHouse} (Kendra/Trikona) powerfully lifts the native to great success.`
        : `Dispositor ${kartaLordName} is in House ${kartaHouse}; secondary dispositor strength governs manifestation.`
    },
    hasLakshmiYoga,
    mahaDhanaYoga,
    dhanaDetails,
    score,
    verdict,
    badgeColor
  };
}

/**
 * 9.3 Pitri Bhava & Pitru Dosha Diagnostic (Father's Well-being & Ancestral Harmony)
 * Source: Mehta Ch. 9 (pp. 180-181), Parashara Ch. 24, Phala Deepika
 */
export function calculatePitriProfile(planets, ascSignId, h9LordKey, h9LordHouse, extraContext = {}) {
  const p9 = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const saturn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const mars = planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');

  // Determine Day or Night birth:
  // Sun in Houses 7, 8, 9, 10, 11, 12 indicates daylight (above horizon); 1 to 6 indicates night.
  const sunHouse = sun ? (((sun.signId - ascSignId + 12) % 12) + 1) : 1;
  const isDayBirth = [7, 8, 9, 10, 11, 12].includes(sunHouse);

  // Mehta p. 181: "Sun is significator for father for day birth, while Saturn is treated as significator for father for night birth."
  const karakaKey = isDayBirth ? 'Sun' : 'Satn';
  const karakaName = isDayBirth ? 'Sun (Surya - Day Birth Pitru Karaka)' : 'Saturn (Shani - Night Birth Pitru Karaka)';
  const karakaPlanet = isDayBirth ? sun : saturn;
  const karakaHouse = karakaPlanet ? (((karakaPlanet.signId - ascSignId + 12) % 12) + 1) : 0;
  const karakaDignity = karakaPlanet ? getPlanetaryDignity(karakaKey, karakaPlanet.signId) : 'Normal';

  const protections = [];
  const vulnerabilities = [];

  // 1. Afflictions to Sun in Day Birth (Mehta p. 181)
  if (isDayBirth && sun) {
    let sunAfflictedByMars = false;
    let sunAfflictedBySaturn = false;

    if (mars) {
      const distFromMars = (((sun.signId - mars.signId + 12) % 12) + 1);
      if ([1, 4, 7, 8].includes(distFromMars)) sunAfflictedByMars = true;
    }
    if (saturn) {
      const distFromSaturn = (((sun.signId - saturn.signId + 12) % 12) + 1);
      if ([1, 3, 7, 10].includes(distFromSaturn)) sunAfflictedBySaturn = true;
    }

    let hasBeneficAspectOnSun = false;
    if (jupiter) {
      const distFromJup = (((sun.signId - jupiter.signId + 12) % 12) + 1);
      if ([1, 5, 7, 9].includes(distFromJup)) hasBeneficAspectOnSun = true;
    }
    if (venus && venus.signId === sun.signId) hasBeneficAspectOnSun = true;

    if (sunAfflictedByMars && sunAfflictedBySaturn && !hasBeneficAspectOnSun) {
      vulnerabilities.push('Sun in day birth aspected/conjoined simultaneously by Mars and Saturn without benefic aspect (classical indicator of early paternal vulnerability - Mehta p. 181).');
    } else if (sunAfflictedByMars || sunAfflictedBySaturn) {
      vulnerabilities.push(`Sun under malefic influence of ${[sunAfflictedByMars ? 'Mars' : '', sunAfflictedBySaturn ? 'Saturn' : ''].filter(Boolean).join(' & ')}.`);
    }

    if (hasBeneficAspectOnSun) {
      protections.push('Benefic aspect (Jupiter/Venus) on Sun shields the father from untimely medical perils.');
    }

    // 8th from Sun check
    const h8FromSun = ((sun.signId - 1 + 7) % 12) + 1;
    const occ8FromSun = planets.filter(p => {
      const k = getPlanetKey(p.key || p.name);
      return ['Mars', 'Rahu', 'Satn'].includes(k) && p.signId === h8FromSun;
    }).map(p => getPlanetKey(p.key || p.name));

    if (occ8FromSun.length > 0) {
      vulnerabilities.push(`8th house from Sun is occupied by malefic(s) (${occ8FromSun.join(', ')}), signaling chronic health sensitivities for the father (Mehta p. 181).`);
    } else {
      protections.push('8th house from Sun is free from malefic occupation, supporting paternal longevity.');
    }
  }

  // 2. Afflictions to Saturn in Night Birth (Mehta p. 181)
  if (!isDayBirth && saturn) {
    const h8FromSaturn = ((saturn.signId - 1 + 7) % 12) + 1;
    const occ8FromSat = planets.filter(p => {
      const k = getPlanetKey(p.key || p.name);
      return ['Mars', 'Rahu', 'Sun'].includes(k) && p.signId === h8FromSaturn;
    }).map(p => getPlanetKey(p.key || p.name));

    if (occ8FromSat.length > 0) {
      vulnerabilities.push(`For night birth, 8th from Saturn is occupied by ${occ8FromSat.join(', ')} (classical vulnerability indicator - Mehta p. 181).`);
    } else {
      protections.push('For night birth, 8th house from Saturn is clear of malefic affliction, conferring steady paternal stamina.');
    }
  }

  // 3. Parashara's Combinations for Rich & Exalted Father (Mehta p. 180)
  const parasharaRichFather = [];
  // Rule A: 9th lord strong, Venus in 9th, Jupiter in Kendra
  const jupHouse = jupiter ? (((jupiter.signId - ascSignId + 12) % 12) + 1) : 0;
  const venHouse = venus ? (((venus.signId - ascSignId + 12) % 12) + 1) : 0;
  if (venHouse === 9 && [1, 4, 7, 10].includes(jupHouse)) {
    parasharaRichFather.push('Parashara Rule 1: Venus in 9th with Jupiter in Kendra confers an affluent, distinguished, and respected father.');
  }

  // Rule B: 9th lord in Kendra relative to Jupiter
  if (jupiter && p9) {
    const distJup9 = (((p9.signId - jupiter.signId + 12) % 12) + 1);
    if ([1, 4, 7, 10].includes(distJup9)) {
      parasharaRichFather.push('Parashara Rule 2: 9th Lord sits in a Kendra relative to Jupiter, making the father commanding, prosperous, and regal.');
    }
  }

  // Rule C: 9th lord in 10th with benefics
  if (h9LordHouse === 10) {
    parasharaRichFather.push('Parashara Rule 3: 9th Lord in the 10th Kendra house grants a celebrated and highly accomplished father.');
  }

  // Rule D: 9th lord in 11th with exalted Sun
  if (h9LordHouse === 11 && sun && sun.signId === 1) {
    parasharaRichFather.push('Parashara Rule 4: 9th Lord in 11th with exalted Sun indicates an exceptionally devoted son and illustrious father.');
  }

  // 4. Paternal Devotion vs Friction
  let paternalBond = 'Harmonious & Affectionate';
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const lagnaLord = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);
  const h6SignId = ((ascSignId - 1 + 5) % 12) + 1;
  const h6LordKey = getPlanetKey(SIGNS[h6SignId - 1].lord);

  // Mehta p. 180: "Ascendant lord in 9 with lord of six - father contemptible / friction."
  if (lagnaLord && lagnaLord.signId === ((ascSignId - 1 + 8) % 12) + 1) {
    const h6Lord = planets.find(p => getPlanetKey(p.key || p.name) === h6LordKey);
    if (h6Lord && h6Lord.signId === lagnaLord.signId) {
      paternalBond = 'Ideological Dissonance (Lagna Lord & 6th Lord in 9th)';
      vulnerabilities.push('Ascendant Lord conjoining 6th Lord in the 9th house creates sharp ideological disputes or litigation with father (Mehta p. 180).');
    }
  }

  // Sun-Saturn opposition or conjunction
  if (sun && saturn) {
    const distSunSat = (((saturn.signId - sun.signId + 12) % 12) + 1);
    if (distSunSat === 1 || distSunSat === 7) {
      vulnerabilities.push(`Sun and Saturn in ${distSunSat === 1 ? 'conjunction' : 'direct 7th opposition'}: Indicates differing generational temperaments between father and native (Mehta p. 179).`);
    }
  }

  return {
    birthType: isDayBirth ? 'Day Birth (Sun is Pitru Karaka)' : 'Night Birth (Saturn is Pitru Karaka)',
    karakaName,
    karakaHouse,
    karakaDignity,
    protections: protections.length > 0 ? protections : ['Standard paternal longevity indications.'],
    vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : ['No acute classical paternal afflictions detected.'],
    parasharaRichFather: parasharaRichFather.length > 0 ? parasharaRichFather : ['Father\'s fortune operates through general 9th house strength.'],
    paternalBond
  };
}

/**
 * 9.4 Teertha Yatra, Foreign Travel & Higher Education Engine
 * Source: Mehta Ch. 9 (pp. 177-181), Uttara Kalamrita
 */
export function calculateTeerthaAndForeignTravelProfile(planets, ascSignId, h9LordKey, h9LordHouse) {
  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9Sign = SIGNS[h9SignId - 1];

  const h12SignId = ((ascSignId - 1 + 11) % 12) + 1;
  const h12Sign = SIGNS[h12SignId - 1];

  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');
  const ketu = planets.find(p => getPlanetKey(p.key || p.name) === 'Ketu');
  const mercury = planets.find(p => getPlanetKey(p.key || p.name) === 'Merc');

  const occupants9 = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    return (((p.signId - ascSignId + 12) % 12) + 1) === 9;
  });

  const teerthaIndicators = [];
  const foreignTravelIndicators = [];
  const higherEducationIndicators = [];

  // Pilgrimages (Teertha Yatra)
  if (['Water', 'Fire'].includes(h9Sign.element)) {
    teerthaIndicators.push(`9th house in ${h9Sign.element} sign (${h9Sign.name}): Classical resonance with sacred holy rivers, sea sangams, or ancient mountain sanctums.`);
  }

  const hasBeneficIn9 = occupants9.some(p => ['Jupt', 'Moon', 'Venu'].includes(getPlanetKey(p.key || p.name)));
  if (hasBeneficIn9) {
    teerthaIndicators.push('Natural benefics in the 9th house inspire frequent sacred journeys, pilgrimages, and philanthropic contributions to temples/dharamshalas (Mehta p. 177).');
  }

  if (ketu && (((ketu.signId - ascSignId + 12) % 12) + 1) === 9) {
    teerthaIndicators.push('Ketu in 9th House: Innate pull toward secluded mountain retreats, Himalayan shrines (Kedarnath/Badrinath), and meditative pilgrimage.');
  }

  if (h9LordHouse === 12) {
    teerthaIndicators.push('9th Lord in 12th House (Guru\'s Ashram): Strong alignment with ashram life, spiritual retreats, and meditation in holy sanctuaries.');
  }

  // Foreign Travel & Long Voyages
  if (rahu && (((rahu.signId - ascSignId + 12) % 12) + 1) === 9) {
    foreignTravelIndicators.push('Rahu in 9th House: Cardinal marker of foreign travels, intercultural voyages, and mastery of foreign languages (Mehta p. 180).');
  }

  if (moon && (((moon.signId - ascSignId + 12) % 12) + 1) === 9) {
    foreignTravelIndicators.push('Moon in 9th House: Frequent sea voyages, international flights, and residences in foreign lands (Mehta p. 177).');
  }

  if ([7, 12].includes(h9LordHouse)) {
    foreignTravelIndicators.push(`9th Lord in House ${h9LordHouse}: Direct bridge between higher fortune and foreign residence or diplomatic postings overseas.`);
  }

  if (['Movable', 'Dual'].includes(h9Sign.mobility) && ['Movable', 'Dual'].includes(h12Sign.mobility)) {
    foreignTravelIndicators.push(`Both 9th (${h9Sign.name}) and 12th (${h12Sign.name}) cusps are mobile/dual signs, facilitating effortless overseas travel.`);
  }

  // Higher Education & Academic Authorship
  if (mercury && (((mercury.signId - ascSignId + 12) % 12) + 1) === 9) {
    higherEducationIndicators.push('Mercury in 9th House: Sharp intellect, scientific discoveries, astrological mastery, and celebrated authorship/publishing (Mehta p. 178).');
  }

  if (jupiter && (((jupiter.signId - ascSignId + 12) % 12) + 1) === 9) {
    higherEducationIndicators.push('Jupiter in 9th House: Preceptor status, philosophical erudition, higher university degrees, and lecturing abroad.');
  }

  if ([1, 4, 5, 10].includes(h9LordHouse)) {
    higherEducationIndicators.push(`9th Lord in House ${h9LordHouse}: Conjunction with education/intellect/status houses ensures academic honors and intellectual acclaim.`);
  }

  return {
    teerthaYatra: {
      potential: teerthaIndicators.length >= 2 ? 'High (Frequent Sacred Pilgrimages)' : 'Moderate (Periodic Holy Visits)',
      indicators: teerthaIndicators.length > 0 ? teerthaIndicators : ['Standard religious inclinations.']
    },
    foreignTravel: {
      potential: foreignTravelIndicators.length >= 2 ? 'Strong (Frequent Overseas Journeys / Foreign Residence)' : 'Moderate (Domestic & Regional Travel)',
      indicators: foreignTravelIndicators.length > 0 ? foreignTravelIndicators : ['Travel primarily within cultural borders.']
    },
    higherEducation: {
      potential: higherEducationIndicators.length >= 2 ? 'Distinguished (Advanced Degrees, Research & Authorship)' : 'Standard Academic Foundation',
      indicators: higherEducationIndicators.length > 0 ? higherEducationIndicators : ['General academic training.']
    }
  };
}

/**
 * 9.5 House 9 Classical Yogas Evaluator
 * Source: Mehta Ch. 9, Phala Deepika, BPHS, Bhavartha Ratnakara
 */
function checkNinthHouseYogas(planets, ascSignId, h9LordKey, h9LordHouse, h9LordSignId, extraContext = {}) {
  const yogas = [];
  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9Lord = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);

  // 1. Dharma-Karmadhipati Raja Yoga
  const dkYoga = calculateDharmaKarmaYoga(planets, ascSignId);
  if (dkYoga.isFormed) {
    yogas.push({
      name: dkYoga.title,
      condition: dkYoga.description,
      effects: dkYoga.effects,
      description: `${dkYoga.description} ${dkYoga.effects}`,
      type: 'Auspicious / Supreme Raja Yoga',
      source: dkYoga.source
    });
  }

  // 2. Lakshmi Yoga
  const bhagya = calculateBhagyaProfile(planets, ascSignId, h9LordKey, h9LordHouse, h9LordSignId);
  if (bhagya.hasLakshmiYoga) {
    const cond = '9th Lord is in Kendra/Trikona in its own or exalted sign, and Venus is also in Kendra/Trikona in its own or exalted sign.';
    const eff = 'Supreme Lakshmi Yoga: Native is blessed by Goddess Lakshmi with boundless wealth, noble pedigree, high moral virtue, regal conveyances, and flawless reputation (Phala Deepika 6.35).';
    yogas.push({
      name: 'Lakshmi Yoga (Goddess of Fortune Alignment)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Maha Dhana Raja Yoga',
      source: 'Phala Deepika, Ch. 6, Sl. 35'
    });
  }

  // 3. 2nd & 9th Maha Dhana Yoga
  if (bhagya.mahaDhanaYoga) {
    yogas.push({
      name: 'Maha Dhana Yoga (2nd & 9th House Nexus)',
      condition: bhagya.dhanaDetails,
      effects: 'Bestows flourishing family business, steady liquid wealth, sweet and persuasive speech, and massive financial stability (Mehta p. 174).',
      description: bhagya.dhanaDetails,
      type: 'Auspicious / Maha Dhana Yoga',
      source: 'Bhavartha Ratnakara & Mehta Ch. 9, p. 174'
    });
  }

  // 4. Bhagya Karta Elevation Yoga
  if (bhagya.bhagyaKarta.isKendraKona) {
    yogas.push({
      name: `Bhagya Karta Elevation (${bhagya.bhagyaKarta.lordName} in House ${bhagya.bhagyaKarta.house})`,
      condition: `Dispositor of 9th Lord (${bhagya.bhagyaKarta.lordName}) occupies Kendra/Trikona House ${bhagya.bhagyaKarta.house} with ${bhagya.bhagyaKarta.dignity} dignity.`,
      effects: 'Fulfills Mehta\'s cardinal dictum (p. 180): A favourable Bhagyapati in Kendra or Kona lifts the native from humble origins to towering success and public esteem.',
      description: bhagya.bhagyaKarta.note,
      type: 'Auspicious / Providential Elevation',
      source: 'Mehta Ch. 9, p. 180'
    });
  }

  // 5. Buddha Yoga / Ascetic Intellect (Mercury in 9th)
  const mercury = planets.find(p => getPlanetKey(p.key || p.name) === 'Merc');
  if (mercury && (((mercury.signId - ascSignId + 12) % 12) + 1) === 9) {
    const cond = 'Mercury occupies the 9th house of higher wisdom and philosophy.';
    const eff = 'Mehta notes (p. 178): Endows an ascetic, noble, and meditative intellect like Lord Buddha; supreme mastery in astrology, mathematics, higher literature, and scientific discoveries.';
    yogas.push({
      name: 'Buddha Yoga (Ascetic Intellect & Scientific Discovery)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Intellectual Mastery',
      source: 'Mehta Ch. 9, p. 178'
    });
  }

  // 6. Rahu Foreign Language & Intercultural Mastery (Rahu in 9th)
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');
  if (rahu && (((rahu.signId - ascSignId + 12) % 12) + 1) === 9) {
    const cond = 'Rahu occupies the 9th house of higher philosophy and global travel.';
    const eff = 'Mehta\'s empirical discovery (p. 180): Confers extraordinary proficiency in foreign languages and intercultural literature, elevating professors, translators, and foreign diplomats to high honor.';
    yogas.push({
      name: 'Rahu Intercultural & Linguistic Mastery',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Linguistic & Global Skill',
      source: 'Mehta Ch. 9, p. 180'
    });
  }

  // 7. Swakshetra Bhagya Yoga (9th Lord in 9th House)
  if (h9LordHouse === 9) {
    const cond = `9th Lord (${h9LordKey}) is comfortably situated in its own Swakshetra 9th house.`;
    const eff = 'Pristine Bhagya Yoga: Endows the native with unblemished luck, divine grace, long life, noble progeny, deep religious piety, and flourishing ancestral endowments (Phala Deepika).';
    yogas.push({
      name: 'Swakshetra Bhagya Yoga (Fortress of Divine Grace)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Divine Grace',
      source: 'Phala Deepika & Mehta Ch. 9, p. 176'
    });
  }

  return yogas;
}

/**
 * 10.1 Amala Yoga Evaluator (Phala Deepika 6.64 & Mehta Ch. 10, p. 186)
 * "When a benefic planet is placed in the 10th house from Lagna or Moon (unblemished by malefics),
 * it gives rise to Amala Yoga — conferring an unblemished reputation, lasting prosperity, and sovereign honor."
 */
export function calculateAmalaYoga(planets, ascSignId) {
  const h10LagnaSignId = ((ascSignId - 1 + 9) % 12) + 1;
  const naturalBenefics = ['Jupt', 'Venu', 'Merc'];
  const naturalMalefics = ['Sun', 'Mars', 'Satn', 'Rahu', 'Ketu'];

  // 10th from Lagna
  const occupantsLagna = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && p.signId === h10LagnaSignId;
  });

  const beneficsLagna = occupantsLagna.filter(p => naturalBenefics.includes(getPlanetKey(p.key || p.name)));
  const maleficsLagna = occupantsLagna.filter(p => naturalMalefics.includes(getPlanetKey(p.key || p.name)));

  // 10th from Moon
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  let beneficsMoon = [];
  let maleficsMoon = [];
  let h10MoonSignId = null;

  if (moon) {
    h10MoonSignId = ((moon.signId - 1 + 9) % 12) + 1;
    const occupantsMoon = planets.filter(p => {
      const k = getPlanetKey(p.key || p.name);
      return k !== 'ASC' && p.signId === h10MoonSignId;
    });
    beneficsMoon = occupantsMoon.filter(p => naturalBenefics.includes(getPlanetKey(p.key || p.name)));
    maleficsMoon = occupantsMoon.filter(p => naturalMalefics.includes(getPlanetKey(p.key || p.name)));
  }

  const isFormedFromLagna = beneficsLagna.length > 0 && maleficsLagna.length === 0;
  const isFormedFromMoon = beneficsMoon.length > 0 && maleficsMoon.length === 0;

  if (isFormedFromLagna && isFormedFromMoon) {
    return {
      isFormed: true,
      type: 'Double Amala Yoga (Lagna & Chandra)',
      title: 'Maha Amala Yoga (Spotless Dual Eminence)',
      rating: '⭐⭐⭐⭐⭐ Immaculate Imperial Eminence',
      beneficsFromLagna: beneficsLagna.map(p => getPlanetKey(p.key || p.name)),
      beneficsFromMoon: beneficsMoon.map(p => getPlanetKey(p.key || p.name)),
      maleficsPresent: [],
      description: `Natural benefics occupy the 10th house from both Lagna (${beneficsLagna.map(p => getPlanetKey(p.key || p.name)).join(', ')}) and Moon (${beneficsMoon.map(p => getPlanetKey(p.key || p.name)).join(', ')}) completely free from malefic conjunction.`,
      effects: 'Bestows an unassailable spotless reputation, perpetual prosperity, sovereign honors, righteous deeds, and enduring institutional fame throughout life.',
      shlokaReference: 'Phala Deepika 6.64; Mehta Ch. 10, p. 186'
    };
  }

  if (isFormedFromLagna) {
    return {
      isFormed: true,
      type: 'Amala Yoga from Lagna',
      title: 'Amala Yoga (Lagna Kendra Sovereign Virtue)',
      rating: '⭐⭐⭐⭐ Spotless Public Eminence',
      beneficsFromLagna: beneficsLagna.map(p => getPlanetKey(p.key || p.name)),
      beneficsFromMoon: beneficsMoon.map(p => getPlanetKey(p.key || p.name)),
      maleficsPresent: [],
      description: `Natural benefic planet (${beneficsLagna.map(p => getPlanetKey(p.key || p.name)).join(', ')}) occupies the 10th house from Lagna without malefic affliction.`,
      effects: 'Endows spotless public reputation, high institutional standing, charitable nobility, and steady career prosperity (Phala Deepika 6.64).',
      shlokaReference: 'Phala Deepika 6.64; Mehta Ch. 10, p. 186'
    };
  }

  if (isFormedFromMoon) {
    return {
      isFormed: true,
      type: 'Amala Yoga from Chandra Lagna',
      title: 'Chandra Amala Yoga (Lunar Spotless Acclaim)',
      rating: '⭐⭐⭐⭐ Spotless Lunar Acclaim',
      beneficsFromLagna: beneficsLagna.map(p => getPlanetKey(p.key || p.name)),
      beneficsFromMoon: beneficsMoon.map(p => getPlanetKey(p.key || p.name)),
      maleficsPresent: [],
      description: `Natural benefic planet (${beneficsMoon.map(p => getPlanetKey(p.key || p.name)).join(', ')}) occupies the 10th house from Moon without malefic affliction.`,
      effects: 'Confers widespread public popularity, moral dignity, professional acclaim, and fortune in societal leadership.',
      shlokaReference: 'Phala Deepika 6.64; Mehta Ch. 10, p. 186'
    };
  }

  // Check if benefic present but conjoined with malefic (Conditional / Blemished)
  if (beneficsLagna.length > 0 || beneficsMoon.length > 0) {
    const allMalefics = [...maleficsLagna, ...maleficsMoon].map(p => getPlanetKey(p.key || p.name));
    return {
      isFormed: false,
      isConditional: true,
      type: 'Blemished Amala Yoga',
      title: 'Amala Yoga (Subject to Malefic Friction)',
      rating: '⭐⭐⭐ Intermittent Eminence with Public Challenges',
      beneficsFromLagna: beneficsLagna.map(p => getPlanetKey(p.key || p.name)),
      beneficsFromMoon: beneficsMoon.map(p => getPlanetKey(p.key || p.name)),
      maleficsPresent: Array.from(new Set(allMalefics)),
      description: `Benefics are present in the 10th house but conjoined with natural malefics (${Array.from(new Set(allMalefics)).join(', ')}), causing public controversies or professional obstacles alongside recognition.`,
      effects: 'High reputation is punctuated by periodic political or workplace rivalries requiring ethical vigilance.',
      shlokaReference: 'Mehta Ch. 10, p. 186'
    };
  }

  return {
    isFormed: false,
    type: 'None',
    title: 'Amala Yoga Inactive',
    rating: '---',
    beneficsFromLagna: [],
    beneficsFromMoon: [],
    maleficsPresent: maleficsLagna.map(p => getPlanetKey(p.key || p.name)),
    description: 'No natural benefics occupy the 10th house from either Lagna or Moon.',
    effects: 'Professional achievements unfold primarily through 10th lord dispositor dignity, Karakas, and operational Dashas.',
    shlokaReference: 'Phala Deepika 6.64'
  };
}

/**
 * 10.2 Directional Strength (Digbala) & Vocational Profile Engine
 * Ground truth: Mehta Ch. 10, pp. 186-193; Satyacharya; Phala Deepika
 */
export function calculateCareerAndVocationalProfile(planets, ascSignId, h10LordKey, h10LordHouse, h10LordSignId) {
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10Sign = SIGNS[h10SignId - 1];

  const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const mars = planets.find(p => getPlanetKey(p.key || p.name) === 'Mars');
  const mercury = planets.find(p => getPlanetKey(p.key || p.name) === 'Merc');
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const venus = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const saturn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');
  const ketu = planets.find(p => getPlanetKey(p.key || p.name) === 'Ketu');
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');

  // Digbala Check
  const isSunIn10 = sun && (((sun.signId - ascSignId + 12) % 12) + 1) === 10;
  const isMarsIn10 = mars && (((mars.signId - ascSignId + 12) % 12) + 1) === 10;

  let digbalaStatus = 'None';
  let digbalaTitle = 'Standard Directional Strength';
  let digbalaNote = 'Neither Sun nor Mars occupies the 10th house for directional strength.';

  if (isSunIn10 && isMarsIn10) {
    digbalaStatus = 'Dual Supreme Digbala (Sun & Mars)';
    digbalaTitle = 'Double Digbala Imperial Powerhouse';
    digbalaNote = 'Both Sun and Mars attain 100% Directional Strength (Digbala) in the 10th house, conferring unprecedented administrative dominion, executive courage, and sovereign authority (Mehta p. 186-189).';
  } else if (isSunIn10) {
    digbalaStatus = 'Sun Supreme Digbala (60 Virupas)';
    digbalaTitle = 'Surya Digbala (Imperial Governance & State Authority)';
    digbalaNote = 'The Sun attains full directional strength in the 10th house. Gives royal patronage, civil service / administrative prominence, dignified office, and high public responsibility (Mehta p. 186-187).';
  } else if (isMarsIn10) {
    digbalaStatus = 'Mars Supreme Digbala (60 Virupas)';
    digbalaTitle = 'Mangala Digbala (Commander & Technical Pioneer)';
    digbalaNote = 'Mars attains full directional strength in the 10th house. Gives fearless leadership, dominance in armed forces, police, surgery, engineering, or heavy industrial enterprise (Mehta p. 189).';
  }

  // Satyacharya Rule for Actors / Performers / Artists (Mehta p. 185)
  // 3rd lord in 10th house, especially in signs of Mercury (Gemini, Virgo) or Venus (Taurus, Libra)
  const h3SignId = ((ascSignId - 1 + 2) % 12) + 1;
  const h3LordKey = getPlanetKey(SIGNS[h3SignId - 1].lord);
  const p3 = planets.find(p => getPlanetKey(p.key || p.name) === h3LordKey);
  const is3rdLordIn10 = p3 && (((p3.signId - ascSignId + 12) % 12) + 1) === 10;
  const isArtistSign = [2, 3, 6, 7].includes(h10SignId); // Taurus, Gemini, Virgo, Libra

  let satyacharyaArtistYoga = null;
  if (is3rdLordIn10) {
    const isMarsConnected = mars && (mars.signId === p3.signId || (((mars.signId - ascSignId + 12) % 12) + 1) === 10);
    satyacharyaArtistYoga = {
      isFormed: true,
      title: 'Satyacharya Kala & Abhinaya Yoga (Cinema / Music / Performing Arts)',
      rating: isArtistSign ? '⭐⭐⭐⭐⭐ Celebrated Performing Artist' : '⭐⭐⭐⭐ Artistic / Media Eminence',
      description: `3rd Lord of dramatic expression (${h3LordKey}) resides in the 10th Kendra${isArtistSign ? ` in ${h10Sign.name} (ruled by ${h10Sign.lord})` : ''}. Sage Satyacharya dictates this position creates a celebrated singer, actor, dancer, or instrumentalist (exemplified in Nargis Dutt's chart, Mehta p. 185).`,
      specialization: isMarsConnected ? 'Instrumental Music / Dynamic Physical Performance' : 'Dramatic Acting / Vocal Music / Fine Cinema Arts',
      source: 'Sage Satyacharya & Mehta Ch. 10, p. 185'
    };
  }

  // 10th House Occupants
  const occupants10 = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && (((p.signId - ascSignId + 12) % 12) + 1) === 10;
  });

  // Vocational Streams synthesis based on Mehta pp. 191-205
  const vocationalStreams = [];

  // Stream 1: Cusp Sign Element
  const signCategory = h10Sign.element; // Fire, Earth, Air, Water
  if (signCategory === 'Fire') {
    vocationalStreams.push({
      category: 'Governance, Defense & High Executive Administration',
      affinity: 'High (Fiery 10th Cusp)',
      roles: ['Civil Services (IAS/IPS)', 'Defense Command & Law Enforcement', 'Surgery & Emergency Medicine', 'Mechanical / Industrial Direction'],
      rationale: `Fiery cusp (${h10Sign.name}) stimulates bold enterprise, governance, administrative command, and transformative statecraft (Mehta p. 191).`
    });
  } else if (signCategory === 'Earth') {
    vocationalStreams.push({
      category: 'Corporate Finance, Banking, Real Estate & Architecture',
      affinity: 'High (Earthy 10th Cusp)',
      roles: ['Banking & Wealth Management', 'Civil Engineering & Infrastructure', 'Real Estate Development', 'Corporate Auditing & Resource Extraction'],
      rationale: `Earthy cusp (${h10Sign.name}) grounds career in tangible financial, infrastructural, and asset-building institutions (Mehta p. 191).`
    });
  } else if (signCategory === 'Air') {
    vocationalStreams.push({
      category: 'Information Technology, Media, Aviation & Research',
      affinity: 'High (Airy 10th Cusp)',
      roles: ['Software & Computing Architecture', 'Journalism, Authorship & Media', 'Aviation, Aerospace & Telecommunications', 'Judiciary & Public Relations'],
      rationale: `Airy cusp (${h10Sign.name}) channels vocational energy into intellectual, communication, theoretical, and cutting-edge digital realms (Mehta p. 191).`
    });
  } else if (signCategory === 'Water') {
    vocationalStreams.push({
      category: 'Global Commerce, Shipping, Pharmaceuticals & Healing Arts',
      affinity: 'High (Watery 10th Cusp)',
      roles: ['International Trade & Maritime Shipping', 'Pharmaceuticals & Biochemistry', 'Hospital Administration & Healthcare', 'Liquid Commodities & Food Processing'],
      rationale: `Watery cusp (${h10Sign.name}) stimulates global exports, offshore navigation, chemical sciences, and therapeutic healing (Mehta p. 191).`
    });
  }

  // Stream 2: Planetary Drivers
  if (isSunIn10 || h10LordKey === 'Sun') {
    vocationalStreams.push({
      category: 'Sovereign Governance, Politics & Public Directorate',
      affinity: 'Prime Sovereign Marker',
      roles: ['State Administration', 'Public Policy & Ministry', 'Apex Corporate Leadership', 'Medical Leadership'],
      rationale: 'Sun in 10th or 10th lord Sun gives direct resonance with state authority and high public responsibility.'
    });
  }

  if (isMarsIn10 || h10LordKey === 'Mars') {
    vocationalStreams.push({
      category: 'Engineering, Technology, Defense & Surgery',
      affinity: 'Prime Technical Marker',
      roles: ['Mechanical & Defense Engineering', 'Surgical Specialties', 'Police / Military Officer', 'Real Estate & Construction'],
      rationale: 'Mars provides executive courage, technical aptitude, and dominance over competitive environments.'
    });
  }

  if (occupants10.some(p => getPlanetKey(p.key || p.name) === 'Merc') || h10LordKey === 'Merc') {
    vocationalStreams.push({
      category: 'Commerce, Accountancy, Publishing & Journalism',
      affinity: 'Intellectual & Commercial Pillar',
      roles: ['Chartered Accountancy & Finance', 'Publishing, Editing & Authorship', 'Software Engineering & Analytics', 'Diplomatic Communications'],
      rationale: 'Mercury bestows sharp commercial acumen, mathematical skill, and mastery over verbal and digital media.'
    });
  }

  if (occupants10.some(p => getPlanetKey(p.key || p.name) === 'Jupt') || h10LordKey === 'Jupt') {
    vocationalStreams.push({
      category: 'Jurisprudence, University Professorship & Ethical Advisory',
      affinity: 'Wisdom & Advisory Pillar',
      roles: ['Judiciary & Senior Counsel', 'Higher Academic Dean / Professor', 'Financial & Corporate Advisory', 'Religious / Cultural Foundations'],
      rationale: 'Jupiter brings profound jurisprudence, institutional ethics, and dignified preceptor appointments.'
    });
  }

  if (occupants10.some(p => getPlanetKey(p.key || p.name) === 'Venu') || h10LordKey === 'Venu' || satyacharyaArtistYoga) {
    vocationalStreams.push({
      category: 'Fine Arts, Media, Fashion, Diplomacy & Luxury Commerce',
      affinity: 'Cultural & Aesthetic Pillar',
      roles: ['Cinema, Television & Stage Acting', 'Diplomatic & Foreign Relations', 'Textiles, Jewelry & Luxury Goods', 'Architecture & Interior Design'],
      rationale: 'Venus governs aesthetic refinement, entertainment media, diplomatic finesse, and luxury goods commerce.'
    });
  }

  if (occupants10.some(p => getPlanetKey(p.key || p.name) === 'Satn') || h10LordKey === 'Satn') {
    vocationalStreams.push({
      category: 'Heavy Industry, Mining, Labor Organizations & Mass Politics',
      affinity: 'Structural & Enterprise Pillar',
      roles: ['Industrial Manufacturing & Hardware', 'Mining, Petroleum & Steel', 'Public Labor Union Leadership', 'Judicial / Administrative Integrity'],
      rationale: 'Saturn connects with organizational discipline, mass following, heavy industry, and structural perseverance.'
    });
  }

  if (occupants10.some(p => getPlanetKey(p.key || p.name) === 'Rahu')) {
    vocationalStreams.push({
      category: 'Cutting-Edge Computing, Aviation, Electronics & Unorthodox Politics',
      affinity: 'Technological & Disruptive Marker',
      roles: ['Artificial Intelligence & Computer Engineering', 'Aviation & Aerospace', 'Unconventional Political Campaigns', 'Multinational Corporations'],
      rationale: 'Rahu introduces foreign technology, digital innovation, and meteoric elevation in complex hierarchies (Mehta p. 203).'
    });
  }

  return {
    cuspSign: {
      name: h10Sign.name,
      element: h10Sign.element,
      mobility: h10Sign.mobility,
      symbol: h10Sign.symbol
    },
    digbala: {
      status: digbalaStatus,
      title: digbalaTitle,
      note: digbalaNote,
      hasSunDigbala: isSunIn10,
      hasMarsDigbala: isMarsIn10
    },
    satyacharyaArtistYoga,
    vocationalStreams,
    occupantSummary: occupants10.map(p => getPlanetKey(p.key || p.name))
  };
}

/**
 * 10.3 Simhasana & Sovereign High Office Raja Yoga Matrix
 * Ground truth: Mehta Ch. 10, pp. 182-188, 214; BPHS Ch. 24 & 34; Phala Deepika Ch. 6
 */
export function calculateSimhasanaAndStatusProfile(planets, ascSignId, h10LordKey, h10LordHouse, h10LordSignId) {
  const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const pLagna = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);

  const isSunIn10 = sun && (((sun.signId - ascSignId + 12) % 12) + 1) === 10;
  const h10Lord = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);
  const h10LordDignity = getPlanetaryDignity(h10LordKey, h10LordSignId);

  const indicators = [];
  let statusScore = 50;

  // 1. Kshetra Simhasana Yoga (10th lord in 1, 4, 9, 10 or Sun in 10 aspecting 4th throne)
  let hasKshetraSimhasana = false;
  if (isSunIn10) {
    hasKshetraSimhasana = true;
    indicators.push('Kshetra Simhasana Yoga (Sun in 10th Kendra): Sun shines at the zenith of the sky, casting its direct 7th aspect upon the 4th house — the symbolic throne of the sovereign (Mehta p. 187).');
    statusScore += 15;
  } else if ([1, 4, 9, 10].includes(h10LordHouse) && (h10LordDignity.includes('Exalted') || h10LordDignity.includes('Own Sign') || h10LordDignity.includes('Moolatrikona'))) {
    hasKshetraSimhasana = true;
    indicators.push(`Kshetra Simhasana Yoga: 10th Lord (${h10LordKey}) occupies auspicious Kendra/Kona House ${h10LordHouse} in fortified ${h10LordDignity} dignity, establishing sovereign status and royal favor.`);
    statusScore += 15;
  }

  // 2. Parashara Sovereign Acclaim Yoga (10th lord in 9th, Lagna lord in 10th, Moon in 5th)
  let hasParasharaAcclaim = false;
  const isLagnaLordIn10 = pLagna && (((pLagna.signId - ascSignId + 12) % 12) + 1) === 10;
  const isMoonIn5 = moon && (((moon.signId - ascSignId + 12) % 12) + 1) === 5;
  if (h10LordHouse === 9 && isLagnaLordIn10 && isMoonIn5) {
    hasParasharaAcclaim = true;
    indicators.push('Parashara Supreme Kirti Yoga: 10th Lord in 9th, Lagna Lord in 10th, and Moon in 5th house — Maharishi Parashara proclaims this confers world-spanning fame and unassailable authority (Mehta p. 214).');
    statusScore += 25;
  }

  // 3. Lagna Lord + 10th Lord Sambandha (Pioneering Executive Leadership)
  let hasLagnaAnd10thNexus = false;
  if (pLagna && h10Lord) {
    if (pLagna.signId === h10Lord.signId) {
      hasLagnaAnd10thNexus = true;
      indicators.push(`Lagna-Karma Conjunction: Lagna Lord (${lagnaLordKey}) and 10th Lord (${h10LordKey}) conjoin in House ${(((pLagna.signId - ascSignId + 12) % 12) + 1)}, creating an elite self-made executive leader and institutional pioneer (Mehta p. 183).`);
      statusScore += 15;
    } else if ((((h10Lord.signId - pLagna.signId + 12) % 12) + 1) === 7) {
      hasLagnaAnd10thNexus = true;
      indicators.push(`Lagna-Karma Mutual Aspect: Lagna Lord (${lagnaLordKey}) and 10th Lord (${h10LordKey}) cast full mutual aspects, aligning physical drive directly with career authority.`);
      statusScore += 12;
    }
  }

  // 4. Dharma-Karmadhipati Raja Yoga
  const dkYoga = calculateDharmaKarmaYoga(planets, ascSignId);
  if (dkYoga.isFormed) {
    indicators.push(`Dharma-Karmadhipati Raja Yoga: ${dkYoga.title} active, infusing career authority with ethical purity and sovereign patronage.`);
    statusScore += 15;
  }

  // 5. 11th Lord in 10th with strong 10th Lord & Jupiter aspect (Parashara fame)
  const h11SignId = ((ascSignId - 1 + 10) % 12) + 1;
  const h11LordKey = getPlanetKey(SIGNS[h11SignId - 1].lord);
  const p11 = planets.find(p => getPlanetKey(p.key || p.name) === h11LordKey);
  const is11thLordIn10 = p11 && (((p11.signId - ascSignId + 12) % 12) + 1) === 10;
  if (is11thLordIn10 && (h10LordDignity.includes('Exalted') || h10LordDignity.includes('Own Sign') || h10LordDignity.includes('Moolatrikona'))) {
    indicators.push(`Parashara Labha-Karma Raja Yoga: 11th Lord (${h11LordKey}) resides in the 10th Kendra with a fortified 10th Lord (${h10LordKey}), ensuring public acclaim and vast commercial gains (Mehta p. 214).`);
    statusScore += 15;
  }

  // 6. Pancha Mahapurusha Yoga in 10th House
  const occupants10 = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && (((p.signId - ascSignId + 12) % 12) + 1) === 10;
  });

  const mahapurushaPlanets = [
    { key: 'Mars', yoga: 'Ruchaka Mahapurusha Yoga (Valor, Commander, Military/Surgical Triumph)' },
    { key: 'Merc', yoga: 'Bhadra Mahapurusha Yoga (Diplomatic & Commercial Eminence, Intellectual Genius)' },
    { key: 'Jupt', yoga: 'Hamsa Mahapurusha Yoga (Supreme Jurisprudence, Chancellor / Ministerial Dignity)' },
    { key: 'Venu', yoga: 'Malavya Mahapurusha Yoga (Diplomatic Honors, High Media/Cultural Authority)' },
    { key: 'Satn', yoga: 'Sasa Mahapurusha Yoga (Mass Political Dominance, Industrial Tycoon Status)' }
  ];

  mahapurushaPlanets.forEach(mp => {
    const occ = occupants10.find(p => getPlanetKey(p.key || p.name) === mp.key);
    if (occ) {
      const dig = getPlanetaryDignity(mp.key, occ.signId);
      if ((dig.includes('Exalted') || dig.includes('Own Sign') || dig.includes('Moolatrikona'))) {
        indicators.push(`${mp.yoga}: Formed by fortified ${mp.key} in the 10th Kendra (Mehta pp. 189-191).`);
        statusScore += 18;
      }
    }
  });

  // Adjustments for Dusthana placement
  if ([6, 8, 12].includes(h10LordHouse)) {
    statusScore -= 15;
  }
  if (h10LordDignity.includes('Debilitated')) {
    statusScore -= 20;
  }

  // Clamp score
  statusScore = Math.max(20, Math.min(100, statusScore));

  let statusRating = 'Elite Sovereign Leadership';
  if (statusScore >= 85) statusRating = '⭐⭐⭐⭐⭐ Pinnacle Imperial / Ministerial Stature';
  else if (statusScore >= 70) statusRating = '⭐⭐⭐⭐ High Executive & Institutional Command';
  else if (statusScore >= 55) statusRating = '⭐⭐⭐ Respected Professional Authority';
  else statusRating = '⭐⭐ Independent / Moderate Vocational Standing';

  return {
    score: statusScore,
    rating: statusRating,
    hasKshetraSimhasana,
    hasParasharaAcclaim,
    hasLagnaAnd10thNexus,
    indicators: indicators.length > 0 ? indicators : ['Standard professional advancement through gradual merit.']
  };
}

/**
 * 10.4 Career Stability vs. Volatility Diagnostics Engine
 * Ground truth: Mehta Ch. 10, pp. 183-186, 213-214; BPHS Ch. 24
 */
export function calculateCareerStabilityProfile(planets, ascSignId, h10LordKey, h10LordHouse, h10LordSignId) {
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10LordDignity = getPlanetaryDignity(h10LordKey, h10LordSignId);
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');

  const riskFactors = [];
  const protectiveFactors = [];
  let stabilityScore = 70;

  // 1. 10th Lord in 8th House (Breaks in career & transformations - Mehta p. 183-184)
  if (h10LordHouse === 8) {
    stabilityScore -= 25;
    const isRahuIn8 = rahu && (((rahu.signId - ascSignId + 12) % 12) + 1) === 8;
    if (isRahuIn8) {
      riskFactors.push('10th Lord in 8th with Rahu: Classical alert from Parashara & Mehta (p. 183) — indicates sudden vocational ruptures, danger of anti-social shortcuts, or ethical pitfalls unless fortified by Jupiter.');
      stabilityScore -= 10;
    } else {
      riskFactors.push('10th Lord in 8th House: Prone to career interruptions, unexpected structural pivots, or periods of occupational retreat (favors research, surgery, mining, and occult subjects).');
    }
  }

  // 2. 10th Lord in 6th or 12th House
  if (h10LordHouse === 6) {
    riskFactors.push('10th Lord in 6th House: Workplace disputes, disciplinary procedures, or intense rivalries; however, favorable for legal, medical, or defense careers.');
    stabilityScore -= 10;
  } else if (h10LordHouse === 12) {
    riskFactors.push('10th Lord in 12th House: Relocation abroad, distant postings, or occupational dissipation if linked with 12th lord (Mehta p. 184).');
    stabilityScore -= 12;
  }

  // 3. Dusthana Lords in 10th House
  const h8SignId = ((ascSignId - 1 + 7) % 12) + 1;
  const h8LordKey = getPlanetKey(SIGNS[h8SignId - 1].lord);
  const p8 = planets.find(p => getPlanetKey(p.key || p.name) === h8LordKey);
  if (p8 && (((p8.signId - ascSignId + 12) % 12) + 1) === 10) {
    riskFactors.push(`8th Lord (${h8LordKey}) in 10th House: Mehta (p. 186) notes periods of joblessness, career hiatus, or friction with institutional authorities.`);
    stabilityScore -= 15;
  }

  const h12SignId = ((ascSignId - 1 + 11) % 12) + 1;
  const h12LordKey = getPlanetKey(SIGNS[h12SignId - 1].lord);
  const p12 = planets.find(p => getPlanetKey(p.key || p.name) === h12LordKey);
  if (p12 && (((p12.signId - ascSignId + 12) % 12) + 1) === 10) {
    riskFactors.push(`12th Lord (${h12LordKey}) in 10th House: Mehta (p. 186) indicates official fines, tax audits, or involuntary relocations.`);
    stabilityScore -= 10;
  }

  // 4. Debilitated 10th Lord
  if (h10LordDignity.includes('Debilitated')) {
    riskFactors.push(`10th Lord (${h10LordKey}) is debilitated: Potential lack of institutional support, career obstructions, or periods of professional exhaustion.`);
    stabilityScore -= 20;
  }

  // Protective Factors: Jupiter aspect or strong placement
  if (jupiter) {
    const jupHouse = (((jupiter.signId - ascSignId + 12) % 12) + 1);
    const aspectHouses = [jupHouse, ((jupHouse + 4) % 12) || 12, ((jupHouse + 6) % 12) || 12, ((jupHouse + 8) % 12) || 12];
    if (aspectHouses.includes(10) || aspectHouses.includes(h10LordHouse)) {
      protectiveFactors.push('Jupiter casts benign aspect on 10th house or 10th lord: Dissolves occupational blemish, protects reputation, and grants wise institutional mentors.');
      stabilityScore += 18;
    }
  }

  if ((h10LordDignity.includes('Exalted') || h10LordDignity.includes('Own Sign') || h10LordDignity.includes('Moolatrikona'))) {
    protectiveFactors.push(`10th Lord is fortified in ${h10LordDignity} dignity: Unshakeable vocational resilience and rapid recovery from workplace setbacks.`);
    stabilityScore += 15;
  }

  if ([1, 4, 5, 9, 10, 11].includes(h10LordHouse)) {
    protectiveFactors.push(`10th Lord occupies auspicious House ${h10LordHouse}, securing career longevity and institutional patronage.`);
    stabilityScore += 10;
  }

  // Clamp score
  stabilityScore = Math.max(15, Math.min(100, stabilityScore));

  let stabilityRating = 'Moderate Stability';
  if (stabilityScore >= 80) stabilityRating = 'Rock Solid / Unshakeable Citadel';
  else if (stabilityScore >= 65) stabilityRating = 'High Stability with Sustained Expansion';
  else if (stabilityScore >= 45) stabilityRating = 'Dynamic / Periodic Shifts & Strategic Breakthroughs';
  else stabilityRating = 'Volatile / Vulnerable to Career Breaks & Institutional Friction';

  return {
    score: stabilityScore,
    rating: stabilityRating,
    riskFactors: riskFactors.length > 0 ? riskFactors : ['No major career volatility markers detected.'],
    protectiveFactors: protectiveFactors.length > 0 ? protectiveFactors : ['Standard professional baseline.'],
    classicalRemedy: stabilityScore < 60
      ? 'Classical Remedial Dictum: Service to preceptors, recitation of Aditya Hridaya Stotram, and ethical workplace conduct mitigate career fluctuations (Mehta Ch. 10).'
      : 'Maintain ethical integrity and continue noble public welfare deeds.'
  };
}

/**
 * 10.5 House 10 Classical Yogas Evaluator
 * Source: Mehta Ch. 10, Phala Deepika, BPHS, Saravali, Bhavartha Ratnakara
 */
function checkTenthHouseYogas(planets, ascSignId, h10LordKey, h10LordHouse, h10LordSignId, extraContext = {}) {
  const yogas = [];
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10Sign = SIGNS[h10SignId - 1];
  const h10Lord = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);
  const h10LordDignity = getPlanetaryDignity(h10LordKey, h10LordSignId);

  // 1. Amala Yoga
  const amala = calculateAmalaYoga(planets, ascSignId);
  if (amala.isFormed) {
    yogas.push({
      name: amala.title,
      condition: amala.description,
      effects: amala.effects,
      description: `${amala.description} ${amala.effects}`,
      type: 'Auspicious / Spotless Reputation & Prosperity',
      source: amala.shlokaReference
    });
  }

  // 2. Pancha Mahapurusha Yogas in 10th Kendra
  const occupants10 = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && (((p.signId - ascSignId + 12) % 12) + 1) === 10;
  });

  occupants10.forEach(p => {
    const k = getPlanetKey(p.key || p.name);
    const dig = getPlanetaryDignity(k, p.signId);
    if ((dig.includes('Exalted') || dig.includes('Own Sign') || dig.includes('Moolatrikona'))) {
      if (k === 'Mars') {
        yogas.push({
          name: 'Ruchaka Mahapurusha Yoga in 10th Kendra',
          condition: `Mars is exalted or in own sign (${SIGNS[p.signId - 1].name}) in the 10th Kendra with supreme Digbala.`,
          effects: 'Makes the native full of courage, powerful, conqueror of enemies, arrogant in valor, celebrated, and commander of armed forces or police (Phala Deepika 6.2; Mehta p. 189).',
          description: `Mars in House 10 in ${SIGNS[p.signId - 1].name} confers imperial courage, executive leadership, and military/technical triumph.`,
          type: 'Auspicious / Supreme Mahapurusha Yoga',
          source: 'Phala Deepika 6.2; Mehta Ch. 10, p. 189'
        });
      } else if (k === 'Merc') {
        yogas.push({
          name: 'Bhadra Mahapurusha Yoga in 10th Kendra',
          condition: `Mercury is exalted or in own sign (${SIGNS[p.signId - 1].name}) in the 10th Kendra.`,
          effects: 'Confers longevity, brilliant intellect, pure speech, scholarly praise, diplomatic eloquence, and immense commercial prosperity (Phala Deepika 6.3; Mehta p. 189).',
          description: `Mercury in House 10 in ${SIGNS[p.signId - 1].name} bestows early career breakthroughs, literary fame, and commercial leadership.`,
          type: 'Auspicious / Supreme Mahapurusha Yoga',
          source: 'Phala Deepika 6.3; Mehta Ch. 10, p. 189'
        });
      } else if (k === 'Jupt') {
        yogas.push({
          name: 'Hamsa Mahapurusha Yoga in 10th Kendra',
          condition: `Jupiter is exalted or in own sign (${SIGNS[p.signId - 1].name}) in the 10th Kendra.`,
          effects: 'Endows state emblems, magnificent dwellings, association with revered scholars, judicial / ministerial authority, and spotless moral character (Phala Deepika 6.4; Mehta pp. 189-190).',
          description: `Jupiter in House 10 in ${SIGNS[p.signId - 1].name} grants royal honors, chancellor/ministerial status, and institutional wisdom.`,
          type: 'Auspicious / Supreme Mahapurusha Yoga',
          source: 'Phala Deepika 6.4; Mehta Ch. 10, pp. 189-190'
        });
      } else if (k === 'Venu') {
        yogas.push({
          name: 'Malavya Mahapurusha Yoga in 10th Kendra',
          condition: `Venus is exalted or in own sign (${SIGNS[p.signId - 1].name}) in the 10th Kendra.`,
          effects: 'Confers immense wealth, societal charm, luxury conveyances, artistic eloquence, and high rank in cultural or diplomatic governance (Phala Deepika 6.5; Mehta p. 190).',
          description: `Venus in House 10 in ${SIGNS[p.signId - 1].name} bestows diplomatic honors, aesthetic genius, and luxurious prosperity.`,
          type: 'Auspicious / Supreme Mahapurusha Yoga',
          source: 'Phala Deepika 6.5; Mehta Ch. 10, p. 190'
        });
      } else if (k === 'Satn') {
        yogas.push({
          name: 'Sasa Mahapurusha Yoga in 10th Kendra',
          condition: `Saturn is exalted or in own sign (${SIGNS[p.signId - 1].name}) in the 10th Kendra.`,
          effects: 'Confers sovereign or ministerial status, mass following (formidable political leader/Neta), industrial tycoon stature, and senior administrative command (Phala Deepika 6.6; Mehta pp. 190-191).',
          description: `Saturn in House 10 in ${SIGNS[p.signId - 1].name} gives fearless authority, mass support, and enduring industrial dominance.`,
          type: 'Auspicious / Supreme Mahapurusha Yoga',
          source: 'Phala Deepika 6.6; Mehta Ch. 10, pp. 190-191'
        });
      }
    }
  });

  // 3. Kshetra Simhasana Yoga
  const status = calculateSimhasanaAndStatusProfile(planets, ascSignId, h10LordKey, h10LordHouse, h10LordSignId);
  if (status.hasKshetraSimhasana) {
    const sun = planets.find(p => getPlanetKey(p.key || p.name) === 'Sun');
    const isSunIn10 = sun && (((sun.signId - ascSignId + 12) % 12) + 1) === 10;
    const cond = isSunIn10
      ? 'Sun occupies the 10th Kendra, casting full aspect upon the 4th house throne.'
      : `10th Lord (${h10LordKey}) occupies auspicious Kendra/Kona House ${h10LordHouse} in strong dignity.`;
    const eff = 'Kshetra Simhasana Yoga: Establishes the native upon the symbolic seat of sovereign authority, commanding high executive rank, government respect, and lasting renown.';
    yogas.push({
      name: 'Kshetra Simhasana Yoga (Seat of Royal Authority)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Sovereign Raja Yoga',
      source: 'Mehta Ch. 10, p. 187; Classical Dictum'
    });
  }

  // 4. Parashara Supreme Kirti Yoga
  if (status.hasParasharaAcclaim) {
    const cond = '10th Lord is in 9th house, Lagna Lord is in 10th house, and Moon is in 5th house.';
    const eff = 'Confers boundless world fame, spotless public reputation, and sovereign patronage (BPHS & Mehta p. 214).';
    yogas.push({
      name: 'Parashara Kirti Yoga (Boundless World Acclaim)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Universal Acclaim Raja Yoga',
      source: 'Maharishi Parashara; Mehta Ch. 10, p. 214'
    });
  }

  // 5. Dharma-Karmadhipati Raja Yoga
  const dkYoga = calculateDharmaKarmaYoga(planets, ascSignId);
  if (dkYoga.isFormed) {
    yogas.push({
      name: dkYoga.title,
      condition: dkYoga.description,
      effects: dkYoga.effects,
      description: `${dkYoga.description} ${dkYoga.effects}`,
      type: 'Auspicious / Supreme Raja Yoga',
      source: dkYoga.source
    });
  }

  // 6. Satyacharya Kala & Abhinaya Yoga
  const career = calculateCareerAndVocationalProfile(planets, ascSignId, h10LordKey, h10LordHouse, h10LordSignId);
  if (career.satyacharyaArtistYoga) {
    yogas.push({
      name: career.satyacharyaArtistYoga.title,
      condition: career.satyacharyaArtistYoga.description,
      effects: `Distinction as a celebrated performing artist, singer, actor, or musician (${career.satyacharyaArtistYoga.specialization}).`,
      description: career.satyacharyaArtistYoga.description,
      type: 'Auspicious / Artistic & Performing Genius',
      source: career.satyacharyaArtistYoga.source
    });
  }

  // 7. Swakshetra Karma Raja Yoga (10th Lord in 10th House)
  if (h10LordHouse === 10) {
    const cond = `10th Lord (${h10LordKey}) occupies its own Swakshetra 10th house.`;
    const eff = 'Fortress of Karma: Courageous, truthful, devoted to elders, respected by governance, and an unshakeable leader of industry or public welfare (Mehta p. 184).';
    yogas.push({
      name: 'Swakshetra Karma Yoga (Citadel of Vocational Sovereignty)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Professional Mastery',
      source: 'BPHS Ch. 24, Sl. 118; Mehta Ch. 10, p. 184'
    });
  }

  // 8. Vaishnava Yoga (Sun + Mercury + Venus in 10th or Kendras - Mehta p. 187)
  const sunIn10 = occupants10.find(p => getPlanetKey(p.key || p.name) === 'Sun');
  const mercIn10 = occupants10.find(p => getPlanetKey(p.key || p.name) === 'Merc');
  const venuIn10 = occupants10.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  if (sunIn10 && mercIn10 && venuIn10) {
    const cond = 'Sun, Mercury, and Venus conjoin in the 10th Kendra.';
    const eff = 'Vaishnava Yoga: Elevates the native to extraordinary spiritual, intellectual, and societal pinnacles (as observed in the horoscopes of Ramanujacharya and Swami Vivekananda, Mehta p. 187).';
    yogas.push({
      name: 'Vaishnava Yoga (Pinnacle of Spiritual & Intellectual Nobility)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Spiritual & Societal Summit',
      source: 'Mehta Ch. 10, p. 187'
    });
  }

  // 9. Sanyas Yoga (4 or more planets in 10th house - Mehta p. 184 & 214)
  if (occupants10.length >= 4) {
    const planetNames = occupants10.map(p => getPlanetKey(p.key || p.name)).join(', ');
    const cond = `Four or more planets (${planetNames}) conjoin in the 10th Kendra.`;
    const eff = 'Classical Sanyas / Pravrajya Yoga: Deep philosophical detachment, renunciation of mundane vanity, and leadership of spiritual orders or monastic foundations (Mehta p. 184, 214).';
    yogas.push({
      name: 'Dasa-Graha Sanyas Yoga (Monastic / Philosophical Renunciation)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Spiritual / Ascetic Detachment',
      source: 'Brihat Jataka & Mehta Ch. 10, pp. 184, 214'
    });
  }

  return yogas;
}

/**
 * 11.1 Maha Labha & Dhana Yoga Engine
 * Ground truth: Mehta Ch. 11, pp. 274-279; BPHS Ch. 41; Bhavartha Ratnakara
 */
export function calculateMahaLabhaDhanaYoga(planets, ascSignId, h11LordKey, h11LordHouse, h11LordSignId) {
  const lagnaLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const h2SignId = ((ascSignId - 1 + 1) % 12) + 1;
  const h2LordKey = getPlanetKey(SIGNS[h2SignId - 1].lord);
  const h5SignId = ((ascSignId - 1 + 4) % 12) + 1;
  const h5LordKey = getPlanetKey(SIGNS[h5SignId - 1].lord);
  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9LordKey = getPlanetKey(SIGNS[h9SignId - 1].lord);
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10LordKey = getPlanetKey(SIGNS[h10SignId - 1].lord);
  const h6SignId = ((ascSignId - 1 + 5) % 12) + 1;
  const h6LordKey = getPlanetKey(SIGNS[h6SignId - 1].lord);
  const h4SignId = ((ascSignId - 1 + 3) % 12) + 1;
  const h4LordKey = getPlanetKey(SIGNS[h4SignId - 1].lord);

  const pLagna = planets.find(p => getPlanetKey(p.key || p.name) === lagnaLordKey);
  const p2 = planets.find(p => getPlanetKey(p.key || p.name) === h2LordKey);
  const p5 = planets.find(p => getPlanetKey(p.key || p.name) === h5LordKey);
  const p9 = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const p10 = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);
  const p6 = planets.find(p => getPlanetKey(p.key || p.name) === h6LordKey);
  const p4 = planets.find(p => getPlanetKey(p.key || p.name) === h4LordKey);
  const p11 = planets.find(p => getPlanetKey(p.key || p.name) === h11LordKey);

  const h11LordDignity = getPlanetaryDignity(h11LordKey, h11LordSignId);

  // 11th House Occupants
  const occupants11 = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && (((p.signId - ascSignId + 12) % 12) + 1) === 11;
  });

  const naturalMalefics = ['Sun', 'Mars', 'Satn', 'Rahu', 'Ketu'];
  const naturalBenefics = ['Jupt', 'Venu', 'Merc', 'Moon'];

  const maleficOccupants = occupants11.filter(p => naturalMalefics.includes(getPlanetKey(p.key || p.name)));
  const beneficOccupants = occupants11.filter(p => naturalBenefics.includes(getPlanetKey(p.key || p.name)));

  const combinations = [];
  let dhanaScore = 50;

  // 1. 11th Lord with 2nd Lord (Paramount Maha Dhana Yoga)
  if (p2 && p11 && (p2.signId === p11.signId || h11LordHouse === 2)) {
    combinations.push({
      title: 'Paramount 2nd & 11th Maha Dhana Nexus',
      description: `11th Lord (${h11LordKey}) directly conjoins or occupies the house of accumulated wealth (2nd) with 2nd Lord (${h2LordKey}). Maharishi Parashara proclaims this produces colossal generational riches, banking prosperity, and flourishing trade (Mehta p. 275).`,
      potency: 'Supreme Dhana Multiplier (+25)'
    });
    dhanaScore += 25;
  }

  // 2. 11th Lord with 1st Lord (Self-Earned Empire / Aristocratic Heritage)
  if (pLagna && p11 && (pLagna.signId === p11.signId || h11LordHouse === 1)) {
    combinations.push({
      title: 'Lagna-Labha Sovereign Wealth Alignment',
      description: `11th Lord (${h11LordKey}) unites with Lagna Lord (${lagnaLordKey}). Birth in a prominent, wealthy lineage with immense self-earned commercial expansion (as in Rajiv Gandhi's horoscope, Mehta p. 274).`,
      potency: 'Imperial Stature (+20)'
    });
    dhanaScore += 20;
  }

  // 3. 11th Lord with 5th or 9th Trikona Lords (Lakshmi & Purva Punya Expansion)
  if (p5 && p11 && (p5.signId === p11.signId || h11LordHouse === 5)) {
    combinations.push({
      title: '5th & 11th Purva Punya & Speculative Dhana Yoga',
      description: `11th Lord (${h11LordKey}) aligns with 5th Lord of intellect (${h5LordKey}). Bestows lucrative financial investments, stock market acumen, and wealth through advisory or academic publication (Mehta p. 276).`,
      potency: 'Speculative Genius (+18)'
    });
    dhanaScore += 18;
  }

  if (p9 && p11 && (p9.signId === p11.signId || h11LordHouse === 9)) {
    combinations.push({
      title: '9th & 11th Bhagya-Labha Lakshmi Yoga',
      description: `11th Lord (${h11LordKey}) conjoins or occupies the 9th house of fortune with 9th Lord (${h9LordKey}). Guarantees effortless incoming cash flow, noble paternal inheritance, and providential blessings of Goddess Lakshmi (Mehta p. 277).`,
      potency: 'Providential Fortune (+20)'
    });
    dhanaScore += 20;
  }

  // 4. 11th Lord with 10th Lord (Karma-Labha Tycoon Nexus)
  if (p10 && p11 && (p10.signId === p11.signId || h11LordHouse === 10)) {
    combinations.push({
      title: '10th & 11th Corporate & State Honors Raja Yoga',
      description: `11th Lord (${h11LordKey}) unites with 10th Lord of career (${h10LordKey}). Hallmark of corporate industrial magnates, top executive directors, and state-honored philanthropists (Mehta p. 277).`,
      potency: 'Apex Executive Prestige (+18)'
    });
    dhanaScore += 18;
  }

  // 5. 11th Lord with 4th Lord (Bill Gates Computing & Real Estate Rule)
  if (p4 && p11 && (p4.signId === p11.signId || h11LordHouse === 4)) {
    combinations.push({
      title: '4th & 11th Real Estate & Infrastructure Dhana Yoga',
      description: `11th Lord (${h11LordKey}) unites with 4th Lord (${h4LordKey}). Ideal classical alliance for enjoying life's finest comforts, palatial estates, luxury conveyances, and massive computing infrastructure (exemplified in Bill Gates' chart, Mehta p. 276).`,
      potency: 'Infrastructural Wealth (+16)'
    });
    dhanaScore += 16;
  }

  // 6. 11th Lord in 6th or Exchange with 6th Lord (Indira Gandhi Adversary Triumph)
  if (p6 && p11) {
    const isParivartana = (h11LordHouse === 6 && (((p6.signId - ascSignId + 12) % 12) + 1) === 11);
    if (isParivartana || h11LordHouse === 6) {
      combinations.push({
        title: isParivartana ? '11th & 6th Lords Maha Parivartana Yoga' : '11th Lord in 6th House (Triumph over Rivals)',
        description: `Linkage between 11th Lord (${h11LordKey}) and 6th House (${h6LordKey}). Confers extraordinary political tenacity, legal triumphs over corporate adversaries, and wealth through health/labor management (as in Indira Gandhi's chart, Mehta pp. 276-277).`,
        potency: 'Competitive Dominion (+15)'
      });
      dhanaScore += 15;
    }
  }

  // 7. 11th Lord in 7th House (Franklin Roosevelt Global & Marital Wealth)
  if (h11LordHouse === 7) {
    combinations.push({
      title: '11th Lord in 7th House (Marital & Global Alliance)',
      description: `11th Lord (${h11LordKey}) resides in the 7th Kendra. Signifies marriage into an affluent dynasty or spouse of majestic social standing, extensive foreign trade, and prosperity across oceans (as in Franklin D. Roosevelt's chart, Mehta p. 277).`,
      potency: 'Diplomatic & Marital Fortune (+15)'
    });
    dhanaScore += 15;
  }

  // 8. Upachaya Malefic Material Boom
  if (maleficOccupants.length > 0) {
    const mNames = maleficOccupants.map(p => getPlanetKey(p.key || p.name)).join(', ');
    combinations.push({
      title: `Upachaya Malefic Material Multiplier (${mNames} in 11th)`,
      description: `Natural malefics (${mNames}) occupy the 11th Upachaya house. Classical treatises (Hora Sara & Mehta p. 278) celebrate this placement for aggressive financial expansion, fearless ambition, vast landed estates, and unassailable authority.`,
      potency: 'Aggressive Expansion (+15)'
    });
    dhanaScore += 15;
  }

  // 9. Upachaya Benefic Noble Wealth
  if (beneficOccupants.length > 0) {
    const bNames = beneficOccupants.map(p => getPlanetKey(p.key || p.name)).join(', ');
    combinations.push({
      title: `Upachaya Benefic Spotless Prosperity (${bNames} in 11th)`,
      description: `Natural benefics (${bNames}) occupy the 11th house. Ensures steady, unblemished cash flow earned through honest, noble, and virtuous enterprises with widespread social goodwill (Mehta p. 279).`,
      potency: 'Spotless Financial Stability (+15)'
    });
    dhanaScore += 15;
  }

  // Swakshetra Fortification
  if (h11LordHouse === 11) {
    combinations.push({
      title: `Swakshetra 11th Lord Citadel (${h11LordKey} in 11th)`,
      description: `11th Lord sits in its own Swakshetra in the 11th house, establishing an unshakeable citadel for financial liquidity and complete fulfillment of worldly ambitions (Mehta p. 277).`,
      potency: 'Citadel of Labha (+18)'
    });
    dhanaScore += 18;
  }

  // Deductions for Debilitation
  if (h11LordDignity.includes('Debilitated')) {
    dhanaScore -= 20;
  }

  // Clamp score
  dhanaScore = Math.max(20, Math.min(100, dhanaScore));

  // K.N. Rao's Spiritual Dictum
  let spiritualThirst = null;
  if ([6, 8, 12].includes(h11LordHouse) || (maleficOccupants.length > 0 && beneficOccupants.length === 0 && h11LordDignity.includes('Debilitated'))) {
    spiritualThirst = {
      isTriggered: true,
      title: 'Transcendental Yearning (K.N. Rao Dictum)',
      note: 'K.N. Rao master dictum (Mehta p. 279): "11th lord afflicted gives spiritual thirst." When worldly gains face friction, the soul redirects its aspiration toward divine liberation (Moksha).'
    };
  }

  // Determine Wealth Type
  let wealthType = 'Balanced & Multifaceted Liquid Revenue';
  if (maleficOccupants.length > 0 && beneficOccupants.length === 0) {
    wealthType = 'Aggressive Material & Commercial Expansion (Upachaya Drive)';
  } else if (beneficOccupants.length > 0 && maleficOccupants.length === 0) {
    wealthType = 'Spotless, Noble & Ethical Cash Flow (Shubha Labha)';
  }

  let rating = 'Substantial Financial Stability';
  if (dhanaScore >= 85) rating = '⭐⭐⭐⭐⭐ Colossal Multi-Stream Wealth & Sovereign Abundance';
  else if (dhanaScore >= 70) rating = '⭐⭐⭐⭐ High Financial Expansion & Liquid Cash Flow';
  else if (dhanaScore >= 55) rating = '⭐⭐⭐ Respected Commercial Earnings & Steady Savings';
  else rating = '⭐⭐ Moderate / Gradual Financial Accumulation';

  return {
    score: dhanaScore,
    rating,
    wealthType,
    combinations: combinations.length > 0 ? combinations : [{
      title: 'Standard Vocational Earnings',
      description: 'Wealth accrues steadily through personal vocational diligence and standard savings.',
      potency: 'Baseline Stability'
    }],
    spiritualThirst
  };
}

/**
 * 11.2 K.N. Rao / Mehta Ashtakavarga 11th vs 10th Lift Engine
 * Ground truth: Mehta Ch. 11, p. 280
 */
export function calculateAshtakavargaLiftProfile(extraContext, ascSignId) {
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h11SignId = ((ascSignId - 1 + 10) % 12) + 1;

  const savArr = extraContext?.ashtakavarga?.sav || extraContext?.ashtakavarga?.savBySign || (Array.isArray(extraContext?.ashtakavarga) ? extraContext.ashtakavarga : null);
  const sav10 = (savArr && savArr[h10SignId - 1] !== undefined)
    ? savArr[h10SignId - 1]
    : null;
  const sav11 = (savArr && savArr[h11SignId - 1] !== undefined)
    ? savArr[h11SignId - 1]
    : null;

  if (sav10 === null || sav11 === null) {
    return {
      isAvailable: false,
      sav10: null,
      sav11: null,
      delta: null,
      verdict: 'Ashtakavarga Points Not Computed',
      badgeClass: 'badge-gold',
      rating: '---',
      description: 'Compute full Sarvashtakavarga matrix to evaluate K.N. Rao\'s 11th vs 10th career lift dynamic.',
      compensatoryLift: null
    };
  }

  const delta = sav11 - sav10;
  let verdict = '';
  let badgeClass = 'badge-green';
  let rating = '';
  let description = '';
  let compensatoryLift = null;

  if (delta >= 4) {
    verdict = 'Extraordinary Providential Lift (Lifelong Upward Ascension)';
    badgeClass = 'badge-green';
    rating = '⭐⭐⭐⭐⭐ Massive Providential Lift (+4 or more Bindus)';
    description = `Fulfills K.N. Rao & Mehta's cardinal rule (p. 280): 11th house SAV (${sav11} pts) exceeds 10th house SAV (${sav10} pts) by ${delta} Bindus (surpassing the ≥4 surplus threshold). Guarantees that honors, rewards, and public luck perpetually outpace labor (celebrated in Jawaharlal Nehru's chart: H10=26, H11=35, a massive +9 surplus ensuring Dame Luck was always kind).`;
  } else if (delta > 0) {
    verdict = 'Auspicious Career Ascension (Gains Outpace Effort)';
    badgeClass = 'badge-green';
    rating = `⭐⭐⭐⭐ Progressive Growth Vector (+${delta} Bindus)`;
    description = `11th house SAV (${sav11} pts) exceeds 10th house SAV (${sav10} pts) by ${delta} Bindus. Rewards, promotions, and incoming dividends steadily outrun professional exertions (Mehta p. 280).`;
  } else if (delta === 0) {
    verdict = 'Equilibrium of Labors & Gains';
    badgeClass = 'badge-gold';
    rating = '⭐⭐⭐ Balanced Effort-Reward Dynamic (0 Delta)';
    description = `10th and 11th houses possess equal Ashtakavarga strength (${sav11} Bindus), maintaining exact symmetry between vocational output and financial compensation.`;
  } else {
    // delta < 0
    if (sav10 >= 28 && sav11 < 28) {
      verdict = 'Career Stagnation Vulnerability (Labor Outpaces Fruition)';
      badgeClass = 'badge-red';
      rating = `⚠️ Plateau & Delayed Recognition (${delta} Delta)`;
      description = `Mehta cautions (p. 280): 10th house is strong (${sav10} pts) but 11th is weak (${sav11} pts), indicating periods where intense vocational output is met with delayed rewards, plateau, or institutional ceiling.`;
    } else {
      verdict = 'Standard Effort-Driven Curve';
      badgeClass = 'badge-gold';
      rating = `⭐⭐ Incremental Expansion (${delta} Delta)`;
      description = `10th house (${sav10} pts) leads 11th house (${sav11} pts), indicating growth earned through methodical persistence.`;
    }
  }

  // Compensatory Lift Check (Mehta p. 280)
  if (sav10 < 28 && sav11 >= 28) {
    compensatoryLift = `Compensatory 11th House Lift Active: Even with a modest 10th house (${sav10} pts), the fortified 11th house (${sav11} pts) possesses the classical power to lift the native to prominent socio-economic heights (Mehta p. 280).`;
  }

  return {
    isAvailable: true,
    sav10,
    sav11,
    delta,
    verdict,
    badgeClass,
    rating,
    description,
    compensatoryLift
  };
}

/**
 * 11.3 Jyeshtha Bhrata (Elder Siblings) Diagnostics Engine
 * Ground truth: Mehta Ch. 11, pp. 274-278; Sarvarth Chintamani
 */
export function calculateElderSiblingProfile(planets, ascSignId, h11LordKey, h11LordHouse) {
  const occupants11 = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    return k !== 'ASC' && (((p.signId - ascSignId + 12) % 12) + 1) === 11;
  });

  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');

  const naturalMalefics = ['Sun', 'Mars', 'Satn', 'Rahu', 'Ketu'];
  const naturalBenefics = ['Jupt', 'Venu', 'Merc', 'Moon'];

  const maleficOccupants = occupants11.filter(p => naturalMalefics.includes(getPlanetKey(p.key || p.name)));
  const beneficOccupants = occupants11.filter(p => naturalBenefics.includes(getPlanetKey(p.key || p.name)));

  const protections = [];
  const vulnerabilities = [];

  // Mehta Sibling Order Rule (p. 275)
  let siblingOrderNote = null;
  if (h11LordHouse === 3) {
    siblingOrderNote = 'Eldest or Youngest Sibling Thumb Rule: 11th lord situated in the 3rd house makes the native either the eldest or the youngest among siblings (Mehta p. 275).';
    protections.push(siblingOrderNote);
  }

  // 11th Lord in 12th (Elder sibling abroad)
  if (h11LordHouse === 12) {
    protections.push('11th Lord in 12th House: Frequently indicates an elder brother or sister comfortably settled in a foreign land or working in international domains (Mehta p. 278).');
  }

  // Sarvarth Chintamani Malefic Rule
  if (maleficOccupants.length > 0) {
    const mNames = maleficOccupants.map(p => getPlanetKey(p.key || p.name)).join(', ');
    vulnerabilities.push(`Sarvarth Chintamani Dictum: Malefics (${mNames}) occupying the 11th house indicate friction, distance, or denial/health sensitivity for elder co-borns (Mehta p. 276).`);
  } else {
    protections.push('11th house is free from direct resident natural malefics, safeguarding elder co-born longevity.');
  }

  if (beneficOccupants.length > 0) {
    const bNames = beneficOccupants.map(p => getPlanetKey(p.key || p.name)).join(', ');
    protections.push(`Natural benefics (${bNames}) in 11th house confer prosperous, affectionate, and distinguished elder siblings.`);
  }

  if (jupiter) {
    const jupHouse = (((jupiter.signId - ascSignId + 12) % 12) + 1);
    if ([1, 4, 5, 9, 11].includes(jupHouse)) {
      protections.push(`Universal Karaka Jupiter is well-placed in House ${jupHouse}, extending protective grace to elder siblings.`);
    }
  }

  let relationshipStatus = 'Harmonious & Supportive';
  if (vulnerabilities.length > 0 && protections.length <= 1) {
    relationshipStatus = 'Complex / Distant / Sibling Scrutiny';
  } else if (protections.length >= 2) {
    relationshipStatus = 'Deeply Affectionate, Prosperous & Mutually Beneficial';
  }

  return {
    relationshipStatus,
    siblingOrderNote,
    protections: protections.length > 0 ? protections : ['Standard sibling dynamics.'],
    vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : ['No acute classical fraternal afflictions detected.']
  };
}

/**
 * 11.4 High Honors & Prestigious Awards Engine
 * Ground truth: K.N. Rao's dictum in Mehta Ch. 11, p. 274
 */
export function calculateHonorsAndAwardsProfile(planets, ascSignId, h11LordKey, h11LordHouse, h11LordSignId) {
  const h11LordDignity = getPlanetaryDignity(h11LordKey, h11LordSignId);
  const jupiter = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10LordKey = getPlanetKey(SIGNS[h10SignId - 1].lord);
  const p10 = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);
  const p11 = planets.find(p => getPlanetKey(p.key || p.name) === h11LordKey);

  const honorsIndicators = [];
  let honorsScore = 50;

  // 1. K.N. Rao Rule: Strong 11th Lord in Kendra/Trikona
  const isKendraOrKona = [1, 4, 5, 7, 9, 10, 11].includes(h11LordHouse);
  const isFortified = h11LordDignity.includes('Exalted') || h11LordDignity.includes('Own Sign') || h11LordDignity.includes('Moolatrikona');

  if (isKendraOrKona && isFortified) {
    honorsIndicators.push(`K.N. Rao Laurels Alignment: 11th Lord (${h11LordKey}) is fortified in ${h11LordDignity} dignity in House ${h11LordHouse}. Fulfills the cardinal astrological prerequisite for high state citations, medals, and apex national awards (Mehta p. 274).`);
    honorsScore += 25;
  } else if (isKendraOrKona) {
    honorsIndicators.push(`11th Lord (${h11LordKey}) is situated in auspicious House ${h11LordHouse}, supporting career commendations and industry accolades.`);
    honorsScore += 12;
  }

  // 2. Link between 10th and 11th Lords (State Honor & Mudradhikara)
  if (p10 && p11 && (p10.signId === p11.signId || h11LordHouse === 10)) {
    honorsIndicators.push(`10th & 11th Lords Association: Directly joins professional authority with state recognition and medals of honor (Mehta p. 277).`);
    honorsScore += 18;
  }

  // 3. Jupiter Aspect on 11th House or 11th Lord
  if (jupiter) {
    const jupHouse = (((jupiter.signId - ascSignId + 12) % 12) + 1);
    const aspectHouses = [jupHouse, ((jupHouse + 4) % 12) || 12, ((jupHouse + 6) % 12) || 12, ((jupHouse + 8) % 12) || 12];
    if (aspectHouses.includes(11) || aspectHouses.includes(h11LordHouse)) {
      honorsIndicators.push('Jupiter casts full benign aspect on 11th house or 11th lord, certifying moral prestige, unblemished public standing, and institutional awards.');
      honorsScore += 15;
    }
  }

  // Clamp score
  honorsScore = Math.max(20, Math.min(100, honorsScore));

  let tier = 'Standard Professional Commendations';
  if (honorsScore >= 80) tier = '⭐⭐⭐⭐⭐ Apex Laurels & State Decorations (Nobel Prize / National Citations Tier)';
  else if (honorsScore >= 65) tier = '⭐⭐⭐⭐ High Institutional & Industry Honors';
  else if (honorsScore >= 50) tier = '⭐⭐⭐ Respected Civic Recognition & Professional Citations';
  else tier = '⭐⭐ Standard Vocational Commendations';

  return {
    score: honorsScore,
    tier,
    indicators: honorsIndicators.length > 0 ? honorsIndicators : ['Merit recognition through continuous professional duty.']
  };
}

/**
 * 11.5 House 11 Classical Yogas Evaluator
 * Source: Mehta Ch. 11, BPHS, Phala Deepika, Sarvarth Chintamani, Bhavartha Ratnakara
 */
function checkEleventhHouseYogas(planets, ascSignId, h11LordKey, h11LordHouse, h11LordSignId, extraContext = {}) {
  const yogas = [];
  const h11SignId = ((ascSignId - 1 + 10) % 12) + 1;
  const h11Sign = SIGNS[h11SignId - 1];
  const h11LordDignity = getPlanetaryDignity(h11LordKey, h11LordSignId);

  // 1. Maha Dhana Raja Yoga
  const mahaDhana = calculateMahaLabhaDhanaYoga(planets, ascSignId, h11LordKey, h11LordHouse, h11LordSignId);
  if (mahaDhana.score >= 65) {
    mahaDhana.combinations.forEach(combo => {
      yogas.push({
        name: combo.title,
        condition: combo.description,
        effects: `Elevates material abundance, liquid revenues, and societal stature (${combo.potency}).`,
        description: combo.description,
        type: 'Auspicious / Supreme Dhana Yoga',
        source: 'Parashara BPHS Ch. 41 & Mehta Ch. 11, pp. 274-279'
      });
    });
  }

  // 2. Swakshetra Labha Yoga (11th Lord in 11th House)
  if (h11LordHouse === 11) {
    const cond = `11th Lord (${h11LordKey}) resides in its own Swakshetra 11th house.`;
    const eff = 'Pristine Labha Yoga: Creates an unshakeable citadel for financial liquidity, loyal friends, prosperous elder brothers, and realization of all ambitions (Mehta p. 277).';
    yogas.push({
      name: 'Swakshetra Labha Yoga (Citadel of Fulfillments)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Prosperity Citadel',
      source: 'BPHS Ch. 24, Sl. 131; Mehta Ch. 11, p. 277'
    });
  }

  // 3. K.N. Rao Providential Lift Yoga (Ashtakavarga 11th > 10th by 4+ bindus)
  const lift = calculateAshtakavargaLiftProfile(extraContext, ascSignId);
  if (lift.isAvailable && lift.delta >= 4) {
    yogas.push({
      name: 'K.N. Rao Providential Lift Yoga (11th SAV Surplus)',
      condition: `11th house SAV (${lift.sav11} pts) surpasses 10th house SAV (${lift.sav10} pts) by ${lift.delta} Bindus.`,
      effects: 'Lifelong providential upward lift where rewards and honors perpetually outrun labors (as in Jawaharlal Nehru\'s chart, Mehta p. 280).',
      description: lift.description,
      type: 'Auspicious / Providential Lift',
      source: 'K.N. Rao & Mehta Ch. 11, p. 280'
    });
  }

  // 4. Sarvarth Chintamani Shubh Kartari Wealth Yoga
  // Hemmed between benefics in 10th and 12th
  const h10Sign = ((ascSignId - 1 + 9) % 12) + 1;
  const h12Sign = ((ascSignId - 1 + 11) % 12) + 1;
  const p10 = planets.filter(p => p.signId === h10Sign && getPlanetKey(p.key || p.name) !== 'ASC');
  const p12 = planets.filter(p => p.signId === h12Sign && getPlanetKey(p.key || p.name) !== 'ASC');
  const naturalBenefics = ['Jupt', 'Venu', 'Merc', 'Moon'];
  const hasBeneficIn10 = p10.some(p => naturalBenefics.includes(getPlanetKey(p.key || p.name)));
  const hasBeneficIn12 = p12.some(p => naturalBenefics.includes(getPlanetKey(p.key || p.name)));

  if (hasBeneficIn10 && hasBeneficIn12) {
    const cond = '11th House is hemmed between natural benefics in the 10th and 12th houses (Shubh Kartari).';
    const eff = 'Sarvarth Chintamani Wealth Yoga: Confers colossal unearned and commercial wealth, financial fortification, and protection against losses (Mehta p. 274).';
    yogas.push({
      name: 'Sarvarth Chintamani Shubh Kartari Labha Yoga',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Financial Fortification',
      source: 'Sarvarth Chintamani & Mehta Ch. 11, p. 274'
    });
  }

  return yogas;
}

/**
 * 2.13 House 12: Moksha & Spiritual Renunciation Matrix Engine
 * Ground truth: Mehta Ch. 12, pp. 281-288; Parashara Ch. 24; Jataka Parijata Ch. 14
 */
export function calculateMokshaAndRenunciationProfile(planets, ascSignId, h12LordKey, h12LordHouse, h12LordSignId) {
  let score = 20; // baseline
  const keyFindings = [];
  let sadgati = false;

  const h12SignId = ((ascSignId - 1 + 11) % 12) + 1;
  const h12LordDignity = getPlanetaryDignity(h12LordKey, h12LordSignId);

  // 1. Jupiter in 12th House
  const jupt = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');
  if (jupt) {
    const juptHouse = (((jupt.signId - ascSignId + 12) % 12) + 1);
    if (juptHouse === 12) {
      if ([9, 12].includes(jupt.signId)) {
        score += 45;
        sadgati = true;
        keyFindings.push('Jupiter in 12th in Swakshetra/Moolatrikona (Sagittarius/Pisces): Supreme classical configuration for meditative bliss, communion with the divine, and final liberation (as observed in Swami Moorkhanandji, Mehta p. 283–284).');
      } else if (jupt.signId === 4) {
        score += 45;
        sadgati = true;
        keyFindings.push('Jupiter in 12th Exalted in Cancer: Transcendental divine grace, pristine philanthropy, and effortless spiritual ascent (Mehta p. 283).');
      } else {
        score += 25;
        keyFindings.push('Jupiter in 12th House: Pious disposition, silent charitable acts, and philosophical detachment from worldly vanity (Mehta p. 283).');
      }
    }
  }

  // 2. Ketu in 12th House (Moksha Karaka par excellence)
  const ketu = planets.find(p => getPlanetKey(p.key || p.name) === 'Ketu');
  if (ketu) {
    const ketuHouse = (((ketu.signId - ascSignId + 12) % 12) + 1);
    if (ketuHouse === 12) {
      score += 35;
      sadgati = true;
      keyFindings.push('Ketu in 12th House: Supreme Moksha Karaka posited in Moksha Sthana; bestows profound inward detachment, visionary meditative experiences, and transcendence over karmic rebirth (BPHS & Mehta p. 285).');
    }
  }

  // 3. 12th Lord Placement
  if (h12LordHouse === 12) {
    score += 25;
    sadgati = true;
    keyFindings.push('12th Lord in 12th House (Swakshetra): Generates Shubh Vyaya (virtuous spending) and guarantees Sadgati (higher celestial spheres and final liberation post-mortem per Jataka Parijata, Mehta p. 285, 288).');
  } else if (h12LordHouse === 8) {
    score += 25;
    if (h12LordDignity.includes('Exalted')) {
      score += 20;
      keyFindings.push('12th Lord Exalted in the 8th House: Forms an enlightened mystic combination of a high spiritual order (Mehta p. 287).');
    } else {
      keyFindings.push('12th Lord in 8th House (Sarala/Vimala Vipreet Yoga): Deep interest in occult mysteries, longevity, and unexpected legacies (Mehta p. 287).');
    }
  } else if (h12LordHouse === 5) {
    // Dr. Hedgewar Sanyasa Yoga check (Mehta p. 286-287)
    const satn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
    const satnHouse = satn ? (((satn.signId - ascSignId + 12) % 12) + 1) : null;
    const isSatnIn8 = satnHouse === 8;
    if (isSatnIn8 || h12LordDignity.includes('Own') || h12LordDignity.includes('Moolatrikona')) {
      score += 30;
      keyFindings.push('12th Lord in 5th House with Sanyasa Influences: Razor-sharp spiritual intellect, fierce idealism, austere vows, and colossal charities (as seen in Dr. K.B. Hedgewar, Mehta p. 286–287).');
    } else {
      score += 15;
      keyFindings.push('12th Lord in 5th House: Philosophical mind, sacred pilgrimages, and detachment regarding progeny (Mehta p. 286).');
    }
  } else if (h12LordHouse === 1) {
    // Swami Parmanand Saraswati check (Mehta p. 285-286)
    const isMoon12Lord = h12LordKey === 'Moon';
    if (isMoon12Lord) {
      score += 25;
      keyFindings.push('12th Lord Moon in Lagna: Classical ascetic combination for renunciation (Sanyas Yoga) and profound spiritual evolution, though demanding bodily discipline (Swami Parmanand Saraswati, Mehta p. 285–286).');
    }
  }

  // 4. Moksha Trikona (4th, 8th, 12th) Population
  const mokshaHouses = [4, 8, 12];
  const mokshaOccupants = planets.filter(p => {
    if (getPlanetKey(p.key || p.name) === 'ASC') return false;
    const h = (((p.signId - ascSignId + 12) % 12) + 1);
    return mokshaHouses.includes(h);
  });
  const mokshaKetu = mokshaOccupants.some(p => getPlanetKey(p.key || p.name) === 'Ketu');
  const mokshaJupt = mokshaOccupants.some(p => getPlanetKey(p.key || p.name) === 'Jupt');

  let mokshaTrikonaStatus = `${mokshaOccupants.length} grahas occupy the Moksha Trikona (4th, 8th, 12th).`;
  if (mokshaKetu && mokshaJupt) {
    score += 15;
    mokshaTrikonaStatus += ' Both Jupiter and Ketu fortify the Moksha corridor, creating powerful spiritual momentum.';
  } else if (mokshaKetu || mokshaJupt) {
    score += 10;
    mokshaTrikonaStatus += ' Supported by benefic/spiritual karakas catalyzing meditative withdrawal.';
  }

  score = Math.min(100, Math.max(0, score));

  let tier = '';
  if (score >= 75) {
    tier = 'Paramahamsa / Sublime Sanyasa & Moksha Potential';
  } else if (score >= 50) {
    tier = 'Profound Meditative Insight & Spiritual Detachment';
  } else if (score >= 30) {
    tier = 'Philosophical Inclination & Occult Contemplation';
  } else {
    tier = 'Worldly Focus / Nascent Spiritual Impressions';
  }

  if (keyFindings.length === 0) {
    keyFindings.push('Spiritual impulses mature steadily in the latter half of life through reflective life experience.');
  }

  return {
    score,
    tier,
    keyFindings,
    sadgati,
    mokshaTrikonaStatus
  };
}

/**
 * 2.13.2 House 12: Foreign Residence & Settlement Matrix (Mehta 4-Point Snapshot Rule)
 * Ground truth: Mehta Ch. 12, pp. 288-292 (Case Study 1: 19-11-1947 Jullundhar); Jataka Parijata Ch. 14; Saravali
 */
export function calculateForeignSettlementProfile(planets, ascSignId, h12LordKey, h12LordHouse, extraContext = {}) {
  let score = 20; // baseline
  const indicators = [];

  const h4SignId = ((ascSignId - 1 + 3) % 12) + 1;
  const h4LordName = SIGNS[h4SignId - 1].lord;
  const h4LordKey = getPlanetKey(h4LordName);
  const h4LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h4LordKey);
  const h4LordHouse = h4LordPlanet ? (((h4LordPlanet.signId - ascSignId + 12) % 12) + 1) : null;

  const h12SignId = ((ascSignId - 1 + 11) % 12) + 1;
  const h12SignObj = SIGNS[h12SignId - 1];

  const satn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');
  const ketu = planets.find(p => getPlanetKey(p.key || p.name) === 'Ketu');
  const moon = planets.find(p => getPlanetKey(p.key || p.name) === 'Moon');

  // Parameter 1: 4th House & 4th Lord Condition (Mehta p. 290)
  // Ill-placement of 4th lord in 6, 8, or 12
  if (h4LordHouse && [6, 8, 12].includes(h4LordHouse)) {
    score += 25;
    indicators.push(`Parameter 1 (4th Lord in Dusthana): 4th lord (${h4LordKey}) is posited in House ${h4LordHouse}, uprooting ancestral homeland anchorage and propelling native overseas (Mehta p. 290).`);
  }

  // Malefics occupying 4th house
  const h4Occupants = planets.filter(p => {
    if (getPlanetKey(p.key || p.name) === 'ASC') return false;
    return (((p.signId - ascSignId + 12) % 12) + 1) === 4;
  });
  const hasMaleficIn4 = h4Occupants.some(p => ['Satn', 'Mars', 'Rahu', 'Sun'].includes(getPlanetKey(p.key || p.name)));
  if (hasMaleficIn4) {
    score += 20;
    const names = h4Occupants.map(p => p.name || p.key).join(', ');
    indicators.push(`Parameter 1 (4th House Affliction): Malefic grahas (${names}) occupy the 4th house of residence, dissolving attachment to native country (Mehta p. 290, 292).`);
  }

  // Parameter 2: Role of Rahu / Ketu (Foreign Karaka, Mehta p. 290)
  const isRahuKetuOn4 = h4Occupants.some(p => ['Rahu', 'Ketu'].includes(getPlanetKey(p.key || p.name)));
  const isRahuKetuOn4Lord = (rahu && h4LordPlanet && rahu.signId === h4LordPlanet.signId) || (ketu && h4LordPlanet && ketu.signId === h4LordPlanet.signId);
  if (isRahuKetuOn4 || isRahuKetuOn4Lord) {
    score += 25;
    indicators.push('Parameter 2 (Rahu/Ketu Foreign Nexus): Rahu/Ketu connects directly with the 4th house or 4th lord, making residence abroad an empirical near-certainty (Mehta p. 290).');
  }

  // Rahu in 1st, 7th, 9th, or 12th house (Mehta p. 289-290)
  if (rahu) {
    const rahuHouse = (((rahu.signId - ascSignId + 12) % 12) + 1);
    if ([1, 7, 9, 12].includes(rahuHouse)) {
      score += 15;
      indicators.push(`Parameter 2 (Rahu Placement): Foreign Karaka Rahu occupies House ${rahuHouse}, conferring cross-border journeys, cultural transitions, and offshore settlement (Mehta p. 289–290).`);
    }
  }

  // 4th from Moon on Rahu/Ketu axis (Mehta p. 292 Case 1)
  if (moon && (rahu || ketu)) {
    const h4FromMoon = ((moon.signId - 1 + 3) % 12) + 1;
    const isRahuKetu4FromMoon = (rahu && rahu.signId === h4FromMoon) || (ketu && ketu.signId === h4FromMoon);
    if (isRahuKetu4FromMoon) {
      score += 20;
      indicators.push('Parameter 2 (Chandra Kundali Alignment): The 4th house from Moon falls squarely on the Rahu/Ketu axis, replicating Mehta\'s cardinal diagnostic from Case Study 1 (p. 292).');
    }
  }

  // Parameter 3: 12th & 9th House Dynamics & Mobility
  if (['Movable', 'Dual'].includes(h12SignObj.mobility)) {
    score += 10;
    indicators.push(`Parameter 3 (12th Cusp Mobility): 12th house falls in ${h12SignObj.mobility} sign (${h12SignObj.name}), providing dynamic locomotion and trans-oceanic relocation.`);
  }

  // 12th lord in 9th or 9th lord in 12th (Mehta p. 288)
  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9LordKey = getPlanetKey(SIGNS[h9SignId - 1].lord);
  const h9LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const h9LordHouse = h9LordPlanet ? (((h9LordPlanet.signId - ascSignId + 12) % 12) + 1) : null;

  if (h12LordHouse === 9) {
    score += 25;
    indicators.push('Parameter 3 (12th Lord in 9th): Confers both flourishing residence and landed property abroad (Mehta p. 288).');
  } else if (h9LordHouse === 12) {
    score += 25;
    indicators.push('Parameter 3 (9th Lord in 12th): Long-distance destiny house merges with foreign house, creating residence in sacred or prestigious overseas institutions (Mehta p. 288).');
  }

  // Moon in 12th, 8th, or 9th, or in Cancer/Pisces (Mehta p. 290)
  if (moon) {
    const moonHouse = (((moon.signId - ascSignId + 12) % 12) + 1);
    if ([12, 8, 9].includes(moonHouse)) {
      score += 15;
      indicators.push(`Parameter 3 (Moon in House ${moonHouse}): Moon posited in a deep/foreign house favors long voyages across the seas and prosperity abroad (Mehta p. 290).`);
    } else if ([4, 12].includes(moon.signId)) {
      score += 10;
      indicators.push(`Parameter 3 (Moon in Water Sign ${SIGNS[moon.signId - 1].name}): Classical water sign transit signifying oceanic voyages (Mehta p. 290).`);
    }
  }

  // Parameter 4: Jataka Parijata 12th from Lagna Lord Rule (Mehta p. 290)
  const ascLordKey = getPlanetKey(SIGNS[ascSignId - 1].lord);
  const ascLordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === ascLordKey);
  if (ascLordPlanet) {
    const sign12FromAscLord = ((ascLordPlanet.signId - 2 + 12) % 12) + 1;
    const lord12FromAscLordKey = getPlanetKey(SIGNS[sign12FromAscLord - 1].lord);
    const lord12Planet = planets.find(p => getPlanetKey(p.key || p.name) === lord12FromAscLordKey);
    if (lord12Planet) {
      const dig = getPlanetaryDignity(lord12FromAscLordKey, lord12Planet.signId);
      if (dig.includes('Debilitated')) {
        score += 15;
        indicators.push('Parameter 4 (Jataka Parijata Dictum): The lord of the 12th sign from Lagna Lord is debilitated, affirming permanent migration abroad (Mehta p. 290).');
      } else if (dig.includes('Exalted') || dig.includes('Own')) {
        indicators.push(`Parameter 4 (Jataka Parijata Dictum): The lord of the 12th sign from Lagna Lord is fortified (${dig}), indicating enduring roots in the native land.`);
      }
    }
  }

  score = Math.min(100, Math.max(0, score));

  let likelihood = '';
  let badgeClass = 'badge-green';
  if (score >= 65) {
    likelihood = 'Very High / Overseas Settlement Indicated (Mehta 4-Point Alignment)';
    badgeClass = 'badge-green';
  } else if (score >= 40) {
    likelihood = 'Moderate / Long-Distance Migration & Overseas Ventures';
    badgeClass = 'badge-gold';
  } else {
    likelihood = 'Low / Strong Native Homeland Anchorage';
    badgeClass = 'badge-purple';
  }

  if (indicators.length === 0) {
    indicators.push('Homeland ties remain sturdy; travels occur predominantly for recreational or temporary purposes.');
  }

  return {
    score,
    likelihood,
    badgeClass,
    indicators
  };
}

/**
 * 2.13.3 House 12: Vyaya (Expenditure) & Financial Leakage Diagnostics
 * Ground truth: Mehta Ch. 12, pp. 281-282, 288; Phala Deepika; Prasna Neeti
 */
export function calculateVyayaExpenditureProfile(planets, ascSignId, h12LordKey, h12LordHouse) {
  let virtueScore = 50; // neutral
  const avenues = [];
  let litigationRisk = false;

  const h12Occupants = planets.filter(p => {
    if (getPlanetKey(p.key || p.name) === 'ASC') return false;
    return (((p.signId - ascSignId + 12) % 12) + 1) === 12;
  });

  const naturalBenefics = ['Jupt', 'Venu', 'Merc', 'Moon'];
  const naturalMalefics = ['Mars', 'Satn', 'Rahu', 'Sun'];

  const beneficOccupants = h12Occupants.filter(p => naturalBenefics.includes(getPlanetKey(p.key || p.name)));
  const maleficOccupants = h12Occupants.filter(p => naturalMalefics.includes(getPlanetKey(p.key || p.name)));

  if (beneficOccupants.length > 0) {
    virtueScore += beneficOccupants.length * 20;
    const names = beneficOccupants.map(p => p.name || p.key).join(', ');
    avenues.push(`Shubh Vyaya (Virtuous Disbursements): Benefic occupants (${names}) channel expenditure into honorable avenues: philanthropy, education, charitable institutions, and religious endowments (Mehta p. 281).`);
  }

  if (maleficOccupants.length > 0) {
    virtueScore -= maleficOccupants.length * 20;
    const names = maleficOccupants.map(p => p.name || p.key).join(', ');
    avenues.push(`Pap Vyaya (Expenditure on Vices / Penalties): Malefic occupants (${names}) induce financial leakages, unforeseen penalties, impulsive outflows, or litigation overheads unless restrained (Mehta p. 281).`);
  }

  // 12th Lord with 6th Lord Check (Mehta p. 282)
  const h6SignId = ((ascSignId - 1 + 5) % 12) + 1;
  const h6LordKey = getPlanetKey(SIGNS[h6SignId - 1].lord);
  const h6LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h6LordKey);
  const h12LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h12LordKey);

  if (h6LordPlanet && h12LordPlanet && h6LordPlanet.signId === h12LordPlanet.signId) {
    virtueScore -= 25;
    litigationRisk = true;
    avenues.push('6th & 12th Lord Nexus: Association of 6th and 12th lords warns of money spent on litigation relating to property disputes, contractual claims, or debt recovery (Mehta p. 282).');
  }

  // 11th and 12th Lord Parivartana / Link (Mehta p. 285, 292)
  const h11SignId = ((ascSignId - 1 + 10) % 12) + 1;
  const h11LordKey = getPlanetKey(SIGNS[h11SignId - 1].lord);
  const h11LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h11LordKey);
  const h11LordHouse = h11LordPlanet ? (((h11LordPlanet.signId - ascSignId + 12) % 12) + 1) : null;

  if (h12LordHouse === 11 && h11LordHouse === 12) {
    virtueScore += 30;
    avenues.push('11th & 12th Lord Parivartana Yoga: Mutual exchange between lords of profit and expenditure generates colossal international cash flow, lucrative exports, and magnificent charitable generosity (Mehta p. 292).');
  } else if (h12LordHouse === 11) {
    virtueScore += 15;
    avenues.push('12th Lord in 11th: Outflows directly feed revenue channels; profitable foreign commerce and export gains (Bhavartha Ratnakara, Mehta p. 288).');
  }

  virtueScore = Math.min(100, Math.max(0, virtueScore));

  let nature = '';
  let badgeClass = 'badge-green';
  if (virtueScore >= 65) {
    nature = 'Pious & Virtuous Expenditure (Shubh Vyaya)';
    badgeClass = 'badge-green';
  } else if (virtueScore >= 40) {
    nature = 'Balanced & Pragmatic Allocation';
    badgeClass = 'badge-gold';
  } else {
    nature = 'Wasteful / Litigation & Friction (Pap Vyaya)';
    badgeClass = 'badge-red';
  }

  if (avenues.length === 0) {
    avenues.push('Expenditure patterns reflect standard household budgeting without chronic leakage or extravagant dissipation.');
  }

  return {
    score: virtueScore,
    nature,
    badgeClass,
    avenues,
    litigationRisk
  };
}

/**
 * 2.13.4 House 12: Bandhana (Confinement) & Sayana Sukha Diagnostic
 * Ground truth: Mehta Ch. 12, pp. 282, 284-286; Bhavartha Ratnakara; Jataka Bharnam
 */
export function calculateBandhanaAndSayanaProfile(planets, ascSignId, h12LordKey, h12LordHouse) {
  const h12SignId = ((ascSignId - 1 + 11) % 12) + 1;
  const h12Occupants = planets.filter(p => {
    if (getPlanetKey(p.key || p.name) === 'ASC') return false;
    return (((p.signId - ascSignId + 12) % 12) + 1) === 12;
  });

  const rahu = planets.find(p => getPlanetKey(p.key || p.name) === 'Rahu');
  const satn = planets.find(p => getPlanetKey(p.key || p.name) === 'Satn');
  const venu = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  const jupt = planets.find(p => getPlanetKey(p.key || p.name) === 'Jupt');

  // 1. Bandhana (Confinement / Institutionalization / Incarceration) Check
  let confinementRisk = 'Clear / No Incarceration Risk';
  let confinementBadge = 'badge-green';
  let confinementNote = 'No acute classical combinations for legal incarceration or enforced institutional confinement identified.';

  const isRahuIn12 = rahu && (((rahu.signId - ascSignId + 12) % 12) + 1) === 12;
  const isSatnAspecting12 = satn && [3, 7, 10].some(asp => (((satn.signId + asp - 2) % 12) + 1) === h12SignId);
  const isJuptAspecting12 = jupt && [5, 7, 9].some(asp => (((jupt.signId + asp - 2) % 12) + 1) === h12SignId);

  if (isRahuIn12 && isSatnAspecting12 && !isJuptAspecting12) {
    confinementRisk = 'Vulnerability to Confinement / Institutional Isolation';
    confinementBadge = 'badge-red';
    confinementNote = 'Rahu in the 12th receiving Saturn\'s aspect without Jupiter\'s relief constitutes classical Soola/Bandhana Yoga, warning of hospital stays, quarantine, or legal confinement (Mehta p. 285).';
  }

  // 2. Sayana Sukha (Bed Pleasures & Restful Sleep)
  let sayanaSukhaRating = 'Balanced Bed Comforts & Restful Sleep';
  let sayanaSukhaBadge = 'badge-green';
  let sayanaSukhaNote = 'Normal circadian rhythm and harmonious bedroom atmosphere.';

  const isVenusIn12 = venu && (((venu.signId - ascSignId + 12) % 12) + 1) === 12;
  if (isVenusIn12) {
    sayanaSukhaRating = 'Exquisite Sayana Sukha & Luxurious Chambers (Bhavartha Ratnakara)';
    sayanaSukhaBadge = 'badge-gold';
    sayanaSukhaNote = 'Ramanujacharya declares Venus in 12 grants colossal wealth, exquisite bed pleasures, harmonious intimacy, and palatial bedroom comforts (Mehta p. 284).';
  } else {
    const maleficOccupant = h12Occupants.find(p => ['Mars', 'Satn', 'Rahu'].includes(getPlanetKey(p.key || p.name)));
    if (maleficOccupant) {
      sayanaSukhaRating = 'Restless Sleep / Sensory Agitation';
      sayanaSukhaBadge = 'badge-red';
      sayanaSukhaNote = `${maleficOccupant.name || maleficOccupant.key} in the 12th causes irregular sleep cycles, nocturnal anxiety, or bedroom friction; benefits from meditative quietus before sleep (Mehta p. 282).`;
    }
  }

  // 3. Left Eye & Feet Health Scrutiny
  let ophthalmicFootNote = 'Normal left eye visual acuity and lower limb locomotion.';
  const eyeAffliction = h12Occupants.filter(p => ['Sun', 'Mars', 'Satn', 'Rahu'].includes(getPlanetKey(p.key || p.name)));
  if (eyeAffliction.length > 0) {
    const names = eyeAffliction.map(p => p.name || p.key).join(', ');
    ophthalmicFootNote = `Vulnerability to left eye strain, refractive changes, or foot/ankle sensitivity under ${names} influence; periodic ophthalmic check-ups recommended (Jataka Bharnam, Mehta p. 282–285).`;
  }

  return {
    confinementRisk,
    confinementBadge,
    confinementNote,
    sayanaSukhaRating,
    sayanaSukhaBadge,
    sayanaSukhaNote,
    ophthalmicFootNote
  };
}

/**
 * 2.13.5 House 12: Classical Yogas Evaluator
 * Ground truth: Mehta Ch. 12, pp. 281-292; Phala Deepika; Prasna Neeti
 */
function checkTwelfthHouseYogas(planets, ascSignId, h12LordKey, h12LordHouse, h12LordSignId, extraContext = {}) {
  const yogas = [];
  const h12SignId = ((ascSignId - 1 + 11) % 12) + 1;
  const h12LordDignity = getPlanetaryDignity(h12LordKey, h12LordSignId);

  // 1. Vimala Yoga (Vipreet Raja Yoga)
  const h6SignId = ((ascSignId - 1 + 5) % 12) + 1;
  const h6LordKey = getPlanetKey(SIGNS[h6SignId - 1].lord);
  const h6LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h6LordKey);
  const h6LordHouse = h6LordPlanet ? (((h6LordPlanet.signId - ascSignId + 12) % 12) + 1) : null;

  if ([6, 8, 12].includes(h12LordHouse) || h6LordHouse === 12) {
    const cond = h6LordHouse === 12 
      ? '6th lord occupies the 12th house (Vimala Yoga per Mehta p. 292).'
      : `12th lord occupies Dusthana House ${h12LordHouse} (Vimala Vipreet Raja Yoga).`;
    const eff = 'Confers unassailable independent wealth, unshakeable savings, honorable reputation, happiness, and mastery over opponents (Mehta p. 287, 292; Phala Deepika Ch. 6).';
    yogas.push({
      name: 'Vimala Yoga (Vipreet Raja Yoga)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Vipreet Raja Yoga',
      source: 'Phala Deepika Ch. 6 & Mehta Ch. 12, p. 292'
    });
  }

  // 2. Moksha & Sadgati Yoga
  const mokshaProfile = calculateMokshaAndRenunciationProfile(planets, ascSignId, h12LordKey, h12LordHouse, h12LordSignId);
  if (mokshaProfile.score >= 60 || mokshaProfile.sadgati) {
    const cond = mokshaProfile.keyFindings[0] || 'Fortified Moksha karakas/lords in the 12th house.';
    const eff = 'Guarantees transcendental spiritual insight, sublime detachment, and attainment of Sadgati (higher realms post-mortem per Jataka Parijata).';
    yogas.push({
      name: 'Moksha & Sadgati Yoga (Final Bliss)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Spiritual / Emancipation Yoga',
      source: 'Jataka Parijata Ch. 14 & Mehta Ch. 12, pp. 283-288'
    });
  }

  // 3. Generosity & Philanthropy Yoga (Dana Yoga)
  const h11SignId = ((ascSignId - 1 + 10) % 12) + 1;
  const h11LordKey = getPlanetKey(SIGNS[h11SignId - 1].lord);
  const h11LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h11LordKey);
  const h11LordHouse = h11LordPlanet ? (((h11LordPlanet.signId - ascSignId + 12) % 12) + 1) : null;

  const h9SignId = ((ascSignId - 1 + 8) % 12) + 1;
  const h9LordKey = getPlanetKey(SIGNS[h9SignId - 1].lord);
  const h9LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h9LordKey);
  const h9LordHouse = h9LordPlanet ? (((h9LordPlanet.signId - ascSignId + 12) % 12) + 1) : null;

  const h10SignId = ((ascSignId - 1 + 9) % 12) + 1;
  const h10LordKey = getPlanetKey(SIGNS[h10SignId - 1].lord);
  const h10LordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === h10LordKey);
  const h10LordHouse = h10LordPlanet ? (((h10LordPlanet.signId - ascSignId + 12) % 12) + 1) : null;

  const is11_12_Exchange = (h12LordHouse === 11 && h11LordHouse === 12);
  const isDanaYogaMehta = (h12LordDignity.includes('Exalted') || h12LordDignity.includes('Own')) && h9LordHouse === 4 && [1, 4, 7, 10].includes(h10LordHouse);

  if (is11_12_Exchange || isDanaYogaMehta) {
    const cond = is11_12_Exchange 
      ? 'Mutual exchange (Parivartana) between 11th and 12th lords.'
      : '12th lord dignified, 9th lord in 4th house, and 10th lord in Kendra (Mehta p. 292).';
    const eff = 'Celebrated classical yoga for monumental charities, magnificent philanthropic endowments, and unblemished nobility (Mehta p. 292).';
    yogas.push({
      name: 'Generosity & Philanthropy Yoga (Maha Dana Yoga)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Philanthropic Nobility',
      source: 'Jataka Parijata & Mehta Ch. 12, p. 292'
    });
  }

  // 4. Sayana Bhoga Yoga (Venus in 12th)
  const venu = planets.find(p => getPlanetKey(p.key || p.name) === 'Venu');
  if (venu && (((venu.signId - ascSignId + 12) % 12) + 1) === 12) {
    const cond = 'Venus occupies the 12th house (Sayana Bhava).';
    const eff = 'Bhavartha Ratnakara: Bestows immense wealth, exquisite bed pleasures, refined aesthetic delights, and comfortable foreign living (Mehta p. 284).';
    yogas.push({
      name: 'Sayana Bhoga Yoga (Pleasures of the Bed & Wealth)',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Sensory Bliss & Riches',
      source: 'Bhavartha Ratnakara & Mehta Ch. 12, p. 284'
    });
  }

  // 5. Mehta Foreign Settlement Yoga
  const foreignProfile = calculateForeignSettlementProfile(planets, ascSignId, h12LordKey, h12LordHouse, extraContext);
  if (foreignProfile.score >= 65) {
    const cond = 'Mehta 4-Point Foreign Settlement parameters align: 4th house/lord afflicted/ill-placed, Rahu/Ketu nexus, and strong 12th/9th connections.';
    const eff = 'Native establishes prosperous permanent settlement, career, and property in a foreign country (Mehta p. 290–292).';
    yogas.push({
      name: 'K.N. Rao / Mehta Foreign Settlement Yoga',
      condition: cond,
      effects: eff,
      description: `${cond} ${eff}`,
      type: 'Auspicious / Trans-Oceanic Migration',
      source: 'Mehta Ch. 12, pp. 290-292'
    });
  }

  return yogas;
}

/**
 * Main Evaluation Function for a Specific House
 *
 * @param {Array} planets - Array of parsed planet objects
 * @param {number} houseNum - House number (1 to 12)
 * @param {Object} [extraContext] - Optional context (bhavabala, ashtakavarga, etc.)
 * @returns {Object} Comprehensive house delineation report
 */
export function evaluateHouse(planets, houseNum = 1, extraContext = {}) {
  const asc = planets.find(p => getPlanetKey(p.key || p.name) === 'ASC');
  if (!asc) {
    throw new Error('Ascendant (ASC) not found in planets list');
  }

  const ascSignId = asc.signId;
  const houseSignId = ((ascSignId - 1 + (houseNum - 1)) % 12) + 1;
  const houseSignObj = SIGNS[houseSignId - 1];
  const houseLordName = houseSignObj.lord;
  const houseLordKey = getPlanetKey(houseLordName);

  // Locate the house lord
  const houseLordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === houseLordKey);
  let lordHouse = 1;
  let lordSignId = houseSignId;
  let lordDignity = 'Normal';
  let isLordRetrograde = false;

  if (houseLordPlanet) {
    lordSignId = houseLordPlanet.signId;
    lordHouse = (((lordSignId - ascSignId + 12) % 12) + 1);
    lordDignity = getPlanetaryDignity(houseLordKey, lordSignId);
    isLordRetrograde = !!houseLordPlanet.isRetro;
  }

  // Find occupants of this house
  const occupants = planets.filter(p => {
    const k = getPlanetKey(p.key || p.name);
    if (k === 'ASC') return false;
    const pHouse = (((p.signId - ascSignId + 12) % 12) + 1);
    return pHouse === houseNum;
  });

  // Calculate Drishti (Aspects)
  const aspects = getAspectsOnHouse(planets, houseNum, ascSignId);

  // Kartari Yoga
  const kartari = checkKartariYoga(planets, houseNum, ascSignId);

  // Load house specific classical data
  const houseMeta = HOUSE_DATA_MAP[houseNum] || {
    houseNumber: houseNum,
    name: `House ${houseNum}`,
    sanskritName: `भाव ${houseNum}`,
    significations: ['General significations based on classical texts'],
    naturalKaraka: []
  };

  // House Lord Placement text
  let lordPlacementReport = null;
  const lordMap = houseMeta.lordInHouses || houseMeta.lordPlacements;
  if (lordMap && lordMap[String(lordHouse)]) {
    const rawLordData = lordMap[String(lordHouse)];
    const isAfflicted = lordDignity.includes('Debilitated') || [6, 8, 12].includes(lordHouse);
    const favText = rawLordData.favorable || rawLordData.positive || rawLordData.classicalText || '';
    const affText = rawLordData.afflicted || rawLordData.negative || rawLordData.classicalText || '';
    lordPlacementReport = {
      targetHouse: lordHouse,
      title: rawLordData.title,
      text: isAfflicted ? (affText || favText) : favText,
      favorableText: favText,
      afflictedText: affText,
      mehtaNotes: rawLordData.mehtaNotes || rawLordData.classicalText || '',
      dignity: lordDignity,
      isRetrograde: isLordRetrograde
    };
  }

  // Occupants Report with Lordship Mapping
  const occupantsReport = occupants.map(p => {
    const pKey = getPlanetKey(p.key || p.name);
    const dignity = getPlanetaryDignity(pKey, p.signId);
    const occupantMeta = findPlanetMeta(houseMeta.planetsInHouse || houseMeta.occupants, pKey);

    // Functional Lordship(s) of this occupant planet
    const ruledHouses = getRuledHouses(pKey, ascSignId);
    const lordshipsReport = ruledHouses.map(ruledH => {
      const hData = HOUSE_DATA_MAP[ruledH];
      let placementInfo = null;
      const hLordMap = hData ? (hData.lordInHouses || hData.lordPlacements) : null;
      if (hLordMap && hLordMap[String(houseNum)]) {
        const raw = hLordMap[String(houseNum)];
        const isAfflicted = dignity.includes('Debilitated') || [6, 8, 12].includes(houseNum);
        const fText = raw.favorable || raw.positive || raw.classicalText || '';
        const aText = raw.afflicted || raw.negative || raw.classicalText || '';
        placementInfo = {
          fromHouse: ruledH,
          targetHouse: houseNum,
          title: raw.title,
          text: isAfflicted ? (aText || fText) : fText,
          favorableText: fText,
          afflictedText: aText,
          mehtaNotes: raw.mehtaNotes || raw.classicalText || '',
          sourceChapter: `Mehta Ch. ${ruledH}`
        };
      }
      return {
        houseNumber: ruledH,
        houseName: hData ? hData.name : `House ${ruledH}`,
        sanskritName: hData ? hData.sanskritName : `भाव ${ruledH}`,
        placementInfo
      };
    });

    let classicalText = 'Occupies this house.';
    if (occupantMeta) {
      if (dignity.includes('Debilitated')) {
        classicalText = occupantMeta.afflicted || occupantMeta.negative || occupantMeta.effects || 'Occupies this house.';
      } else {
        classicalText = occupantMeta.dignified || occupantMeta.favorable || occupantMeta.positive || occupantMeta.effects || 'Occupies this house.';
      }
    }

    return {
      planetKey: pKey,
      name: p.name || pKey,
      signName: p.signName || SIGNS[p.signId - 1].name,
      dignity,
      isRetrograde: !!p.isRetro,
      classicalText,
      mehtaNotes: occupantMeta ? (occupantMeta.mehtaNotes || occupantMeta.classicalCitation || occupantMeta.conditions || '') : '',
      ruledHouses,
      lordshipsReport
    };
  });

  // Special Yogas & House-specific metrics
  let specialYogas = [];
  let induLagna = null;
  let beejaKshetra = null;
  let progenyWindows = null;
  let medicalProfile = null;
  let marriageWindows = null;
  let kujaDosha = null;
  let maritalHarmony = null;
  let longevityProfile = null;
  let chhidraGrahas = null;
  let khareshKharaNavamsa = null;
  let virasatAnalysis = null;
  let dharmaKarmaYoga = null;
  let bhagyaProfile = null;
  let pitriProfile = null;
  let travelProfile = null;
  let amalaYoga = null;
  let careerProfile = null;
  let statusProfile = null;
  let stabilityProfile = null;
  let mahaLabhaYoga = null;
  let ashtakavargaLift = null;
  let elderSiblingProfile = null;
  let honorsProfile = null;
  let mokshaProfile = null;
  let foreignSettlementProfile = null;
  let vyayaProfile = null;
  let bandhanaSayanaProfile = null;
  if (houseNum === 1) {
    specialYogas = checkFirstHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
  } else if (houseNum === 2) {
    induLagna = calculateInduLagna(planets, ascSignId);
    specialYogas = checkSecondHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, induLagna);
  } else if (houseNum === 3) {
    specialYogas = checkThirdHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext?.ashtakavarga?.sav ? extraContext.ashtakavarga.sav[houseSignId - 1] : null);
  } else if (houseNum === 4) {
    specialYogas = checkFourthHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext?.ashtakavarga?.sav ? extraContext.ashtakavarga.sav[houseSignId - 1] : null);
  } else if (houseNum === 5) {
    beejaKshetra = calculateBeejaKshetraSphuta(planets, extraContext?.gender || 'male');
    progenyWindows = calculateProgenyTransitWindows(planets, ascSignId, extraContext?.birthDate);
    specialYogas = checkFifthHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext?.ashtakavarga?.sav ? extraContext.ashtakavarga.sav[houseSignId - 1] : null, beejaKshetra);
  } else if (houseNum === 6) {
    medicalProfile = calculateMedicalVulnerabilityProfile(planets, ascSignId, houseSignId, houseLordKey);
    specialYogas = checkSixthHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext?.ashtakavarga?.sav ? extraContext.ashtakavarga.sav[houseSignId - 1] : null);
  } else if (houseNum === 7) {
    marriageWindows = calculateMarriageTransitWindows(planets, ascSignId, extraContext?.birthDate, extraContext?.gender);
    kujaDosha = calculateKujaDoshaProfile(planets, ascSignId);
    maritalHarmony = calculateMaritalHarmonyProfile(planets, ascSignId, houseLordKey);
    specialYogas = checkSeventhHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext);
  } else if (houseNum === 8) {
    khareshKharaNavamsa = calculateKhareshAndKharaNavamsa(planets, ascSignId);
    longevityProfile = calculateLongevityProfile(planets, ascSignId, extraContext?.birthDate);
    chhidraGrahas = calculateChhidraGrahas(planets, ascSignId, houseLordKey, houseSignId, khareshKharaNavamsa);
    virasatAnalysis = calculateVirasatProfile(planets, ascSignId, houseLordKey, lordHouse);
    specialYogas = checkEighthHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext);
  } else if (houseNum === 9) {
    dharmaKarmaYoga = calculateDharmaKarmaYoga(planets, ascSignId);
    bhagyaProfile = calculateBhagyaProfile(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
    pitriProfile = calculatePitriProfile(planets, ascSignId, houseLordKey, lordHouse, extraContext);
    travelProfile = calculateTeerthaAndForeignTravelProfile(planets, ascSignId, houseLordKey, lordHouse);
    specialYogas = checkNinthHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext);
  } else if (houseNum === 10) {
    amalaYoga = calculateAmalaYoga(planets, ascSignId);
    careerProfile = calculateCareerAndVocationalProfile(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
    statusProfile = calculateSimhasanaAndStatusProfile(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
    stabilityProfile = calculateCareerStabilityProfile(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
    specialYogas = checkTenthHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext);
  } else if (houseNum === 11) {
    mahaLabhaYoga = calculateMahaLabhaDhanaYoga(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
    ashtakavargaLift = calculateAshtakavargaLiftProfile(extraContext, ascSignId);
    elderSiblingProfile = calculateElderSiblingProfile(planets, ascSignId, houseLordKey, lordHouse);
    honorsProfile = calculateHonorsAndAwardsProfile(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
    specialYogas = checkEleventhHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext);
  } else if (houseNum === 12) {
    mokshaProfile = calculateMokshaAndRenunciationProfile(planets, ascSignId, houseLordKey, lordHouse, lordSignId);
    foreignSettlementProfile = calculateForeignSettlementProfile(planets, ascSignId, houseLordKey, lordHouse, extraContext);
    vyayaProfile = calculateVyayaExpenditureProfile(planets, ascSignId, houseLordKey, lordHouse);
    bandhanaSayanaProfile = calculateBandhanaAndSayanaProfile(planets, ascSignId, houseLordKey, lordHouse);
    specialYogas = checkTwelfthHouseYogas(planets, ascSignId, houseLordKey, lordHouse, lordSignId, extraContext);
  }

  // SAV points if provided
  let savPoints = null;
  if (extraContext.ashtakavarga) {
    const savArr = extraContext.ashtakavarga.sav || extraContext.ashtakavarga.savBySign || (Array.isArray(extraContext.ashtakavarga) ? extraContext.ashtakavarga : null);
    if (savArr && savArr[houseSignId - 1] !== undefined) {
      savPoints = savArr[houseSignId - 1];
    }
  }

  // Bhavabala if provided
  let bhavabalaScore = null;
  if (extraContext.bhavabala && extraContext.bhavabala[houseNum - 1]) {
    bhavabalaScore = extraContext.bhavabala[houseNum - 1];
  }

  // Summary of all 12 House Lords across the entire chart
  const allHouseLords = getAllHouseLordsSummary(planets);

  return {
    houseNumber: houseNum,
    name: houseMeta.name,
    sanskritName: houseMeta.sanskritName,
    sign: {
      id: houseSignId,
      name: houseSignObj.name,
      sanskrit: houseSignObj.sanskrit,
      element: houseSignObj.element,
      mobility: houseSignObj.mobility,
      symbol: houseSignObj.symbol
    },
    lord: {
      name: houseLordName,
      key: houseLordKey,
      currentHouse: lordHouse,
      currentSign: SIGNS[lordSignId - 1].name,
      dignity: lordDignity,
      isRetrograde: isLordRetrograde
    },
    significations: houseMeta.significations,
    naturalKaraka: houseMeta.naturalKaraka || [],
    lordPlacementReport,
    occupants: occupantsReport,
    aspects,
    kartari,
    specialYogas,
    induLagna,
    beejaKshetra,
    progenyWindows,
    medicalProfile,
    marriageWindows,
    kujaDosha,
    maritalHarmony,
    longevityProfile,
    chhidraGrahas,
    khareshKharaNavamsa,
    virasatAnalysis,
    dharmaKarmaYoga,
    bhagyaProfile,
    pitriProfile,
    travelProfile,
    amalaYoga,
    careerProfile,
    statusProfile,
    stabilityProfile,
    mahaLabhaYoga,
    ashtakavargaLift,
    elderSiblingProfile,
    honorsProfile,
    mokshaProfile,
    foreignSettlementProfile,
    vyayaProfile,
    bandhanaSayanaProfile,
    allHouseLords,
    metrics: {
      savPoints,
      bhavabalaScore
    },
    sources: houseMeta.classicalSources || [],
    authoritiesSummary: houseMeta.authoritiesSummary || {}
  };
}

/**
 * Computes the placement and classical summary for all 12 House Lords (1 to 12)
 *
 * @param {Array} planets - Array of parsed planet objects
 * @returns {Array} Array of 12 objects detailing each Bhava Lord's target placement
 */
export function getAllHouseLordsSummary(planets) {
  const asc = planets.find(p => getPlanetKey(p.key || p.name) === 'ASC');
  if (!asc) return [];
  const ascSignId = asc.signId;

  const summary = [];
  for (let h = 1; h <= 12; h++) {
    const houseSignId = ((ascSignId - 1 + (h - 1)) % 12) + 1;
    const signObj = SIGNS[houseSignId - 1];
    const lordName = signObj.lord;
    const lordKey = getPlanetKey(lordName);
    const lordPlanet = planets.find(p => getPlanetKey(p.key || p.name) === lordKey);

    let targetHouse = 1;
    let targetSignName = signObj.name;
    let lordDignity = 'Normal';
    let isRetro = false;

    if (lordPlanet) {
      targetHouse = (((lordPlanet.signId - ascSignId + 12) % 12) + 1);
      targetSignName = SIGNS[lordPlanet.signId - 1].name;
      lordDignity = getPlanetaryDignity(lordKey, lordPlanet.signId);
      isRetro = !!lordPlanet.isRetro;
    }

    const hMeta = HOUSE_DATA_MAP[h];
    let dictum = null;
    const lordMap = hMeta ? (hMeta.lordInHouses || hMeta.lordPlacements) : null;
    if (lordMap && lordMap[String(targetHouse)]) {
      const raw = lordMap[String(targetHouse)];
      const isAfflicted = lordDignity.includes('Debilitated') || [6, 8, 12].includes(targetHouse);
      const favText = raw.favorable || raw.positive || raw.classicalText || '';
      const affText = raw.afflicted || raw.negative || raw.classicalText || '';
      dictum = {
        title: raw.title,
        text: isAfflicted ? (affText || favText) : favText,
        favorableText: favText,
        afflictedText: affText,
        mehtaNotes: raw.mehtaNotes || raw.classicalText || '',
        sourceChapter: `Mehta Ch. ${h}`
      };
    }

    summary.push({
      houseNumber: h,
      name: hMeta ? hMeta.name : `House ${h}`,
      sanskritName: hMeta ? hMeta.sanskritName : `भाव ${h}`,
      cuspSign: signObj.name,
      cuspSymbol: signObj.symbol,
      lordName,
      lordKey,
      targetHouse,
      targetSignName,
      lordDignity,
      isRetrograde: isRetro,
      dictum,
      isChapterLoaded: !!lordMap
    });
  }

  return summary;
}
