import { SIGNS, PLANETS, NAKSHATRAS } from './constants.js';

// Normalization mappings for Signs
const SIGN_MAP = {
  'aries': 1, 'ari': 1, 'mesha': 1,
  'taurus': 2, 'tau': 2, 'vrishabha': 2, 'vrishabh': 2,
  'gemini': 3, 'gem': 3, 'mithuna': 3, 'mithun': 3,
  'cancer': 4, 'can': 4, 'karka': 4, 'kark': 4,
  'leo': 5, 'simha': 5, 'singh': 5,
  'virgo': 6, 'vir': 6, 'kanya': 6,
  'libra': 7, 'lib': 7, 'tula': 7,
  'scorpio': 8, 'scorpion': 8, 'sco': 8, 'vrischika': 8, 'vrishchik': 8,
  'sagittarius': 9, 'sagittary': 9, 'sag': 9, 'sgr': 9, 'dhanu': 9, 'dhanus': 9,
  'capricorn': 10, 'cap': 10, 'makara': 10, 'makar': 10,
  'aquarius': 11, 'aqu': 11, 'kumbha': 11, 'kumbh': 11,
  'pisces': 12, 'pis': 12, 'meena': 12, 'meen': 12
};

// Normalization mappings for Planets
const PLANET_MAP = {
  'asc': 'ASC', 'ascendant': 'ASC', 'lagna': 'ASC', 'as': 'ASC',
  'sun': 'Sun', 'su': 'Sun', 'surya': 'Sun',
  'moon': 'Moon', 'mo': 'Moon', 'chandra': 'Moon',
  'mars': 'Mars', 'ma': 'Mars', 'mangala': 'Mars', 'mangal': 'Mars', 'kuja': 'Mars',
  'merc': 'Merc', 'mercury': 'Merc', 'me': 'Merc', 'budha': 'Merc', 'budh': 'Merc',
  'jupt': 'Jupt', 'jupiter': 'Jupt', 'jup': 'Jupt', 'ju': 'Jupt', 'guru': 'Jupt', 'brihaspati': 'Jupt',
  'venu': 'Venu', 'venus': 'Venu', 've': 'Venu', 'shukra': 'Venu', 'shukr': 'Venu',
  'satn': 'Satn', 'saturn': 'Satn', 'sat': 'Satn', 'sa': 'Satn', 'shani': 'Satn',
  'rahu': 'Rahu', 'ra': 'Rahu',
  'ketu': 'Ketu', 'ke': 'Ketu',
  'uran': 'Uran', 'uranus': 'Uran', 'ur': 'Uran', 'ure': 'Uran', 'harshal': 'Uran',
  'nept': 'Nept', 'neptune': 'Nept', 'ne': 'Nept', 'nep': 'Nept', 'varuna': 'Nept',
  'plut': 'Plut', 'pluto': 'Plut', 'pl': 'Plut', 'plu': 'Plut', 'yama': 'Plut'
};

/**
 * Parses DMS (Degrees, Minutes, Seconds) string into decimal degrees.
 * Handles formats: "09-01-55", "09:01:55", "9° 1' 55\"", "9.03194"
 */
export function parseDMS(dmsStr) {
  if (!dmsStr) return { deg: 0, min: 0, sec: 0, decimal: 0 };
  const clean = dmsStr.trim().replace(/[°'"]/g, ' ');
  const parts = clean.split(/[-:\s]+/).map(p => parseFloat(p)).filter(p => !isNaN(p));
  
  let deg = 0, min = 0, sec = 0;
  if (parts.length >= 3) {
    deg = parts[0];
    min = parts[1];
    sec = parts[2];
  } else if (parts.length === 2) {
    deg = parts[0];
    min = parts[1];
  } else if (parts.length === 1) {
    // Check if it's decimal or whole
    const val = parts[0];
    deg = Math.floor(val);
    const remMin = (val - deg) * 60;
    min = Math.floor(remMin);
    sec = Math.round((remMin - min) * 60);
  }
  
  const decimal = deg + (min / 60) + (sec / 3600);
  return { deg, min, sec, decimal };
}

export function formatDMS(degDecimal) {
  const norm = ((degDecimal % 30) + 30) % 30;
  const d = Math.floor(norm);
  const mFloat = (norm - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

/**
 * Given absolute longitude (0 to 360), calculate Nakshatra & Pada.
 */
export function calculateNakshatraPada(absLongitude) {
  const normDeg = ((absLongitude % 360) + 360) % 360;
  const totalMinutes = normDeg * 60;
  const nakshatraIndex = Math.floor(totalMinutes / 800); // 13°20' = 800 minutes
  const padaIndex = Math.floor((totalMinutes % 800) / 200) + 1; // 3°20' = 200 minutes
  const nakshatra = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0];
  
  return {
    nakshatraId: nakshatra.id,
    nakshatraName: nakshatra.name,
    nakshatraLord: nakshatra.lord,
    pada: Math.min(4, Math.max(1, padaIndex)),
    fractionInNakshatra: (totalMinutes % 800) / 800
  };
}

/**
 * Parses user raw string input into an array of planet records.
 */
export function parsePlanetaryInput(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split('\n');
  const results = [];
  const seenPlanets = new Set();

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Skip header lines
    if (/^(planets|planet|graha|body|name)\s+/i.test(trimmed)) continue;

    // Tokens split by space/tab
    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 2) continue;

    let pKey = null;
    let isRetro = false;
    let signName = null;
    let dmsString = null;
    let nakshatraName = null;
    let pada = null;

    let idx = 0;
    // Check first token for planet
    const token0Lower = tokens[0].toLowerCase();
    if (PLANET_MAP[token0Lower]) {
      pKey = PLANET_MAP[token0Lower];
      idx = 1;
    }

    if (!pKey) continue;

    // Check if next token is Retrograde indicator [R], (R), R
    if (idx < tokens.length && /^(\[r\]|\(r\)|r|retro|rx)$/i.test(tokens[idx])) {
      isRetro = true;
      idx++;
    }

    // Next token should be Sign
    if (idx < tokens.length) {
      const signCand = tokens[idx].toLowerCase().replace(/[^a-z]/g, '');
      if (SIGN_MAP[signCand]) {
        signName = signCand;
        idx++;
      }
    }

    // Retro indicator could be after sign as well e.g. "Jupt Libra [R] ..."
    if (idx < tokens.length && /^(\[r\]|\(r\)|r|retro|rx)$/i.test(tokens[idx])) {
      isRetro = true;
      idx++;
    }

    // Next token should be DMS or degrees
    if (idx < tokens.length) {
      dmsString = tokens[idx];
      idx++;
    }

    // Remaining tokens could be Nakshatra and Pada
    if (idx < tokens.length) {
      const rem = tokens.slice(idx);
      // Last token might be Pada number 1..4
      const lastToken = rem[rem.length - 1];
      if (/^[1-4]$/.test(lastToken)) {
        pada = parseInt(lastToken, 10);
        nakshatraName = rem.slice(0, rem.length - 1).join(' ');
      } else {
        nakshatraName = rem.join(' ');
      }
    }

    if (!signName || !dmsString) continue;

    const signId = SIGN_MAP[signName];
    const signObj = SIGNS[signId - 1];
    const dms = parseDMS(dmsString);
    const absLongitude = ((signId - 1) * 30) + dms.decimal;
    const nakInfo = calculateNakshatraPada(absLongitude);

    const planetMeta = PLANETS.find(p => p.key === pKey);

    const planetData = {
      key: pKey,
      name: planetMeta ? planetMeta.name : pKey,
      sanskrit: planetMeta ? planetMeta.sanskrit : pKey,
      symbol: planetMeta ? planetMeta.symbol : pKey,
      color: planetMeta ? planetMeta.color : '#A855F7',
      isRetro,
      signId,
      signIndex: signId - 1,
      longitude: Number(absLongitude.toFixed(6)),
      absLongitude: Number(absLongitude.toFixed(6)),
      signName: signObj.name,
      signSanskrit: signObj.sanskrit,
      signLord: signObj.lord,
      degInSign: dms.decimal,
      degDms: dms,
      dmsFormatted: formatDMS(dms.decimal),
      nakshatraId: nakInfo.nakshatraId,
      nakshatraName: nakshatraName || nakInfo.nakshatraName,
      pada: pada || nakInfo.pada,
      nakshatraLord: nakInfo.nakshatraLord,
      fractionInNakshatra: nakInfo.fractionInNakshatra
    };

    results.push(planetData);
    seenPlanets.add(pKey);
  }

  return results;
}
