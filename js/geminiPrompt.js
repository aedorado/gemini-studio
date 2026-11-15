import { SIGNS } from './constants.js';
import { formatLifeEventsForPrompt } from './lifeEvents.js';

export const PROMPT_PRESETS = [
  {
    id: 'general',
    title: '🌟 Comprehensive Life & Destiny Reading',
    question: 'Please provide a comprehensive Vedic Astrology (Jyotish) reading of this Kundali. Analyze my core personality, career trajectory, financial stability, relationships, health tendencies, and overall life destiny.'
  },
  {
    id: 'career',
    title: '💼 Career, Wealth & Status (D10 Focus)',
    question: 'Please analyze my career, profession, status, and financial growth in detail. Specifically integrate the 10th house, 11th house, 2nd house from Lagna and Moon, the D10 Dashamsha chart placements, and Ashtakavarga strength to advise on the most suitable fields, leadership potential, and wealth accumulation.'
  },
  {
    id: 'marriage',
    title: '❤️ Marriage, Relationships & Compatibility (D9 Focus)',
    question: 'Please provide an in-depth analysis of my marriage and relationship prospects. Examine the 7th house, 7th lord, Venus/Jupiter placements, the D9 Navamsha chart, timing of marriage/partnership, spouse characteristics, and marital harmony.'
  },
  {
    id: 'health',
    title: '🩺 Health, Vitality & Medical Astrology (Ayur-Jyotish)',
    question: 'Please provide a comprehensive Medical Astrology (Ayur-Jyotish) analysis of this chart. Evaluate my constitutional strength and vitality (Lagna & Lagna lord), mental resilience (Moon & Mercury), and potential vulnerabilities across the 6th house (Roga - acute illnesses & digestion), 8th house (chronic ailments, longevity & reproductive/excretory system), and 12th house (sleep & hospitalization). Analyze any afflictions to vital Karakas (Sun for vitality/heart, Moon for fluids/mental peace, Mars for blood/inflammation, Saturn for joints/nervous wear), Ayurvedic dosha tendencies (Vata, Pitta, Kapha), critical transit and Dasha timing periods to safeguard health, and practical lifestyle, dietary, or Ayurvedic wellness recommendations.'
  },
  {
    id: 'dasha',
    title: '⏳ Current Dasha & Transit (Gochar) Timing',
    question: 'Analyze my currently active Vimshottari Mahadasha, Antardasha, and Pratyantardasha combined with current planetary transits (Saturn, Jupiter, Rahu-Ketu, Sade Sati). What specific karma and themes are ripening right now, and what should I anticipate or prepare for in the next 1-2 years?'
  },
  {
    id: 'remedies',
    title: '🌿 Astrological Remedies (Upayas) & Gemstones',
    question: 'Based on planetary afflictions, debilitations, or vulnerable houses in my Ashtakavarga, recommend practical Vedic remedies (Upayas). Include suitable mantras, charitable deeds, gemstone or metal recommendations (with necessary cautions), and behavioral lifestyle alignments.'
  },
  {
    id: 'spiritual',
    title: '🕉️ Spiritual Evolution & Karmic Debt (D20 & D60)',
    question: 'What are my soul\'s deepest karmic lessons according to the Rahu-Ketu axis, D20 Vimshamsha, and D60 Shashtiamsha? How can I align with my highest spiritual purpose (Dharma) and overcome recurring past-life patterns?'
  },
  {
    id: 'custom',
    title: '✍️ Custom Question',
    question: ''
  }
];

export function generateGeminiPrompt({
  clientName = '',
  birthDate = null,
  lifeEvents = null,
  planets,
  shodashvarga,
  ashtakavarga,
  dasha,
  yoginiDasha = null,
  yogas,
  transits = null,
  panchanga = null,
  drishti = null,
  shadbala = null,
  gender = 'male',
  selectedPresetId = 'general',
  customQuestion = ''
}) {
  const lagna = planets.find(p => p.key === 'ASC');
  const moon = planets.find(p => p.key === 'Moon');
  const lagnaSignId = lagna ? lagna.signId : 1;

  let preset = PROMPT_PRESETS.find(p => p.id === selectedPresetId) || PROMPT_PRESETS[0];
  let finalQuestion = selectedPresetId === 'custom' && customQuestion.trim()
    ? customQuestion.trim()
    : preset.question;

  let text = `# VEDIC ASTROLOGY (JYOTISH) CHART READING REQUEST\n\n`;
  if (clientName) {
    const genderTag = gender ? ` (${gender.charAt(0).toUpperCase() + gender.slice(1)})` : '';
    text += `**Native / Client:** ${clientName}${genderTag}\n\n`;
  }
  text += `Act as a master Vedic Astrologer (Jyotishi) trained in the classical Parashari system (Brihat Parashara Hora Shastra, Jaimini Sutras, and Phaladeepika). Please provide a deep, highly nuanced, practical, and objective chart analysis based on the verified birth chart calculations provided below.\n\n`;

  // Birth Panchanga Section
  if (panchanga) {
    text += `## 0. BIRTH PANCHANGA (FIVE LIMBS OF TIME)\n`;
    text += `- **Tithi:** ${panchanga.tithi.name} (${panchanga.tithi.paksha}, #${panchanga.tithi.number}) [Elapsed: ${panchanga.tithi.progressPct}%]\n`;
    text += `- **Vaara (Solar Day):** ${panchanga.vaara.name} (${panchanga.vaara.sanskrit}), Day Lord: **${panchanga.vaara.lord}**\n`;
    text += `- **Janma Nakshatra:** ${panchanga.nakshatra.name} (Pada ${panchanga.nakshatra.pada}), Lord: **${panchanga.nakshatra.lord}**\n`;
    text += `- **Nitya Yoga:** ${panchanga.yoga.name} (${panchanga.yoga.isAuspicious ? 'Auspicious' : 'Inauspicious/Sensitive'})\n`;
    text += `- **Karana:** ${panchanga.karana.name}\n\n`;
  }

  text += `## 1. CORE CHART DATA & PLANETARY POSITIONS (D1 RASHI)\n`;
  text += `**Ascendant (Lagna):** ${lagna ? `${lagna.signName} (${lagna.signSanskrit}) at ${lagna.dmsFormatted}, Nakshatra: ${lagna.nakshatraName} (Pada ${lagna.pada}, Lord: ${lagna.nakshatraLord})` : 'Unknown'}\n`;
  text += `**Chandra Lagna (Moon Sign):** ${moon ? `${moon.signName} (${moon.signSanskrit}) at ${moon.dmsFormatted}, Nakshatra: ${moon.nakshatraName} (Pada ${moon.pada}, Lord: ${moon.nakshatraLord})` : 'Unknown'}\n\n`;

  text += `| Planet | Sign | Degree (DMS) | Nakshatra (Pada) | House (from Lagna) | Dignity | Status |\n`;
  text += `|---|---|---|---|---|---|---|\n`;

  for (let p of planets) {
    const houseFromLagna = ((p.signId - lagnaSignId + 12) % 12) + 1;
    const vRow = shodashvarga.matrix.find(r => r.key === p.key);
    const dignity = vRow ? vRow.dignityD1.label : '-';
    const status = p.isRetro ? 'Retrograde [R]' : 'Direct';
    text += `| ${p.name} | ${p.signName} | ${p.dmsFormatted} | ${p.nakshatraName} (${p.pada}) | House ${houseFromLagna} | ${dignity} | ${status} |\n`;
  }

  text += `\n## 2. SHODASHVARGA & DIVISIONAL CHART HIGHLIGHTS\n`;
  if (shodashvarga.vargottamaList && shodashvarga.vargottamaList.length > 0) {
    text += `- **Vargottama Planets (Same sign in D1 Rashi & D9 Navamsha):** ${shodashvarga.vargottamaList.join(', ')} *(Endowed with intrinsic strength & resilience)*\n`;
  } else {
    text += `- **Vargottama Planets:** None\n`;
  }

  text += `\n**Key Divisional Sign Placements:**\n`;
  text += `| Planet | D1 Rashi | D9 Navamsha | D10 Dashamsha | D60 Shashtiamsha |\n`;
  text += `|---|---|---|---|---|\n`;
  for (let p of planets) {
    const vRow = shodashvarga.matrix.find(r => r.key === p.key);
    if (!vRow) continue;
    const sD1 = SIGNS[vRow.vargas['D1'] - 1].name;
    const sD9 = SIGNS[vRow.vargas['D9'] - 1].name;
    const sD10 = SIGNS[vRow.vargas['D10'] - 1].name;
    const sD60 = SIGNS[vRow.vargas['D60'] - 1].name;
    text += `| ${p.name} | ${sD1} | ${sD9} | ${sD10} | ${sD60} |\n`;
  }

  text += `\n## 3. ASHTAKAVARGA ANALYSIS (SARVASHTAKAVARGA - SAV)\n`;
  text += `- **Total SAV Bindus:** ${ashtakavarga.totalSAV} / 337 (Canonical Parashara benchmark: 28 bindus per house)\n`;
  text += `- **Strongest House:** House ${ashtakavarga.strongestHouse.house} (${ashtakavarga.strongestHouse.signName}) with **${ashtakavarga.strongestHouse.points} bindus**\n`;
  text += `- **Weakest House:** House ${ashtakavarga.weakestHouse.house} (${ashtakavarga.weakestHouse.signName}) with **${ashtakavarga.weakestHouse.points} bindus**\n`;
  text += `\n**SAV Bindu Distribution by Bhava:**\n`;
  const housePointsStr = ashtakavarga.savByHouse.map(h => `H${h.house} (${h.signName.substring(0, 3)}): ${h.points}`).join(' | ');
  text += `${housePointsStr}\n`;

  // 4. Dasha Section (Vimshottari & Yogini Dual-Dasha per Mehta Chapters XV & XVI)
  text += `\n## 4. DUAL DASHA TIMELINE (VIMSHOTTARI & YOGINI - MEHTA & KN RAO METHOD)\n`;
  if (dasha) {
    text += `### A. Vimshottari Dasha (120 Years):\n`;
    text += `- **Birth Balance:** ${dasha.balanceText}\n`;
    if (dasha.currentRunning) {
      const cr = dasha.currentRunning;
      text += `- **🔥 CURRENTLY ACTIVE VIMSHOTTARI:**\n`;
      text += `  - **Mahadasha (MD):** ${cr.md} (${cr.mdSpan})\n`;
      text += `  - **Antardasha (AD):** ${cr.ad} (${cr.adSpan})\n`;
      text += `  - **Pratyantardasha (PD):** ${cr.pd} (${cr.startStr} to ${cr.endStr}) [Progress: ${cr.progressPct}%]\n`;
      if (cr.chidraStatus) {
        text += `  - **⚡ Dasha Chidra Warning:** ${cr.chidraStatus.phase} (${cr.chidraStatus.description})\n`;
      }
      if (cr.sambandha) {
        text += `  - **Mutual Sambandha (MD-AD):** ${cr.sambandha.label} - ${cr.sambandha.description}\n`;
      }
      if (cr.specialWarning) {
        text += `  - **⚠️ Classical Alert (Mehta Ch. XV):** ${cr.specialWarning}\n`;
      }
    }
    text += `\n**Upcoming Mahadashas Sequence:**\n`;
    for (let md of dasha.mahadashas.slice(0, 5)) {
      text += `- **${md.lord} Mahadasha**: ${md.startStr} to ${md.endStr} (${md.actualDurationYears} years)\n`;
    }
  }

  if (yoginiDasha && yoginiDasha.currentRunning) {
    const ycr = yoginiDasha.currentRunning;
    text += `\n### B. Yogini Dasha (36-Year Cycles - Shiva-Parvati System):\n`;
    text += `- **Birth Balance:** ${yoginiDasha.balanceText}\n`;
    text += `- **🔥 CURRENTLY ACTIVE YOGINI:**\n`;
    text += `  - **Cycle:** ${ycr.cycle} (36-Year Cycle ${ycr.cycle})\n`;
    text += `  - **Mahadasha (MD):** ${ycr.mdName} (Lord: ${ycr.mdLord}, ${ycr.mdNature}) [${ycr.mdSpan}]\n`;
    text += `  - **Antardasha (AD):** ${ycr.adName} (Lord: ${ycr.adLord}, ${ycr.adNature}) [${ycr.adSpan}] (Progress: ${ycr.progressPct}%)\n`;
    text += `  - **📖 Classical Yogini Prediction (Mansagri / Mehta Ch. XVI):** "${ycr.classicalReading}"\n`;
    text += `\n*Methodology Note for Gemini Consultation: Follow K.N. Rao and M.S. Mehta's dual-dasha synchronization rule. Verify whether significant life events (career breakthroughs, marriage, transfers, or challenges) are doubly indicated when both Vimshottari rulers and Yogini rulers simultaneously activate the relevant houses and karakas.* \n`;
  }

  // 5. Transits Section
  if (transits && transits.transitSummary) {
    text += `\n## 5. REAL-TIME PLANETARY TRANSITS (GOCHAR)\n`;
    if (transits.alerts && transits.alerts.length > 0) {
      text += `**Major Transit Formations:**\n`;
      for (let al of transits.alerts) {
        text += `- **${al.title}**: ${al.desc}\n`;
      }
      text += `\n`;
    }
    text += `| Transiting Planet | Sign & Degree | House from Lagna | House from Moon | SAV Bindus | Verdict |\n`;
    text += `|---|---|---|---|---|---|\n`;
    for (let tp of transits.transitSummary) {
      const retro = tp.isRetro ? ' [R]' : '';
      text += `| ${tp.name}${retro} | ${tp.signName} ${tp.dmsFormatted} | House ${tp.houseFromLagna} | House ${tp.houseFromMoon} | ${tp.savPoints} pts | ${tp.savVerdict} |\n`;
    }
  }

  // Parashari Drishti (Aspects) Section
  if (drishti) {
    text += `\n## 6. PARASHARI PLANETARY ASPECTS (DRISHTI)\n`;
    if (drishti.mutualAspects && drishti.mutualAspects.length > 0) {
      text += `**Key Mutual Aspects (Sambandha):**\n`;
      for (let ma of drishti.mutualAspects) {
        text += `- ${ma.description}\n`;
      }
      text += `\n`;
    }
    if (drishti.aspectsOnPlanets && drishti.aspectsOnPlanets.length > 0) {
      text += `**Full Planetary Aspects Matrix:**\n`;
      for (let ap of drishti.aspectsOnPlanets) {
        text += `- ${ap.aspectingPlanet} (H${ap.fromHouse}) casts ${ap.aspectType} on ${ap.aspectedPlanet} (H${ap.toHouse})\n`;
      }
      text += `\n`;
    }
  }

  // Shadbala (Six-fold Planetary Strength) Section
  if (shadbala && shadbala.planets && shadbala.planets.length > 0) {
    text += `\n## 7. SHADBALA (SIX-FOLD PLANETARY POTENCY & RANKING)\n`;
    text += `| Planet | Total Rupas | Req Rupas | Ratio % | Rank | Classical Verdict |\n`;
    text += `|---|---|---|---|---|---|\n`;
    for (let p of shadbala.planets) {
      text += `| ${p.name} | ${p.totalRupas.toFixed(2)} | ${p.requiredRupas.toFixed(1)} | ${p.ratioPercent}% | #${p.rank} | ${p.verdict} |\n`;
    }
    if (shadbala.summary) {
      text += `\n*Top Strength Planet:* **${shadbala.summary.topPlanet.name}** (${shadbala.summary.topPlanet.ratioPercent}% of req)\n`;
      text += `*Most Vulnerable Planet:* **${shadbala.summary.weakPlanet.name}** (${shadbala.summary.weakPlanet.ratioPercent}% of req)\n`;
    }
    text += `\n`;
  }

  text += `\n## 8. DETECTED SPECIAL YOGAS & FORMATIONS (BPHS D-A-R-E MATRIX)\n`;
  if (yogas && yogas.length > 0) {
    for (let y of yogas) {
      const strengthTag = y.strength ? ` (${y.strength})` : '';
      const planetsTag = y.planets && y.planets.length > 0 ? ` [Grahas: ${y.planets.join(', ')}]` : '';
      const dashaTag = y.dashaTiming ? ` | Timing: ${y.dashaTiming}` : '';
      text += `- **${y.name}** [${y.dare ? y.dare + ' - ' : ''}${y.category}]${strengthTag}${planetsTag}: ${y.description}${dashaTag}\n`;
    }
  } else {
    text += `- No major classical yogas detected automatically.\n`;
  }

  // Section 9: Verified Historical Life Events (for Birth Time Rectification & Calibration)
  if (lifeEvents && lifeEvents.length > 0) {
    text += formatLifeEventsForPrompt(lifeEvents, planets, dasha, ashtakavarga, birthDate);
  }

  text += `\n---\n`;
  text += `## USER CONSULTATION QUESTION:\n`;
  text += `"${finalQuestion}"\n\n`;
  text += `Please structure your response with:\n`;
  text += `1. **Executive Astrological Summary** (Core chart theme & temperament)\n`;
  text += `2. **In-Depth Answer to the User's Consultation Question**\n`;
  text += `3. **Planetary Influences & Divisional Confirmation** (Synthesizing D1, D9, D10 & Ashtakavarga)\n`;
  text += `4. **Dasha & Transit (Gochar) Correlation** (How current timing & transits impact this)\n`;
  text += `5. **Actionable Wisdom & Guidance** (Practical decisions, spiritual perspective, and remedies)\n`;

  return text;
}
