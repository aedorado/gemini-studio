// Shani Sade Sati & Kantaka Shani Analyzer
// Enhanced with classical principles from APA (Advanced Predictive Astrology) Hindi Notes, pp. 175–177
// - Trikona Lordship Mitigation (Saturn/Moon ruling 1st, 5th, or 9th from Lagna)
// - Agni Tatwa vs Non-Agni Lagna Elemental Impact
// - Dual Gochar Assessment (Transit from Janma Rashi vs Transit from Lagna)

import { SIGNS } from './constants.js';

function getSignIdx(p) {
  if (!p) return 0;
  if (p.signIndex !== undefined && p.signIndex >= 0 && p.signIndex < 12) return p.signIndex;
  if (p.signId !== undefined && p.signId >= 1 && p.signId <= 12) return p.signId - 1;
  const lon = p.longitude !== undefined ? p.longitude : (p.absLongitude !== undefined ? p.absLongitude : 0);
  const norm = ((lon % 360) + 360) % 360;
  return Math.floor(norm / 30);
}

const SIGN_ELEMENTS = [
  'Fire',  // 0: Aries (Mesha)
  'Earth', // 1: Taurus (Vrishabha)
  'Air',   // 2: Gemini (Mithuna)
  'Water', // 3: Cancer (Karka)
  'Fire',  // 4: Leo (Simha)
  'Earth', // 5: Virgo (Kanya)
  'Air',   // 6: Libra (Tula)
  'Water', // 7: Scorpio (Vrishchika)
  'Fire',  // 8: Sagittarius (Dhanu)
  'Earth', // 9: Capricorn (Makara)
  'Air',   // 10: Aquarius (Kumbha)
  'Water'  // 11: Pisces (Meena)
];

/**
 * Calculate Sade Sati and Dhaiya status of Saturn relative to natal Moon and natal Lagna
 * @param {Object} natalMoon - { longitude, signIndex, signId }
 * @param {Object} transitSaturn - { longitude, signIndex, signId, isRetrograde }
 * @param {Array} saturnBav - Optional array of 12 bindus for Saturn in each sign
 * @param {Object} natalLagna - Optional { longitude, signIndex, signId }
 */
export function calculateSadeSati(natalMoon, transitSaturn, saturnBav = null, natalLagna = null) {
  const moonSign = getSignIdx(natalMoon);
  const saturnSign = getSignIdx(transitSaturn);
  const lagnaSign = natalLagna ? getSignIdx(natalLagna) : null;

  // House of transit Saturn relative to natal Moon (1-indexed)
  const relHouse = ((saturnSign - moonSign + 12) % 12) + 1;

  // House of transit Saturn relative to natal Lagna (1-indexed)
  const relHouseLagna = lagnaSign !== null ? (((saturnSign - lagnaSign + 12) % 12) + 1) : null;

  let isSadeSati = false;
  let phaseName = 'No Sade Sati';
  let phaseNum = 0;
  let severity = 'Safe';
  let description = '';
  let recommendations = '';

  const bindusInSign = (saturnBav && saturnBav[saturnSign] !== undefined) ? saturnBav[saturnSign] : null;

  const mName = SIGNS[moonSign] ? SIGNS[moonSign].name : 'Moon';
  const sName = SIGNS[saturnSign] ? SIGNS[saturnSign].name : 'Saturn';
  const lName = lagnaSign !== null && SIGNS[lagnaSign] ? SIGNS[lagnaSign].name : null;

  if (relHouse === 12) {
    isSadeSati = true;
    phaseNum = 1;
    phaseName = 'Phase 1: Rising Phase (Aadhyant Shani)';
    severity = 'Moderate to Intense';
    description = `Transit Saturn is transiting the 12th house (${sName}) from your natal Moon (${mName}). This phase activates introspection, foreign travel, sleep patterns, expenditure, and letting go of old attachments.`;
    recommendations = 'Practice meditation, maintain disciplined sleep cycles, avoid impulsive investments, donate dark sesame or iron on Saturdays.';
  } else if (relHouse === 1) {
    isSadeSati = true;
    phaseNum = 2;
    phaseName = 'Phase 2: Peak / Core Phase (Janma Shani)';
    severity = 'Most Intense (Core Transformation)';
    description = `Transit Saturn is directly conjunct your natal Moon in ${sName}! This is the central testing and maturation phase of life. Emotions, mental resilience, and health require patience and steadfast discipline.`;
    recommendations = 'Recite Hanuman Chalisa or Dasharatha Shani Stotram daily, practice satya (truthfulness), care for elders and subordinate staff.';
  } else if (relHouse === 2) {
    isSadeSati = true;
    phaseNum = 3;
    phaseName = 'Phase 3: Setting Phase (Niryana Shani)';
    severity = 'Waning / Financial Realignment';
    description = `Transit Saturn is in the 2nd house (${sName}) from your natal Moon (${mName}). This final 2.5-year phase restructures family assets, speech, financial stability, and consolidates the karmic lessons learned in earlier phases.`;
    recommendations = 'Maintain honest, gentle speech, save conservatively, support charitable feeding programs.';
  } else if (relHouse === 4) {
    phaseName = 'Ardha-Ashtama Shani (Dhaiya)';
    severity = 'Moderate Challenge';
    description = `Transit Saturn is in the 4th house (${sName}) from your natal Moon (${mName}). Known as Ardha-Ashtama Shani, this 2.5-year transit invites focus on domestic tranquility, mother\'s well-being, vehicles, and real estate security.`;
    recommendations = 'Avoid unnecessary domestic disputes, keep home clean and peaceful, offer water to Peepal tree on Saturdays.';
  } else if (relHouse === 8) {
    phaseName = 'Ashtama Shani (Major Dhaiya)';
    severity = 'High Caution';
    description = `Transit Saturn is in the 8th house (${sName}) from your natal Moon (${mName}). This 2.5-year cycle brings sudden transformations, hidden health checks, inheritance matters, and career shifts.`;
    recommendations = 'Drive safely, avoid risky speculation, recite Mahamrityunjaya Mantra, serve elderly people.';
  } else {
    description = `Transit Saturn in ${sName} is in the ${relHouse}th house from your natal Moon (${mName}). You are currently FREE from Sade Sati and major Kantaka Shani dhaiyas. Saturn supports your regular karmic growth.`;
  }

  // Classical Trikona Lordship & Elemental Evaluation (APA Hindi Notes, p. 176)
  // "त्रिकोण का स्वामी यदि शनि या चन्द्रमा हो तो भी साढ़ेसाती का प्रभाव जातक पर कम होता है।"
  let isSaturnTrikonaLord = false;
  let isMoonTrikonaLord = false;
  let trikonaRole = '';
  let lagnaElement = null;
  let isAgniLagna = false;
  let elementalCommentary = '';

  if (lagnaSign !== null) {
    lagnaElement = SIGN_ELEMENTS[lagnaSign];
    isAgniLagna = lagnaElement === 'Fire';

    // Saturn is Trikona Lord (rules 1st, 5th, or 9th house from Lagna):
    // - Taurus Lagna (1): Saturn rules 9th (Capricorn) & 10th (Aquarius) -> Yogakaraka / 9th Lord
    // - Libra Lagna (6): Saturn rules 4th (Capricorn) & 5th (Aquarius) -> Yogakaraka / 5th Lord
    // - Capricorn Lagna (9): Saturn rules 1st (Capricorn) & 2nd (Aquarius) -> Lagna Lord
    // - Aquarius Lagna (10): Saturn rules 1st (Aquarius) & 12th (Capricorn) -> Lagna Lord
    if (lagnaSign === 1) {
      isSaturnTrikonaLord = true;
      trikonaRole = 'Saturn is 9th Lord (Supreme Trikona) & Yogakaraka for Taurus Lagna';
    } else if (lagnaSign === 6) {
      isSaturnTrikonaLord = true;
      trikonaRole = 'Saturn is 5th Lord (Trikona) & Yogakaraka for Libra Lagna';
    } else if (lagnaSign === 9) {
      isSaturnTrikonaLord = true;
      trikonaRole = 'Saturn is Lagnesha (1st Lord) for Capricorn Lagna';
    } else if (lagnaSign === 10) {
      isSaturnTrikonaLord = true;
      trikonaRole = 'Saturn is Lagnesha (1st Lord) for Aquarius Lagna';
    }

    // Moon is Trikona Lord (rules 1st, 5th, or 9th house from Lagna):
    // - Cancer Lagna (3): Moon is Lagnesha (1st Lord)
    // - Scorpio Lagna (7): Moon rules 9th house (Cancer)
    // - Pisces Lagna (11): Moon rules 5th house (Cancer)
    if (lagnaSign === 3) {
      isMoonTrikonaLord = true;
      trikonaRole += (trikonaRole ? ' | ' : '') + 'Moon is Lagnesha (1st Lord) for Cancer Lagna';
    } else if (lagnaSign === 7) {
      isMoonTrikonaLord = true;
      trikonaRole += (trikonaRole ? ' | ' : '') + 'Moon is 9th Lord (Supreme Trikona) for Scorpio Lagna';
    } else if (lagnaSign === 11) {
      isMoonTrikonaLord = true;
      trikonaRole += (trikonaRole ? ' | ' : '') + 'Moon is 5th Lord (Trikona) for Pisces Lagna';
    }

    // Elemental rule (p. 176):
    // "अग्नि तत्व राशि यानि मेष, सिंह और धनु लगन पर साढ़ेसाती का प्रभाव विशेष होता है। बाकि लग्नों पर शनि की साढ़ेसाती का प्रभाव कम होता है।"
    if (isAgniLagna) {
      elementalCommentary = `Agni Tatwa Ascendant (${lName} - Fire): Experiences Sade Sati with pronounced friction, restlessness, and sudden transformations due to the elemental clash between Fire and Saturn's cold/airy nature.`;
    } else {
      elementalCommentary = `${lagnaElement} Ascendant (${lName}): More receptive to Saturn's deliberate, disciplined pace; Sade Sati operates with steady, manageable maturation.`;
    }
  }

  const hasTrikonaMitigation = isSaturnTrikonaLord || isMoonTrikonaLord;
  let trikonaNote = '';

  if (hasTrikonaMitigation && isSadeSati) {
    trikonaNote = `Classical Mitigation (APA Notes, p. 176): Because ${trikonaRole}, Saturn's malefic intensity is substantially softened. Saturn acts here as a constructive karmic mentor rather than a punitive destroyer.`;
    if (phaseNum === 2) {
      severity = 'Intense (Tempered by Trikona Lordship)';
    } else {
      severity = 'Mild / Constructive Karmic Maturation';
    }
  }

  // Dual perspective note (Moon vs Lagna Gochar)
  let dualGocharNote = '';
  if (relHouseLagna !== null) {
    dualGocharNote = `Dual Perspective: Saturn is in House ${relHouse} from Natal Moon (Mental/Emotional impact) and in House ${relHouseLagna} from Natal Lagna (Physical body & tangible worldly events).`;
  }

  // Ashtakavarga benefic filter
  let bavStatus = '';
  if (bindusInSign !== null) {
    if (bindusInSign >= 4) {
      bavStatus = `Favorable Ashtakavarga: Saturn has ${bindusInSign} bindus in ${sName} (above average ≥ 4), softening negative effects and granting endurance and steady success.`;
    } else {
      bavStatus = `Challenging Ashtakavarga: Saturn has ${bindusInSign} bindus in ${sName} (below average < 4), demanding extra spiritual discipline and patience.`;
    }
  }

  const isKantaka = relHouse === 4;
  const isAshtama = relHouse === 8;

  return {
    isSadeSati,
    isActive: isSadeSati,
    isKantaka,
    isAshtama,
    phaseNum,
    phase: phaseName,
    phaseName,
    relHouse,
    houseFromMoon: relHouse,
    houseFromLagna: relHouseLagna,
    severity,
    moonSign: mName,
    saturnSign: sName,
    lagnaSign: lName,
    lagnaElement,
    isAgniLagna,
    currentShaniSign: sName,
    saturnLongitude: transitSaturn.longitude !== undefined ? transitSaturn.longitude : transitSaturn.absLongitude,
    isRetrograde: Boolean(transitSaturn.isRetrograde || transitSaturn.isRetro),
    bindusInSign,
    bavStatus,
    description,
    recommendations,
    // Classical APA Enhancements
    hasTrikonaMitigation,
    isSaturnTrikonaLord,
    isMoonTrikonaLord,
    trikonaRole,
    trikonaNote,
    elementalCommentary,
    dualGocharNote,
    classicalSource: 'APA (Advanced Predictive Astrology) Hindi Notes, pp. 175–177'
  };
}
