import { VIMSHOTTARI_LORDS } from './constants.js';

const ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Classical House Lord Dasha Results (From M.S. Mehta Ch. XV, pp. 323-325, Phala Deepika & Parasara)
export const HOUSE_LORD_DASHA_RESULTS = {
  1: {
    house: '1st House (Lagna)',
    strong: 'Eminence in society, robust health, sturdy constitution, increasing prosperity, leadership and all-round success.',
    weak: 'Health decline, mental anguish, fear of loss of position, confinement or isolation, and domestic misfortunes.'
  },
  2: {
    house: '2nd House (Dhana/Kutumba)',
    strong: 'Acquisition of wealth, family harmony, eloquent and persuasive speech, social appreciation, and fine food.',
    weak: 'Loss of wealth, harsh speech, eye ailments, displeasure of superiors, and vulnerability as Maraka (killer) period.'
  },
  3: {
    house: '3rd House (Sahaja/Bhratri)',
    strong: 'Courage, valour, honours, popularity, enterprise, and strong cooperation and prosperity through siblings.',
    weak: 'Loss or disputes with brothers/sisters, harassment by hidden enemies, humiliation, and loss of pride.'
  },
  4: {
    house: '4th House (Sukha/Matri)',
    strong: 'Acquisition of property, vehicles and conveyances, marital harmony, agricultural gains, and elevated social status.',
    weak: 'Instability in residence, distress to mother and maternal relations, danger from water, and loss of land.'
  },
  5: {
    house: '5th House (Putra/Buddhi)',
    strong: 'Birth of worthy progeny, sharp intellect, ministerial status, literary honours, and celebration of virtuous deeds.',
    weak: 'Distress or separation from children, aimless wandering, digestive or stomach disorders, and deception.'
  },
  6: {
    house: '6th House (Ripu/Roga)',
    strong: 'Decisive victory over opponents, freedom from disease, administrative power, wealth, splendour, and generosity.',
    weak: 'Debts, chronic litigation, theft, bodily injuries, humiliation, servitude, and recurring ailments.'
  },
  7: {
    house: '7th House (Kalatra/Jaya)',
    strong: 'Marital bliss, luxury apparel, ornaments, enjoyable foreign travel, physical vitality, and profitable partnerships.',
    weak: 'Marital discord, scandals, separation, urinary or generative complaints, and distress through questionable company.'
  },
  8: {
    house: '8th House (Ayur/Randhra)',
    strong: 'Surprise career advancement, total clearance of chronic debts, end of disputes, legacy gains, and occult mastery.',
    weak: 'Acute sorrow, loss of mental composure, fits, intense anxiety, poverty, and severe longevity crises.'
  },
  9: {
    house: '9th House (Bhagya/Dharma)',
    strong: 'Government/royal recognition, profound spiritual merit, pilgrimages, flourishing wealth, and joy through children.',
    weak: 'Distress to father or elder brother, decline in fortune, domestic poverty, and obstacles in higher knowledge.'
  },
  10: {
    house: '10th House (Karma)',
    strong: 'Peak fame, reputation, professional authority, elevation to top rank, and highly meritorious deeds.',
    weak: 'Failure in enterprises, career demotion, loss of honour, exile/living in foreign land, and public distress.'
  },
  11: {
    house: '11th House (Labha)',
    strong: 'Rapid surge in wealth, domestic prosperity, fulfillment of major ambitions, and profitable alliances.',
    weak: 'Ear disorders, illness to elder siblings, sickly children, financial deception, and unfulfilled desires.'
  },
  12: {
    house: '12th House (Vyaya/Moksha)',
    strong: 'Spiritual liberation, generous charitable deeds, foreign honors, pilgrimages, and triumph in distant lands.',
    weak: 'Heavy debts, wasteful litigation, confinement, sleep disorders, involuntary servitude, and dishonor.'
  }
};

/**
 * Calculate Vimshottari Dasha with Advanced Classical Metrics:
 * - 120-Year Mahadasha / Antardasha / Pratyantardasha timeline
 * - Dasha Chidra analysis (penultimate & final AD transition vulnerability per Mehta Ch. XV)
 * - MD-AD Mutual Sambandha (6/8 Shadashtaka, 2/12 Dvidwadasa, 1/7 Saptama, Kendra/Trikona)
 * - Classical 4th Saturn / 6th Jupiter / 9th Rahu-Mars danger rule
 *
 * @param {Object} moonPlanet - parsed Moon object with nakshatraLord, nakshatraName, fractionInNakshatra
 * @param {string|null} birthDateStr - YYYY-MM-DD
 * @param {Array} planets - optional array of all parsed chart planets for relationship & lordship checks
 * @param {Array} houses - optional array of chart houses
 * @param {Date|null} refDate - reference date to check currently running dasha (default: now)
 */
export function calculateVimshottariDasha(moonPlanet, birthDateStr = null, planets = [], houses = [], refDate = new Date()) {
  if (!moonPlanet) return null;

  const nakLord = moonPlanet.nakshatraLord;
  const startLordIdx = ORDER.indexOf(nakLord);
  if (startLordIdx === -1) return null;

  const fractionElapsed = moonPlanet.fractionInNakshatra != null ? moonPlanet.fractionInNakshatra : 0;
  const fractionRemaining = Math.max(0, Math.min(1, 1 - fractionElapsed));

  const startLordMeta = VIMSHOTTARI_LORDS.find(l => l.lord === nakLord);
  const firstMdTotalYears = startLordMeta.years;
  const firstMdBalanceYears = firstMdTotalYears * fractionRemaining;

  // Format balance at birth into Years, Months, Days
  const balanceYears = Math.floor(firstMdBalanceYears);
  const balanceMonthsFloat = (firstMdBalanceYears - balanceYears) * 12;
  const balanceMonths = Math.floor(balanceMonthsFloat);
  const balanceDays = Math.round((balanceMonthsFloat - balanceMonths) * 30.4375);

  const balanceText = `${balanceYears}y ${balanceMonths}m ${balanceDays}d of ${nakLord} Mahadasha remaining at birth`;

  // Establish base birth date
  let baseDate = birthDateStr ? new Date(birthDateStr) : new Date(2000, 0, 1);
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date(2000, 0, 1);
  }

  // Generate 120-year Mahadasha sequence
  const mahadashas = [];
  let currentDateMs = baseDate.getTime();

  for (let i = 0; i < 9; i++) {
    const lordIdx = (startLordIdx + i) % 9;
    const lordName = ORDER[lordIdx];
    const lordMeta = VIMSHOTTARI_LORDS.find(l => l.lord === lordName);
    const mdDurationYears = (i === 0) ? firstMdBalanceYears : lordMeta.years;

    const startDate = new Date(currentDateMs);
    const durationMs = mdDurationYears * 365.25 * 24 * 60 * 60 * 1000;
    const endDate = new Date(currentDateMs + durationMs);
    currentDateMs = endDate.getTime();

    // Check Classical Mehta Rule:
    // 4th MD Saturn, 6th MD Jupiter, 9th MD Rahu/Mars carry innate vulnerability
    let specialWarning = null;
    const mdOrderFromBirth = i + 1; // 1 to 9
    if (mdOrderFromBirth === 4 && lordName === 'Saturn') {
      specialWarning = '4th Mahadasha of Saturn from birth: Classical adverse period according to Parasara & Mehta (unfavourable results regardless of lordship).';
    } else if (mdOrderFromBirth === 6 && lordName === 'Jupiter') {
      specialWarning = '6th Mahadasha of Jupiter from birth: Classical critical period according to Parasara & Mehta.';
    } else if (mdOrderFromBirth === 9 && (lordName === 'Rahu' || lordName === 'Mars')) {
      specialWarning = `9th Mahadasha of ${lordName} from birth: Classical hazardous period according to Parasara & Mehta.`;
    }

    // Generate 9 Antardashas for this Mahadasha
    // Classical Jyotish principle: For the birth Mahadasha (i === 0), the 9 Antardashas
    // run across the full theoretical cycle (birthDate - elapsed to birthDate + balance).
    // Antardashas before birth are pre-natal; the native is born into the active Antardasha.
    const antardashas = [];
    const firstMdElapsedYears = firstMdTotalYears * fractionElapsed;
    const theoreticalStartMs = baseDate.getTime() - (firstMdElapsedYears * 365.25 * 24 * 60 * 60 * 1000);
    let adCurrentMs = (i === 0) ? theoreticalStartMs : startDate.getTime();

    for (let j = 0; j < 9; j++) {
      const adLordIdx = (lordIdx + j) % 9;
      const adLordName = ORDER[adLordIdx];
      const adLordMeta = VIMSHOTTARI_LORDS.find(l => l.lord === adLordName);
      
      const fullAdYears = (lordMeta.years * adLordMeta.years) / 120;
      const adDurationMs = fullAdYears * 365.25 * 24 * 60 * 60 * 1000;

      const adStart = new Date(adCurrentMs);
      const adEnd = new Date(adCurrentMs + adDurationMs);
      adCurrentMs = adEnd.getTime();

      const isPreNatal = (i === 0) && (adEnd.getTime() <= baseDate.getTime());
      const isBirthDasha = (i === 0) && (adStart.getTime() <= baseDate.getTime() && adEnd.getTime() > baseDate.getTime());

      // Dasha Chidra Check (Ch. XV p. 318, 335):
      // Penultimate AD (j === 7, 8th AD) & Ultimate AD (j === 8, 9th AD)
      let chidraStatus = null;
      if (j === 8) {
        chidraStatus = {
          isChidra: true,
          phase: 'Terminal Dasha Chidra (Ultimate AD)',
          description: `Final Antardasha of ${lordName} Mahadasha. Major transformational cusp; old structures dissolve to prepare for ${ORDER[(lordIdx + 1) % 9]} Mahadasha.`
        };
      } else if (j === 7) {
        chidraStatus = {
          isChidra: true,
          phase: 'Incipient Dasha Chidra (Penultimate AD)',
          description: `Penultimate Antardasha of ${lordName} Mahadasha. Mehta observes major life upheavals, career shifts, and relocations often initiate here.`
        };
      }

      // Relationship Sambandha between MD Lord and AD Lord
      const sambandha = evaluatePlanetSambandha(lordName, adLordName, planets);

      // Generate 9 Pratyantardashas
      const pratyantars = [];
      let pdCurrentMs = adStart.getTime();

      for (let k = 0; k < 9; k++) {
        const pdLordIdx = (adLordIdx + k) % 9;
        const pdLordName = ORDER[pdLordIdx];
        const pdLordMeta = VIMSHOTTARI_LORDS.find(l => l.lord === pdLordName);

        const pdYears = (fullAdYears * pdLordMeta.years) / 120;
        const pdDurationMs = pdYears * 365.25 * 24 * 60 * 60 * 1000;
        const pdStart = new Date(pdCurrentMs);
        const pdEnd = new Date(pdCurrentMs + pdDurationMs);
        pdCurrentMs = pdEnd.getTime();

        const pdIsPreNatal = (i === 0) && (pdEnd.getTime() <= baseDate.getTime());
        const pdIsBirthDasha = (i === 0) && (pdStart.getTime() <= baseDate.getTime() && pdEnd.getTime() > baseDate.getTime());

        pratyantars.push({
          lord: pdLordName,
          startDate: pdStart,
          endDate: pdEnd,
          startStr: formatDate(pdStart),
          endStr: formatDate(pdEnd),
          isPreNatal: pdIsPreNatal,
          isBirthDasha: pdIsBirthDasha
        });
      }

      antardashas.push({
        lord: adLordName,
        index: j,
        years: Number(fullAdYears.toFixed(3)),
        startDate: adStart,
        endDate: adEnd,
        startStr: formatDate(adStart),
        endStr: formatDate(adEnd),
        isPreNatal,
        isBirthDasha,
        chidraStatus,
        sambandha,
        pratyantars
      });
    }

    mahadashas.push({
      lord: lordName,
      orderFromBirth: mdOrderFromBirth,
      color: lordMeta.color,
      totalYears: lordMeta.years,
      actualDurationYears: Number(mdDurationYears.toFixed(2)),
      theoreticalStartDate: (i === 0) ? new Date(theoreticalStartMs) : startDate,
      theoreticalStartStr: (i === 0) ? formatDate(new Date(theoreticalStartMs)) : formatDate(startDate),
      startDate,
      endDate,
      startStr: formatDate(startDate),
      endStr: formatDate(endDate),
      specialWarning,
      antardashas
    });
  }

  // Find currently active Dasha for reference date
  const refDateMs = refDate.getTime();
  let currentRunning = null;

  for (let md of mahadashas) {
    if (refDateMs >= md.startDate.getTime() && refDateMs <= md.endDate.getTime()) {
      for (let ad of md.antardashas) {
        if (refDateMs >= ad.startDate.getTime() && refDateMs <= ad.endDate.getTime()) {
          for (let pd of ad.pratyantars) {
            if (refDateMs >= pd.startDate.getTime() && refDateMs <= pd.endDate.getTime()) {
              const elapsed = refDateMs - pd.startDate.getTime();
              const total = pd.endDate.getTime() - pd.startDate.getTime();
              const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
              currentRunning = {
                md: md.lord,
                ad: ad.lord,
                pd: pd.lord,
                startDate: pd.startDate,
                endDate: pd.endDate,
                startStr: pd.startStr,
                endStr: pd.endStr,
                progressPct: pct,
                mdSpan: `${md.startStr} → ${md.endStr}`,
                adSpan: `${ad.startStr} → ${ad.endStr}`,
                specialWarning: md.specialWarning,
                chidraStatus: ad.chidraStatus,
                sambandha: ad.sambandha
              };
              break;
            }
          }
          if (currentRunning) break;
        }
      }
      if (currentRunning) break;
    }
  }

  return {
    nakshatraName: moonPlanet.nakshatraName,
    nakshatraLord: nakLord,
    balanceText,
    balanceYears: Number(firstMdBalanceYears.toFixed(2)),
    mahadashas,
    currentRunning
  };
}

/**
 * Evaluate mutual relationship (Sambandha / Bhava distance) between MD and AD lords
 * per Mehta Ch. XV (pp. 316, 319, 335):
 * - 6/8 Shadashtaka (disputes, disease, litigation, depression)
 * - 2/12 Dvidwadasa (expenditure, displacements, losses)
 * - 1/7 Saptama (opposition / tension, with favorable exceptions)
 * - Kendras (1/4/7/10) & Trikonas (1/5/9) (favorable, Rajayoga potency)
 */
function evaluatePlanetSambandha(mdLordName, adLordName, planets = []) {
  if (!planets || !planets.length) {
    return {
      type: 'General',
      distance: null,
      label: `${mdLordName} - ${adLordName}`,
      isChallenging: false,
      description: 'Mutual relationship depends on chart house placements.'
    };
  }

  const findP = (name) => planets.find(p => p.name === name || p.key === name);
  const p1 = findP(mdLordName);
  const p2 = findP(adLordName);

  if (!p1 || !p2 || p1.signId == null || p2.signId == null) {
    return {
      type: 'General',
      distance: null,
      label: `${mdLordName} - ${adLordName}`,
      isChallenging: false,
      description: 'Chart coordinates not fully assigned.'
    };
  }

  // Count from MD lord sign to AD lord sign (1 to 12)
  const dist = ((p2.signId - p1.signId + 12) % 12) + 1;
  const oppDist = ((p1.signId - p2.signId + 12) % 12) + 1;

  if (dist === 6 || dist === 8) {
    return {
      type: 'Shadashtaka (6/8 Axis)',
      distance: `${dist}/${oppDist}`,
      label: '⚠️ 6/8 Shadashtaka (Adverse Axis)',
      isChallenging: true,
      description: `MD Lord ${mdLordName} and AD Lord ${adLordName} are in 6/8 relationship. Classical Mehta rule: creates disputes, mental tension, health vulnerability, and career friction.`
    };
  }

  if (dist === 2 || dist === 12) {
    return {
      type: 'Dvidwadasa (2/12 Axis)',
      distance: `${dist}/${oppDist}`,
      label: '⚠️ 2/12 Dvidwadasa (Expenditure/Displacement)',
      isChallenging: true,
      description: `MD Lord ${mdLordName} and AD Lord ${adLordName} are in 2/12 relationship. Mehta rule: highlights high expenditures, transfers, travel, or feeling detached.`
    };
  }

  if (dist === 7) {
    // Check Mehta exceptions on p. 316: Mars-Moon, Saturn-Jupiter, Mars-Jupiter in 1/7 give good results
    const pair = [mdLordName, adLordName].sort().join('-');
    const isFavorableException = (pair === 'Mars-Moon' || pair === 'Jupiter-Saturn' || pair === 'Jupiter-Mars');
    if (isFavorableException) {
      return {
        type: 'Saptama (1/7 Axis - Classical Exception)',
        distance: '1/7',
        label: '✨ 1/7 Axis (Auspicious Exception)',
        isChallenging: false,
        description: `MD ${mdLordName} and AD ${adLordName} are in mutual 7th aspect. Mehta notes ${pair} in 1/7 axis is an auspicious exception conferring growth and status.`
      };
    }
    return {
      type: 'Saptama (1/7 Opposition)',
      distance: '1/7',
      label: '⚡ 1/7 Axis (Mutual Opposition)',
      isChallenging: false,
      description: `MD Lord ${mdLordName} and AD Lord ${adLordName} are in direct opposition (7th from each other). Promotes public interactions and partnerships, but requires balance.`
    };
  }

  if (dist === 1) {
    return {
      type: 'Yuti (Conjunction in Same Sign)',
      distance: '1/1',
      label: '🤝 Yuti (Same Sign Conjunction)',
      isChallenging: false,
      description: `Both Dasha rulers occupy the same sign (${p1.sign || 'Rasi'}), producing intensified focus on that house and its significations.`
    };
  }

  if (dist === 5 || dist === 9) {
    return {
      type: 'Trikona (5/9 Trinal Harmony)',
      distance: `${dist}/${oppDist}`,
      label: '✨ 5/9 Trikona (Dharmic Harmony)',
      isChallenging: false,
      description: `MD ${mdLordName} and AD ${adLordName} are in 5/9 trinal relationship. Mehta rule: Highly auspicious for prosperity, higher learning, virtuous deeds, and luck.`
    };
  }

  if (dist === 4 || dist === 10) {
    return {
      type: 'Kendra (4/10 Quadrant Dynamic)',
      distance: `${dist}/${oppDist}`,
      label: '🏛️ 4/10 Kendra (Action & Growth)',
      isChallenging: false,
      description: `MD ${mdLordName} and AD ${adLordName} are in 4/10 angular relationship, stimulating career activity, enterprise, and material achievement.`
    };
  }

  return {
    type: 'Upachaya / Neutral (3/11 Axis)',
    distance: `${dist}/${oppDist}`,
    label: '📈 3/11 Upachaya (Growth & Gains)',
    isChallenging: false,
    description: `MD ${mdLordName} and AD ${adLordName} are in 3/11 relationship. Favors initiative, friendships, and gradual realization of goals.`
  };
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
