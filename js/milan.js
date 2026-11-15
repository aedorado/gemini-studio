import { NAKSHATRAS, SIGNS, RASHI_LORDS } from './constants.js';

export const PLANETARY_FRIENDSHIPS = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], neutral: ['Mercury'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], neutral: ['Venus', 'Saturn'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], neutral: ['Mars', 'Jupiter', 'Saturn'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], neutral: ['Saturn'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], neutral: ['Mars', 'Jupiter'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], neutral: ['Jupiter'], enemies: ['Sun', 'Moon', 'Mars'] }
};

// Varna classifications (4 = Brahmin, 3 = Kshatriya, 2 = Vaishya, 1 = Shudra)
const SIGN_VARNA = [
  3, // 0: Aries (Kshatriya)
  2, // 1: Taurus (Vaishya)
  1, // 2: Gemini (Shudra)
  4, // 3: Cancer (Brahmin)
  3, // 4: Leo (Kshatriya)
  2, // 5: Virgo (Vaishya)
  1, // 6: Libra (Shudra)
  4, // 7: Scorpio (Brahmin)
  3, // 8: Sagittarius (Kshatriya)
  2, // 9: Capricorn (Vaishya)
  1, // 10: Aquarius (Shudra)
  4  // 11: Pisces (Brahmin)
];

const VARNA_NAMES = { 4: 'Brahmin', 3: 'Kshatriya', 2: 'Vaishya', 1: 'Shudra' };

// Vashya classifications (Chatushpada, Manava, Jalachara, Vanachara, Keeta)
function getVashya(signIndex, degInSign = 15) {
  if (signIndex === 0 || signIndex === 1) return 'Chatushpada';
  if (signIndex === 8 && degInSign >= 15) return 'Chatushpada';
  if (signIndex === 9 && degInSign < 15) return 'Chatushpada';

  if (signIndex === 2 || signIndex === 5 || signIndex === 6 || signIndex === 10) return 'Manava';
  if (signIndex === 8 && degInSign < 15) return 'Manava';

  if (signIndex === 3 || signIndex === 11) return 'Jalachara';
  if (signIndex === 9 && degInSign >= 15) return 'Jalachara';

  if (signIndex === 4) return 'Vanachara';
  if (signIndex === 7) return 'Keeta';

  return 'Manava';
}

// 14 Animal Yonis mapped to 27 Nakshatras
const NAKSHATRA_YONI = [
  'Horse',     // 0: Ashwini
  'Elephant',  // 1: Bharani
  'Sheep',     // 2: Krittika
  'Serpent',   // 3: Rohini
  'Serpent',   // 4: Mrigashira
  'Dog',       // 5: Ardra
  'Cat',       // 6: Punarvasu
  'Sheep',     // 7: Pushya
  'Cat',       // 8: Ashlesha
  'Rat',       // 9: Magha
  'Rat',       // 10: Purva Phalguni
  'Cow',       // 11: Uttara Phalguni
  'Buffalo',   // 12: Hasta
  'Tiger',     // 13: Chitra
  'Buffalo',   // 14: Swati
  'Tiger',     // 15: Vishakha
  'Deer',      // 16: Anuradha
  'Deer',      // 17: Jyeshtha
  'Dog',       // 18: Mula
  'Monkey',    // 19: Purva Ashadha
  'Mongoose',  // 20: Uttara Ashadha
  'Monkey',    // 21: Shravana
  'Lion',      // 22: Dhanishta
  'Horse',     // 23: Shatabhisha
  'Lion',      // 24: Purva Bhadrapada
  'Cow',       // 25: Uttara Bhadrapada
  'Elephant'   // 26: Revati
];

// Sworn enemies among animal yonis
const SWORN_YONI_ENEMIES = [
  ['Horse', 'Buffalo'],
  ['Elephant', 'Lion'],
  ['Sheep', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Dog', 'Deer'],
  ['Cat', 'Rat'],
  ['Cow', 'Tiger']
];

// Ganas (Deva = 1, Manushya = 2, Rakshasa = 3)
const NAKSHATRA_GANA = [
  'Deva',      // 0: Ashwini
  'Manushya',  // 1: Bharani
  'Rakshasa',  // 2: Krittika
  'Manushya',  // 3: Rohini
  'Deva',      // 4: Mrigashira
  'Manushya',  // 5: Ardra
  'Deva',      // 6: Punarvasu
  'Deva',      // 7: Pushya
  'Rakshasa',  // 8: Ashlesha
  'Rakshasa',  // 9: Magha
  'Manushya',  // 10: Purva Phalguni
  'Manushya',  // 11: Uttara Phalguni
  'Deva',      // 12: Hasta
  'Rakshasa',  // 13: Chitra
  'Deva',      // 14: Swati
  'Rakshasa',  // 15: Vishakha
  'Deva',      // 16: Anuradha
  'Rakshasa',  // 17: Jyeshtha
  'Rakshasa',  // 18: Mula
  'Manushya',  // 19: Purva Ashadha
  'Manushya',  // 20: Uttara Ashadha
  'Deva',      // 21: Shravana
  'Rakshasa',  // 22: Dhanishta
  'Rakshasa',  // 23: Shatabhisha
  'Manushya',  // 24: Purva Bhadrapada
  'Manushya',  // 25: Uttara Bhadrapada
  'Deva'       // 26: Revati
];

// Nadis (Aadi = 1, Madhya = 2, Antya = 3)
const NAKSHATRA_NADI = [
  'Aadi',    // 0: Ashwini
  'Madhya',  // 1: Bharani
  'Antya',   // 2: Krittika
  'Antya',   // 3: Rohini
  'Madhya',  // 4: Mrigashira
  'Aadi',    // 5: Ardra
  'Aadi',    // 6: Punarvasu
  'Madhya',  // 7: Pushya
  'Antya',   // 8: Ashlesha
  'Antya',   // 9: Magha
  'Madhya',  // 10: Purva Phalguni
  'Aadi',    // 11: Uttara Phalguni
  'Aadi',    // 12: Hasta
  'Madhya',  // 13: Chitra
  'Antya',   // 14: Swati
  'Antya',   // 15: Vishakha
  'Madhya',  // 16: Anuradha
  'Aadi',    // 17: Jyeshtha
  'Aadi',    // 18: Mula
  'Madhya',  // 19: Purva Ashadha
  'Antya',   // 20: Uttara Ashadha
  'Antya',   // 21: Shravana
  'Madhya',  // 22: Dhanishta
  'Aadi',    // 23: Shatabhisha
  'Aadi',    // 24: Purva Bhadrapada
  'Madhya',  // 25: Uttara Bhadrapada
  'Antya'    // 26: Revati
];

/**
 * Calculate full 36 Guna Ashtakoota compatibility between Groom and Bride
 * @param {Object} groom - { moonLon, lagnaSign, marsHouse, name }
 * @param {Object} bride - { moonLon, lagnaSign, marsHouse, name }
 */
export function calculateAshtakoota(groom, bride) {
  // 1. Groom Lunar attributes
  const gMoonLon = (groom.moonLon % 360 + 360) % 360;
  const gSign = Math.floor(gMoonLon / 30);
  const gDegInSign = gMoonLon % 30;
  const gNakIndex = Math.floor(gMoonLon / (360 / 27));
  const gPada = Math.floor((gMoonLon % (360 / 27)) / ((360 / 27) / 4)) + 1;

  // 2. Bride Lunar attributes
  const bMoonLon = (bride.moonLon % 360 + 360) % 360;
  const bSign = Math.floor(bMoonLon / 30);
  const bDegInSign = bMoonLon % 30;
  const bNakIndex = Math.floor(bMoonLon / (360 / 27));
  const bPada = Math.floor((bMoonLon % (360 / 27)) / ((360 / 27) / 4)) + 1;

  // 1. VARNA KOOTA (Max 1 pt) - Work & Spiritual Hierarchy
  const gVarna = SIGN_VARNA[gSign];
  const bVarna = SIGN_VARNA[bSign];
  let varnaPts = gVarna >= bVarna ? 1 : 0;
  const varnaDesc = gVarna >= bVarna 
    ? `Harmonious spiritual and work alignment (${VARNA_NAMES[gVarna]} & ${VARNA_NAMES[bVarna]}).` 
    : `Bride (${VARNA_NAMES[bVarna]}) has higher Varna than Groom (${VARNA_NAMES[gVarna]}).`;

  // 2. VASHYA KOOTA (Max 2 pts) - Mutual Attraction & Dominance
  const gVashya = getVashya(gSign, gDegInSign);
  const bVashya = getVashya(bSign, bDegInSign);
  let vashyaPts = 0;
  if (gVashya === bVashya) {
    vashyaPts = 2;
  } else if (
    (gVashya === 'Manava' && bVashya !== 'Keeta') ||
    (bVashya === 'Manava' && gVashya !== 'Keeta') ||
    (gVashya === 'Chatushpada' && bVashya === 'Chatushpada')
  ) {
    vashyaPts = 1;
  } else if (
    (gVashya === 'Vanachara' && (bVashya === 'Chatushpada' || bVashya === 'Jalachara')) ||
    (bVashya === 'Vanachara' && (gVashya === 'Chatushpada' || gVashya === 'Jalachara'))
  ) {
    vashyaPts = 0.5;
  }
  const vashyaDesc = `Groom: ${gVashya}, Bride: ${bVashya}.`;

  // 3. TARA KOOTA (Max 3 pts) - Health, Longevity & Destiny
  const t1 = ((gNakIndex - bNakIndex + 27) % 9) + 1;
  const t2 = ((bNakIndex - gNakIndex + 27) % 9) + 1;
  const isBadTara = t => [3, 5, 7].includes(t);
  let taraPts = 0;
  if (!isBadTara(t1) && !isBadTara(t2)) taraPts = 3;
  else if (!isBadTara(t1) || !isBadTara(t2)) taraPts = 1.5;
  const taraDesc = `Dina count: ${t1}/9 & ${t2}/9. ${taraPts === 3 ? 'Auspicious longevity harmony.' : taraPts === 1.5 ? 'Moderate Tara compatibility.' : 'Inauspicious Tara combinations.'}`;

  // 4. YONI KOOTA (Max 4 pts) - Physical Compatibility & Sexual Harmony
  const gYoni = NAKSHATRA_YONI[gNakIndex];
  const bYoni = NAKSHATRA_YONI[bNakIndex];
  let yoniPts = 2; // default neutral
  const isSwornEnemy = SWORN_YONI_ENEMIES.some(
    pair => (pair[0] === gYoni && pair[1] === bYoni) || (pair[1] === gYoni && pair[0] === bYoni)
  );
  if (gYoni === bYoni) {
    yoniPts = 4;
  } else if (isSwornEnemy) {
    yoniPts = 0;
  } else {
    yoniPts = 2; // friendly/neutral default in standard tables
  }
  const yoniDesc = `Groom: ${gYoni}, Bride: ${bYoni}. ${isSwornEnemy ? 'Hostile animal yoni pairing (0/4).' : gYoni === bYoni ? 'Identical animal yoni (4/4, maximum intimacy).' : 'Compatible neutral pairing (2/4).'}`;

  // 5. GRAHA MAITRI (Max 5 pts) - Psychological Harmony & Friendship
  const gLord = RASHI_LORDS[gSign];
  const bLord = RASHI_LORDS[bSign];
  let maitriPts = 3;
  if (gLord === bLord) {
    maitriPts = 5;
  } else {
    const gRels = PLANETARY_FRIENDSHIPS[gLord] || { friends: [], neutral: [], enemies: [] };
    const bRels = PLANETARY_FRIENDSHIPS[bLord] || { friends: [], neutral: [], enemies: [] };
    const gToB = gRels.friends.includes(bLord) ? 'friend' : (gRels.enemies.includes(bLord) ? 'enemy' : 'neutral');
    const bToG = bRels.friends.includes(gLord) ? 'friend' : (bRels.enemies.includes(gLord) ? 'enemy' : 'neutral');

    if (gToB === 'friend' && bToG === 'friend') maitriPts = 5;
    else if ((gToB === 'friend' && bToG === 'neutral') || (gToB === 'neutral' && bToG === 'friend')) maitriPts = 4;
    else if (gToB === 'neutral' && bToG === 'neutral') maitriPts = 3;
    else if ((gToB === 'friend' && bToG === 'enemy') || (gToB === 'enemy' && bToG === 'friend')) maitriPts = 1;
    else maitriPts = 0;
  }
  const maitriDesc = `Moon Lords: ${gLord} & ${bLord}.`;

  // 6. GANA KOOTA (Max 6 pts) - Temperament & Mutual Tolerance
  const gGana = NAKSHATRA_GANA[gNakIndex];
  const bGana = NAKSHATRA_GANA[bNakIndex];
  let ganaPts = 0;
  if (gGana === bGana) ganaPts = 6;
  else if (gGana === 'Deva' && bGana === 'Manushya') ganaPts = 6;
  else if (gGana === 'Manushya' && bGana === 'Deva') ganaPts = 5;
  else if (gGana === 'Rakshasa' && bGana === 'Deva') ganaPts = 1;
  else if (gGana === 'Deva' && bGana === 'Rakshasa') ganaPts = 0;
  else if (gGana === 'Manushya' && bGana === 'Rakshasa') ganaPts = 0;
  else if (gGana === 'Rakshasa' && bGana === 'Manushya') ganaPts = 0;
  const ganaDesc = `Groom: ${gGana}, Bride: ${bGana}.`;

  // 7. BHAKOOT KOOTA (Max 7 pts) - Emotional Bond & Family Welfare
  const diffSign = ((bSign - gSign + 12) % 12) + 1;
  let bhakootPts = 7;
  let bhakootDosha = false;
  let bhakootCancelled = false;

  // Inauspicious combinations: 2/12, 6/8, 9/5
  if (diffSign === 2 || diffSign === 12 || diffSign === 6 || diffSign === 8 || diffSign === 5 || diffSign === 9) {
    bhakootDosha = true;
    // Cancellation: If same sign lord (e.g. Aries-Scorpio, Taurus-Libra) or mutual friends
    if (gLord === bLord) {
      bhakootCancelled = true;
      bhakootPts = 7;
    } else {
      bhakootPts = 0;
    }
  }
  const bhakootDesc = bhakootDosha 
    ? (bhakootCancelled ? `Bhakoot Dosha cancelled due to shared planetary lordship (${gLord}).` : `Bhakoot Dosha present (${diffSign}/12 relative placement).`)
    : `Auspicious Bhakoot (${diffSign}/12 placement).`;

  // 8. NADI KOOTA (Max 8 pts) - Genetic Health & Progeny
  const gNadi = NAKSHATRA_NADI[gNakIndex];
  const bNadi = NAKSHATRA_NADI[bNakIndex];
  let nadiPts = 8;
  let nadiDosha = false;
  let nadiCancelled = false;

  if (gNadi === bNadi) {
    nadiDosha = true;
    // Classical Parihara: same nakshatra with different padas, or same sign with different nakshatras
    if (gNakIndex === bNakIndex && gPada !== bPada) {
      nadiCancelled = true;
      nadiPts = 8;
    } else if (gSign === bSign && gNakIndex !== bNakIndex) {
      nadiCancelled = true;
      nadiPts = 8;
    } else {
      nadiPts = 0;
    }
  }
  const nadiDesc = nadiDosha
    ? (nadiCancelled ? `Nadi Dosha cancelled (same sign/different nakshatra or different padas).` : `Nadi Dosha present (${gNadi} Nadi on both sides). 0/8 pts.`)
    : `Different Nadis (${gNadi} & ${bNadi}). Full 8/8 pts.`;

  // Total Score
  const totalGunas = varnaPts + vashyaPts + taraPts + yoniPts + maitriPts + ganaPts + bhakootPts + nadiPts;

  // Verdict
  let verdict = 'Ashubha (Inauspicious / Not Recommended)';
  let verdictClass = 'verdict-bad';
  if (totalGunas >= 28) {
    verdict = 'Utkrishta (Excellent Match)';
    verdictClass = 'verdict-excellent';
  } else if (totalGunas >= 18) {
    verdict = 'Madhyama (Acceptable / Good Match)';
    verdictClass = 'verdict-good';
  }

  return {
    groom: { name: groom.name || 'Groom', sign: SIGNS[gSign].name, nakshatra: NAKSHATRAS[gNakIndex].name, pada: gPada, nadi: gNadi, gana: gGana, yoni: gYoni },
    bride: { name: bride.name || 'Bride', sign: SIGNS[bSign].name, nakshatra: NAKSHATRAS[bNakIndex].name, pada: bPada, nadi: bNadi, gana: bGana, yoni: bYoni },
    totalGunas,
    maxGunas: 36,
    percentage: Math.round((totalGunas / 36) * 100),
    verdict,
    verdictClass,
    kootas: [
      { name: 'Varna', obtained: varnaPts, max: 1, desc: varnaDesc },
      { name: 'Vashya', obtained: vashyaPts, max: 2, desc: vashyaDesc },
      { name: 'Tara', obtained: taraPts, max: 3, desc: taraDesc },
      { name: 'Yoni', obtained: yoniPts, max: 4, desc: yoniDesc },
      { name: 'Graha Maitri', obtained: maitriPts, max: 5, desc: maitriDesc },
      { name: 'Gana', obtained: ganaPts, max: 6, desc: ganaDesc },
      { name: 'Bhakoot', obtained: bhakootPts, max: 7, desc: bhakootDesc },
      { name: 'Nadi', obtained: nadiPts, max: 8, desc: nadiDesc }
    ]
  };
}

/**
 * Check Mangal Dosha (Kuja Dosha) for a person
 * Mars in houses 1, 4, 7, 8, 12 from Lagna or Moon
 */
export function checkMangalDosha(marsSignIndex, lagnaSignIndex, moonSignIndex) {
  const houseFromLagna = ((marsSignIndex - lagnaSignIndex + 12) % 12) + 1;
  const houseFromMoon = ((marsSignIndex - moonSignIndex + 12) % 12) + 1;

  const manglikHouses = [1, 4, 7, 8, 12];
  const isFromLagna = manglikHouses.includes(houseFromLagna);
  const isFromMoon = manglikHouses.includes(houseFromMoon);

  const hasDosha = isFromLagna || isFromMoon;

  // Check classical cancellations
  let isCancelled = false;
  let cancelReason = '';

  if (hasDosha) {
    if (marsSignIndex === 0 && houseFromLagna === 1) { // Mars in Aries in 1st
      isCancelled = true;
      cancelReason = 'Mars in own sign Aries in Lagna';
    } else if (marsSignIndex === 3 && houseFromLagna === 4) { // Mars in Cancer in 4th
      isCancelled = true;
      cancelReason = 'Mars in Cancer in 4th house';
    } else if (marsSignIndex === 4 && houseFromLagna === 8) { // Mars in Leo in 8th
      isCancelled = true;
      cancelReason = 'Mars in friendly Leo in 8th house';
    } else if (marsSignIndex === 8 && houseFromLagna === 12) { // Mars in Sgr in 12th
      isCancelled = true;
      cancelReason = 'Mars in Jupiterian Sagittarius in 12th';
    } else if (marsSignIndex === 9 && houseFromLagna === 7) { // Mars in exalted Capricorn in 7th
      isCancelled = true;
      cancelReason = 'Mars exalted in Capricorn in 7th house';
    }
  }

  return {
    hasDosha,
    isCancelled,
    cancelReason,
    houseFromLagna,
    houseFromMoon,
    intensity: isCancelled ? 'Cancelled' : (isFromLagna && isFromMoon ? 'High Manglik' : (hasDosha ? 'Anshik (Low) Manglik' : 'No Manglik'))
  };
}
