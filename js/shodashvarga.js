import { SIGNS, SHODASHVARGA_DEFS } from './constants.js';

export function getDignity(planetKey, signId, deg) {
  const dignities = {
    Sun: { exalt: 1, debil: 7, own: [5], moola: 5, moolaRange: [0, 20], friends: [4, 1, 8, 9, 12], enemies: [7, 2, 10, 11] },
    Moon: { exalt: 2, debil: 8, own: [4], moola: 2, moolaRange: [3, 30], friends: [5, 3, 6], enemies: [] },
    Mars: { exalt: 10, debil: 4, own: [1, 8], moola: 1, moolaRange: [0, 12], friends: [5, 4, 9, 12], enemies: [3, 6] },
    Merc: { exalt: 6, debil: 12, own: [3, 6], moola: 6, moolaRange: [15, 20], friends: [5, 7, 2], enemies: [4] },
    Jupt: { exalt: 4, debil: 10, own: [9, 12], moola: 9, moolaRange: [0, 10], friends: [5, 4, 1, 8], enemies: [3, 6, 7, 2] },
    Venu: { exalt: 12, debil: 6, own: [2, 7], moola: 7, moolaRange: [0, 15], friends: [3, 6, 10, 11], enemies: [5, 4] },
    Satn: { exalt: 7, debil: 1, own: [10, 11], moola: 11, moolaRange: [0, 20], friends: [3, 6, 2, 7], enemies: [5, 4, 1, 8] },
    Rahu: { exalt: 2, debil: 8, own: [11], moola: 3, moolaRange: [0, 30], friends: [7, 2, 10, 11], enemies: [5, 4, 1, 8] },
    Ketu: { exalt: 8, debil: 2, own: [8], moola: 9, moolaRange: [0, 30], friends: [1, 8, 9, 12], enemies: [5, 4] }
  };

  const pData = dignities[planetKey];
  if (!pData) return { label: 'Neutral', badgeClass: 'badge-neutral' };

  // Degree-refined checks for Mercury (Virgo: 0-15 Exalted, 15-20 Moolatrikona, 20-30 Own)
  if (deg !== undefined && !isNaN(deg)) {
    if (planetKey === 'Merc' && signId === 6) {
      if (deg <= 15) return { label: 'Exalted (Uchcha)', badgeClass: 'badge-exalted' };
      if (deg <= 20) return { label: 'Moolatrikona', badgeClass: 'badge-moola' };
      return { label: 'Own Sign (Swakshetra)', badgeClass: 'badge-own' };
    }
    // Moon in Taurus: 0-3 Exalted, 3-30 Moolatrikona
    if (planetKey === 'Moon' && signId === 2) {
      if (deg <= 3) return { label: 'Exalted (Uchcha)', badgeClass: 'badge-exalted' };
      return { label: 'Moolatrikona', badgeClass: 'badge-moola' };
    }
    // Moolatrikona range check if in moola sign
    if (signId === pData.moola && pData.moolaRange) {
      if (deg >= pData.moolaRange[0] && deg <= pData.moolaRange[1]) {
        return { label: 'Moolatrikona', badgeClass: 'badge-moola' };
      } else if (pData.own.includes(signId)) {
        return { label: 'Own Sign (Swakshetra)', badgeClass: 'badge-own' };
      }
    }
  }

  if (signId === pData.exalt) {
    return { label: 'Exalted (Uchcha)', badgeClass: 'badge-exalted' };
  }
  if (signId === pData.debil) {
    return { label: 'Debilitated (Neecha)', badgeClass: 'badge-debilitated' };
  }
  if (signId === pData.moola) {
    return { label: 'Moolatrikona', badgeClass: 'badge-moola' };
  }
  if (pData.own.includes(signId)) {
    return { label: 'Own Sign (Swakshetra)', badgeClass: 'badge-own' };
  }
  if (pData.friends.includes(signId)) {
    return { label: 'Friend (Mitra)', badgeClass: 'badge-friend' };
  }
  if (pData.enemies.includes(signId)) {
    return { label: 'Enemy (Shatru)', badgeClass: 'badge-enemy' };
  }
  return { label: 'Neutral (Sama)', badgeClass: 'badge-neutral' };
}

/**
 * Calculates the sign (1-12) of a given planet/ascendant for all 16 Shodashvargas.
 */
export function calculateVargasForPlanet(planet) {
  const sign = planet.signId; // 1 to 12
  const deg = planet.degInSign; // 0 to 30
  const absLong = planet.absLongitude; // 0 to 360
  const isOdd = sign % 2 === 1;
  const isMovable = [1, 4, 7, 10].includes(sign);
  const isFixed = [2, 5, 8, 11].includes(sign);
  const isDual = [3, 6, 9, 12].includes(sign);

  const vargas = {};

  // 1. D1 - Rashi
  vargas['D1'] = sign;

  // 2. D2 - Hora (15° each)
  // Odd: 0-15 Sun (5), 15-30 Moon (4)
  // Even: 0-15 Moon (4), 15-30 Sun (5)
  if (isOdd) {
    vargas['D2'] = deg < 15 ? 5 : 4;
  } else {
    vargas['D2'] = deg < 15 ? 4 : 5;
  }

  // 3. D3 - Drekkana (10° each)
  // 0-10: same; 10-20: 5th; 20-30: 9th
  const p3 = Math.floor(deg / 10);
  vargas['D3'] = ((sign - 1 + p3 * 4) % 12) + 1;

  // 4. D4 - Chaturthamsha (7.5° each)
  // 1st, 4th, 7th, 10th
  const p4 = Math.min(3, Math.floor(deg / 7.5));
  vargas['D4'] = ((sign - 1 + p4 * 3) % 12) + 1;

  // 5. D7 - Saptamsha (30/7 deg each)
  // Odd: from sign itself. Even: from 7th.
  const p7 = Math.min(6, Math.floor(deg / (30 / 7)));
  const start7 = isOdd ? sign : ((sign - 1 + 6) % 12) + 1;
  vargas['D7'] = ((start7 - 1 + p7) % 12) + 1;

  // 6. D9 - Navamsha (3°20' = 3.333333° each)
  const totalNav = Math.floor(absLong / (40 / 12)); // 30/9 = 3.333333 deg
  vargas['D9'] = (totalNav % 12) + 1;

  // 7. D10 - Dashamsha (3° each)
  // Odd: from sign itself. Even: from 9th.
  const p10 = Math.min(9, Math.floor(deg / 3));
  const start10 = isOdd ? sign : ((sign - 1 + 8) % 12) + 1;
  vargas['D10'] = ((start10 - 1 + p10) % 12) + 1;

  // 8. D12 - Dwadamsha (2.5° each)
  // Starts from sign itself
  const p12 = Math.min(11, Math.floor(deg / 2.5));
  vargas['D12'] = ((sign - 1 + p12) % 12) + 1;

  // 9. D16 - Shodashamsha (1.875° each)
  // Movable: Aries(1), Fixed: Leo(5), Dual: Sag(9)
  const p16 = Math.min(15, Math.floor(deg / 1.875));
  const start16 = isMovable ? 1 : (isFixed ? 5 : 9);
  vargas['D16'] = ((start16 - 1 + p16) % 12) + 1;

  // 10. D20 - Vimshamsha (1.5° each)
  // Movable: Aries(1), Fixed: Sag(9), Dual: Leo(5)
  const p20 = Math.min(19, Math.floor(deg / 1.5));
  const start20 = isMovable ? 1 : (isFixed ? 9 : 5);
  vargas['D20'] = ((start20 - 1 + p20) % 12) + 1;

  // 11. D24 - Chaturvimshamsha (1.25° each)
  // Odd: Leo(5), Even: Cancer(4)
  const p24 = Math.min(23, Math.floor(deg / 1.25));
  const start24 = isOdd ? 5 : 4;
  vargas['D24'] = ((start24 - 1 + p24) % 12) + 1;

  // 12. D27 - Saptavimshamsha / Bhamsha (30/27 = 1.111111° each)
  // Fiery(1,5,9): Aries(1); Earthy(2,6,10): Cancer(4); Airy(3,7,11): Libra(7); Watery(4,8,12): Cap(10)
  const p27 = Math.min(26, Math.floor(deg / (30 / 27)));
  let start27 = 1;
  if ([1, 5, 9].includes(sign)) start27 = 1;
  else if ([2, 6, 10].includes(sign)) start27 = 4;
  else if ([3, 7, 11].includes(sign)) start27 = 7;
  else start27 = 10;
  vargas['D27'] = ((start27 - 1 + p27) % 12) + 1;

  // 13. D30 - Trimshamsha (Unequal divisions by rulers)
  let d30Sign = sign;
  if (isOdd) {
    if (deg < 5) d30Sign = 1; // Mars Aries
    else if (deg < 10) d30Sign = 11; // Saturn Aquarius
    else if (deg < 18) d30Sign = 9; // Jupiter Sag
    else if (deg < 25) d30Sign = 3; // Mercury Gemini
    else d30Sign = 7; // Venus Libra
  } else {
    if (deg < 5) d30Sign = 2; // Venus Taurus
    else if (deg < 12) d30Sign = 6; // Mercury Virgo
    else if (deg < 20) d30Sign = 12; // Jupiter Pisces
    else if (deg < 25) d30Sign = 10; // Saturn Cap
    else d30Sign = 8; // Mars Scorpio
  }
  vargas['D30'] = d30Sign;

  // 14. D40 - Khavedamsha (0.75° each)
  // Odd: Aries(1), Even: Libra(7)
  const p40 = Math.min(39, Math.floor(deg / 0.75));
  const start40 = isOdd ? 1 : 7;
  vargas['D40'] = ((start40 - 1 + p40) % 12) + 1;

  // 15. D45 - Akshavedamsha (30/45 = 0.666667° each)
  // Movable: Aries(1), Fixed: Leo(5), Dual: Sag(9)
  const p45 = Math.min(44, Math.floor(deg / (30 / 45)));
  const start45 = isMovable ? 1 : (isFixed ? 5 : 9);
  vargas['D45'] = ((start45 - 1 + p45) % 12) + 1;

  // 16. D60 - Shashtiamsha (0.5° each)
  // Starts from the sign itself
  const p60 = Math.min(59, Math.floor(deg / 0.5));
  vargas['D60'] = ((sign - 1 + p60) % 12) + 1;

  return vargas;
}

/**
 * Calculates Shodashvarga matrix for all parsed planets.
 * Detects Vargottama planets (same sign in D1 and D9).
 */
export function calculateShodashvargaMatrix(planets) {
  const matrix = [];
  const vargottamaList = [];

  const sun = planets.find(p => p.key === 'Sun');
  const COMBUSTION_ORBS = {
    Moon: 12,
    Mars: 17,
    Merc: 14,
    Jupt: 11,
    Venu: 10,
    Satn: 15
  };

  for (let p of planets) {
    const vargas = calculateVargasForPlanet(p);
    const isVargottama = vargas['D1'] === vargas['D9'];
    if (isVargottama && p.key !== 'ASC') {
      vargottamaList.push(p.name);
    }

    let isCombust = false;
    let combustDist = null;
    if (sun && COMBUSTION_ORBS[p.key] !== undefined) {
      let maxOrb = COMBUSTION_ORBS[p.key];
      if (p.isRetro) {
        if (p.key === 'Merc') maxOrb = 12;
        if (p.key === 'Venu') maxOrb = 8;
      }
      const pLon = p.absLongitude !== undefined ? p.absLongitude : ((p.signId - 1) * 30 + (p.degInSign || 0));
      const sLon = sun.absLongitude !== undefined ? sun.absLongitude : ((sun.signId - 1) * 30 + (sun.degInSign || 0));
      let dist = Math.abs(pLon - sLon);
      if (dist > 180) dist = 360 - dist;
      combustDist = Number(dist.toFixed(2));
      if (dist <= maxOrb) {
        isCombust = true;
      }
    }

    const dignityD1 = getDignity(p.key, vargas['D1'], p.degInSign);
    const dignityD9 = getDignity(p.key, vargas['D9']);

    p.isCombust = isCombust;
    p.combustDist = combustDist;
    p.dignity = dignityD1.label;

    const row = {
      key: p.key,
      name: p.name,
      symbol: p.symbol,
      isRetro: p.isRetro,
      isCombust,
      combustDist,
      degInSign: p.degInSign,
      vargas,
      isVargottama,
      dignityD1,
      dignityD9
    };
    matrix.push(row);
  }

  return { matrix, vargottamaList };
}
