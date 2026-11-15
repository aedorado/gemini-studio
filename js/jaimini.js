// Jaimini Astrology Engine: 7 Chara Karakas, Arudha Lagna (AL) & Upapada Lagna (UL)

import { SIGNS, RASHI_LORDS } from './constants.js';

export function getPlanetSignIndex(p) {
  if (!p) return 0;
  if (p.signIndex !== undefined && p.signIndex >= 0 && p.signIndex < 12) return p.signIndex;
  if (p.signId !== undefined && p.signId >= 1 && p.signId <= 12) return p.signId - 1;
  const lon = p.longitude !== undefined ? p.longitude : (p.absLongitude !== undefined ? p.absLongitude : 0);
  return Math.floor((((lon % 360) + 360) % 360) / 30);
}

export function getPlanetDegInSign(p) {
  if (!p) return 0;
  if (p.degInSign !== undefined && !isNaN(p.degInSign)) return p.degInSign;
  const lon = p.longitude !== undefined ? p.longitude : (p.absLongitude !== undefined ? p.absLongitude : 0);
  return (((lon % 30) + 30) % 30);
}

/**
 * 7 Chara Karakas definitions
 */
export const KARAKA_DEFINITIONS = [
  { key: 'AK', name: 'Atmakaraka', title: 'Soul Significance', role: 'King of the Chart, destiny, spiritual core and self-realization' },
  { key: 'AmK', name: 'Amatyakaraka', title: 'Career & Mind', role: 'The Minister, professional pursuits, intellect and financial growth' },
  { key: 'BK', name: 'Bhratrikaraka', title: 'Siblings & Guru', role: 'Brothers/sisters, mentors, courage and philosophical advisors' },
  { key: 'MK', name: 'Matrikaraka', title: 'Mother & Heart', role: 'Mother, real estate, domestic peace, comfort and education' },
  { key: 'PK', name: 'Putrakaraka', title: 'Children & Genius', role: 'Offspring, creative expression, divine mantra and past-life merits' },
  { key: 'GK', name: 'Gnatikaraka', title: 'Obstacles & Relatives', role: 'Cousins, competitors, debts, disease and resistance to overcome' },
  { key: 'DK', name: 'Darakaraka', title: 'Spouse & Partner', role: 'Life partner, marriage karma, union and business alliances' }
];

/**
 * Calculate the 7 Chara Karakas based on longitude inside sign (0° to 30°)
 * @param {Array} planets - Array of planet objects
 * @returns {Array} - Array of planets sorted by degree with assigned Karaka
 */
export function calculateCharaKarakas(planets) {
  const eligibleKeys = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];
  const eligibleNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  const eligible = planets
    .filter(p => eligibleKeys.includes(p.key) || eligibleNames.includes(p.name))
    .map(p => {
      const degInSign = getPlanetDegInSign(p);
      const signIndex = getPlanetSignIndex(p);
      return {
        ...p,
        signIndex,
        degInSign: degInSign >= 0 ? degInSign : degInSign + 30
      };
    });

  // Sort descending by degrees inside sign
  eligible.sort((a, b) => b.degInSign - a.degInSign);

  return eligible.slice(0, 7).map((p, idx) => {
    const def = KARAKA_DEFINITIONS[idx] || { key: '—', name: '—', title: '—', role: '—' };
    const deg = Math.floor(p.degInSign);
    const min = Math.floor((p.degInSign - deg) * 60);
    const sec = Math.round(((p.degInSign - deg) * 60 - min) * 60);

    return {
      planet: p.name || p.key,
      karakaKey: def.key,
      karakaName: def.name,
      karakaTitle: def.title,
      karakaRole: def.role,
      signIndex: p.signIndex,
      signName: SIGNS[p.signIndex] ? SIGNS[p.signIndex].name : '',
      degInSignFormatted: `${deg}° ${min}' ${sec}"`,
      degInSign: p.degInSign
    };
  });
}

export function findSignLordPlanet(planets, lordName) {
  if (!planets || !lordName) return null;
  const target = lordName.trim().toLowerCase();
  return planets.find(p => {
    if (p.key === 'ASC' || p.key === 'Lagna') return false;
    const pName = (p.name || '').toLowerCase();
    const pKey = (p.key || '').toLowerCase();
    if (pName === target || pKey === target) return true;
    if (target === 'mercury' && (pKey === 'merc' || pName === 'budha')) return true;
    if (target === 'jupiter' && (pKey === 'jupt' || pName === 'guru' || pName === 'brihaspati')) return true;
    if (target === 'venus' && (pKey === 'venu' || pName === 'shukra')) return true;
    if (target === 'saturn' && (pKey === 'satn' || pName === 'shani')) return true;
    if (target === 'mars' && (pKey === 'mars' || pName === 'mangala' || pName === 'kuja')) return true;
    if (target === 'sun' && (pKey === 'sun' || pName === 'surya')) return true;
    if (target === 'moon' && (pKey === 'moon' || pName === 'chandra')) return true;
    return false;
  });
}

/**
 * Calculate Arudha Pada for a given reference house
 * Formula: Count x houses from reference to its lord; count x houses from lord.
 * Exception Rule (Jaimini Sutras / Parashara):
 * If the resulting Arudha falls in the same house or 7th from it, shift by 10 houses (add 9 signs).
 * @param {number} refHouse - Reference house (1 to 12)
 * @param {number} lagnaSignIndex - Sign index of Lagna (0 to 11)
 * @param {Array} planets - Planetary positions
 * @returns {Object} - { refHouse, signIndex, signName, houseNumber }
 */
export function calculateArudha(refHouse, lagnaSignIndex, planets) {
  const safeLagnaSign = (lagnaSignIndex !== undefined && !isNaN(lagnaSignIndex)) ? lagnaSignIndex : 0;

  // 1. Determine reference sign
  const refSign = (safeLagnaSign + refHouse - 1) % 12;

  // 2. Find lord of that sign
  const lordName = RASHI_LORDS[refSign];
  const lord = findSignLordPlanet(planets, lordName);

  let lordSign = refSign;
  if (lord) {
    lordSign = getPlanetSignIndex(lord);
  }

  // 3. Distance from reference sign to lord (1-indexed count)
  let dist = ((lordSign - refSign + 12) % 12) + 1;

  // 4. Count same distance from lord
  let rawArudhaSign = (lordSign + dist - 1) % 12;

  // 5. Apply classical Jaimini Exception rule:
  // If rawArudhaSign == refSign (1st) or rawArudhaSign == (refSign + 6)%12 (7th), add 9 signs (10th from raw)
  const is1st = (rawArudhaSign === refSign);
  const is7th = (rawArudhaSign === (refSign + 6) % 12);

  let finalSign = rawArudhaSign;
  if (is1st || is7th) {
    finalSign = (rawArudhaSign + 9) % 12; // 10th house from it
  }

  const houseNumber = ((finalSign - safeLagnaSign + 12) % 12) + 1;

  return {
    refHouse,
    signIndex: finalSign,
    signName: SIGNS[finalSign] ? SIGNS[finalSign].name : '',
    houseNumber
  };
}

/**
 * Calculate Jaimini Special Padas:
 * - Arudha Lagna (AL) = Pada of 1st house
 * - Upapada Lagna (UL) = Pada of 12th house (Marriage & relationship longevity)
 * - Darapada (A7) = Pada of 7th house (Spouse business/social manifestations)
 */
export function calculateJaiminiPadas(lagnaSignIndex, planets) {
  let sIdx = lagnaSignIndex;
  if (sIdx === undefined || isNaN(sIdx)) {
    const lagna = planets.find(p => p.key === 'ASC');
    sIdx = getPlanetSignIndex(lagna);
  }
  const al = calculateArudha(1, sIdx, planets);
  const ul = calculateArudha(12, sIdx, planets);
  const a7 = calculateArudha(7, sIdx, planets);

  return {
    AL: { ...al, label: 'Arudha Lagna (AL)', desc: 'External status, worldly image, manifest fame and career perception' },
    UL: { ...ul, label: 'Upapada Lagna (UL)', desc: 'Marriage stability, nature of spouse family, and relational longevity' },
    A7: { ...a7, label: 'Darapada (A7)', desc: 'Partnership dynamics, sexual harmony, and physical attraction' }
  };
}
