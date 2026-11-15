/**
 * Classical Parashari Planetary Friendship Engine (Maitri Chakra)
 * Calculates:
 * 1. Permanent / Natural Friendship (Naisargika Maitri)
 * 2. Temporal Friendship (Tatkalika Maitri based on natal house separation)
 * 3. Five-Fold Compound Friendship (Panchadha Maitri: Intimate, Friend, Neutral, Enemy, Bitter)
 */

export const CLASSICAL_PLANETS = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];

/**
 * Classical Naisargika Maitri (Permanent Natural Friendships)
 * Source: Brihat Parashara Hora Shastra (BPHS) Chapter 15
 */
export const PERMANENT_FRIENDSHIPS = {
  Sun:  { Sun: '---', Moon: 'Friend',  Mars: 'Friend',  Merc: 'Neutral', Jupt: 'Friend',  Venu: 'Enemy',   Satn: 'Enemy' },
  Moon: { Sun: 'Friend',  Moon: '---', Mars: 'Neutral', Merc: 'Friend',  Jupt: 'Neutral', Venu: 'Neutral', Satn: 'Neutral' },
  Mars: { Sun: 'Friend',  Moon: 'Friend',  Mars: '---', Merc: 'Enemy',   Jupt: 'Friend',  Venu: 'Neutral', Satn: 'Neutral' },
  Merc: { Sun: 'Friend',  Moon: 'Enemy',   Mars: 'Neutral', Merc: '---', Jupt: 'Neutral', Venu: 'Friend',  Satn: 'Neutral' },
  Jupt: { Sun: 'Friend',  Moon: 'Friend',  Mars: 'Friend',  Merc: 'Enemy',   Jupt: '---', Venu: 'Enemy',   Satn: 'Neutral' },
  Venu: { Sun: 'Enemy',   Moon: 'Enemy',   Mars: 'Neutral', Merc: 'Friend',  Jupt: 'Neutral', Venu: '---', Satn: 'Friend' },
  Satn: { Sun: 'Enemy',   Moon: 'Enemy',   Mars: 'Enemy',   Merc: 'Friend',  Jupt: 'Neutral', Venu: 'Friend',  Satn: '---' }
};

/**
 * Get planet's 1-indexed sign number (1=Aries .. 12=Pisces)
 */
function getSignNumber(planet) {
  if (!planet) return 1;
  if (planet.signId !== undefined && planet.signId >= 1 && planet.signId <= 12) return planet.signId;
  if (planet.signIndex !== undefined && planet.signIndex >= 0 && planet.signIndex < 12) return planet.signIndex + 1;
  const lon = planet.absLongitude !== undefined ? planet.absLongitude : (planet.longitude !== undefined ? planet.longitude : 0);
  return Math.floor((((lon % 360) + 360) % 360) / 30) + 1;
}

/**
 * Calculate Temporal Friendship (Tatkalika Maitri)
 * Rule: Planets in 2nd, 3rd, 4th, 10th, 11th, 12th houses from a planet are its Temporal Friends.
 * Planets in 1st (same sign), 5th, 6th, 7th, 8th, 9th houses from it are Temporal Enemies.
 */
export function calculateTemporalFriendship(planets) {
  const signMap = {};
  for (const k of CLASSICAL_PLANETS) {
    const p = planets.find(x => x.key === k || (x.name && x.name.toLowerCase().startsWith(k.toLowerCase().slice(0, 3))));
    signMap[k] = p ? getSignNumber(p) : 1;
  }

  const result = {};
  for (const p1 of CLASSICAL_PLANETS) {
    result[p1] = {};
    for (const p2 of CLASSICAL_PLANETS) {
      if (p1 === p2) {
        result[p1][p2] = '---';
        continue;
      }
      const s1 = signMap[p1];
      const s2 = signMap[p2];
      const houseDiff = ((s2 - s1 + 12) % 12) + 1;
      const isFriend = [2, 3, 4, 10, 11, 12].includes(houseDiff);
      result[p1][p2] = isFriend ? 'Friend' : 'Enemy';
    }
  }
  return result;
}

/**
 * Calculate Five-Fold Compound Friendship (Panchadha Maitri)
 * Combination:
 * - Friend + Friend   => Intimate (Adhi Mitra)
 * - Friend + Neutral  => Friend (Mitra)
 * - Neutral + Friend  => Friend (Mitra)
 * - Neutral + Neutral => Neutral (Sama)
 * - Friend + Enemy    => Neutral (Sama)
 * - Enemy + Friend    => Neutral (Sama)
 * - Neutral + Enemy   => Enemy (Shatru)
 * - Enemy + Neutral   => Enemy (Shatru)
 * - Enemy + Enemy     => Bitter (Adhi Shatru)
 */
export function calculateFiveFoldFriendship(planets) {
  const temporal = calculateTemporalFriendship(planets);
  const result = {};

  for (const p1 of CLASSICAL_PLANETS) {
    result[p1] = {};
    for (const p2 of CLASSICAL_PLANETS) {
      if (p1 === p2) {
        result[p1][p2] = '---';
        continue;
      }
      const nat = PERMANENT_FRIENDSHIPS[p1][p2];
      const temp = temporal[p1][p2];

      if (nat === 'Friend' && temp === 'Friend') {
        result[p1][p2] = 'Intimat';
      } else if (nat === 'Enemy' && temp === 'Enemy') {
        result[p1][p2] = 'Bitter';
      } else if ((nat === 'Friend' && temp === 'Enemy') || (nat === 'Enemy' && temp === 'Friend') || (nat === 'Neutral' && temp === 'Neutral')) {
        result[p1][p2] = 'Neutral';
      } else if ((nat === 'Neutral' && temp === 'Friend') || (nat === 'Friend' && temp === 'Neutral')) {
        result[p1][p2] = 'Friend';
      } else if ((nat === 'Neutral' && temp === 'Enemy') || (nat === 'Enemy' && temp === 'Neutral')) {
        result[p1][p2] = 'Enemy';
      } else {
        result[p1][p2] = 'Neutral';
      }
    }
  }
  return result;
}

/**
 * Returns complete Maitri Chakra dataset containing all 3 friendship tables
 */
export function calculateAllFriendshipTables(planets) {
  return {
    permanent: PERMANENT_FRIENDSHIPS,
    temporal: calculateTemporalFriendship(planets),
    fiveFold: calculateFiveFoldFriendship(planets)
  };
}
