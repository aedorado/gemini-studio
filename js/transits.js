// Transit (Gochar) Analysis & Astrological Synthesizer
// Enhanced with classical Bhava Siddhi Kala (Event Timing Formula) and Bhava Haani
// Provenance: APA (Advanced Predictive Astrology) Hindi Notes, pp. 172–175

/**
 * Classical Auspicious Transit Houses from Natal Moon (Janma Rashi Gochara)
 * Reference: Phaladeepika Ch. 26, Brihat Parasara Hora Shastra, Brihat Samhita Ch. 104
 * - Saturn & Mars: Favorable ONLY in 3, 6, 11 (Upachayas)
 * - Venus: Favorable in 9 houses (1, 2, 3, 4, 5, 8, 9, 11, 12; unfavorable only in 6, 7, 10)
 * - Jupiter: Favorable in 2, 5, 7, 9, 11 (Guru Bala)
 * - Sun: Favorable in 3, 6, 10, 11
 * - Mercury: Favorable in 2, 4, 6, 8, 10, 11
 * - Moon: Favorable in 1, 3, 6, 7, 10, 11
 * - Rahu / Ketu: Favorable in 3, 6, 11
 */
export const AUSPICIOUS_GOCHAR_HOUSES = {
  Sun:     { houses: [3, 6, 10, 11], rule: 'Favorable in 3, 6, 10, 11 from Moon' },
  Moon:    { houses: [1, 3, 6, 7, 10, 11], rule: 'Favorable in 1, 3, 6, 7, 10, 11 from Moon' },
  Mars:    { houses: [3, 6, 11], rule: 'Favorable ONLY in 3, 6, 11 from Moon (Upachayas)' },
  Merc:    { houses: [2, 4, 6, 8, 10, 11], rule: 'Favorable in 2, 4, 6, 8, 10, 11 from Moon' },
  Mercury: { houses: [2, 4, 6, 8, 10, 11], rule: 'Favorable in 2, 4, 6, 8, 10, 11 from Moon' },
  Jupt:    { houses: [2, 5, 7, 9, 11], rule: 'Favorable in 2, 5, 7, 9, 11 from Moon (Guru Bala)' },
  Jupiter: { houses: [2, 5, 7, 9, 11], rule: 'Favorable in 2, 5, 7, 9, 11 from Moon (Guru Bala)' },
  Venu:    { houses: [1, 2, 3, 4, 5, 8, 9, 11, 12], rule: 'Favorable in 9 houses (all except 6, 7, 10) from Moon' },
  Venus:   { houses: [1, 2, 3, 4, 5, 8, 9, 11, 12], rule: 'Favorable in 9 houses (all except 6, 7, 10) from Moon' },
  Satn:    { houses: [3, 6, 11], rule: 'Favorable ONLY in 3, 6, 11 from Moon (Upachayas)' },
  Saturn:  { houses: [3, 6, 11], rule: 'Favorable ONLY in 3, 6, 11 from Moon (Upachayas)' },
  Rahu:    { houses: [3, 6, 11], rule: 'Favorable in 3, 6, 11 from Moon (Upachayas)' },
  Ketu:    { houses: [3, 6, 11], rule: 'Favorable in 3, 6, 11 from Moon (Upachayas)' }
};

export const SIGN_LORDS = [
  'Mars',    // 1: Aries
  'Venus',   // 2: Taurus
  'Mercury', // 3: Gemini
  'Moon',    // 4: Cancer
  'Sun',     // 5: Leo
  'Mercury', // 6: Virgo
  'Venus',   // 7: Libra
  'Mars',    // 8: Scorpio
  'Jupiter', // 9: Sagittarius
  'Saturn',  // 10: Capricorn
  'Saturn',  // 11: Aquarius
  'Jupiter'  // 12: Pisces
];

export const BHAVA_KARAKAS = {
  1: { name: 'Tanu Bhava (Self / Vitality)', primary: 'Sun', all: ['Sun'] },
  2: { name: 'Dhana Bhava (Wealth / Speech)', primary: 'Jupiter', all: ['Jupiter', 'Mercury'] },
  3: { name: 'Sahaja Bhava (Courage / Siblings)', primary: 'Mars', all: ['Mars'] },
  4: { name: 'Sukha Bhava (Mother / Real Estate / Vehicles)', primary: 'Moon', all: ['Moon', 'Venus'] },
  5: { name: 'Putra Bhava (Children / Intellect / Purva Punya)', primary: 'Jupiter', all: ['Jupiter'] },
  6: { name: 'Ripu / Roga Bhava (Health / Debt / Service)', primary: 'Mars', all: ['Mars', 'Saturn'] },
  7: { name: 'Kalatra Bhava (Marriage / Partnerships)', primary: 'Venus', all: ['Venus', 'Jupiter'] },
  8: { name: 'Randhra Bhava (Longevity / Transformation)', primary: 'Saturn', all: ['Saturn'] },
  9: { name: 'Bhagya Bhava (Fortune / Higher Wisdom / Father)', primary: 'Jupiter', all: ['Jupiter', 'Sun'] },
  10: { name: 'Karma Bhava (Profession / Status / Authority)', primary: 'Sun', all: ['Sun', 'Mercury', 'Jupiter', 'Saturn'] },
  11: { name: 'Labha Bhava (Gains / Aspirations)', primary: 'Jupiter', all: ['Jupiter'] },
  12: { name: 'Vyaya Bhava (Expenditure / Foreign / Moksha)', primary: 'Saturn', all: ['Saturn', 'Ketu'] }
};

function findPlanet(planets, nameOrKey) {
  if (!planets || !nameOrKey) return null;
  const target = nameOrKey.toLowerCase();
  return planets.find(p => {
    const k = (p.key || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    if (target === 'mercury' || target === 'merc') return k === 'merc' || n === 'mercury';
    if (target === 'jupiter' || target === 'jupt') return k === 'jupt' || n === 'jupiter';
    if (target === 'venus' || target === 'venu') return k === 'venu' || n === 'venus';
    if (target === 'saturn' || target === 'satn') return k === 'satn' || n === 'saturn';
    if (target === 'sun') return k === 'sun' || n === 'sun';
    if (target === 'moon') return k === 'moon' || n === 'moon';
    if (target === 'mars') return k === 'mars' || n === 'mars';
    if (target === 'rahu') return k === 'rahu' || n === 'rahu';
    if (target === 'ketu') return k === 'ketu' || n === 'ketu';
    if (target === 'asc' || target === 'lagna') return k === 'asc' || n === 'ascendant' || n === 'lagna';
    return k === target || n === target;
  });
}

function areSignsInTrikona(signA, signB) {
  if (!signA || !signB) return false;
  const diff = ((signA - signB + 12) % 12);
  return diff === 0 || diff === 4 || diff === 8;
}

function doesPlanetAspectSign(planet, targetSign) {
  if (!planet || !targetSign) return false;
  const pSign = planet.signId;
  const dist = ((targetSign - pSign + 12) % 12) + 1;
  if (dist === 7) return true;
  const k = (planet.key || planet.name || '').toLowerCase();
  if (k.includes('mar') && (dist === 4 || dist === 8)) return true;
  if (k.includes('jup') && (dist === 5 || dist === 9)) return true;
  if (k.includes('sat') && (dist === 3 || dist === 10)) return true;
  return false;
}

/**
 * Classical Bhava Siddhi Kala (Event Fruition Timing) for a specific House
 * Classical Formula:
 * "संयोगेऽपि विलोकनेऽपि च तयोस्तद्भावसिद्धिं तदा ब्रूयात्कारकयोगतस्तनुपतेर्लग्नाच्च चन्द्रादपि ॥ ३ ॥"
 * Reference: APA Hindi Notes, pp. 172–174
 */
export function calculateBhavaSiddhi(natalPlanets, transitPlanets, houseNum) {
  const natalLagna = findPlanet(natalPlanets, 'ASC');
  const natalMoon = findPlanet(natalPlanets, 'Moon');
  if (!natalLagna || !natalMoon) return null;

  const lagnaSignId = natalLagna.signId;
  const lagneshaName = SIGN_LORDS[lagnaSignId - 1];
  const natalLagnesha = findPlanet(natalPlanets, lagneshaName);
  const transitLagnesha = findPlanet(transitPlanets, lagneshaName);

  const houseSignId = ((lagnaSignId - 1 + houseNum - 1) % 12) + 1;
  const bhaveshaName = SIGN_LORDS[houseSignId - 1];
  const natalBhavesha = findPlanet(natalPlanets, bhaveshaName);
  const transitBhavesha = findPlanet(transitPlanets, bhaveshaName);

  const karakaDef = BHAVA_KARAKAS[houseNum] || { name: `House ${houseNum}`, primary: 'Jupiter', all: ['Jupiter'] };
  const karakaName = karakaDef.primary;
  const transitKaraka = findPlanet(transitPlanets, karakaName);

  const triggers = [];
  let siddhiScore = 0;
  const isSameLord = lagneshaName === bhaveshaName;

  // 1. Transit Lagnesha in Trikona to natal Bhavesha
  // "भावेश जिस राशि या अंश पर हो उस राशि से त्रिकोण राशि में जब लग्नेश उसी अंश के आस-पास गोचर वश आवे।"
  if (transitLagnesha && natalBhavesha && areSignsInTrikona(transitLagnesha.signId, natalBhavesha.signId)) {
    triggers.push({
      rule: 'L1 in Trikona to Natal Bhavesha',
      sanskrit: 'तनुपतेर्भावेशत्रिकोणे गोचरः',
      detail: `Transit Lagna Lord (${lagneshaName} in ${transitLagnesha.signName}) is in Trikona (1/5/9) to natal ${bhaveshaName} (${natalBhavesha.signName}). Activates manifestation channel.`,
      points: 25
    });
    siddhiScore += 25;
  }

  // 2. Transit Bhavesha in Trikona to natal Lagnesha (when distinct from L1)
  // "लग्नेश जिस राशि में जितने अंश का हो उससे त्रिकोण राशि में जब भावेश उसी अंश के आसपास आवे।"
  if (!isSameLord && transitBhavesha && natalLagnesha && areSignsInTrikona(transitBhavesha.signId, natalLagnesha.signId)) {
    triggers.push({
      rule: 'Bhavesha in Trikona to Natal Lagnesha',
      sanskrit: 'भावेशस्य तनुपतित्रिकोणे गोचरः',
      detail: `Transit House Lord (${bhaveshaName} in ${transitBhavesha.signName}) is in Trikona (1/5/9) to natal Lagna Lord ${lagneshaName} (${natalLagnesha.signName}).`,
      points: 25
    });
    siddhiScore += 25;
  }

  // 3. Transit Lagnesha and Transit Bhavesha conjoin (Samyoga) or mutually aspect (Vilokana)
  // "जब लग्नेश और भावेश एक दूसरे को गोचर वश देखें या एक दूसरे से युत हों।"
  if (!isSameLord && transitLagnesha && transitBhavesha) {
    if (transitLagnesha.signId === transitBhavesha.signId) {
      triggers.push({
        rule: 'Samyoga (Transit L1 & Bhavesha Conjunction)',
        sanskrit: 'तयोः संयोगे गोचरे',
        detail: `Transit Lagna Lord (${lagneshaName}) and House Lord (${bhaveshaName}) are conjunct in ${transitLagnesha.signName}. Direct fruition trigger.`,
        points: 30
      });
      siddhiScore += 30;
    } else if (doesPlanetAspectSign(transitLagnesha, transitBhavesha.signId) || doesPlanetAspectSign(transitBhavesha, transitLagnesha.signId)) {
      triggers.push({
        rule: 'Vilokana (Transit L1 & Bhavesha Mutual Aspect)',
        sanskrit: 'तयोर्विलोकने गोचरे',
        detail: `Transit Lagna Lord (${lagneshaName}) and House Lord (${bhaveshaName}) are in mutual aspect. Karmic activation of house results.`,
        points: 25
      });
      siddhiScore += 25;
    }
  }

  // 4. Transit Karaka traverses natal Lagnesha or natal Moon's sign
  // "भाव के कारक गोचरवश उस स्थान पर आवे जहां जन्म कुंडली में लग्नेश या चन्द्र राशि का स्वामी हो।"
  if (transitKaraka && (transitKaraka.signId === natalLagnesha.signId || transitKaraka.signId === natalMoon.signId)) {
    const loc = transitKaraka.signId === natalLagnesha.signId ? `natal Lagnesha (${lagneshaName})` : `natal Moon`;
    triggers.push({
      rule: 'Karaka over Natal Lagnesha / Moon',
      sanskrit: 'कारकयोगतस्तनुपतेश्चन्द्रादपि',
      detail: `Transit Sthira Karaka (${karakaName} in ${transitKaraka.signName}) is traversing the natal sign of ${loc}. Infuses natural house significations with vitality.`,
      points: 20
    });
    siddhiScore += 20;
  }

  // 5. Transit Lagnesha transiting through House sign itself
  // "जब लग्नेश गोचर वश उस राशि में आवे जिस भाव का विचार करना हो।"
  if (transitLagnesha && transitLagnesha.signId === houseSignId) {
    triggers.push({
      rule: 'L1 Transiting Target House',
      sanskrit: 'तनुपतेर्भावराशौ गोचरः',
      detail: `Transit Lagna Lord (${lagneshaName}) is directly transiting through House ${houseNum} (${transitLagnesha.signName}). Direct personal focus and activity.`,
      points: 25
    });
    siddhiScore += 25;
  }

  // 6. Bhava Haani (Loss / Obstruction) Check (APA Notes, p. 174)
  // "संबंधित भाव से अष्टम और द्वादश स्थान का स्वामी जिस राशि में स्थित हो उस राशि के त्रिकोण में जब शनि आए तो उस भाव संबंधी फलों की हानि बतानी चाहिए।"
  const transitSaturn = findPlanet(transitPlanets, 'Saturn');
  let haaniRisk = false;
  let haaniDetail = '';

  const h8FromHouseNum = ((houseNum - 1 + 7) % 12) + 1;
  const h12FromHouseNum = ((houseNum - 1 + 11) % 12) + 1;
  const h8FromHouseSignId = ((lagnaSignId - 1 + h8FromHouseNum - 1) % 12) + 1;
  const h12FromHouseSignId = ((lagnaSignId - 1 + h12FromHouseNum - 1) % 12) + 1;
  const lord8FromHouseName = SIGN_LORDS[h8FromHouseSignId - 1];
  const lord12FromHouseName = SIGN_LORDS[h12FromHouseSignId - 1];

  const natalLord8FromHouse = findPlanet(natalPlanets, lord8FromHouseName);
  const natalLord12FromHouse = findPlanet(natalPlanets, lord12FromHouseName);

  if (transitSaturn) {
    const satTrig8 = natalLord8FromHouse && areSignsInTrikona(transitSaturn.signId, natalLord8FromHouse.signId);
    const satTrig12 = natalLord12FromHouse && areSignsInTrikona(transitSaturn.signId, natalLord12FromHouse.signId);

    if (satTrig8 || satTrig12) {
      haaniRisk = true;
      const afflictedLords = [
        satTrig8 ? `8th lord from H${houseNum} (${lord8FromHouseName})` : '',
        satTrig12 ? `12th lord from H${houseNum} (${lord12FromHouseName})` : ''
      ].filter(Boolean).join(' and ');
      haaniDetail = `Saturnine Obstruction (Bhava Haani): Transit Saturn in ${transitSaturn.signName} is in Trikona to natal ${afflictedLords}. Classical indicator of delays, testing, or resistance for House ${houseNum} matters.`;
      siddhiScore = Math.max(0, siddhiScore - 20);
    }
  }

  siddhiScore = Math.min(100, Math.max(0, siddhiScore));

  let status = 'Dormant';
  let badgeClass = 'badge-neutral';
  if (siddhiScore >= 50) {
    status = '🌟 Active Fruition Window (Bhava Siddhi)';
    badgeClass = 'badge-exalted';
  } else if (siddhiScore >= 25) {
    status = '⚡ Moderate / Approaching Realization';
    badgeClass = 'badge-neutral';
  } else {
    status = '💤 Dormant / Background';
    badgeClass = 'badge-neutral';
  }

  return {
    houseNum,
    houseName: karakaDef.name,
    bhavesha: bhaveshaName,
    lagnesha: lagneshaName,
    karaka: karakaName,
    siddhiScore,
    status,
    badgeClass,
    triggers,
    haaniRisk,
    haaniDetail,
    classicalShloka: 'संयोगेऽपि विलोकनेऽपि च तयोस्तद्भावसिद्धिं तदा ब्रूयात्कारकयोगतस्तनुपतेर्लग्नाच्च चन्द्रादपि ॥ ३ ॥',
    source: 'APA (Advanced Predictive Astrology) Hindi Notes, pp. 172–174'
  };
}

/**
 * Calculate Bhava Siddhi for All 12 Houses
 */
export function calculateAllBhavasSiddhi(natalPlanets, transitPlanets) {
  const bhavas = [];
  for (let h = 1; h <= 12; h++) {
    const res = calculateBhavaSiddhi(natalPlanets, transitPlanets, h);
    if (res) bhavas.push(res);
  }

  const activeBhavas = bhavas.filter(b => b.siddhiScore >= 50);
  const approachingBhavas = bhavas.filter(b => b.siddhiScore >= 25 && b.siddhiScore < 50);
  const haaniBhavas = bhavas.filter(b => b.haaniRisk);

  return {
    bhavas,
    activeBhavas,
    approachingBhavas,
    haaniBhavas,
    classicalShloka: 'संयोगेऽपि विलोकनेऽपि च तयोस्तद्भावसिद्धिं तदा ब्रूयात्कारकयोगतस्तनुपतेर्लग्नाच्च चन्द्रादपि ॥ ३ ॥',
    source: 'APA (Advanced Predictive Astrology) Hindi Notes, pp. 172–174'
  };
}

export function analyzeTransits(natalPlanets, transitPlanets, ashtakavarga) {
  const natalMoon = natalPlanets.find(p => p.key === 'Moon');
  const natalLagna = natalPlanets.find(p => p.key === 'ASC');

  if (!natalMoon || !natalLagna) return null;

  const transitSummary = [];
  const alerts = [];

  const transitSaturn = transitPlanets.find(p => p.key === 'Satn' || p.key === 'Saturn');
  const transitJupiter = transitPlanets.find(p => p.key === 'Jupt' || p.key === 'Jupiter');

  // Sade Sati Detection
  if (transitSaturn) {
    const hFromMoon = ((transitSaturn.signId - natalMoon.signId + 12) % 12) + 1;
    if (hFromMoon === 12) {
      alerts.push({
        type: 'warning',
        title: '⚠️ Sade Sati - Rising Phase (1st Phase)',
        desc: `Transiting Saturn is in ${transitSaturn.signName} (12th from Natal Moon). Marks the beginning of Sade Sati; emphasis on sleep, expenditures, and subconscious introspection.`
      });
    } else if (hFromMoon === 1) {
      alerts.push({
        type: 'caution',
        title: '🔥 Sade Sati - Peak Phase (Janma Shani)',
        desc: `Transiting Saturn is conjunct Natal Moon in ${transitSaturn.signName}. Peak karmic pressure and psychological resilience testing; major life restructuring.`
      });
    } else if (hFromMoon === 2) {
      alerts.push({
        type: 'info',
        title: '🌅 Sade Sati - Setting Phase (3rd Phase)',
        desc: `Transiting Saturn is in ${transitSaturn.signName} (2nd from Natal Moon). Concluding phase; focus on finances, speech, family responsibilities, and harvesting hard-earned maturity.`
      });
    } else if (hFromMoon === 4) {
      alerts.push({
        type: 'warning',
        title: '⚡ Kantaka Shani (4th from Moon)',
        desc: `Transiting Saturn is in the 4th house from Moon. Can bring domestic changes, career shifts, or property/mother-related focus.`
      });
    } else if (hFromMoon === 8) {
      alerts.push({
        type: 'caution',
        title: '🛡️ Ashtama Shani (8th from Moon)',
        desc: `Transiting Saturn in the 8th house from Moon. Demands caution with health, unexpected transformations, and disciplined routine.`
      });
    }
  }

  // Jupiter Transit (Guru Gochar)
  if (transitJupiter) {
    const hFromMoon = ((transitJupiter.signId - natalMoon.signId + 12) % 12) + 1;
    const isBeneficTransit = [2, 5, 7, 9, 11].includes(hFromMoon);
    if (isBeneficTransit) {
      alerts.push({
        type: 'success',
        title: `✨ Auspicious Guru Gochar (${hFromMoon}th from Moon)`,
        desc: `Transiting Jupiter in ${transitJupiter.signName} brings divine grace (*Guru Bala*), auspicious opportunities, optimism, and protective expansion.`
      });
    }
  }

  // Map each transit planet to houses and SAV points
  for (let tp of transitPlanets) {
    const hFromLagna = ((tp.signId - natalLagna.signId + 12) % 12) + 1;
    const hFromMoon = ((tp.signId - natalMoon.signId + 12) % 12) + 1;
    const savPoints = ashtakavarga ? ashtakavarga.savBySign[tp.signId - 1] : 28;

    const gocharRule = AUSPICIOUS_GOCHAR_HOUSES[tp.key] || { houses: [3, 6, 11], rule: 'Favorable in 3, 6, 11 from Moon' };
    const isMoonFavorable = gocharRule.houses.includes(hFromMoon);
    const moonVerdict = isMoonFavorable ? 'Shubha (Auspicious)' : 'Ashubha (Challenging)';

    let savVerdict = 'Average';
    if (savPoints >= 30) savVerdict = 'High Support (Favorable)';
    else if (savPoints < 25) savVerdict = 'Low Support (Friction)';

    let overallVerdict = 'Average';
    let overallBadge = 'badge-neutral';
    let overallReason = '';

    if (isMoonFavorable) {
      if (savPoints >= 30) {
        overallVerdict = '🌟 Fortified & Auspicious';
        overallBadge = 'badge-exalted';
        overallReason = `House ${hFromMoon} from Moon is intrinsically auspicious + Fortified by ${savPoints} SAV bindus (baseline 28). Outstanding positive outcomes.`;
      } else if (savPoints >= 25) {
        overallVerdict = '✨ Favorable';
        overallBadge = 'badge-exalted';
        overallReason = `House ${hFromMoon} from Moon is auspicious + Balanced ${savPoints} SAV bindus. Smooth, favorable manifestation.`;
      } else {
        overallVerdict = '⚖️ Mixed (Low Bindus)';
        overallBadge = 'badge-neutral';
        overallReason = `House ${hFromMoon} from Moon is auspicious, but low SAV (${savPoints} bindus < 28) restricts full potential.`;
      }
    } else {
      if (savPoints >= 30) {
        overallVerdict = '🛡️ Protected (SAV Shield)';
        overallBadge = 'badge-neutral';
        overallReason = `House ${hFromMoon} from Moon is inauspicious, but strong SAV (${savPoints} bindus ≥ 30) acts as an astral shield (Kavach) mitigating affliction.`;
      } else if (savPoints >= 25) {
        overallVerdict = '⚡ Testing / Resistance';
        overallBadge = 'badge-debilitated';
        overallReason = `House ${hFromMoon} from Moon is inauspicious with average SAV (${savPoints} bindus). Requires patience and discipline.`;
      } else {
        overallVerdict = '⚠️ Low Support (Friction)';
        overallBadge = 'badge-debilitated';
        overallReason = `House ${hFromMoon} from Moon is inauspicious + Depleted SAV (${savPoints} bindus < 25). Heavy karmic friction and vulnerability.`;
      }
    }

    transitSummary.push({
      key: tp.key,
      name: tp.name,
      symbol: tp.symbol,
      isRetro: tp.isRetro,
      signName: tp.signName,
      dmsFormatted: tp.dmsFormatted,
      nakshatraName: tp.nakshatraName,
      pada: tp.pada,
      houseFromLagna: hFromLagna,
      houseFromMoon: hFromMoon,
      savPoints,
      savVerdict,
      isMoonFavorable,
      moonVerdict,
      moonRuleText: gocharRule.rule,
      favorableHouses: gocharRule.houses,
      overallVerdict,
      overallBadge,
      overallReason
    });
  }

  // Calculate Bhava Siddhi Kala for all 12 Bhavas
  const bhavaSiddhi = calculateAllBhavasSiddhi(natalPlanets, transitPlanets);

  // Surface active Bhava Siddhi alerts
  if (bhavaSiddhi && bhavaSiddhi.activeBhavas && bhavaSiddhi.activeBhavas.length > 0) {
    bhavaSiddhi.activeBhavas.forEach(b => {
      alerts.push({
        type: 'success',
        title: `🎯 Bhava Siddhi Window: ${b.houseName}`,
        desc: `Classical transit alignment triggered for House ${b.houseNum} (${b.triggers.map(t => t.rule).join(' + ')}). Manifestation score: ${b.siddhiScore}/100.`
      });
    });
  }

  return {
    transitSummary,
    alerts,
    bhavaSiddhi
  };
}
