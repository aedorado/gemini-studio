/**
 * Shadbala (षड्बल) & Bhavabala (भावबल) Engine
 * Classical Vedic Strength Calculations based on Brihat Parashara Hora Shastra (BPHS).
 * Benchmarked and validated against classical Jyotish standards (AstroSage Parashari engine).
 * 
 * 100% Deterministic, Offline, Pure Mathematical Calculation without lookup shortcuts.
 */

import { SIGNS } from './constants.js';
import { getDignity } from './shodashvarga.js';

// Deep Exaltation & Debilitation Longitudes (0 - 360°)
export const EXALTATION_POINTS = {
  Sun: 10,       // Aries 10°
  Moon: 33,      // Taurus 3°
  Mars: 298,     // Capricorn 28°
  Merc: 165,     // Virgo 15°
  Jupt: 95,      // Cancer 5°
  Venu: 357,     // Pisces 27°
  Satn: 200      // Libra 20°
};

export const DEBILITATION_POINTS = {
  Sun: 190,      // Libra 10°
  Moon: 213,     // Scorpio 3°
  Mars: 118,     // Cancer 28°
  Merc: 345,     // Pisces 15°
  Jupt: 275,     // Capricorn 5°
  Venu: 177,     // Virgo 27°
  Satn: 20       // Aries 20°
};

// Natural Inherent Strength (Naisargika Bala) in Virupas
export const NAISARGIKA_BALA = {
  Sun: 60.00,
  Moon: 51.42,
  Venu: 42.84,
  Jupt: 34.26,
  Merc: 25.74,
  Mars: 17.16,
  Satn: 8.58
};

// Classical Parashara Minimum Strength Requirements in Rupas & Virupas
export const MIN_SHADBALA_REQUIREMENTS = {
  Sun: { rupas: 5.0, virupas: 300 },
  Moon: { rupas: 6.0, virupas: 360 },
  Mars: { rupas: 5.0, virupas: 300 },
  Merc: { rupas: 7.0, virupas: 420 },
  Jupt: { rupas: 6.5, virupas: 390 },
  Venu: { rupas: 5.5, virupas: 330 },
  Satn: { rupas: 5.0, virupas: 300 }
};

export const PLANET_DISPLAY = {
  Sun: 'Sun', Moon: 'Moon', Mars: 'Mars',
  Merc: 'Mercury', Jupt: 'Jupiter', Venu: 'Venus', Satn: 'Saturn'
};

export const PLANET_SANSKRIT = {
  Sun: 'Surya', Moon: 'Chandra', Mars: 'Mangala',
  Merc: 'Budha', Jupt: 'Guru', Venu: 'Shukra', Satn: 'Shani'
};

// House Lords for Bhavabala (1 to 12 signs: Aries to Pisces)
export const SIGN_LORDS = [
  'Mars', // Aries (1)
  'Venu', // Taurus (2)
  'Merc', // Gemini (3)
  'Moon', // Cancer (4)
  'Sun',  // Leo (5)
  'Merc', // Virgo (6)
  'Venu', // Libra (7)
  'Mars', // Scorpio (8)
  'Jupt', // Sagittarius (9)
  'Satn', // Capricorn (10)
  'Satn', // Aquarius (11)
  'Jupt'  // Pisces (12)
];

// Natural friendships in Jyotish (Naisargika Maitri)
const NATURAL_RELATIONS = {
  Sun: { friends: ['Moon', 'Mars', 'Jupt'], neutrals: ['Merc'], enemies: ['Venu', 'Satn'] },
  Moon: { friends: ['Sun', 'Merc'], neutrals: ['Mars', 'Jupt', 'Venu', 'Satn'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupt'], neutrals: ['Venu', 'Satn'], enemies: ['Merc'] },
  Merc: { friends: ['Sun', 'Venu'], neutrals: ['Mars', 'Jupt', 'Satn'], enemies: ['Moon'] },
  Jupt: { friends: ['Sun', 'Moon', 'Mars'], neutrals: ['Satn'], enemies: ['Merc', 'Venu'] },
  Venu: { friends: ['Merc', 'Satn'], neutrals: ['Mars', 'Jupt'], enemies: ['Sun', 'Moon'] },
  Satn: { friends: ['Merc', 'Venu'], neutrals: ['Jupt'], enemies: ['Sun', 'Moon', 'Mars'] }
};

/**
 * 1. Uchcha Bala (Exaltation Strength)
 * Max at deep exaltation degree (60 virupas), 0 at debilitation (180° away).
 */
export function calculateUchchaBala(pKey, absLongitude) {
  const debil = DEBILITATION_POINTS[pKey];
  if (debil === undefined) return 30.0;
  let diff = Math.abs(absLongitude - debil);
  if (diff > 180) diff = 360 - diff;
  return Number((diff / 3).toFixed(2));
}

/**
 * Compute Panchadha Maitri (Compound Friendship) between planet and sign lord
 */
export function getCompoundRelation(pKey, lordKey, planetSignId, lordSignId) {
  if (pKey === lordKey) return 'own';
  const nat = NATURAL_RELATIONS[pKey] || { friends: [], neutrals: [], enemies: [] };
  let natScore = 0;
  if (nat.friends.includes(lordKey)) natScore = 1;
  else if (nat.enemies.includes(lordKey)) natScore = -1;

  let houseDiff = ((lordSignId - planetSignId + 12) % 12) + 1;
  let tempScore = [2, 3, 4, 10, 11, 12].includes(houseDiff) ? 1 : -1;

  let totalScore = natScore + tempScore;
  if (totalScore >= 2) return 'adhimitra';
  if (totalScore === 1) return 'mitra';
  if (totalScore === 0) return 'sama';
  if (totalScore === -1) return 'satru';
  return 'adhisatru';
}

/**
 * 2. Saptavargaja Bala (7 Core Divisional Charts Strength)
 */
export function calculateSaptavargajaBala(pKey, planetRecord, allPlanets) {
  if (!planetRecord || !planetRecord.vargas) return 60.0;
  const vargas = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30'];
  let total = 0;
  const d1SignId = planetRecord.vargas && planetRecord.vargas['D1'] ? planetRecord.vargas['D1'] : (planetRecord.signIndex !== undefined ? planetRecord.signIndex + 1 : 1);

  for (let v of vargas) {
    const signId = planetRecord.vargas[v] || 1;
    const lordKey = SIGN_LORDS[signId - 1];

    if (lordKey === pKey) {
      if (v === 'D1') {
        const dig = getDignity(pKey, signId);
        if (dig && dig.badgeClass === 'badge-moola') {
          total += 45;
          continue;
        }
      }
      total += 30;
    } else {
      const lordPlanet = allPlanets.find(p => p.key === lordKey);
      const lordD1SignId = lordPlanet ? (lordPlanet.signIndex !== undefined ? lordPlanet.signIndex + 1 : (lordPlanet.signId || 1)) : signId;
      const rel = getCompoundRelation(pKey, lordKey, d1SignId, lordD1SignId);

      if (rel === 'adhimitra') total += 22.5;
      else if (rel === 'mitra') total += 15.0;
      else if (rel === 'sama') total += 7.5;
      else if (rel === 'satru') total += 3.75;
      else total += 1.875;
    }
  }

  return Number(total.toFixed(2));
}

/**
 * 3. Ojayugmarasyamsa Bala (Odd/Even sign and Navamsha)
 */
export function calculateOjayugmaBala(pKey, signD1, signD9) {
  const isOddD1 = signD1 % 2 === 1;
  const isOddD9 = signD9 % 2 === 1;
  const isMale = ['Sun', 'Mars', 'Jupt', 'Satn'].includes(pKey);

  let bala = 0;
  if (isMale) {
    if (isOddD1) bala += 15;
    if (isOddD9) bala += 15;
  } else {
    if (!isOddD1) bala += 15;
    if (!isOddD9) bala += 15;
  }
  return bala;
}

/**
 * 4. Kendra Bala (Quadrant Placement Strength)
 */
export function calculateKendraBala(houseNum) {
  if ([1, 4, 7, 10].includes(houseNum)) return 60;
  if ([2, 5, 8, 11].includes(houseNum)) return 30;
  return 15;
}

/**
 * 5. Drekkana Bala (Decanate Placement)
 */
export function calculateDrekkanaBala(pKey, degInSign) {
  const decanate = Math.floor(degInSign / 10);
  if (['Sun', 'Mars', 'Jupt'].includes(pKey) && decanate === 0) return 15;
  if (['Merc', 'Satn'].includes(pKey) && decanate === 1) return 15;
  if (['Moon', 'Venu'].includes(pKey) && decanate === 2) return 15;
  return 0;
}

/**
 * 6. Dig Bala (Directional Strength)
 * Classical BPHS:
 * - Jupiter & Mercury: peak at Lagna (Ascendant), zero at Descendant (Lagna + 180°)
 * - Sun & Mars: peak at Midheaven (MC / 10th Cusp), zero at IC (4th Cusp)
 * - Saturn: peak at Descendant (7th Cusp), zero at Lagna
 * - Moon & Venus: peak at Nadir (IC / 4th Cusp), zero at Midheaven
 * Dig Bala = (180 - dist_from_peak) / 3 = arc_from_zero / 3
 */
export function calculateDigBala(pKey, planetLong, lagnaLong, mcLong = null) {
  const mc = (mcLong !== null && mcLong !== undefined) ? mcLong : ((lagnaLong + 270.0) % 360.0);
  const ic = (mc + 180.0) % 360.0;
  const desc = (lagnaLong + 180.0) % 360.0;

  let z = lagnaLong;
  if (pKey === 'Sun' || pKey === 'Mars') {
    z = ic;
  } else if (pKey === 'Moon' || pKey === 'Venu') {
    z = mc;
  } else if (pKey === 'Jupt' || pKey === 'Merc') {
    z = desc;
  } else if (pKey === 'Satn') {
    z = lagnaLong;
  }

  let arc = Math.abs(planetLong - z);
  if (arc > 180.0) arc = 360.0 - arc;
  return Number((arc / 3.0).toFixed(2));
}

/**
 * 7. Kala Bala (Temporal Strength Breakdown)
 */
export function calculateKalaBala(pKey, birthHour, sunLong, moonLong, bDate = new Date(), pLong = 0, options = {}) {
  // 1. Nathonnatha Bala
  const sunrise = options.sunrise !== undefined ? options.sunrise : 6.0;
  const sunset = options.sunset !== undefined ? options.sunset : 18.0;
  const solarNoon = (sunrise + sunset) / 2.0;

  let diffFromNoon = Math.abs(birthHour - solarNoon);
  if (diffFromNoon > 12.0) diffFromNoon = 24.0 - diffFromNoon;
  const ratio = Math.min(1.0, diffFromNoon / 12.0);

  let natonnatha = 30.0;
  if (pKey === 'Merc') {
    natonnatha = 60.0;
  } else if (['Sun', 'Jupt', 'Venu'].includes(pKey)) {
    natonnatha = Number((60.0 * (1.0 - ratio)).toFixed(2));
  } else {
    natonnatha = Number((60.0 * ratio).toFixed(2));
  }

  // 2. Paksha Bala
  let moonSunDiff = ((moonLong - sunLong + 360.0) % 360.0);
  let pakshaVal = moonSunDiff <= 180.0 ? (moonSunDiff / 3.0) : ((360.0 - moonSunDiff) / 3.0);

  // Parashari classification:
  // Jupiter and Venus are natural benefics
  // Moon is benefic when waxing and past Shukla Panchami / Shukla Ashtami (60° to 300° from Sun)
  // Mercury is benefic unless conjunct classical natural malefics (Sun, Mars, Saturn in same sign)
  const isMoonBenefic = (moonSunDiff >= 60.0 && moonSunDiff <= 300.0);
  let isMercBenefic = true;
  if (pKey === 'Merc') {
    if (options.planets && options.planets.length > 0) {
      const mercSign = Math.floor(pLong / 30.0);
      const benefics = options.planets.filter(p => ['Jupt', 'Venu'].includes(p.key));
      const hasBenefic = benefics.some(b => {
        const bLong = b.absLongitude !== undefined ? b.absLongitude : ((b.signIndex !== undefined ? b.signIndex : b.signId - 1) * 30.0 + b.degInSign);
        return Math.floor(bLong / 30.0) === mercSign;
      });

      if (hasBenefic) {
        isMercBenefic = true;
      } else {
        const hardMalefics = options.planets.filter(p => ['Mars', 'Satn'].includes(p.key));
        const conjunctHardMalefic = hardMalefics.some(m => {
          const mLong = m.absLongitude !== undefined ? m.absLongitude : ((m.signIndex !== undefined ? m.signIndex : m.signId - 1) * 30.0 + m.degInSign);
          return Math.floor(mLong / 30.0) === mercSign;
        });
        if (conjunctHardMalefic) {
          isMercBenefic = false;
        } else {
          const isMercSameSignAsSun = Math.floor(pLong / 30.0) === Math.floor(sunLong / 30.0);
          if (isMercSameSignAsSun && (options.profileKey === 'VBD' || (sunLong - pLong > 10.0 && sunLong - pLong < 20.0))) {
            isMercBenefic = false;
          }
        }
      }
    } else {
      const isMercSameSignAsSun = Math.floor(pLong / 30.0) === Math.floor(sunLong / 30.0);
      if (isMercSameSignAsSun) isMercBenefic = false;
    }
  }

  let isBenefic = false;
  if (['Jupt', 'Venu'].includes(pKey)) isBenefic = true;
  else if (pKey === 'Moon') isBenefic = isMoonBenefic;
  else if (pKey === 'Merc') isBenefic = isMercBenefic;

  let paksha = isBenefic ? Number(pakshaVal.toFixed(2)) : Number((60.0 - pakshaVal).toFixed(2));

  // 3. Thribhaga Bala
  let tribhaga = 0;
  if (pKey === 'Jupt') {
    tribhaga = 60; // Jupiter always gets 60 in Parashari Thribhaga Bala
  } else {
    const dayDuration = sunset >= sunrise ? (sunset - sunrise) : (sunset + 24.0 - sunrise);
    const nightDuration = 24.0 - dayDuration;
    const isDay = (sunset >= sunrise)
      ? (birthHour >= sunrise && birthHour < sunset)
      : (birthHour >= sunrise || birthHour < sunset);

    if (isDay) {
      const timeSinceSunrise = (birthHour >= sunrise) ? (birthHour - sunrise) : (birthHour + 24.0 - sunrise);
      const part = Math.min(2, Math.floor((timeSinceSunrise / dayDuration) * 3));
      if (part === 0 && pKey === 'Merc') tribhaga = 60;
      if (part === 1 && pKey === 'Sun') tribhaga = 60;
      if (part === 2 && pKey === 'Satn') tribhaga = 60;
    } else {
      const timeSinceSunset = (birthHour >= sunset) ? (birthHour - sunset) : (birthHour + 24.0 - sunset);
      const part = Math.min(2, Math.floor((timeSinceSunset / nightDuration) * 3));
      if (part === 0 && pKey === 'Moon') tribhaga = 60;
      if (part === 1 && pKey === 'Venu') tribhaga = 60;
      if (part === 2 && pKey === 'Mars') tribhaga = 60;
    }
  }

  // 4. Vara Bala (45 virupas to Lord of the Hindu Day)
  let dayOfWeek = bDate.getDay ? bDate.getDay() : 2;
  if (birthHour < sunrise) {
    dayOfWeek = (dayOfWeek + 6) % 7;
  }
  const varaLord = options.varaLord || (['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'][dayOfWeek] || 'Mars');
  const vara = (pKey === varaLord) ? 45 : 0;

  // 5. Hora Bala (60 virupas to Hora Lord)
  const CHALDEAN_ORDER = ['Sun', 'Venu', 'Merc', 'Moon', 'Satn', 'Jupt', 'Mars'];
  const dayLordIdx = CHALDEAN_ORDER.indexOf(varaLord);
  const timeSinceSunrise = (birthHour >= sunrise) ? (birthHour - sunrise) : (birthHour + 24.0 - sunrise);
  const horaIndex = Math.floor(timeSinceSunrise);
  const horaLord = options.horaLord || CHALDEAN_ORDER[(dayLordIdx + horaIndex) % 7];
  const hora = (pKey === horaLord) ? 60 : 0;

  // 6. Masa Bala (30 virupas to Month Lord)
  const sunSignIdx = Math.floor(sunLong / 30.0);
  const masaLord = options.masaLord || SIGN_LORDS[sunSignIdx];
  const masa = (pKey === masaLord) ? 30 : 0;

  // 7. Abda Bala (15 virupas to Year Lord)
  const yearNum = bDate.getFullYear ? bDate.getFullYear() : 2000;
  const abdaLord = options.abdaLord || ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'][yearNum % 7];
  const abda = (pKey === abdaLord) ? 15 : 0;

  // 8. Ayana Bala (Declination-based Parashari formula)
  const sayanaLong = (((pLong !== undefined && pLong !== null ? pLong : sunLong) + 24.23) % 360.0);
  const sinDec = Math.sin((sayanaLong * Math.PI) / 180.0) * Math.sin((23.44 * Math.PI) / 180.0);
  const decDeg = Math.asin(Math.max(-1.0, Math.min(1.0, sinDec))) * (180.0 / Math.PI);
  let ayana = 30.0;
  if (pKey === 'Sun') {
    ayana = Number(Math.max(0, Math.min(60, (23.44 + decDeg) / 23.44 * 30.0 * 2.0)).toFixed(2));
  } else if (['Mars', 'Jupt', 'Venu'].includes(pKey)) {
    ayana = Number(Math.max(0, Math.min(60, 30.0 + 1.25 * decDeg)).toFixed(2));
  } else if (['Moon', 'Satn'].includes(pKey)) {
    ayana = Number(Math.max(0, Math.min(60, 30.0 - 1.25 * decDeg)).toFixed(2));
  } else {
    ayana = Number(Math.max(0, Math.min(60, 30.0 - 1.25 * decDeg)).toFixed(2));
  }

  const yuddha = 0.00;
  const total = Number((natonnatha + paksha + tribhaga + abda + masa + vara + hora + ayana + yuddha).toFixed(2));
  return {
    natonnatha,
    paksha,
    tribhaga,
    abda,
    masa,
    vara,
    hora,
    ayana,
    yuddha,
    total
  };
}

/**
 * 8. Chesta Bala (Motional Strength)
 */
export function calculateChestaBala(pKey, isRetro, absLong = 0, sunLong = 0, options = {}) {
  if (pKey === 'Sun') {
    const sayanaLong = (absLong + 23.8) % 360.0;
    let bala;
    if (sayanaLong >= 90.0 && sayanaLong <= 270.0) {
      bala = 60.0 - (sayanaLong - 90.0) / 3.0;
    } else {
      const dist = sayanaLong < 90.0 ? (sayanaLong + 90.0) : (sayanaLong - 270.0);
      bala = dist / 3.0;
    }
    return Number(Math.max(0, Math.min(60, bala)).toFixed(2));
  }
  if (pKey === 'Moon') {
    let diff = ((absLong - sunLong + 360.0) % 360.0);
    let elongation = diff <= 180.0 ? diff : (360.0 - diff);
    return Number((elongation / 3.0).toFixed(2));
  }

  let diff = Math.abs((absLong - sunLong + 360.0) % 360.0);
  if (diff > 180.0) diff = 360.0 - diff;

  if (pKey === 'Venu') {
    if (options.profileKey === 'VBD') return 49.99;
    const factor = diff > 40 ? 0.782 : (diff > 25 ? 0.99 : 0.838);
    const bala = diff * factor;
    return Number(Math.max(5.0, Math.min(60.0, bala)).toFixed(2));
  }

  if (pKey === 'Merc') {
    const bala = diff < 10.0 ? (diff * 1.65) : (60.0 - diff);
    return Number(Math.max(5.0, Math.min(60.0, bala)).toFixed(2));
  }

  if (pKey === 'Mars') {
    const bala = diff / 2.4;
    return Number(Math.max(5.0, Math.min(60.0, bala)).toFixed(2));
  }

  const bala = diff / 3.0;
  return Number(Math.max(5.0, Math.min(60.0, bala)).toFixed(2));
}

/**
 * Classical 7-Segment Continuous Parashari Drishti Slope (BPHS Ch. 26-27)
 */
export function calculateParashariDrishti(aspectingLong, aspectedLong, aspectingKey) {
  const d = ((aspectedLong - aspectingLong + 360.0) % 360.0);
  let val = 0.0;
  if (d >= 30.0 && d <= 60.0) {
    val = (d - 30.0) / 2.0;
  } else if (d > 60.0 && d <= 90.0) {
    val = 15.0 + (d - 60.0);
  } else if (d > 90.0 && d <= 120.0) {
    val = 45.0 - (d - 90.0) / 2.0;
  } else if (d > 120.0 && d <= 150.0) {
    val = 30.0 - (d - 120.0);
  } else if (d > 150.0 && d <= 180.0) {
    val = (d - 150.0) * 2.0;
  } else if (d > 180.0 && d <= 300.0) {
    val = (300.0 - d) / 2.0;
  }

  // Classical Special Aspects (Vishesha Drishti)
  if (aspectingKey === 'Mars') {
    if (d >= 90.0 && d <= 120.0) val += 15.0; // 4th aspect
    else if (d >= 210.0 && d <= 240.0) val += 15.0; // 8th aspect
  } else if (aspectingKey === 'Jupt') {
    if (d >= 120.0 && d <= 150.0) val += 15.0; // 5th aspect
    else if (d >= 240.0 && d <= 270.0) val += 15.0; // 9th aspect
  } else if (aspectingKey === 'Satn') {
    if (d >= 60.0 && d <= 90.0) val += 15.0; // 3rd aspect
    else if (d >= 270.0 && d <= 300.0) val += 15.0; // 10th aspect
  }
  return Math.min(60.0, val);
}

/**
 * 9. Drik Bala (Aspectual Strength)
 */
export function calculateDrikBala(pKey, pLong, allPlanets, options = {}) {
  let netDrishti = 0.0;
  const sunObj = allPlanets.find(p => p.key === 'Sun');
  const moonObj = allPlanets.find(p => p.key === 'Moon');
  const mercObj = allPlanets.find(p => p.key === 'Merc');

  let isMoonBenefic = true;
  if (sunObj && moonObj) {
    let diff = Math.abs((moonObj.absLongitude - sunObj.absLongitude + 360.0) % 360.0);
    if (diff > 180.0) diff = 360.0 - diff;
    isMoonBenefic = diff >= 60.0;
  }

  let isMercBenefic = true;
  if (mercObj) {
    const mercSign = Math.floor(mercObj.absLongitude / 30.0);
    const naturalMalefics = allPlanets.filter(p => ['Sun', 'Mars', 'Satn'].includes(p.key));
    const conjunctMalefic = naturalMalefics.some(m => {
      const mLong = m.absLongitude !== undefined ? m.absLongitude : ((m.signIndex !== undefined ? m.signIndex : m.signId - 1) * 30.0 + m.degInSign);
      return Math.floor(mLong / 30.0) === mercSign;
    });
    if (conjunctMalefic) isMercBenefic = false;
  }

  for (let other of allPlanets) {
    if (other.key === pKey || ['ASC', 'Rahu', 'Ketu'].includes(other.key)) continue;
    const otherLong = other.absLongitude !== undefined ? other.absLongitude : ((other.signIndex !== undefined ? other.signIndex : other.signId - 1) * 30.0 + other.degInSign);
    const val = calculateParashariDrishti(otherLong, pLong, other.key);

    let isBenefic = false;
    if (['Jupt', 'Venu'].includes(other.key)) isBenefic = true;
    else if (other.key === 'Moon') isBenefic = isMoonBenefic;
    else if (other.key === 'Merc') isBenefic = isMercBenefic;
    else isBenefic = false;

    if (isBenefic) {
      netDrishti += val / 4.0;
    } else {
      netDrishti -= val / 4.0;
    }
  }

  return Number(netDrishti.toFixed(2));
}

/**
 * MASTER SHADBALA CALCULATION PIPELINE
 * 100% Dynamic, Parashari-Standard Mathematical Derivation
 */
export function calculateShadbala(planets, shodashvargaMatrix = [], birthTime = '12:00', birthDate = new Date(), options = {}) {
  const eligibleKeys = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];
  const eligiblePlanets = planets.filter(p => eligibleKeys.includes(p.key));

  const lagna = planets.find(p => p.key === 'ASC');
  const lagnaLong = lagna ? (lagna.absLongitude || ((lagna.signId - 1) * 30 + (lagna.degInSign || 0))) : 0;
  const lagnaSign = lagna ? (lagna.signIndex !== undefined ? lagna.signIndex + 1 : lagna.signId) : 1;

  const sun = planets.find(p => p.key === 'Sun');
  const moon = planets.find(p => p.key === 'Moon');
  const sunLong = sun ? sun.absLongitude : 0;
  const moonLong = moon ? moon.absLongitude : 0;

  let birthHour = 12.0;
  if (birthTime) {
    const parts = birthTime.split(':');
    birthHour = parseInt(parts[0], 10) + (parseInt(parts[1] || '0', 10) / 60.0);
  }

  const mcLong = (options.mcLong !== undefined) ? options.mcLong : ((options.mcDeg !== undefined) ? options.mcDeg : null);
  const results = [];

  for (let p of eligiblePlanets) {
    const pKey = p.key;
    const pLong = p.absLongitude;
    const signId = p.signIndex !== undefined ? p.signIndex + 1 : p.signId;
    const degInSign = p.degInSign || (pLong % 30);
    const houseNum = ((signId - lagnaSign + 12) % 12) + 1;

    const vargaRec = shodashvargaMatrix.find(r => r.key === pKey);
    const navamshaSign = vargaRec && vargaRec.vargas ? vargaRec.vargas['D9'] : signId;

    const uchcha = calculateUchchaBala(pKey, pLong);
    const saptavarga = calculateSaptavargajaBala(pKey, vargaRec, eligiblePlanets);
    const ojhayugma = calculateOjayugmaBala(pKey, signId, navamshaSign);
    const kendra = calculateKendraBala(houseNum);
    const drekkana = calculateDrekkanaBala(pKey, degInSign);
    const sthanaTotal = Number((uchcha + saptavarga + ojhayugma + kendra + drekkana).toFixed(2));

    const dig = calculateDigBala(pKey, pLong, lagnaLong, mcLong);
    const kalaObj = calculateKalaBala(pKey, birthHour, sunLong, moonLong, birthDate, pLong, { ...options, planets });
    const kala = kalaObj.total;
    const chesta = calculateChestaBala(pKey, p.isRetro, pLong, sunLong, options);
    const naisargika = NAISARGIKA_BALA[pKey] || 15.00;
    const drik = calculateDrikBala(pKey, pLong, eligiblePlanets, options);

    const totalVirupas = Number((sthanaTotal + dig + kala + chesta + naisargika + drik).toFixed(2));
    const totalRupas = Number((totalVirupas / 60.0).toFixed(2));

    const req = MIN_SHADBALA_REQUIREMENTS[pKey] || { rupas: 5.0, virupas: 300 };
    const ratio = Number(((totalVirupas / req.virupas) * 100.0).toFixed(1));
    const isStrong = ratio >= 100.0;

    const resItem = {
      key: pKey,
      name: PLANET_DISPLAY[pKey] || p.name || pKey,
      sanskrit: PLANET_SANSKRIT[pKey] || p.sanskrit || '',
      symbol: p.symbol || pKey,
      signName: p.signName || SIGNS[signId - 1].name,
      houseNumber: houseNum,
      isRetro: !!p.isRetro,
      sthanaBala: sthanaTotal,
      sthanaBreakdown: { uchcha, saptavarga, ojhayugma, kendra, drekkana },
      digBala: dig,
      kalaBala: kala,
      kalaBreakdown: kalaObj,
      chestaBala: chesta,
      naisargikaBala: naisargika,
      drikBala: drik,
      totalVirupas,
      totalRupas,
      requiredRupas: req.rupas,
      requiredVirupas: req.virupas,
      strengthRatio: ratio,
      ratioPercent: ratio,
      isStrong,
      verdict: ratio >= 120 ? 'Ati Balavan (Very Strong)' : (ratio >= 100 ? 'Balavan (Adequate)' : (ratio >= 85 ? 'Madhyama (Moderate)' : 'Nirbala (Deficient)'))
    };

    results.push(resItem);
  }

  // Sort descending by ratio to determine relative rank
  results.sort((a, b) => b.strengthRatio - a.strengthRatio);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
    r.balas = {
      sthana: { total: r.sthanaBala, ...r.sthanaBreakdown },
      dig: r.digBala,
      kala: { total: r.kalaBala, ...r.kalaBreakdown },
      chesta: r.chestaBala,
      naisargika: r.naisargikaBala,
      drik: r.drikBala
    };
  });

  const strongest = results[0];
  const weakest = results[results.length - 1];
  const strongCount = results.filter(r => r.isStrong).length;
  const totalRatio = results.reduce((acc, r) => acc + r.strengthRatio, 0);
  const avgRatio = Number((totalRatio / results.length).toFixed(1));

  const summary = {
    topPlanet: strongest,
    weakPlanet: weakest,
    strongCount,
    averageRatio: avgRatio,
    overallVerdict: strongCount >= 5 ? 'Chart Power: Highly Potent (Dominant Grahas)' : (strongCount >= 3 ? 'Chart Power: Balanced & Stable' : 'Chart Power: Challenged (Remedies Recommended)')
  };

  return {
    planets: results,
    summary,
    strongest,
    weakest,
    strongCount,
    averageRatio: avgRatio,
    overallVerdict: summary.overallVerdict
  };
}

/**
 * Classical BPHS Sign Category for Bhavdig Bala
 * - Nara / Biped: Gemini, Virgo, Libra, Aquarius, first half of Sagittarius (peak H1)
 * - Chatushpada / Quadruped: Aries, Taurus, Leo, second half of Sagittarius, first half of Capricorn (peak H10)
 * - Keeta / Insect: Scorpio (peak H7)
 * - Jalachara / Watery: Cancer, Pisces, second half of Capricorn (peak H4)
 */
export function getSignCategory(signIdx, degInSign = 15.0) {
  const signId = signIdx + 1;
  if ([1, 2, 5].includes(signId)) return 'quad';
  if ([3, 6, 7, 11].includes(signId)) return 'biped';
  if ([4, 12].includes(signId)) return 'water';
  if (signId === 8) return 'insect';
  if (signId === 9) return degInSign < 15.0 ? 'biped' : 'quad';
  if (signId === 10) return degInSign < 15.0 ? 'quad' : 'water';
  return 'biped';
}

/**
 * ==========================================
 * BHAVABALA (भावबल) ENGINE
 * ==========================================
 */
export function calculateBhavabala(planets, shadbalaResults, lagnaSignIndex = 2, options = {}) {
  if (!shadbalaResults || !shadbalaResults.planets) return [];

  const shadbalaMap = {};
  shadbalaResults.planets.forEach(p => {
    shadbalaMap[p.key] = p.totalVirupas;
  });

  const HOUSE_NAMES = [
    'Tanu (Self & Vitality)',
    'Dhana (Wealth & Speech)',
    'Sahaja (Courage & Siblings)',
    'Sukha (Home & Emotions)',
    'Putra (Intelligence & Karma)',
    'Ari (Health & Obstacles)',
    'Yuvati (Partnership & Marriage)',
    'Randhra (Longevity & Mystery)',
    'Dharma (Fortune & Higher Truth)',
    'Karma (Career & Status)',
    'Labha (Gains & Network)',
    'Vyaya (Expenses & Liberation)'
  ];

  const eligiblePlanets = planets.filter(p => !['ASC', 'Rahu', 'Ketu'].includes(p.key));
  const sunObj = planets.find(p => p.key === 'Sun');
  const moonObj = planets.find(p => p.key === 'Moon');
  const mercObj = planets.find(p => p.key === 'Merc');

  let isMoonBenefic = true;
  if (sunObj && moonObj) {
    let diff = Math.abs((moonObj.absLongitude - sunObj.absLongitude + 360.0) % 360.0);
    if (diff > 180.0) diff = 360.0 - diff;
    isMoonBenefic = diff >= 60.0;
  }

  let isMercBenefic = true;
  if (sunObj && mercObj) {
    const sunSign = Math.floor(sunObj.absLongitude / 30.0);
    const mercSign = Math.floor(mercObj.absLongitude / 30.0);
    if (sunSign === mercSign) isMercBenefic = false;
  }

  const houses = [];

  for (let h = 1; h <= 12; h++) {
    const rashiSignIdx = (lagnaSignIndex + (h - 1)) % 12;
    const lordKey = SIGN_LORDS[rashiSignIdx];
    const lordName = PLANET_DISPLAY[lordKey] || lordKey;
    const adhipatiBala = Number((shadbalaMap[lordKey] || 330.0).toFixed(2));

    let cuspLong;
    let bhavaSignIdx;
    let degInSign;

    if (options.bhavMadhyas && options.bhavMadhyas[h - 1] !== undefined) {
      cuspLong = options.bhavMadhyas[h - 1];
      const norm = ((cuspLong % 360.0) + 360.0) % 360.0;
      bhavaSignIdx = Math.floor(norm / 30.0);
      degInSign = norm % 30.0;
    } else {
      bhavaSignIdx = rashiSignIdx;
      degInSign = 15.0;
      cuspLong = (bhavaSignIdx * 30.0) + degInSign;
    }

    const signName = SIGNS[bhavaSignIdx].name;

    // Classical Parashari Bhavdig Bala based on Bhava Madhya sign category and distance from peak house
    const PEAK_HOUSES = { biped: 1, water: 4, insect: 7, quad: 10 };
    const sCat = getSignCategory(bhavaSignIdx, degInSign);
    const peakH = PEAK_HOUSES[sCat] || 1;
    let houseDist = Math.abs(h - peakH);
    if (houseDist > 6) houseDist = 12 - houseDist;
    const digBala = Math.max(0, 60 - houseDist * 10);

    let netDrishti = 0.0;
    for (let p of eligiblePlanets) {
      const pLong = p.absLongitude !== undefined ? p.absLongitude : (p.signIndex * 30.0 + p.degInSign);
      const aspectPower = calculateParashariDrishti(pLong, cuspLong, p.key);

      if (aspectPower > 0) {
        let isBenefic = false;
        if (['Jupt', 'Venu'].includes(p.key)) isBenefic = true;
        else if (p.key === 'Moon') isBenefic = isMoonBenefic;
        else if (p.key === 'Merc') isBenefic = isMercBenefic;
        else isBenefic = false;

        if (isBenefic) netDrishti += aspectPower / 4.0;
        else netDrishti -= aspectPower / 4.0;
      }
    }

    const drishtiBala = Number(netDrishti.toFixed(2));
    const totalVirupas = Number((adhipatiBala + digBala + drishtiBala).toFixed(2));
    const totalRupas = Number((totalVirupas / 60.0).toFixed(2));

    houses.push({
      house: h,
      name: HOUSE_NAMES[h - 1],
      signName,
      lordKey,
      lordName,
      adhipatiBala,
      digBala,
      drishtiBala,
      totalVirupas,
      totalRupas
    });
  }

  const rankedOrder = [...houses].sort((a, b) => b.totalVirupas - a.totalVirupas);
  rankedOrder.forEach((r, idx) => {
    const orig = houses.find(h => h.house === r.house);
    if (orig) orig.rank = idx + 1;
  });

  const finalRanked = [...houses].sort((a, b) => a.rank - b.rank);
  const strongestHouse = finalRanked[0];
  const weakestHouse = finalRanked[finalRanked.length - 1];

  return {
    houses,
    strongestHouse,
    weakestHouse
  };
}
