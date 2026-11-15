import { calculateTransits } from './ephemeris.js';
import { analyzeTransits } from './transits.js';

/**
 * Exhaustive Vedic Astrology Life Event Categories & Astrological Significators
 */
export const LIFE_EVENT_CATEGORIES = [
  {
    id: 'marriage',
    label: 'Marriage / Engagement / Union',
    icon: '💍',
    targetHouses: '7th, 2nd, 11th',
    karakas: 'Venus (Sukra), Jupiter (Guru)',
    divisional: 'D9 Navamsha',
    defaultNature: 'positive'
  },
  {
    id: 'job_change',
    label: 'Job Change / Career Breakthrough',
    icon: '💼',
    targetHouses: '10th, 6th, 11th',
    karakas: 'Sun (Surya), Saturn (Shani), Mercury',
    divisional: 'D10 Dashamsha',
    defaultNature: 'positive'
  },
  {
    id: 'promotion',
    label: 'Promotion / Major Recognition / Award',
    icon: '🏆',
    targetHouses: '10th, 11th, 1st',
    karakas: 'Sun, Jupiter',
    divisional: 'D10 Dashamsha',
    defaultNature: 'positive'
  },
  {
    id: 'job_loss',
    label: 'Job Loss / Resignation / Career Hiatus',
    icon: '📉',
    targetHouses: '8th, 12th, 6th',
    karakas: 'Saturn, Rahu',
    divisional: 'D10 Dashamsha',
    defaultNature: 'challenging'
  },
  {
    id: 'business',
    label: 'New Business / Startup / Venture Launch',
    icon: '🏢',
    targetHouses: '7th, 10th, 3rd, 11th',
    karakas: 'Mercury (Budha), Mars (Mangal)',
    divisional: 'D10 Dashamsha',
    defaultNature: 'positive'
  },
  {
    id: 'house_shift',
    label: 'House Shifting / Domestic Relocation',
    icon: '🏠',
    targetHouses: '4th, 3rd (Movement)',
    karakas: 'Moon (Chandra), Mars',
    divisional: 'D4 Chaturthamsha',
    defaultNature: 'neutral'
  },
  {
    id: 'property',
    label: 'Land / Flat / Property Purchase',
    icon: '🏡',
    targetHouses: '4th (Bhumi/Sukha)',
    karakas: 'Mars (Bhumi Karaka), Saturn',
    divisional: 'D4 / D16 Shodashamsha',
    defaultNature: 'positive'
  },
  {
    id: 'vehicle',
    label: 'Vehicle / Car Purchase',
    icon: '🚗',
    targetHouses: '4th (Vahana Bhava)',
    karakas: 'Venus (Vahana Karaka)',
    divisional: 'D16 Shodashamsha',
    defaultNature: 'positive'
  },
  {
    id: 'foreign_travel',
    label: 'Foreign Travel / Relocation Abroad / PR',
    icon: '✈️',
    targetHouses: '9th (Long Journeys), 12th (Foreign Lands)',
    karakas: 'Rahu, Moon',
    divisional: 'D9 / D12',
    defaultNature: 'positive'
  },
  {
    id: 'child_birth',
    label: 'Child Birth / First or Second Progeny',
    icon: '👶',
    targetHouses: '5th (Putra Bhava), 2nd, 11th',
    karakas: 'Jupiter (Putra Karaka)',
    divisional: 'D7 Saptamsha',
    defaultNature: 'positive'
  },
  {
    id: 'sibling_born',
    label: 'Sibling Born / Sibling Milestone',
    icon: '🧑‍🤝‍🧑',
    targetHouses: '3rd (Bhratri - Younger), 11th (Elder)',
    karakas: 'Mars (Bhratri Karaka)',
    divisional: 'D3 Drekkana',
    defaultNature: 'positive'
  },
  {
    id: 'graduation',
    label: 'Graduation / Degree / Academic Milestone',
    icon: '🎓',
    targetHouses: '4th, 5th, 9th (Higher Knowledge)',
    karakas: 'Mercury (Buddhi), Jupiter (Guru)',
    divisional: 'D24 Chaturvimshamsha',
    defaultNature: 'positive'
  },
  {
    id: 'illness_injury',
    label: 'Major Illness / Surgery / Hospitalization / Accident',
    icon: '🏥',
    targetHouses: '6th (Roga), 8th (Randhra), 12th (Hospitalization)',
    karakas: 'Mars (Surgeries), Saturn, Rahu',
    divisional: 'D6 / D30 Trimshamsha',
    defaultNature: 'challenging'
  },
  {
    id: 'bereavement',
    label: 'Parent / Elder / Relative Passed Away',
    icon: '🕊️',
    targetHouses: '9th (Father), 4th (Mother), 8th (Bereavement)',
    karakas: 'Sun (Pitri), Moon (Matri)',
    divisional: 'D12 Dvadasamsha',
    defaultNature: 'challenging'
  },
  {
    id: 'financial_gain',
    label: 'Major Financial Windfall / Inheritance',
    icon: '💰',
    targetHouses: '2nd (Dhana), 11th (Labha), 8th (Inheritance)',
    karakas: 'Jupiter, Venus',
    divisional: 'D2 Hora',
    defaultNature: 'positive'
  },
  {
    id: 'separation',
    label: 'Divorce / Separation / Heartbreak',
    icon: '💔',
    targetHouses: '6th, 8th, 12th from 7th house',
    karakas: 'Venus, Rahu, Mars',
    divisional: 'D9 Navamsha',
    defaultNature: 'challenging'
  },
  {
    id: 'legal',
    label: 'Legal Battle / Court Case / Settlement',
    icon: '⚖️',
    targetHouses: '6th (Litigation/Disputes), 8th',
    karakas: 'Saturn, Mars',
    divisional: 'D6 Shashtamsha',
    defaultNature: 'neutral'
  },
  {
    id: 'spiritual',
    label: 'Spiritual Initiation / Diksha / Yatra',
    icon: '🕉️',
    targetHouses: '9th (Dharma), 12th (Moksha), 5th (Mantra)',
    karakas: 'Jupiter, Ketu (Moksha Karaka)',
    divisional: 'D20 Vimshamsha',
    defaultNature: 'positive'
  },
  {
    id: 'custom',
    label: 'Other Significant Life Event',
    icon: '⭐',
    targetHouses: 'General Chart Activation',
    karakas: 'Individual Grahas',
    divisional: 'Rashi D1',
    defaultNature: 'neutral'
  }
];

/**
 * Get category metadata by ID
 */
export function getCategoryMeta(typeId) {
  return LIFE_EVENT_CATEGORIES.find(c => c.id === typeId) || LIFE_EVENT_CATEGORIES[LIFE_EVENT_CATEGORIES.length - 1];
}

/**
 * Calculate exact Vimshottari Dasha running on a target date
 */
export function getDashaAtDate(dashaTree, targetDateStr) {
  if (!dashaTree || !dashaTree.mahadashas || !targetDateStr) return null;
  const targetTime = new Date(targetDateStr).getTime();
  if (isNaN(targetTime)) return null;

  let matchMd = null;
  let matchAd = null;
  let matchPd = null;

  for (let md of dashaTree.mahadashas) {
    const mdStart = new Date(md.startDate).getTime();
    const mdEnd = new Date(md.endDate).getTime();
    if (targetTime >= mdStart && targetTime < mdEnd) {
      matchMd = md;
      if (md.antardashas) {
        for (let ad of md.antardashas) {
          const adStart = new Date(ad.startDate).getTime();
          const adEnd = new Date(ad.endDate).getTime();
          if (targetTime >= adStart && targetTime < adEnd) {
            matchAd = ad;
            if (ad.pratyantars) {
              for (let pd of ad.pratyantars) {
                const pdStart = new Date(pd.startDate).getTime();
                const pdEnd = new Date(pd.endDate).getTime();
                if (targetTime >= pdStart && targetTime < pdEnd) {
                  matchPd = pd;
                  break;
                }
              }
            }
            break;
          }
        }
      }
      break;
    }
  }

  const dashaStr = matchMd
    ? `${matchMd.lord} MD${matchAd ? ` › ${matchAd.lord} AD` : ''}${matchPd ? ` › ${matchPd.lord} PD` : ''}`
    : 'Before/After 120-Year Dasha Range';

  return {
    md: matchMd ? { lord: matchMd.lord, color: matchMd.color, startStr: matchMd.startStr, endStr: matchMd.endStr } : null,
    ad: matchAd ? { lord: matchAd.lord, startStr: matchAd.startStr, endStr: matchAd.endStr, chidra: matchAd.chidraStatus } : null,
    pd: matchPd ? { lord: matchPd.lord, startStr: matchPd.startStr, endStr: matchPd.endStr } : null,
    dashaStr
  };
}

/**
 * Calculate Planetary Transits (Gochar) on a target event date
 */
export function getTransitsAtDate(natalPlanets, targetDateStr, ashtakavarga = null) {
  if (!natalPlanets || natalPlanets.length === 0 || !targetDateStr) return null;
  const targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) return null;

  const natalLagna = natalPlanets.find(p => p.key === 'ASC');
  const natalMoon = natalPlanets.find(p => p.key === 'Moon');
  if (!natalLagna || !natalMoon) return null;

  const transitRes = calculateTransits(targetDate);
  const transitPlanets = transitRes.planets;
  const analysis = analyzeTransits(natalPlanets, transitPlanets, ashtakavarga);

  const getPlanetData = (key) => {
    const tp = transitPlanets.find(p => p.key === key);
    if (!tp) return null;
    const hFromLagna = ((tp.signId - natalLagna.signId + 12) % 12) + 1;
    const hFromMoon = ((tp.signId - natalMoon.signId + 12) % 12) + 1;
    const sav = ashtakavarga && ashtakavarga.savBySign ? ashtakavarga.savBySign[tp.signId - 1] : null;
    return {
      key: tp.key,
      name: tp.name,
      signId: tp.signId,
      signName: tp.signName,
      dms: tp.dmsFormatted,
      isRetro: tp.isRetro,
      houseFromLagna: hFromLagna,
      houseFromMoon: hFromMoon,
      sav
    };
  };

  const saturn = getPlanetData('Satn');
  const jupiter = getPlanetData('Jupt');
  const rahu = getPlanetData('Rahu');
  const ketu = getPlanetData('Ketu');
  const mars = getPlanetData('Mars');
  const sun = getPlanetData('Sun');

  // Sade Sati / Kantaka / Ashtama Shani evaluation
  let saturnCondition = 'Regular Transit';
  if (saturn) {
    if (saturn.houseFromMoon === 12) saturnCondition = '⚠️ Sade Sati (Rising / 1st Phase)';
    else if (saturn.houseFromMoon === 1) saturnCondition = '🔥 Sade Sati (Peak / Janma Shani)';
    else if (saturn.houseFromMoon === 2) saturnCondition = '🌅 Sade Sati (Setting / 3rd Phase)';
    else if (saturn.houseFromMoon === 4) saturnCondition = '⚡ Kantaka Shani (4th from Moon)';
    else if (saturn.houseFromMoon === 8) saturnCondition = '🛡️ Ashtama Shani (8th from Moon)';
  }

  // Guru Bala evaluation (Auspicious 2, 5, 7, 9, 11 from Moon)
  let jupiterCondition = 'Neutral Guru Transit';
  if (jupiter) {
    if ([2, 5, 7, 9, 11].includes(jupiter.houseFromMoon)) {
      jupiterCondition = `✨ Active Guru Bala (${jupiter.houseFromMoon}th from Moon)`;
    } else {
      jupiterCondition = `${jupiter.houseFromMoon}th from Moon`;
    }
  }

  return {
    saturn,
    jupiter,
    rahu,
    ketu,
    mars,
    sun,
    saturnCondition,
    jupiterCondition,
    alerts: analysis ? analysis.alerts : []
  };
}

/**
 * Calculate age at the time of the event
 */
export function calculateAgeAtEvent(birthDateStr, eventDateStr) {
  if (!birthDateStr || !eventDateStr) return '—';
  const birth = new Date(birthDateStr);
  const event = new Date(eventDateStr);
  if (isNaN(birth.getTime()) || isNaN(event.getTime())) return '—';

  let years = event.getFullYear() - birth.getFullYear();
  let months = event.getMonth() - birth.getMonth();
  let days = event.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    days += 30;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return 'Pre-Birth';
  if (years === 0) return `${months} mos`;
  return `${years}y ${months}m`;
}

/**
 * Synthesize and Correlate a single Life Event with Astrological Coordinates
 */
export function correlateLifeEvent(event, natalPlanets, dashaTree, ashtakavarga, birthDateStr) {
  const categoryMeta = getCategoryMeta(event.type);
  const ageText = calculateAgeAtEvent(birthDateStr, event.date);
  const dasha = getDashaAtDate(dashaTree, event.date);
  const transits = getTransitsAtDate(natalPlanets, event.date, ashtakavarga);

  return {
    ...event,
    categoryMeta,
    ageText,
    dasha,
    transits
  };
}

/**
 * Format verified historical life events for Gemini AI Prompt
 */
export function formatLifeEventsForPrompt(lifeEvents, natalPlanets, dashaTree, ashtakavarga, birthDateStr) {
  if (!lifeEvents || lifeEvents.length === 0) return '';

  const sortedEvents = [...lifeEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

  let md = `\n## 9. VERIFIED HISTORICAL LIFE EVENTS & TIMELINE (FOR BIRTH TIME RECTIFICATION & CALIBRATION)\n`;
  md += `*The native has provided verified past life events with exact dates. Cross-examine whether these real-world events synchronize with the calculated Mahadasha-Antardasha lords and planetary transits on those dates:*\n\n`;
  md += `| Date | Age | Life Event | User Description | Active Dasha (MD › AD › PD) | Transiting Saturn (Shani) | Transiting Jupiter (Guru) |\n`;
  md += `|---|---|---|---|---|---|---|\n`;

  for (let rawEvent of sortedEvents) {
    const c = correlateLifeEvent(rawEvent, natalPlanets, dashaTree, ashtakavarga, birthDateStr);
    const dashaText = c.dasha ? c.dasha.dashaStr : 'N/A';
    const saturnText = c.transits && c.transits.saturn
      ? `H${c.transits.saturn.houseFromLagna} (${c.transits.saturn.signName}) [Moon: H${c.transits.saturn.houseFromMoon}]`
      : 'N/A';
    const jupiterText = c.transits && c.transits.jupiter
      ? `H${c.transits.jupiter.houseFromLagna} (${c.transits.jupiter.signName}) [Moon: H${c.transits.jupiter.houseFromMoon}]`
      : 'N/A';
    const descParts = [];
    if (c.title) descParts.push(c.title);
    if (c.notes) descParts.push(c.notes);
    const summary = descParts.length > 0 ? descParts.join(' - ').replace(/\|/g, '/') : '—';

    md += `| ${c.date} | ${c.ageText} | ${c.categoryMeta.icon} ${c.categoryMeta.label} | ${summary} | ${dashaText} | ${saturnText} | ${jupiterText} |\n`;
  }

  md += `\n**Rectification & Calibration Directive:**\n`;
  md += `Examine whether the Dasha lords and active houses on these event dates corroborate the exact Lagna degree and divisional chart placements (D9 Navamsha, D10 Dashamsha, D4 Chaturthamsha). Use this empirical timeline to calibrate the native's chart before delivering future predictions.\n\n`;

  return md;
}
