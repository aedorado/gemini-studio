import { NAKSHATRAS } from './constants.js';

export const YOGINI_ORDER = [
  { id: 1, name: 'Mangala', lord: 'Moon', years: 1, color: '#E2E8F0', deity: 'Parvati / Kalyan', nature: 'Benefic' },
  { id: 2, name: 'Pingala', lord: 'Sun', years: 2, color: '#F59E0B', deity: 'Surya / Agni', nature: 'Malefic' },
  { id: 3, name: 'Dhanya', lord: 'Jupiter', years: 3, color: '#FBBF24', deity: 'Dhanya Lakshmi / Guru', nature: 'Benefic' },
  { id: 4, name: 'Bhramari', lord: 'Mars', years: 4, color: '#EF4444', deity: 'Bhramari / Mangala', nature: 'Malefic' },
  { id: 5, name: 'Bhadrika', lord: 'Mercury', years: 5, color: '#10B981', deity: 'Bhadra / Budha', nature: 'Benefic' },
  { id: 6, name: 'Ulka', lord: 'Saturn', years: 6, color: '#3B82F6', deity: 'Ulka / Shani', nature: 'Malefic' },
  { id: 7, name: 'Siddha', lord: 'Venus', years: 7, color: '#EC4899', deity: 'Siddha / Shukra', nature: 'Benefic' },
  { id: 8, name: 'Sankata', lord: 'Rahu', years: 8, color: '#8B5CF6', deity: 'Sankata / Rahu', nature: 'Malefic' }
];

export const TOTAL_YOGINI_CYCLE_YEARS = 36;

// Classical 64 Sub-period Predictions from Chapter XVI of Mehta (Mansagri / BPHS)
export const YOGINI_SUBPERIOD_RESULTS = {
  // Mangala (Moon, 1 Year)
  'Mangala-Mangala': 'Many friends, happiness from children, wealth, health, and family celebrations.',
  'Mangala-Pingala': 'Bitter relations with relatives, mental sorrow, bilious complaints, and anxiety.',
  'Mangala-Dhanya': 'Gains of vehicles, gains from children and friends, comforts, luxuries, and religious inclinations.',
  'Mangala-Bhramari': 'Tension with partner, stay in foreign or distant places, expenses, and meeting high-placed individuals.',
  'Mangala-Bhadrika': 'Gains of wealth, domestic harmony, good relations with spouse and children, devotion to the Divine.',
  'Mangala-Ulka': 'Loss of wealth, mental distress, sorrow to loved ones, and hurdles from authority.',
  'Mangala-Siddha': 'Happiness from children and spouse, financial progress, luxuries, comfort, and peaceful associations.',
  'Mangala-Sankata': 'Difficulties, illness, disputes, unexpected setbacks, and domestic unease.',

  // Pingala (Sun, 2 Years)
  'Pingala-Pingala': 'Health disorders, fever, eye or heart strain, mental tensions, and family frictions.',
  'Pingala-Dhanya': 'Wealth accumulation, support from children, luxuries, fulfillment of desires, and good status.',
  'Pingala-Bhramari': 'Travel to foreign places, sudden expenses, conflicts with family members, and restlessness.',
  'Pingala-Bhadrika': 'Gains from children, intellectual achievements, social fame, and business prosperity.',
  'Pingala-Ulka': 'Friction with friends and relatives, official penalties, fear of losses, and emotional sorrow.',
  'Pingala-Siddha': 'Spiritual progress through Mantra/Yantra, financial gains, happiness, but watch blood sugar and breathing.',
  'Pingala-Sankata': 'Financial drains, fear of litigation or disease, opposition from rivals, and sudden obstacles.',
  'Pingala-Mangala': 'Health fluctuations, physical fatigue, grief, and need for longevity remedies.',

  // Dhanya (Jupiter, 3 Years)
  'Dhanya-Dhanya': 'Land acquisition, agricultural or real estate profits, domestic happiness, and family welfare.',
  'Dhanya-Bhramari': 'Wandering, temporary dislocation from home, loss of savings, and differences with companions.',
  'Dhanya-Bhadrika': 'Exceptional good fortune, high post or promotion, government recognition, vehicle gain, and robes of honor.',
  'Dhanya-Ulka': 'Financial strain, emotional pain, chest/heart anxiety, and obstacles across endeavors.',
  'Dhanya-Siddha': 'Bliss from children, artistic pleasures, social gatherings, new noble friendships, and prosperity.',
  'Dhanya-Sankata': 'Confinement or feeling restricted, loss of enthusiasm in commercial ventures, and hurdles.',
  'Dhanya-Mangala': 'Auspicious celebrations, luxury purchases, jewelry/gems, domestic joy, and peace of mind.',
  'Dhanya-Pingala': 'Depletion of assets, headaches, mental dejection, disputes with superiors, and official delays.',

  // Bhramari (Mars, 4 Years)
  'Bhramari-Bhramari': 'Restless mind, disputes, fear of accidents or fire, disputes with rivals, and physical strain.',
  'Bhramari-Bhadrika': 'Victory over opponents, intellectual enterprise, successful travel, and practical progress.',
  'Bhramari-Ulka': 'Bodily fatigue, impure associations, sudden falls, injuries, and domestic instability.',
  'Bhramari-Siddha': 'Recovery of happiness, wisdom, fulfillment of ambitions, and improved vitality.',
  'Bhramari-Sankata': 'Loss of prestige, deception, theft, endless travel, and grief from adversaries.',
  'Bhramari-Mangala': 'Gains through courage, relief from state troubles, assistance from mentors, and renewed vitality.',
  'Bhramari-Pingala': 'Inflammatory complaints, digestive disorders, anger, and punitive actions from authorities.',
  'Bhramari-Dhanya': 'Wealth inflow, vehicles, comfort, decisive victory over competitors, and institutional favor.',

  // Bhadrika (Mercury, 5 Years)
  'Bhadrika-Bhadrika': 'Fame, goodwill, intellectual distinction, conveyance, spiritual knowledge, and freedom from pain.',
  'Bhadrika-Ulka': 'Financial depletion, skin or nervous complaints, mental sorrow, and broken agreements.',
  'Bhadrika-Siddha': 'Religious devotion, grand celebrations, auspicious ceremonies, artistic triumph, and joyous times.',
  'Bhadrika-Sankata': 'Fluctuating fortunes: brief gains followed by unexpected anxieties and family stress.',
  'Bhadrika-Mangala': 'Prosperity, social acclaim, happiness from offspring, and successful business contracts.',
  'Bhadrika-Pingala': 'Gains from land, property, agricultural ventures, and valuable counsel from elders.',
  'Bhadrika-Dhanya': 'Family joy, harmony with spouse, joyous gatherings, festivities, and intellectual achievements.',
  'Bhadrika-Bhramari': 'Fire or electric hazards, sudden property headaches, agitation, and interrupted peace.',

  // Ulka (Saturn, 6 Years)
  'Ulka-Ulka': 'Heavy obstacles, sorrow, loss of status, joint/bone pain, and severe career hurdles.',
  'Ulka-Siddha': 'Foreign journeys, emotional solitude, financial drains, but perseverance yields hidden insight.',
  'Ulka-Sankata': 'Severe trials, fear of losses, health distress to family members, and chronic worries.',
  'Ulka-Mangala': 'Comforting support from loyal friends, relief in health, and gradual domestic stability.',
  'Ulka-Pingala': 'Aimless wandering, skin issues, headaches, eye strain, and clashes with superiors.',
  'Ulka-Dhanya': 'Mixed fortunes: alternating moments of financial relief and emotional heavy weather.',
  'Ulka-Bhadrika': 'Relief through wisdom, regaining lost footing, mental clarity, and friendly assistance.',
  'Ulka-Bhramari': 'Loss of vehicles or travel delays, disputes with subordinates, and abrupt reversals.',

  // Siddha (Venus, 7 Years)
  'Siddha-Siddha': 'Fulfillment of cherished desires, domestic bliss, romance, artistic success, and social prestige.',
  'Siddha-Sankata': 'Legal penalties, hidden enmities, unexpected financial losses, and deceptive traps.',
  'Siddha-Mangala': 'Splendor, luxuries, vehicles, gracious royal/governmental favors, and auspicious festivities.',
  'Siddha-Pingala': 'Haughtiness, disputes from unchecked pride, sudden expenses, and friction with authority.',
  'Siddha-Dhanya': 'Peak auspiciousness: effortless success, noble associations, generous prosperity, and spiritual joy.',
  'Siddha-Bhramari': 'Questionable habits, foreign displacement, restless movements, and official admonitions.',
  'Siddha-Bhadrika': 'Grand family celebrations, academic or professional accolades, refinement, and lasting goodwill.',
  'Siddha-Ulka': 'Sudden monetary losses, physical discomfort, emotional detachment, and sorrow through associates.',

  // Sankata (Rahu, 8 Years)
  'Sankata-Sankata': 'Critical transitions, fear of legal or official penalties, exile/displacement, and profound tests.',
  'Sankata-Mangala': 'Health vulnerabilities, distress to spouse, emotional gloom, and need for protective mantras.',
  'Sankata-Dhanya': 'Abdominal or digestive strain, but unexpected fame, popularity, and relief through children.',
  'Sankata-Bhramari': 'Aimless journeys, financial dissipation, fear from hidden enemies, and chronic restlessness.',
  'Sankata-Bhadrika': 'Academic success, intellectual breakthroughs, discovery of secret treasures, but debate with rivals.',
  'Sankata-Ulka': 'Heavy financial erosion, conveyance accidents, acute stress, and severe existential tests.',
  'Sankata-Siddha': 'Resilience, surge of morale, comfort through offspring, and sudden triumph over adversity.',
  'Sankata-Pingala': 'Clashes with authorities, cardiac or eye sensitivity, feverish conditions, and sudden upheaval.'
};

/**
 * Calculate Yogini Dasha from Moon's nakshatra and longitude.
 * Formula per Mehta p. 377:
 * Yogini Index = (Nakshatra Number + 3) mod 8 (if remainder 0 -> 8, i.e. Sankata)
 * Balance = (1 - fractionInNakshatra) * Yogini.years
 *
 * @param {Object} moonPlanet - parsed Moon object with nakshatraId & fractionInNakshatra
 * @param {string} birthDateStr - YYYY-MM-DD string
 * @param {number} cycleCount - number of 36-year cycles to generate (default 3 = 108 years)
 * @param {Date|null} refDate - Date to check currently active period (default: now)
 */
export function calculateYoginiDasha(moonPlanet, birthDateStr = null, cycleCount = 3, refDate = new Date()) {
  if (!moonPlanet) return null;

  let nakId = moonPlanet.nakshatraId;
  if (!nakId && moonPlanet.nakshatraName) {
    const match = NAKSHATRAS.find(n => n.name.toLowerCase() === moonPlanet.nakshatraName.toLowerCase());
    if (match) nakId = match.id;
  }
  if (!nakId && (moonPlanet.absLongitude != null || moonPlanet.longitude != null)) {
    const lon = moonPlanet.absLongitude != null ? moonPlanet.absLongitude : moonPlanet.longitude;
    nakId = Math.floor((((lon % 360) + 360) % 360) * 60 / 800) + 1;
  }
  if (!nakId) return null;
  // Classical rule: (Nakshatra # + 3) % 8
  const rem = (nakId + 3) % 8;
  const startingYoginiId = rem === 0 ? 8 : rem; // 1 = Mangala, ..., 8 = Sankata
  const startingYogini = YOGINI_ORDER.find(y => y.id === startingYoginiId);

  const fractionElapsed = moonPlanet.fractionInNakshatra != null ? moonPlanet.fractionInNakshatra : 0;
  const fractionRemaining = Math.max(0, Math.min(1, 1 - fractionElapsed));

  const firstMdTotalYears = startingYogini.years;
  const firstMdBalanceYears = firstMdTotalYears * fractionRemaining;

  // Format balance at birth into Years, Months, Days
  const balanceYears = Math.floor(firstMdBalanceYears);
  const balanceMonthsFloat = (firstMdBalanceYears - balanceYears) * 12;
  const balanceMonths = Math.floor(balanceMonthsFloat);
  const balanceDays = Math.round((balanceMonthsFloat - balanceMonths) * 30.4375);

  const balanceText = `${balanceYears}y ${balanceMonths}m ${balanceDays}d of ${startingYogini.name} (${startingYogini.lord}) remaining at birth`;

  let baseDate = birthDateStr ? new Date(birthDateStr) : new Date(2000, 0, 1);
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date(2000, 0, 1);
  }

  // Generate cycles of 8 Yoginis each (36 years per full cycle)
  const cycles = [];
  let currentDateMs = baseDate.getTime();
  let startingIndexInOrder = YOGINI_ORDER.findIndex(y => y.id === startingYoginiId);

  const allMahadashas = [];

  for (let c = 0; c < cycleCount; c++) {
    const cycleMahadashas = [];

    for (let i = 0; i < 8; i++) {
      const yoginiIdx = (startingIndexInOrder + i) % 8;
      const yogini = YOGINI_ORDER[yoginiIdx];

      const isFirstAtBirth = (c === 0 && i === 0);
      const mdDurationYears = isFirstAtBirth ? firstMdBalanceYears : yogini.years;

      const startDate = new Date(currentDateMs);
      const durationMs = mdDurationYears * 365.25 * 24 * 60 * 60 * 1000;
      const endDate = new Date(currentDateMs + durationMs);
      currentDateMs = endDate.getTime();

      // Generate 8 Antardashas within this Mahadasha
      // Sub-period duration = (MD_Years * AD_Years) / 36
      // For the birth Mahadasha (c === 0 && i === 0), the 8 Antardashas run across the full theoretical cycle.
      const antardashas = [];
      const firstMdElapsedYears = startingYogini.years * fractionElapsed;
      const theoreticalStartMs = baseDate.getTime() - (firstMdElapsedYears * 365.25 * 24 * 60 * 60 * 1000);
      let adCurrentMs = isFirstAtBirth ? theoreticalStartMs : startDate.getTime();

      for (let j = 0; j < 8; j++) {
        const adIdx = (yoginiIdx + j) % 8;
        const adYogini = YOGINI_ORDER[adIdx];

        const fullAdYears = (yogini.years * adYogini.years) / TOTAL_YOGINI_CYCLE_YEARS;
        const adDurationMs = fullAdYears * 365.25 * 24 * 60 * 60 * 1000;

        const adStart = new Date(adCurrentMs);
        const adEnd = new Date(adCurrentMs + adDurationMs);
        adCurrentMs = adEnd.getTime();

        const isPreNatal = isFirstAtBirth && (adEnd.getTime() <= baseDate.getTime());
        const isBirthDasha = isFirstAtBirth && (adStart.getTime() <= baseDate.getTime() && adEnd.getTime() > baseDate.getTime());

        const comboKey = `${yogini.name}-${adYogini.name}`;
        const classicalReading = YOGINI_SUBPERIOD_RESULTS[comboKey] || 'Neutral period according to classical principles.';

        antardashas.push({
          name: adYogini.name,
          lord: adYogini.lord,
          years: Number(fullAdYears.toFixed(3)),
          startDate: adStart,
          endDate: adEnd,
          startStr: formatDate(adStart),
          endStr: formatDate(adEnd),
          isPreNatal,
          isBirthDasha,
          comboKey,
          nature: adYogini.nature,
          classicalReading
        });
      }

      const mdRecord = {
        cycleNumber: c + 1,
        id: yogini.id,
        name: yogini.name,
        lord: yogini.lord,
        color: yogini.color,
        nature: yogini.nature,
        deity: yogini.deity,
        totalYears: yogini.years,
        actualDurationYears: Number(mdDurationYears.toFixed(2)),
        theoreticalStartDate: isFirstAtBirth ? new Date(theoreticalStartMs) : startDate,
        theoreticalStartStr: isFirstAtBirth ? formatDate(new Date(theoreticalStartMs)) : formatDate(startDate),
        startDate,
        endDate,
        startStr: formatDate(startDate),
        endStr: formatDate(endDate),
        antardashas
      };

      cycleMahadashas.push(mdRecord);
      allMahadashas.push(mdRecord);
    }

    cycles.push({
      cycleNumber: c + 1,
      name: `Cycle ${c + 1} (${c * 36} to ${(c + 1) * 36} years)`,
      mahadashas: cycleMahadashas
    });
  }

  // Find currently active Yogini Dasha
  const refMs = refDate.getTime();
  let currentRunning = null;

  for (let md of allMahadashas) {
    if (refMs >= md.startDate.getTime() && refMs <= md.endDate.getTime()) {
      for (let ad of md.antardashas) {
        if (refMs >= ad.startDate.getTime() && refMs <= ad.endDate.getTime()) {
          const elapsed = refMs - ad.startDate.getTime();
          const total = ad.endDate.getTime() - ad.startDate.getTime();
          const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
          currentRunning = {
            cycle: md.cycleNumber,
            mdName: md.name,
            mdLord: md.lord,
            adName: ad.name,
            adLord: ad.lord,
            mdNature: md.nature,
            adNature: ad.nature,
            comboKey: ad.comboKey,
            startDate: ad.startDate,
            endDate: ad.endDate,
            startStr: ad.startStr,
            endStr: ad.endStr,
            progressPct: pct,
            mdSpan: `${md.startStr} → ${md.endStr}`,
            adSpan: `${ad.startStr} → ${ad.endStr}`,
            classicalReading: ad.classicalReading
          };
          break;
        }
      }
      if (currentRunning) break;
    }
  }

  return {
    nakshatraId: nakId,
    nakshatraName: moonPlanet.nakshatraName,
    startingYogini: startingYogini.name,
    startingLord: startingYogini.lord,
    balanceText,
    balanceYears: Number(firstMdBalanceYears.toFixed(2)),
    cycles,
    allMahadashas,
    currentRunning
  };
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
