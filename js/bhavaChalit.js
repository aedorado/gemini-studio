/**
 * Sripati Bhava Chalit (भाव चलित) Calculation Engine
 * 
 * Implements the classical unequal house system according to Sripati Paddhati:
 * - Madhya of Bhava 1 = Ascendant (Lagna)
 * - Madhya of Bhava 10 = Midheaven (MC / Madhya Lagna)
 * - Madhya of Bhava 7 = Opposite Ascendant (Descendant)
 * - Madhya of Bhava 4 = Opposite Midheaven (Nadir / IC)
 * - Quadrants are trisected to obtain Bhav Madhyas of houses 2, 3, 5, 6, 8, 9, 11, 12
 * - Bhav Sandhi (Bhav Begin / Arambha) is the exact arithmetic midpoint between
 *   consecutive Bhav Madhyas.
 * - Planetary placements in Bhava Chalit are determined by which bhava span
 *   [Bhav Begin, Bhav End) the planet's sidereal longitude falls into.
 */

import { SIGNS } from './constants.js';
import { formatDMS } from './parser.js';

/**
 * Normalizes an angle to [0, 360) degrees.
 */
export function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Computes the forward circular midpoint from angle a to angle b.
 */
export function circularMidpoint(a, b) {
  const diff = normalizeDeg(b - a);
  return normalizeDeg(a + diff / 2);
}

/**
 * Formats a celestial longitude into Sign Name, Sign ID (1-12), Degrees in sign, and DMS string.
 */
export function formatLongitude(deg) {
  const norm = normalizeDeg(deg);
  const signIndex = Math.floor(norm / 30);
  const signId = signIndex + 1;
  const signObj = SIGNS[signIndex];
  const degInSign = norm % 30;

  const d = Math.floor(degInSign);
  const mFloat = (degInSign - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);

  const pad = n => String(n).padStart(2, '0');
  const dmsDotFormatted = `${pad(d)}.${pad(m)}.${pad(s)}`;

  return {
    longitude: Number(norm.toFixed(6)),
    signId,
    signIndex,
    signName: signObj.name,
    signSanskrit: signObj.sanskrit,
    degInSign,
    degDms: { deg: d, min: m, sec: s, decimal: degInSign },
    dmsFormatted: formatDMS(degInSign),
    dmsDotFormatted: `${signObj.name} ${dmsDotFormatted}`
  };
}

/**
 * Checks whether a given longitude falls within a bhava span [startDeg, endDeg).
 */
export function isAngleInSpan(targetDeg, startDeg, endDeg) {
  const normTarget = normalizeDeg(targetDeg);
  const normStart = normalizeDeg(startDeg);
  const normEnd = normalizeDeg(endDeg);

  if (normStart < normEnd) {
    return normTarget >= normStart && normTarget < normEnd;
  } else {
    // Spans across 0° Aries (e.g. 350° to 20°)
    return normTarget >= normStart || normTarget < normEnd;
  }
}

/**
 * Calculates Sripati Bhava Chalit table and planet bhava allocations.
 * 
 * @param {Array} planets - Array of parsed planet objects (must contain 'ASC')
 * @param {Object} options - Options containing mcDeg (Midheaven sidereal longitude),
 *                           or explicit midBhav10Deg.
 */
export function calculateBhavaChalit(planets, options = {}) {
  const ascObj = planets.find(p => p.key === 'ASC' || p.key === 'Lagna');
  if (!ascObj) {
    throw new Error('Ascendant (ASC) is required for Bhava Chalit calculation');
  }

  const ascDeg = normalizeDeg(ascObj.absLongitude !== undefined ? ascObj.absLongitude : ascObj.longitude);

  // Determine Midheaven (MC / House 10 Madhya)
  let mcDeg;
  if (options.mcDeg !== undefined) {
    mcDeg = normalizeDeg(options.mcDeg);
  } else if (options.midBhav10Deg !== undefined) {
    mcDeg = normalizeDeg(options.midBhav10Deg);
  } else {
    // Default standard approximation: MC ~ 9 signs from Ascendant or RAMC approximation
    // If no MC is supplied, fallback to equal 90° quadrant offset
    mcDeg = normalizeDeg(ascDeg + 270);
  }

  const mid = new Array(13);
  mid[1] = ascDeg;
  mid[10] = mcDeg;
  mid[7] = normalizeDeg(ascDeg + 180);
  mid[4] = normalizeDeg(mcDeg + 180);

  // Quadrant IV (10 to 1): Trisect arc between MC (10) and Ascendant (1)
  const arc10to1 = normalizeDeg(ascDeg - mcDeg);
  const d1 = arc10to1 / 3;
  mid[11] = normalizeDeg(mcDeg + d1);
  mid[12] = normalizeDeg(mcDeg + 2 * d1);

  // Quadrant I (1 to 4): Trisect arc between Ascendant (1) and IC (4)
  const arc1to4 = normalizeDeg(mid[4] - ascDeg);
  const d2 = arc1to4 / 3;
  mid[2] = normalizeDeg(ascDeg + d2);
  mid[3] = normalizeDeg(ascDeg + 2 * d2);

  // Quadrant II (4 to 7): Trisect arc between IC (4) and Descendant (7)
  mid[5] = normalizeDeg(mid[4] + d1);
  mid[6] = normalizeDeg(mid[4] + 2 * d1);

  // Quadrant III (7 to 10): Trisect arc between Descendant (7) and MC (10)
  mid[8] = normalizeDeg(mid[7] + d2);
  mid[9] = normalizeDeg(mid[7] + 2 * d2);

  // Calculate Bhav Sandhis (Bhav Begin / Arambha)
  // Bhav Begin for house i is the circular midpoint between mid[i-1] and mid[i]
  const begin = new Array(13);
  for (let i = 1; i <= 12; i++) {
    const prev = i === 1 ? 12 : i - 1;
    begin[i] = circularMidpoint(mid[prev], mid[i]);
  }

  // Construct the 12 houses
  const houses = [];
  for (let i = 1; i <= 12; i++) {
    const next = i === 12 ? 1 : i + 1;
    const beginDeg = begin[i];
    const endDeg = begin[next];
    const spanDeg = normalizeDeg(endDeg - beginDeg);

    houses.push({
      house: i,
      midBhav: formatLongitude(mid[i]),
      bhavBegin: formatLongitude(beginDeg),
      bhavEnd: formatLongitude(endDeg),
      spanDeg: Number(spanDeg.toFixed(6)),
      planets: []
    });
  }

  // Determine planet allocations in Chalit houses
  const ascSignId = ascObj.signId;
  const planetPlacements = [];
  const shiftedPlanets = [];

  for (const p of planets) {
    if (p.key === 'ASC') continue;

    const pLon = normalizeDeg(p.absLongitude !== undefined ? p.absLongitude : p.longitude);

    // Find which bhava span the planet belongs to
    let chalitHouse = 1;
    for (let i = 1; i <= 12; i++) {
      const next = i === 12 ? 1 : i + 1;
      if (isAngleInSpan(pLon, begin[i], begin[next])) {
        chalitHouse = i;
        break;
      }
    }

    // Traditional Rashi House (1 to 12 from Lagna sign)
    const rashiHouse = ((p.signId - ascSignId + 12) % 12) + 1;
    const isShifted = chalitHouse !== rashiHouse;

    const placement = {
      key: p.key,
      name: p.name,
      symbol: p.symbol,
      signId: p.signId,
      signName: p.signName,
      rashiHouse,
      chalitHouse,
      isShifted,
      shiftDescription: isShifted
        ? `${p.name} shifted from H${rashiHouse} (${p.signName}) to H${chalitHouse} in Bhava Chalit`
        : `${p.name} remains in H${chalitHouse}`
    };

    planetPlacements.push(placement);
    houses[chalitHouse - 1].planets.push(p.name);

    if (isShifted) {
      shiftedPlanets.push(placement);
    }
  }

  return {
    ascendantDeg: ascDeg,
    mcDeg,
    houses,
    planetPlacements,
    shiftedPlanets
  };
}
