import { SIGNS, ASHTAKAVARGA_RULES } from './constants.js';

const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];

/**
 * Calculates Bhinna Ashtakavarga (BAV) for the 7 planets and Sarvashtakavarga (SAV).
 */
export function calculateAshtakavarga(planets) {
  // Map planet keys to their D1 signs (1 to 12)
  const planetSigns = {};
  for (let p of planets) {
    planetSigns[p.key] = p.signId;
  }

  // Ensure default lagna sign if not present
  const lagnaSign = planetSigns['ASC'] || 1;

  // Initialize BAV tables: 7 planets x 12 signs
  const bav = {};
  for (let pKey of PLANET_KEYS) {
    bav[pKey] = new Array(12).fill(0);
  }

  // Calculate BAV bindus
  for (let pKey of PLANET_KEYS) {
    const rules = ASHTAKAVARGA_RULES[pKey];
    if (!rules) continue;

    for (let donorKey of Object.keys(rules)) {
      const donorSign = planetSigns[donorKey];
      if (!donorSign) continue;

      const houses = rules[donorKey];
      for (let h of houses) {
        // Sign index (0-indexed: 0 = Aries, 11 = Pisces)
        const targetSignIdx = (donorSign - 1 + (h - 1)) % 12;
        bav[pKey][targetSignIdx] += 1;
      }
    }
  }

  // Calculate Sarvashtakavarga (SAV) per sign (0..11)
  const savBySign = new Array(12).fill(0);
  for (let sIdx = 0; sIdx < 12; sIdx++) {
    for (let pKey of PLANET_KEYS) {
      savBySign[sIdx] += bav[pKey][sIdx];
    }
  }

  // Calculate SAV by Bhava (1st house to 12th house from Lagna)
  const savByHouse = [];
  for (let h = 1; h <= 12; h++) {
    const signIdx = (lagnaSign - 1 + (h - 1)) % 12;
    const points = savBySign[signIdx];
    const signObj = SIGNS[signIdx];
    
    let strength = 'Average';
    if (points >= 30) strength = 'Very Strong';
    else if (points >= 28) strength = 'Strong';
    else if (points >= 25) strength = 'Moderate';
    else strength = 'Weak';

    savByHouse.push({
      house: h,
      signId: signObj.id,
      signName: signObj.name,
      signSanskrit: signObj.sanskrit,
      points,
      strength
    });
  }

  // Total SAV points (canonical 337)
  const totalSAV = savBySign.reduce((a, b) => a + b, 0);

  // Summary analysis for AI prompt and UI
  const strongestHouse = [...savByHouse].sort((a, b) => b.points - a.points)[0];
  const weakestHouse = [...savByHouse].sort((a, b) => a.points - b.points)[0];

  return {
    bav,
    savBySign,
    savByHouse,
    totalSAV,
    strongestHouse,
    weakestHouse
  };
}
