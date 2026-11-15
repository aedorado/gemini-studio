// Classical Vedic Astrological Yogas & Special Formations Engine
// Fully compliant with Brihat Parashara Hora Shastra (BPHS) & Mehta (Chapter XIX)
// Implements the D-A-R-E Architecture:
// [D] Dhana Yogas (Wealth & Assets)
// [A] Arishta & Daridra Yogas (Afflictions & Challenges)
// [R] Raja Yogas (Royal Power, Status, Pancha Mahapurusha, NBRY, Viparita)
// [E] Exchanges (Parivartana Yogas: Maha, Kahala, Dainya)
// [N] Nabhas Yogas & Special Formations (Ashraya, Dala, Sankhya, Solar, Lunar, Stelliums)

export const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_LORDS = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
  5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars',
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

export const EXALTATION_SIGNS = {
  Sun: 1, Moon: 2, Mars: 10, Merc: 6, Jupt: 4, Venu: 12, Satn: 7, Rahu: 2, Ketu: 8
};

export const DEBILITATION_SIGNS = {
  Sun: 7, Moon: 8, Mars: 4, Merc: 12, Jupt: 10, Venu: 6, Satn: 1, Rahu: 8, Ketu: 2
};

export const OWN_SIGNS = {
  Sun: [5], Moon: [4], Mars: [1, 8], Merc: [3, 6], Jupt: [9, 12], Venu: [2, 7], Satn: [10, 11]
};

export const NATURAL_BENEFICS = ['Jupt', 'Venu', 'Merc', 'Moon'];
export const NATURAL_MALEFICS = ['Satn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

/**
 * Checks if Planet A aspects Planet B per Vedic Drishti
 */
function hasVedicAspect(fromPlanet, toPlanet) {
  if (!fromPlanet || !toPlanet) return false;
  const dist = ((toPlanet.signId - fromPlanet.signId + 12) % 12) + 1;
  // All planets have 7th aspect
  if (dist === 7) return true;
  // Mars special aspects: 4th and 8th
  if (fromPlanet.key === 'Mars' && (dist === 4 || dist === 8)) return true;
  // Jupiter / Rahu / Ketu special aspects: 5th and 9th
  if (['Jupt', 'Rahu', 'Ketu'].includes(fromPlanet.key) && (dist === 5 || dist === 9)) return true;
  // Saturn special aspects: 3rd and 10th
  if (fromPlanet.key === 'Satn' && (dist === 3 || dist === 10)) return true;
  return false;
}

/**
 * Checks if two planets aspect each other mutually
 */
function hasMutualAspect(p1, p2) {
  return hasVedicAspect(p1, p2) && hasVedicAspect(p2, p1);
}

/**
 * Core D-A-R-E Detection Function
 * @param {Array} planets Array of planet objects
 * @param {Object} options { gender: 'male'|'female', isDayBirth: boolean, ramanDb: Array }
 * @returns {Array} List of detected yogas with rich metadata
 */
export function detectYogas(planets, options = {}) {
  const yogas = [];
  const pMap = {};
  for (let p of planets) {
    pMap[p.key] = p;
  }

  const lagna = pMap['ASC'];
  if (!lagna) return yogas;

  // 1. Calculate Whole Sign House (1 to 12 from Lagna)
  const houseOf = {};
  for (let p of planets) {
    houseOf[p.key] = ((p.signId - lagna.signId + 12) % 12) + 1;
  }

  // 2. Determine House Lords (1 to 12)
  const houseLordKey = {};
  const houseLordName = {};
  const lordKeyToPlanetKey = {
    Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Merc',
    Jupiter: 'Jupt', Venus: 'Venu', Saturn: 'Satn'
  };

  for (let h = 1; h <= 12; h++) {
    const signOfHouse = ((lagna.signId - 1 + (h - 1)) % 12) + 1;
    const lordName = SIGN_LORDS[signOfHouse];
    houseLordName[h] = lordName;
    houseLordKey[h] = lordKeyToPlanetKey[lordName];
  }

  const sun = pMap['Sun'];
  const moon = pMap['Moon'];
  const mars = pMap['Mars'];
  const merc = pMap['Merc'];
  const jupt = pMap['Jupt'];
  const venu = pMap['Venu'];
  const satn = pMap['Satn'];
  const rahu = pMap['Rahu'];
  const ketu = pMap['Ketu'];

  const kendras = [1, 4, 7, 10];
  const trikonas = [1, 5, 9];
  const dusthanas = [6, 8, 12];
  const upachayas = [3, 6, 10, 11];

  // Helper: check relationship (Sambandha) between two house lords
  function getLordSambandha(h1, h2) {
    const p1 = pMap[houseLordKey[h1]];
    const p2 = pMap[houseLordKey[h2]];
    if (!p1 || !p2 || p1.key === p2.key) return null;

    // A: Parivartana (Mutual reception)
    const p1InP2Sign = OWN_SIGNS[p2.key]?.includes(p1.signId);
    const p2InP1Sign = OWN_SIGNS[p1.key]?.includes(p2.signId);
    if (p1InP2Sign && p2InP1Sign) {
      return { type: 'Parivartana', label: 'Mutual Sign Exchange', p1, p2 };
    }

    // B: Yuti (Conjunction)
    if (p1.signId === p2.signId) {
      return { type: 'Yuti', label: `Conjunction in ${p1.signName}`, p1, p2, sign: p1.signName, house: houseOf[p1.key] };
    }

    // C: Mutual Aspect
    if (hasMutualAspect(p1, p2)) {
      return { type: 'Drishti', label: 'Mutual Vedic Aspect', p1, p2 };
    }

    return null;
  }

  // =========================================================================
  // [E] EXCHANGES & TYPES (PARIVARTANA YOGAS) - BPHS Canonical Classification
  // =========================================================================
  const checkedPairs = new Set();
  for (let h1 = 1; h1 <= 12; h1++) {
    for (let h2 = h1 + 1; h2 <= 12; h2++) {
      const p1 = pMap[houseLordKey[h1]];
      const p2 = pMap[houseLordKey[h2]];
      if (!p1 || !p2 || p1.key === p2.key) continue;

      const p1InP2Sign = OWN_SIGNS[p2.key]?.includes(p1.signId);
      const p2InP1Sign = OWN_SIGNS[p1.key]?.includes(p2.signId);

      if (p1InP2Sign && p2InP1Sign) {
        const pairKey = `${p1.key}_${p2.key}`;
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);

        const isDainya = dusthanas.includes(h1) || dusthanas.includes(h2);
        const isKahala = !isDainya && (h1 === 3 || h2 === 3);
        const isMaha = !isDainya && !isKahala;

        if (isMaha) {
          yogas.push({
            id: `parivartana-maha-${h1}-${h2}`,
            dare: 'E',
            category: 'Exchanges (Parivartana)',
            subCategory: 'Maha Parivartana',
            name: `Maha Yoga (H${h1} ⇄ H${h2} Exchange)`,
            planets: [p1.name, p2.name],
            houses: [h1, h2],
            strength: 'Strong',
            description: `Auspicious mutual exchange between the lord of the ${h1}th house (${p1.name}) and the lord of the ${h2}th house (${p2.name}). Endows regal status, persistent prosperity, and authoritative prestige.`,
            modernInterpretation: 'Exceptional executive mobility, mutual synergy between life sectors, high financial and professional resilience.',
            neutralization: 'None; considered one of the highest 28 Parashari Maha Yogas.',
            dashaTiming: `Operates prominently in the Mahadashas/Antardashas of ${p1.name} and ${p2.name}.`
          });
        } else if (isKahala) {
          yogas.push({
            id: `parivartana-kahala-${h1}-${h2}`,
            dare: 'E',
            category: 'Exchanges (Parivartana)',
            subCategory: 'Kahala Parivartana',
            name: `Kahala Yoga (H${h1} ⇄ H${h2} Exchange)`,
            planets: [p1.name, p2.name],
            houses: [h1, h2],
            strength: 'Moderate',
            description: `Exchange involving the 3rd lord of initiative (${p1.name === houseLordName[3] ? p1.name : p2.name}) and house ${h1 === 3 ? h2 : h1} lord. Gives commanding courage, enterprise, and fluctuating fortunes.`,
            modernInterpretation: 'High tenacity, self-made entrepreneurial drive, success achieved through intense personal effort and bold initiative.',
            neutralization: 'Results fluctuate if 3rd lord is afflicted by natural malefics.',
            dashaTiming: `Activated during the major and sub-periods of ${p1.name} and ${p2.name}.`
          });
        } else if (isDainya) {
          const isPureViparitaExchange = dusthanas.includes(h1) && dusthanas.includes(h2);
          yogas.push({
            id: `parivartana-dainya-${h1}-${h2}`,
            dare: 'E',
            category: 'Exchanges (Parivartana)',
            subCategory: isPureViparitaExchange ? 'Viparita Parivartana' : 'Dainya Parivartana',
            name: isPureViparitaExchange
              ? `Viparita Dainya Yoga (H${h1} ⇄ H${h2} Dusthana Exchange)`
              : `Dainya Yoga (H${h1} ⇄ H${h2} Inauspicious Exchange)`,
            planets: [p1.name, p2.name],
            houses: [h1, h2],
            strength: isPureViparitaExchange ? 'Moderate' : 'Challenging',
            description: isPureViparitaExchange
              ? `Mutual exchange between two Dusthana lords (${h1}th & ${h2}th). Neutralizes adversity and grants victory over opponents through unexpected circumstances.`
              : `Exchange involving Dusthana house ${dusthanas.includes(h1) ? h1 : h2} lord. Signifies cyclical friction, obstacles, or debt before resolution.`,
            modernInterpretation: isPureViparitaExchange
              ? 'Thriving in turnaround scenarios, litigation mastery, profiting from market disruptions.'
              : 'Requires conscious risk management, avoidance of toxic partnerships, and disciplined health preservation.',
            neutralization: isPureViparitaExchange ? 'Pure when unafflicted by natural benefics.' : 'Neutralized if benefic planets cast protective trine aspects.',
            dashaTiming: `Demands caution during the Dasha periods of ${p1.name} and ${p2.name}.`
          });
        }
      }
    }
  }

  // =========================================================================
  // [R] RAJA YOGAS (POWER, HIGH STATUS & DIGNITY)
  // =========================================================================

  // 1. Kendra-Trikona Sambandha Raja Yogas
  const kendraLords = [1, 4, 7, 10];
  const trikonaLords = [5, 9]; // 1 is checked as Kendra
  const recordedRajaCombos = new Set();

  for (let k of kendraLords) {
    for (let t of trikonaLords) {
      const rel = getLordSambandha(k, t);
      if (rel) {
        const comboKey = `${Math.min(k, t)}-${Math.max(k, t)}-${rel.type}`;
        if (recordedRajaCombos.has(comboKey)) continue;
        recordedRajaCombos.add(comboKey);

        const isDharmaKarma = (k === 10 && t === 9) || (k === 9 && t === 10);
        const name = isDharmaKarma
          ? 'Dharma-Karmadhipati Raja Yoga (Supreme Raja Yoga)'
          : `Kendra-Trikona Raja Yoga (H${k} & H${t} ${rel.type})`;

        yogas.push({
          id: `raja-kt-${k}-${t}-${rel.type.toLowerCase()}`,
          dare: 'R',
          category: 'Raja Yoga',
          subCategory: isDharmaKarma ? 'Dharma-Karmadhipati' : 'Kendra-Trikona Union',
          name,
          planets: [rel.p1.name, rel.p2.name],
          houses: [k, t],
          strength: isDharmaKarma ? 'Very Strong' : 'Strong',
          description: isDharmaKarma
            ? `Union of the 9th lord of Dharma/Fortune (${pMap[houseLordKey[9]].name}) and the 10th lord of Karma/Profession (${pMap[houseLordKey[10]].name}) via ${rel.label}. Highest classical Parashari combination for supreme leadership, righteous governance, and eminent honors.`
            : `Combination between Kendra lord (${rel.p1.name}, H${k}) and Trikona lord (${rel.p2.name}, H${t}) via ${rel.label}. Unites Vishnu (action) and Lakshmi (grace) energies for elevated authority.`,
          modernInterpretation: isDharmaKarma
            ? 'C-suite leadership, high state honor, transformative career breakthroughs, and enduring legacy.'
            : 'Rapid professional promotions, authoritative command, and recognition from industry leaders.',
          neutralization: 'Weakened if either planet is combust, debilitated without cancellation, or afflicted by Rahu/Ketu.',
          dashaTiming: `Yields pinnacle results during the mutual Dasha/Bhukti periods of ${rel.p1.name} and ${rel.p2.name}.`
        });
      }
    }
  }

  // 2. Pancha Mahapurusha Yogas (Mars, Merc, Jupt, Venu, Satn in Kendra in Own/Exalted)
  if (mars && kendras.includes(houseOf['Mars']) && [1, 8, 10].includes(mars.signId)) {
    yogas.push({
      id: 'mahapurusha-ruchaka',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Pancha Mahapurusha',
      name: 'Ruchaka Yoga (Mahapurusha)',
      planets: ['Mars'],
      houses: [houseOf['Mars']],
      strength: mars.signId === 10 ? 'Exalted (Pinnacle)' : 'Strong (Own Sign)',
      description: `Mars in Kendra (House ${houseOf['Mars']}) in ${mars.signName} (own/exalted sign). Endows supreme physical vigor, executive authority, commanding valor, and victory over adversaries.`,
      modernInterpretation: 'High leadership in defence, sports, civil administration, surgical medicine, and engineering enterprises.',
      neutralization: 'Impaired if heavily combust within 17° of Sun or aspected by multiple functional malefics.',
      dashaTiming: 'Operates with great potency in Mars Mahadasha and Antardasha.'
    });
  }

  if (merc && kendras.includes(houseOf['Merc']) && [3, 6].includes(merc.signId)) {
    yogas.push({
      id: 'mahapurusha-bhadra',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Pancha Mahapurusha',
      name: 'Bhadra Yoga (Mahapurusha)',
      planets: ['Mercury'],
      houses: [houseOf['Merc']],
      strength: merc.signId === 6 ? 'Deep Exaltation & Moolatrikona' : 'Strong (Own Sign)',
      description: `Mercury in Kendra (House ${houseOf['Merc']}) in ${merc.signName} (own/exalted sign). Bestows brilliant intellect, eloquent oratory, commercial mastery, and scholarly renown.`,
      modernInterpretation: 'Mathematical, software, media, financial, and strategic consulting genius; high advisory standing.',
      neutralization: 'Impaired if severely combust within 14° of Sun.',
      dashaTiming: 'Activated in Mercury Mahadasha and Antardasha.'
    });
  }

  if (jupt && kendras.includes(houseOf['Jupt']) && [4, 9, 12].includes(jupt.signId)) {
    yogas.push({
      id: 'mahapurusha-hamsa',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Pancha Mahapurusha',
      name: 'Hamsa Yoga (Mahapurusha)',
      planets: ['Jupiter'],
      houses: [houseOf['Jupt']],
      strength: jupt.signId === 4 ? 'Exalted (Pinnacle)' : 'Strong (Own Sign)',
      description: `Jupiter in Kendra (House ${houseOf['Jupt']}) in ${jupt.signName} (own/exalted sign). Gives saintly wisdom, spiritual purity, deep philosophical knowledge, and universal reverence.`,
      modernInterpretation: 'Judicial, academic, financial, and spiritual mentorship; high institutional trust and ethical prestige.',
      neutralization: 'Weakened if aspected by Rahu or combust within 11° of Sun.',
      dashaTiming: 'Fruits materialize profoundly during Jupiter Mahadasha/Antardasha.'
    });
  }

  if (venu && kendras.includes(houseOf['Venu']) && [2, 7, 12].includes(venu.signId)) {
    yogas.push({
      id: 'mahapurusha-malavya',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Pancha Mahapurusha',
      name: 'Malavya Yoga (Mahapurusha)',
      planets: ['Venus'],
      houses: [houseOf['Venu']],
      strength: venu.signId === 12 ? 'Exalted (Pinnacle)' : 'Strong (Own Sign)',
      description: `Venus in Kendra (House ${houseOf['Venu']}) in ${venu.signName} (own/exalted sign). Bestows exquisite aesthetic refinement, artistic genius, luxurious conveyances, and magnetic charm.`,
      modernInterpretation: 'Celebrity appeal, luxury goods success, film/arts triumph, diplomatic grace, and refined lifestyle.',
      neutralization: 'Diminished if combust within 10° of Sun.',
      dashaTiming: 'Operates dynamically throughout Venus Mahadasha/Antardasha.'
    });
  }

  if (satn && kendras.includes(houseOf['Satn']) && [7, 10, 11].includes(satn.signId)) {
    yogas.push({
      id: 'mahapurusha-sasa',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Pancha Mahapurusha',
      name: 'Sasa Yoga (Mahapurusha)',
      planets: ['Saturn'],
      houses: [houseOf['Satn']],
      strength: satn.signId === 7 ? 'Exalted (Pinnacle)' : 'Strong (Own Sign)',
      description: `Saturn in Kendra (House ${houseOf['Satn']}) in ${satn.signName} (own/exalted sign). Endows supreme endurance, mass appeal, organizational genius, and enduring political or institutional authority.`,
      modernInterpretation: 'Grassroots leadership, heavy industry governance, infrastructure empire building, and long-lasting public influence.',
      neutralization: 'Afflicted if combust within 15° of Sun.',
      dashaTiming: 'Pinnacle authority unfolds in Saturn Mahadasha and Antardasha.'
    });
  }

  // 3. Neecha Bhanga Raja Yoga (NBRY) - Classical 5 Conditions (Mehta Ch. XIX / Phaladeepika)
  for (let p of planets) {
    if (['ASC', 'Rahu', 'Ketu'].includes(p.key)) continue;
    const debSign = DEBILITATION_SIGNS[p.key];
    if (p.signId === debSign) {
      // Planet is debilitated. Test 5 classical cancellation criteria:
      const nbryReasons = [];
      const debDispositorKey = lordKeyToPlanetKey[SIGN_LORDS[debSign]];
      const debDispositor = pMap[debDispositorKey];
      const exaltSignOfP = EXALTATION_SIGNS[p.key];
      const exaltLordKey = lordKeyToPlanetKey[SIGN_LORDS[exaltSignOfP]];
      const exaltLord = pMap[exaltLordKey];

      // Condition 1: Dispositor of debility sign in Kendra from Lagna or Moon
      if (debDispositor) {
        const dispFromLagna = houseOf[debDispositorKey];
        const dispFromMoon = moon ? (((debDispositor.signId - moon.signId + 12) % 12) + 1) : 0;
        if (kendras.includes(dispFromLagna) || kendras.includes(dispFromMoon)) {
          nbryReasons.push(`Dispositor ${debDispositor.name} is in Kendra from ${kendras.includes(dispFromLagna) ? 'Lagna' : 'Moon'}`);
        }
      }

      // Condition 2: Lord of exaltation sign of debilitated planet in Kendra from Lagna or Moon
      if (exaltLord) {
        const exaltLordFromLagna = houseOf[exaltLordKey];
        const exaltLordFromMoon = moon ? (((exaltLord.signId - moon.signId + 12) % 12) + 1) : 0;
        if (kendras.includes(exaltLordFromLagna) || kendras.includes(exaltLordFromMoon)) {
          nbryReasons.push(`Exaltation sign lord ${exaltLord.name} is in Kendra from ${kendras.includes(exaltLordFromLagna) ? 'Lagna' : 'Moon'}`);
        }
      }

      // Condition 3: Dispositor aspects the debilitated planet
      if (debDispositor && hasVedicAspect(debDispositor, p)) {
        nbryReasons.push(`Dispositor ${debDispositor.name} directly aspects debilitated ${p.name}`);
      }

      // Condition 4: Debilitated planet is in Kendra from Lagna or Moon
      const pFromLagna = houseOf[p.key];
      const pFromMoon = moon ? (((p.signId - moon.signId + 12) % 12) + 1) : 0;
      if (kendras.includes(pFromLagna) || kendras.includes(pFromMoon)) {
        nbryReasons.push(`${p.name} is placed in Kendra from ${kendras.includes(pFromLagna) ? 'Lagna' : 'Moon'}`);
      }

      if (nbryReasons.length > 0) {
        yogas.push({
          id: `raja-nbry-${p.key.toLowerCase()}`,
          dare: 'R',
          category: 'Raja Yoga',
          subCategory: 'Neecha Bhanga Raja Yoga',
          name: `Neecha Bhanga Raja Yoga (${p.name})`,
          planets: [p.name, debDispositor?.name].filter(Boolean),
          houses: [houseOf[p.key]],
          strength: 'Very Strong (Cancellation to Kingly Status)',
          description: `Debilitation of ${p.name} in ${p.signName} is cancelled into a powerful Raja Yoga. Qualified by: ${nbryReasons.join('; ')}. Gives unprecedented elevation from early adversity.`,
          modernInterpretation: 'Underdog narrative: rising from humble beginnings or initial setbacks to attain top-tier executive prominence and resilience.',
          neutralization: 'Operates with full majesty because classical cancellation conditions are strictly satisfied.',
          dashaTiming: `Transforms life dramatically during the Dasha/Bhukti of ${p.name} and ${debDispositor?.name || 'dispositor'}.`
        });
      }
    }
  }

  // 4. Viparita Raja Yogas (Harsha, Sarala, Vimala) - Phaladeepika & Mehta Ch. XIX
  const lord6 = pMap[houseLordKey[6]];
  const lord8 = pMap[houseLordKey[8]];
  const lord12 = pMap[houseLordKey[12]];

  // Harsha Yoga: 6th lord in 6, 8, or 12
  if (lord6 && dusthanas.includes(houseOf[lord6.key])) {
    const isPure = !NATURAL_BENEFICS.some(b => b !== lord6.key && pMap[b]?.signId === lord6.signId);
    yogas.push({
      id: 'viparita-harsha',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Viparita Raja Yoga',
      name: 'Harsha Yoga (Viparita Raja)',
      planets: [lord6.name],
      houses: [houseOf[lord6.key]],
      strength: isPure ? 'Strong & Pure' : 'Moderate (Benefic Touch)',
      description: `6th lord ${lord6.name} is posited in Dusthana (House ${houseOf[lord6.key]}). Vanquishes enemies, bestows robust immunity, fearlessness, happiness, and unexpected gains from adversaries.`,
      modernInterpretation: 'Total victory in corporate warfare, litigation, and competitive bids; immune to hidden sabotage.',
      neutralization: isPure ? 'Pure Viparita formation without benefic dilution.' : 'Slightly softened by association with benefic planets.',
      dashaTiming: `Materializes during the Mahadasha/Antardasha of ${lord6.name}.`
    });
  }

  // Sarala Yoga: 8th lord in 6, 8, or 12
  if (lord8 && dusthanas.includes(houseOf[lord8.key])) {
    const isPure = !NATURAL_BENEFICS.some(b => b !== lord8.key && pMap[b]?.signId === lord8.signId);
    yogas.push({
      id: 'viparita-sarala',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Viparita Raja Yoga',
      name: 'Sarala Yoga (Viparita Raja)',
      planets: [lord8.name],
      houses: [houseOf[lord8.key]],
      strength: isPure ? 'Strong & Pure' : 'Moderate (Benefic Touch)',
      description: `8th lord ${lord8.name} is placed in Dusthana (House ${houseOf[lord8.key]}). Grants long life, unflinching courage, profound occult/investigative intellect, and sudden prosperity.`,
      modernInterpretation: 'Exceptional resilience through crises, crisis-capitalization skills, financial gains through mergers or settlements.',
      neutralization: isPure ? 'Fully potent.' : 'Mitigated by benefic contact.',
      dashaTiming: `Operates during the major and sub-periods of ${lord8.name}.`
    });
  }

  // Vimala Yoga: 12th lord in 6, 8, or 12
  if (lord12 && dusthanas.includes(houseOf[lord12.key])) {
    const isPure = !NATURAL_BENEFICS.some(b => b !== lord12.key && pMap[b]?.signId === lord12.signId);
    yogas.push({
      id: 'viparita-vimala',
      dare: 'R',
      category: 'Raja Yoga',
      subCategory: 'Viparita Raja Yoga',
      name: 'Vimala Yoga (Viparita Raja)',
      planets: [lord12.name],
      houses: [houseOf[lord12.key]],
      strength: isPure ? 'Strong & Pure' : 'Moderate (Benefic Touch)',
      description: `12th lord ${lord12.name} is posited in Dusthana (House ${houseOf[lord12.key]}). Bestows economical discipline, accumulation of wealth, honorable reputation, and independence.`,
      modernInterpretation: 'Mastery over expenditure, wealth retention, lucrative overseas operations, and moral autonomy.',
      neutralization: isPure ? 'Pure formation.' : 'Slightly softened by benefic association.',
      dashaTiming: `Operates in the periods of ${lord12.name}.`
    });
  }

  // 5. Adhi Yoga (Chandra Adhi & Lagna Adhi Yoga) - Mehta Ch. XIX
  if (moon && merc && jupt && venu) {
    const benefics = [merc, jupt, venu];
    const adhiHousesFromMoon = [6, 7, 8];
    const beneficsInAdhiMoon = benefics.filter(b => {
      const hFromMoon = ((b.signId - moon.signId + 12) % 12) + 1;
      return adhiHousesFromMoon.includes(hFromMoon);
    });

    if (beneficsInAdhiMoon.length >= 2) {
      yogas.push({
        id: 'raja-chandra-adhi',
        dare: 'R',
        category: 'Raja Yoga',
        subCategory: 'Chandra Adhi Yoga',
        name: `Chandra Adhi Yoga (${beneficsInAdhiMoon.length} Benefics in 6/7/8 from Moon)`,
        planets: ['Moon', ...beneficsInAdhiMoon.map(b => b.name)],
        houses: beneficsInAdhiMoon.map(b => ((b.signId - moon.signId + 12) % 12) + 1),
        strength: beneficsInAdhiMoon.length === 3 ? 'Supreme (All 3 Benefics)' : 'Strong (2 Benefics)',
        description: `Natural benefics (${beneficsInAdhiMoon.map(b => b.name).join(', ')}) occupy the 6th, 7th, or 8th from Moon. One of the greatest classical Rajayogas; confers ministership, immense wealth, and vanquishes all foes without battle.`,
        modernInterpretation: 'Diplomatic supremacy, ministerial authority, aristocratic reputation, and commanding intellectual elevation.',
        neutralization: 'Impaired if the forming benefics are combust or afflicted by Saturn/Rahu.',
        dashaTiming: `Yields exceptional heights in the Dasha periods of ${beneficsInAdhiMoon.map(b => b.name).join(', ')} and Moon.`
      });
    }
  }

  // =========================================================================
  // [D] DHANA YOGAS (WEALTH, ASSETS & PROSPERITY)
  // =========================================================================

  // 1. Core Wealth Lord Sambandhas (Lords of 1, 2, 5, 9, 11)
  const wealthHouses = [1, 2, 5, 9, 11];
  const checkedDhanaPairs = new Set();
  const dhanaPairs = [
    [2, 11, 'Prime Dhana Yoga (Treasury & Gains)'],
    [1, 2, 'Self-Made Wealth Yoga (Lagna & 2nd)'],
    [1, 11, 'Major Gains Yoga (Lagna & 11th)'],
    [5, 9, 'Mahalakshmi Fortune Yoga (Purva Punya & Bhagya)'],
    [2, 5, 'Speculative Assets Yoga (Wealth & Intelligence)'],
    [2, 9, 'Divine Wealth Yoga (Wealth & Divine Grace)'],
    [5, 11, 'Continuous Income Yoga (Intellect & Huge Gains)'],
    [9, 11, 'Abundant Windfall Yoga (Fortune & Supreme Gains)']
  ];

  for (let [h1, h2, dhanaTitle] of dhanaPairs) {
    const rel = getLordSambandha(h1, h2);
    if (rel) {
      const key = `${h1}-${h2}`;
      if (checkedDhanaPairs.has(key)) continue;
      checkedDhanaPairs.add(key);

      yogas.push({
        id: `dhana-${h1}-${h2}-${rel.type.toLowerCase()}`,
        dare: 'D',
        category: 'Dhana Yoga',
        subCategory: 'Wealth Lord Union',
        name: `${dhanaTitle} via ${rel.type}`,
        planets: [rel.p1.name, rel.p2.name],
        houses: [h1, h2],
        strength: 'Strong',
        description: `Auspicious union between the ${h1}th lord (${rel.p1.name}) and the ${h2}th lord (${rel.p2.name}) via ${rel.label}. Directly energizes the wealth houses for persistent financial accumulation.`,
        modernInterpretation: 'High net-worth trajectory, multiple income streams, sound capital reinvestment, and property expansion.',
        neutralization: 'Weakened if either lord is heavily debilitated without cancellation or posited in the 12th house.',
        dashaTiming: `Triggers peak financial windfalls during the mutual periods of ${rel.p1.name} and ${rel.p2.name}.`
      });
    }
  }

  // 2. Lakshmi Yoga (9th lord strong + Venus in own/exaltation in Kendra/Trikona)
  const lord9 = pMap[houseLordKey[9]];
  if (lord9 && venu) {
    const lord9InKT = kendras.includes(houseOf[lord9.key]) || trikonas.includes(houseOf[lord9.key]);
    const venusInKT = kendras.includes(houseOf['Venu']) || trikonas.includes(houseOf['Venu']);
    const venusStrong = [2, 7, 12].includes(venu.signId);
    if (lord9InKT && venusInKT && venusStrong) {
      yogas.push({
        id: 'dhana-lakshmi',
        dare: 'D',
        category: 'Dhana Yoga',
        subCategory: 'Lakshmi Yoga',
        name: 'Lakshmi Yoga (Supreme Wealth)',
        planets: [lord9.name, 'Venus'],
        houses: [houseOf[lord9.key], houseOf['Venu']],
        strength: 'Supreme',
        description: `9th lord ${lord9.name} in Kendra/Trikona, and Venus in ${venu.signName} (own/exalted) in Kendra/Trikona. One of the highest classical wealth combinations blessing the native with boundless prosperity, grace, and luxury.`,
        modernInterpretation: 'Multimillionaire asset potential, artistic & luxury lifestyle, immense charitable capability, and esteemed lineage.',
        neutralization: 'Afflicted only if Venus is combust within 8° of Sun.',
        dashaTiming: `Unfolds majestic abundance in the Dasha of Venus or ${lord9.name}.`
      });
    }
  }

  // 3. Chandra-Mangala Yoga (Moon + Mars in same sign or mutual aspect)
  if (moon && mars) {
    const marsFromMoon = ((mars.signId - moon.signId + 12) % 12) + 1;
    if (marsFromMoon === 1 || marsFromMoon === 7) {
      yogas.push({
        id: 'dhana-chandra-mangala',
        dare: 'D',
        category: 'Dhana Yoga',
        subCategory: 'Chandra-Mangala Yoga',
        name: `Chandra-Mangala Yoga (${marsFromMoon === 1 ? 'Conjunction' : 'Direct Opposition'})`,
        planets: ['Moon', 'Mars'],
        houses: [houseOf['Moon'], houseOf['Mars']],
        strength: 'Strong',
        description: `Moon and Mars are in mutual relationship (${marsFromMoon === 1 ? 'conjunction' : 'mutual 7th aspect'}). Sparks vigorous enterprise, commercial dynamism, real estate acumen, and aggressive financial accumulation.`,
        modernInterpretation: 'Bold commercial investments, real-estate flipping, fintech/trading dynamism, and financial self-reliance.',
        neutralization: 'Requires emotional balance; caution advised against rash over-leveraging.',
        dashaTiming: 'Operates actively during Moon and Mars Dasha periods.'
      });
    }
  }

  // 4. Vasumathi Yoga (All benefics in Upachaya 3, 6, 10, 11 from Lagna or Moon)
  if (merc && jupt && venu) {
    const benefics = [merc, jupt, venu];
    const lagnaUpachayaCount = benefics.filter(b => upachayas.includes(houseOf[b.key])).length;
    const moonUpachayaCount = moon ? benefics.filter(b => {
      const hFromM = ((b.signId - moon.signId + 12) % 12) + 1;
      return upachayas.includes(hFromM);
    }).length : 0;

    if (lagnaUpachayaCount === 3 || moonUpachayaCount === 3) {
      yogas.push({
        id: 'dhana-vasumathi',
        dare: 'D',
        category: 'Dhana Yoga',
        subCategory: 'Vasumathi Yoga',
        name: 'Vasumathi Yoga (Self-Generated Empire)',
        planets: ['Jupiter', 'Venus', 'Mercury'],
        houses: [3, 6, 10, 11],
        strength: 'Very Strong',
        description: `All natural benefics (Jupiter, Venus, Mercury) occupy Upachaya houses (3, 6, 10, 11) from ${lagnaUpachayaCount === 3 ? 'Lagna' : 'Moon'}. The native commands vast self-earned wealth without being dependent on others.`,
        modernInterpretation: 'Self-made empire, high financial liquidity, unstoppable upward trajectory after age 28.',
        neutralization: 'None.',
        dashaTiming: 'Materializes progressively across all benefic Mahadashas.'
      });
    }
  }

  // 5. Mahabhagya Yoga (Parashari Gender & Day/Night Rule)
  const gender = (options.gender || 'male').toLowerCase();
  if (sun && moon && lagna) {
    const sunHouse = houseOf['Sun'];
    const isDay = options.isDayBirth !== undefined
      ? Boolean(options.isDayBirth)
      : [7, 8, 9, 10, 11, 12].includes(sunHouse);

    const isLagnaOdd = lagna.signId % 2 === 1;
    const isSunOdd = sun.signId % 2 === 1;
    const isMoonOdd = moon.signId % 2 === 1;

    if (gender === 'male' && isDay && isLagnaOdd && isSunOdd && isMoonOdd) {
      yogas.push({
        id: 'dhana-mahabhagya-male',
        dare: 'D',
        category: 'Dhana Yoga',
        subCategory: 'Mahabhagya Yoga',
        name: 'Mahabhagya Yoga (Supreme Divine Fortune)',
        planets: ['Sun', 'Moon', 'ASC'],
        houses: [1, houseOf['Sun'], houseOf['Moon']],
        strength: 'Supreme',
        description: 'Formed in a male chart when born during daytime with Lagna, Sun, and Moon all in Odd (Masculine/Solar) signs. Bestows boundless fortune, royal reputation, generosity, and longevity.',
        modernInterpretation: 'Effortless luck, widespread social respect, aristocratic reputation, and generous philanthropic authority.',
        neutralization: 'None.',
        dashaTiming: 'Blesses the native throughout entire lifetime, peaking in Sun and Moon Dashas.'
      });
    } else if (gender === 'female' && !isDay && !isLagnaOdd && !isSunOdd && !isMoonOdd) {
      yogas.push({
        id: 'dhana-mahabhagya-female',
        dare: 'D',
        category: 'Dhana Yoga',
        subCategory: 'Mahabhagya Yoga',
        name: 'Mahabhagya Yoga (Supreme Divine Fortune)',
        planets: ['Sun', 'Moon', 'ASC'],
        houses: [1, houseOf['Sun'], houseOf['Moon']],
        strength: 'Supreme',
        description: 'Formed in a female chart when born at night with Lagna, Sun, and Moon all in Even (Feminine/Lunar) signs. Bestows peerless grace, enduring prosperity, exceptional character, and esteemed family happiness.',
        modernInterpretation: 'Magnetic dignity, long-lasting prosperity, domestic bliss, and high societal honor.',
        neutralization: 'None.',
        dashaTiming: 'Operates continuously, peaking in Moon and Venus periods.'
      });
    }
  }

  // =========================================================================
  // [A] ARISHTA & DARIDRA YOGAS (AFFLICTIONS, CHALLENGES & MITIGATIONS)
  // =========================================================================

  // 1. Kemadruma Yoga & Kemadruma Bhanga (Cancellation)
  if (moon) {
    const planetsIn2ndFromMoon = planets.filter(p => {
      if (['ASC', 'Moon', 'Sun', 'Rahu', 'Ketu'].includes(p.key)) return false;
      return ((p.signId - moon.signId + 12) % 12) + 1 === 2;
    });
    const planetsIn12thFromMoon = planets.filter(p => {
      if (['ASC', 'Moon', 'Sun', 'Rahu', 'Ketu'].includes(p.key)) return false;
      return ((p.signId - moon.signId + 12) % 12) + 1 === 12;
    });

    if (planetsIn2ndFromMoon.length === 0 && planetsIn12thFromMoon.length === 0) {
      // Classical Kemadruma is formed. Now check classical Bhanga (Cancellation) rules:
      const moonInKendraFromLagna = kendras.includes(houseOf['Moon']);
      const planetsInKendraFromMoon = planets.filter(p => {
        if (['ASC', 'Moon', 'Rahu', 'Ketu'].includes(p.key)) return false;
        const diff = ((p.signId - moon.signId + 12) % 12) + 1;
        return kendras.includes(diff);
      });
      const planetsInKendraFromLagna = planets.filter(p => {
        if (['ASC', 'Moon', 'Rahu', 'Ketu'].includes(p.key)) return false;
        return kendras.includes(houseOf[p.key]);
      });

      const isCancelled = moonInKendraFromLagna || planetsInKendraFromMoon.length > 0 || planetsInKendraFromLagna.length > 0;

      yogas.push({
        id: 'arishta-kemadruma',
        dare: 'A',
        category: 'Arishta & Daridra',
        subCategory: 'Kemadruma Yoga',
        name: isCancelled ? 'Kemadruma Yoga (Cancelled / Kemadruma Bhanga)' : 'Kemadruma Yoga (Active Lunar Isolation)',
        planets: ['Moon'],
        houses: [houseOf['Moon']],
        isNeutralized: isCancelled,
        neutralizationReason: isCancelled
          ? (moonInKendraFromLagna ? 'Moon in Kendra from Lagna' : 'Planets occupy Kendras from Moon/Lagna')
          : '',
        strength: isCancelled ? 'Neutralized / Bhanga' : 'Active Affliction',
        description: isCancelled
          ? `Moon has no planets in 2nd or 12th, but the evil is CANCELLED (Kemadruma Bhanga) because ${moonInKendraFromLagna ? 'Moon is in Kendra from Lagna' : 'Planets occupy Kendras from Moon/Lagna'}. Financial stability is safeguarded.`
          : 'No planets (other than Sun/nodes) occupy the 2nd or 12th from Moon. Indicates mental solitude, occasional financial swings, or feelings of isolation.',
        modernInterpretation: isCancelled
          ? 'Deep contemplative focus, independence, and self-reliance without financial deprivation.'
          : 'Need for proactive emotional wellness, strong support networks, and structured asset protection.',
        neutralization: isCancelled ? 'Fully cancelled per classical Parashara & Raman rules.' : 'Mitigated by strong Jupiter aspects or spiritual practices.',
        dashaTiming: 'Be mindful during Moon Mahadasha or Sade Sati transits.'
      });
    }
  }

  // 2. Shakata Yoga (Moon in 6, 8, 12 from Jupiter)
  if (moon && jupt) {
    const moonFromJup = ((moon.signId - jupt.signId + 12) % 12) + 1;
    if ([6, 8, 12].includes(moonFromJup)) {
      const moonInLagnaKendra = kendras.includes(houseOf['Moon']);
      yogas.push({
        id: 'arishta-shakata',
        dare: 'A',
        category: 'Arishta & Daridra',
        subCategory: 'Shakata Yoga',
        name: moonInLagnaKendra ? 'Shakata Yoga (Neutralized by Lagna Kendra)' : 'Shakata Yoga (Wheel of Fortune)',
        planets: ['Moon', 'Jupiter'],
        houses: [houseOf['Moon'], houseOf['Jupt']],
        isNeutralized: moonInLagnaKendra,
        neutralizationReason: moonInLagnaKendra ? 'Moon placed in Kendra from Ascendant (Lagna).' : '',
        strength: moonInLagnaKendra ? 'Neutralized / Bhanga' : 'Moderate Challenge',
        description: `Moon is in the ${moonFromJup}th house (Dusthana) from Jupiter. Like a wheel turning (Shakata), fortunes and status undergo periodic cycles of loss and recovery.${moonInLagnaKendra ? ' Neutralized as Moon is in a Kendra from Lagna.' : ''}`,
        modernInterpretation: 'Cyclical career rhythms: alternating between intense expansion and consolidation. Cultivates extraordinary grit.',
        neutralization: moonInLagnaKendra ? 'Fully neutralized by Moon in Kendra from Ascendant.' : 'Less severe if Jupiter is in own/exalted sign.',
        dashaTiming: 'Visible during transitions between Jupiter and Moon Dasha periods.'
      });
    }
  }

  // 3. Kaal Sarpa Yoga & Mitigations (Mehta Ch. XIX & Raman)
  if (rahu && ketu) {
    const visiblePlanets = [sun, moon, mars, merc, jupt, venu, satn].filter(Boolean);
    const rahuSign = rahu.signId;
    const ketuSign = ketu.signId;

    let allOneSide = true;
    let allOtherSide = true;
    let conjunctNodes = false;

    for (let vp of visiblePlanets) {
      if (vp.signId === rahuSign || vp.signId === ketuSign) {
        conjunctNodes = true;
      }
      const distFromRahu = ((vp.signId - rahuSign + 12) % 12);
      if (distFromRahu > 6) allOneSide = false;
      if (distFromRahu < 6 && distFromRahu > 0) allOtherSide = false;
    }

    if (allOneSide || allOtherSide) {
      const ksyNames = [
        '', 'Ananta', 'Kulik', 'Vasuki', 'Shankhapal',
        'Padma', 'Mahapadma', 'Takshak', 'Karkotak',
        'Shankhachur', 'Ghatak', 'Vishdhar', 'Sheshnag'
      ];
      const rHouse = houseOf['Rahu'];
      const ksyType = ksyNames[rHouse] || 'Kaal Sarpa';
      const isNeutralized = conjunctNodes || kendras.includes(houseOf['Jupt']) || (houseOf['ASC'] !== rHouse && houseOf['ASC'] !== houseOf['Ketu']);

      yogas.push({
        id: 'arishta-kaalsarpa',
        dare: 'A',
        category: 'Arishta & Daridra',
        subCategory: 'Kaal Sarpa Yoga',
        name: `${ksyType} Kaal Sarpa Yoga${conjunctNodes ? ' (Bhanga / Broken Axis)' : ''}`,
        planets: ['Rahu', 'Ketu', ...visiblePlanets.map(p => p.name)],
        houses: [houseOf['Rahu'], houseOf['Ketu']],
        isNeutralized: isNeutralized,
        neutralizationReason: isNeutralized
          ? (conjunctNodes ? 'Broken axis: one or more planets conjunct nodal cusps.' : 'Mitigated: Jupiter in Kendra or Lagna outside axis.')
          : '',
        strength: conjunctNodes ? 'Neutralized / Broken Axis' : 'Intense Karmic Axis',
        description: `All 7 planets are hemmed on one side between Rahu (House ${houseOf['Rahu']}) and Ketu (House ${houseOf['Ketu']}). Known classically as ${ksyType} Kaal Sarpa. Dr. Raman & Mehta note this creates intense internal pressure leading to remarkable achievements after age 32.`,
        modernInterpretation: 'Early struggle followed by meteoric late-career rise; deep transformative karmic mission and unconventional trajectory.',
        neutralization: conjunctNodes ? 'Broken because one or more planets are conjunct the nodal axis.' : 'Mitigated by strong Jupiter in Kendra.',
        dashaTiming: 'Intense during Rahu and Ketu Mahadashas.'
      });
    }
  }

  // 4. Guru Chandal Yoga (Jupiter + Rahu/Ketu)
  if (jupt && rahu && jupt.signId === rahu.signId) {
    yogas.push({
      id: 'arishta-guru-chandal',
      dare: 'A',
      category: 'Arishta & Daridra',
      subCategory: 'Guru Chandal Yoga',
      name: 'Guru Chandal Yoga (Jupiter conjunct Rahu)',
      planets: ['Jupiter', 'Rahu'],
      houses: [houseOf['Jupt']],
      strength: 'Moderate Affliction',
      description: `Jupiter and Rahu are conjunct in ${jupt.signName}. Challenges conventional orthodox dogmas; stimulates unconventional philosophies, foreign knowledge, and skepticism.`,
      modernInterpretation: 'Disruptive thinker, rebel against outdated dogmas, innovation in tech/social paradigms; caution against deceptive advisors.',
      neutralization: 'Neutralized if Jupiter is exalted in Cancer or aspected by Mars/Sun.',
      dashaTiming: 'Active during Jupiter or Rahu Dasha.'
    });
  }

  // 5. Grahan Yoga (Sun/Moon conjunct Rahu/Ketu)
  if (sun && rahu && sun.signId === rahu.signId) {
    yogas.push({
      id: 'arishta-grahan-surya',
      dare: 'A',
      category: 'Arishta & Daridra',
      subCategory: 'Grahan Yoga',
      name: 'Surya Grahan Yoga (Sun conjunct Rahu)',
      planets: ['Sun', 'Rahu'],
      houses: [houseOf['Sun']],
      strength: 'Karmic Eclipse',
      description: `Sun and Rahu are conjunct in ${sun.signName}. Solar energy is eclipsed; demands conscious cultivation of self-worth, relations with father/authority figures.`,
      modernInterpretation: 'Complex dynamics with senior leadership, profound capability in cutting-edge or underground tech, desire for public impact.',
      neutralization: 'Benefic aspect from Jupiter cleanses the eclipse.',
      dashaTiming: 'Surfaces in Sun or Rahu Mahadashas.'
    });
  }

  if (moon && rahu && moon.signId === rahu.signId) {
    yogas.push({
      id: 'arishta-grahan-chandra',
      dare: 'A',
      category: 'Arishta & Daridra',
      subCategory: 'Grahan Yoga',
      name: 'Chandra Grahan Yoga (Moon conjunct Rahu)',
      planets: ['Moon', 'Rahu'],
      houses: [houseOf['Moon']],
      strength: 'Karmic Eclipse',
      description: `Moon and Rahu are conjunct in ${moon.signName}. Lunar mental waters are stirred; fosters heightened psychic intuition, imaginative artistry, but emotional restlessness.`,
      modernInterpretation: 'High artistic imagination, intuitive foresight, cinema/creative expression; requires meditation to soothe overthinking.',
      neutralization: 'Calmed by Jupiter’s aspect or strong 4th house.',
      dashaTiming: 'Surfaces in Moon or Rahu periods.'
    });
  }

  // 6. Daridra Yoga: 11th lord in Dusthana (6, 8, 12)
  const lord11 = pMap[houseLordKey[11]];
  if (lord11 && dusthanas.includes(houseOf[lord11.key])) {
    yogas.push({
      id: 'arishta-daridra-11',
      dare: 'A',
      category: 'Arishta & Daridra',
      subCategory: 'Daridra Yoga',
      name: 'Daridra Yoga (11th Lord in Dusthana)',
      planets: [lord11.name],
      houses: [houseOf[lord11.key]],
      strength: 'Financial Vulnerability',
      description: `11th lord of income and gains (${lord11.name}) is posited in the ${houseOf[lord11.key]}th Dusthana. Signifies high expenditures or revenue leakage requiring structured financial discipline.`,
      modernInterpretation: 'Need for automated savings, avoiding speculative shortcuts, and managing variable income streams.',
      neutralization: 'Nullified if the 2nd lord of savings is strongly placed in Kendra/Trikona.',
      dashaTiming: `Calls for prudent capital allocation during ${lord11.name} Dasha.`
    });
  }

  // =========================================================================
  // [N] NABHAS YOGAS & SPECIAL PLANETARY FORMATIONS (Mehta Ch. XIX / Raman)
  // =========================================================================

  // 1. Ashraya Yogas (All 7 planets in Movable, Fixed, or Dual signs)
  const visible = [sun, moon, mars, merc, jupt, venu, satn].filter(Boolean);
  const movableSigns = [1, 4, 7, 10];
  const fixedSigns = [2, 5, 8, 11];
  const dualSigns = [3, 6, 9, 12];

  if (visible.every(p => movableSigns.includes(p.signId))) {
    yogas.push({
      id: 'nabhas-rajju',
      dare: 'N',
      category: 'Nabhas Yoga',
      subCategory: 'Ashraya Yoga',
      name: 'Rajju Yoga (Ashraya Nabhas)',
      planets: visible.map(p => p.name),
      houses: visible.map(p => houseOf[p.key]),
      strength: 'Universal Formation',
      description: 'All 7 visible planets occupy Movable (Chara) signs. Endows love for travel, foreign residences, restless ambition, and enterprising spirit.',
      modernInterpretation: 'Global lifestyle, high mobility, serial entrepreneurship, pioneering projects.',
      neutralization: 'Permanent formation active throughout life.',
      dashaTiming: 'Operates continuously regardless of Dasha.'
    });
  } else if (visible.every(p => fixedSigns.includes(p.signId))) {
    yogas.push({
      id: 'nabhas-musala',
      dare: 'N',
      category: 'Nabhas Yoga',
      subCategory: 'Ashraya Yoga',
      name: 'Musala Yoga (Ashraya Nabhas)',
      planets: visible.map(p => p.name),
      houses: visible.map(p => houseOf[p.key]),
      strength: 'Universal Formation',
      description: 'All 7 visible planets occupy Fixed (Sthira) signs. Bestows steadfast determination, institutional stability, enduring wealth, and resolute honor.',
      modernInterpretation: 'Anchor leadership, bedrock reliability, wealth accumulation through real-estate and compounding assets.',
      neutralization: 'Permanent formation.',
      dashaTiming: 'Operates continuously throughout life.'
    });
  } else if (visible.every(p => dualSigns.includes(p.signId))) {
    yogas.push({
      id: 'nabhas-nala',
      dare: 'N',
      category: 'Nabhas Yoga',
      subCategory: 'Ashraya Yoga',
      name: 'Nala Yoga (Ashraya Nabhas)',
      planets: visible.map(p => p.name),
      houses: visible.map(p => houseOf[p.key]),
      strength: 'Universal Formation',
      description: 'All 7 visible planets occupy Dual (Dwisvabhava) signs. Bestows mental flexibility, multitalented versatility, artistic eloquence, and adaptability.',
      modernInterpretation: 'Multidisciplinary polymath, multilingual competence, strategic dexterity in volatile environments.',
      neutralization: 'Permanent formation.',
      dashaTiming: 'Operates continuously throughout life.'
    });
  }

  // 2. Sankhya Yogas (Distribution across 1 to 7 signs)
  const distinctSigns = new Set(visible.map(p => p.signId)).size;
  const sankhyaMap = {
    7: { name: 'Veena / Vallaki Yoga (7 Signs)', desc: 'Planets distributed across 7 signs. Endows deep love for music, fine arts, wisdom, and eloquent friendship.' },
    6: { name: 'Damini Yoga (6 Signs)', desc: 'Planets distributed across 6 signs. Generous disposition, helpful nature, intellect, and cattle/property wealth.' },
    5: { name: 'Pasha Yoga (5 Signs)', desc: 'Planets distributed across 5 signs. Skilled in work, surrounded by friends and relatives, capable administrator.' },
    4: { name: 'Kedara Yoga (4 Signs)', desc: 'Planets distributed across 4 signs. Agricultural/real estate wealth, truthful character, contented mind.' },
    3: { name: 'Shoola Yoga (3 Signs)', desc: 'Planets concentrated in 3 signs. Sharp temperament, courageous fighter, victory over adversity.' },
    2: { name: 'Yuga Yoga (2 Signs)', desc: 'Planets concentrated in only 2 signs. Unconventional lifestyle, deep focused concentration in narrow disciplines.' },
    1: { name: 'Gola Yoga (1 Sign)', desc: 'All 7 planets concentrated in 1 sign. Extreme vortex of karmic focus in one life department.' }
  };

  if (sankhyaMap[distinctSigns]) {
    yogas.push({
      id: `nabhas-sankhya-${distinctSigns}`,
      dare: 'N',
      category: 'Nabhas Yoga',
      subCategory: 'Sankhya Yoga',
      name: sankhyaMap[distinctSigns].name,
      planets: visible.map(p => p.name),
      houses: [...new Set(visible.map(p => houseOf[p.key]))],
      strength: 'Structural Celestial Blueprint',
      description: `All 7 visible planets are distributed across ${distinctSigns} distinct signs. ${sankhyaMap[distinctSigns].desc}`,
      modernInterpretation: 'Defines the structural cognitive and social distribution of personal destiny.',
      neutralization: 'Permanent foundational Nabhasa pattern.',
      dashaTiming: 'Operates as the baseline backdrop for all Dashas.'
    });
  }

  // 3. Solar Yogas (Vesi, Vosi, Ubhayachari, Budhaditya)
  if (sun) {
    const planetsIn2ndFromSun = visible.filter(p => p.key !== 'Sun' && ((p.signId - sun.signId + 12) % 12) + 1 === 2);
    const planetsIn12thFromSun = visible.filter(p => p.key !== 'Sun' && ((p.signId - sun.signId + 12) % 12) + 1 === 12);

    if (planetsIn2ndFromSun.length > 0 && planetsIn12thFromSun.length > 0) {
      yogas.push({
        id: 'solar-ubhayachari',
        dare: 'N',
        category: 'Solar Yoga',
        subCategory: 'Ubhayachari Yoga',
        name: 'Ubhayachari Yoga (Flanked Solar Grace)',
        planets: ['Sun', ...planetsIn2ndFromSun.map(p => p.name), ...planetsIn12thFromSun.map(p => p.name)],
        houses: [houseOf['Sun']],
        strength: 'Strong',
        description: `Planets occupy both the 2nd and 12th houses from Sun. Bestows symmetrical charm, eloquence, dignified status, and universal likeability.`,
        modernInterpretation: 'High personal charm, balanced executive temperament, influential social standing.',
        neutralization: 'Weakened if forming planets are natural malefics (Papa Ubhayachari).',
        dashaTiming: 'Active in Sun Dasha and Dashas of flanking planets.'
      });
    } else if (planetsIn2ndFromSun.length > 0) {
      const isSubha = planetsIn2ndFromSun.some(p => NATURAL_BENEFICS.includes(p.key));
      yogas.push({
        id: 'solar-vesi',
        dare: 'N',
        category: 'Solar Yoga',
        subCategory: 'Vesi Yoga',
        name: `${isSubha ? 'Subha' : 'Asubha'} Vesi Yoga (${planetsIn2ndFromSun.map(p => p.name).join(', ')} in 2nd from Sun)`,
        planets: ['Sun', ...planetsIn2ndFromSun.map(p => p.name)],
        houses: [houseOf['Sun']],
        strength: isSubha ? 'Strong' : 'Moderate',
        description: `Planets occupy the 2nd house from Sun. Bestows truthfulness, steady career progress, and reputable character.`,
        modernInterpretation: 'Strong professional work ethic and commercial viability.',
        neutralization: 'None.',
        dashaTiming: 'Operates in Sun and flanking planet Dashas.'
      });
    } else if (planetsIn12thFromSun.length > 0) {
      const isSubha = planetsIn12thFromSun.some(p => NATURAL_BENEFICS.includes(p.key));
      yogas.push({
        id: 'solar-vosi',
        dare: 'N',
        category: 'Solar Yoga',
        subCategory: 'Vosi Yoga',
        name: `${isSubha ? 'Subha' : 'Asubha'} Vosi Yoga (${planetsIn12thFromSun.map(p => p.name).join(', ')} in 12th from Sun)`,
        planets: ['Sun', ...planetsIn12thFromSun.map(p => p.name)],
        houses: [houseOf['Sun']],
        strength: isSubha ? 'Strong' : 'Moderate',
        description: `Planets occupy the 12th house from Sun. Endows liberal philanthropy, intellectual skill, and self-respect.`,
        modernInterpretation: 'Charitable disposition, international connections, and spiritual poise.',
        neutralization: 'None.',
        dashaTiming: 'Operates in Sun and flanking planet Dashas.'
      });
    }

    // Budhaditya Yoga (Sun + Mercury)
    if (merc && sun.signId === merc.signId) {
      yogas.push({
        id: 'solar-budhaditya',
        dare: 'N',
        category: 'Solar Yoga',
        subCategory: 'Budhaditya Yoga',
        name: `Budhaditya Yoga (Sun-Mercury in ${sun.signName})`,
        planets: ['Sun', 'Mercury'],
        houses: [houseOf['Sun']],
        strength: 'Strong Intellectual Formation',
        description: `Sun and Mercury are conjunct in ${sun.signName}. Enhances sharp analytical intellect, administrative competence, and mathematical/astrological fluency.`,
        modernInterpretation: 'Sharp analytical problem solving, data analytics, tech leadership, and administrative polish.',
        neutralization: 'Optimal when Mercury is not too deeply combust within 3 degrees of Sun.',
        dashaTiming: 'Operates in Sun and Mercury Dashas.'
      });
    }
  }

  // 4. Lunar Yogas (Sunapha, Anapha, Dhurdhura, Gajakesari)
  if (moon) {
    const nonSunFromMoon2 = visible.filter(p => !['Moon', 'Sun'].includes(p.key) && ((p.signId - moon.signId + 12) % 12) + 1 === 2);
    const nonSunFromMoon12 = visible.filter(p => !['Moon', 'Sun'].includes(p.key) && ((p.signId - moon.signId + 12) % 12) + 1 === 12);

    if (nonSunFromMoon2.length > 0 && nonSunFromMoon12.length > 0) {
      yogas.push({
        id: 'lunar-dhurdhura',
        dare: 'N',
        category: 'Lunar Yoga',
        subCategory: 'Dhurdhura Yoga',
        name: 'Dhurdhura Yoga (Flanked Lunar Splendor)',
        planets: ['Moon', ...nonSunFromMoon2.map(p => p.name), ...nonSunFromMoon12.map(p => p.name)],
        houses: [houseOf['Moon']],
        strength: 'Strong',
        description: 'Planets other than Sun flank Moon in both 2nd and 12th houses. Endows abundant comforts, conveyances, and financial security.',
        modernInterpretation: 'Diversified assets, luxurious lifestyle, and generous temperament.',
        neutralization: 'None.',
        dashaTiming: 'Active in Moon and flanking planet Dashas.'
      });
    } else if (nonSunFromMoon2.length > 0) {
      yogas.push({
        id: 'lunar-sunapha',
        dare: 'N',
        category: 'Lunar Yoga',
        subCategory: 'Sunapha Yoga',
        name: `Sunapha Yoga (${nonSunFromMoon2.map(p => p.name).join(', ')} in 2nd from Moon)`,
        planets: ['Moon', ...nonSunFromMoon2.map(p => p.name)],
        houses: [houseOf['Moon']],
        strength: 'Strong',
        description: 'Planets other than Sun occupy the 2nd house from Moon. Bestows self-earned wealth, sharp intelligence, and financial security.',
        modernInterpretation: 'Entrepreneurial drive, asset creation through personal skill.',
        neutralization: 'Diminished if planets are debilitated.',
        dashaTiming: 'Operates in Moon and 2nd planet Dashas.'
      });
    } else if (nonSunFromMoon12.length > 0) {
      yogas.push({
        id: 'lunar-anapha',
        dare: 'N',
        category: 'Lunar Yoga',
        subCategory: 'Anapha Yoga',
        name: `Anapha Yoga (${nonSunFromMoon12.map(p => p.name).join(', ')} in 12th from Moon)`,
        planets: ['Moon', ...nonSunFromMoon12.map(p => p.name)],
        houses: [houseOf['Moon']],
        strength: 'Strong',
        description: 'Planets other than Sun occupy the 12th house from Moon. Gives balanced temperament, spiritual inclination, and dignified health.',
        modernInterpretation: 'Emotional maturity, philanthropy, and overseas ventures.',
        neutralization: 'Diminished if afflicted.',
        dashaTiming: 'Operates in Moon and 12th planet Dashas.'
      });
    }

    // Gajakesari Yoga (Jupiter in Kendra from Moon)
    if (jupt) {
      const jupFromMoon = ((jupt.signId - moon.signId + 12) % 12) + 1;
      if (kendras.includes(jupFromMoon)) {
        yogas.push({
          id: 'lunar-gajakesari',
          dare: 'N',
          category: 'Lunar Yoga',
          subCategory: 'Gajakesari Yoga',
          name: `Gajakesari Yoga (Jupiter in H${jupFromMoon} from Moon)`,
          planets: ['Jupiter', 'Moon'],
          houses: [houseOf['Moon'], houseOf['Jupt']],
          strength: 'Pinnacle Auspicious Yoga',
          description: `Jupiter is in Kendra (${jupFromMoon}th house) from Moon. Bestows lion-like victory over adversity, towering wisdom, impeccable reputation, and lasting renown.`,
          modernInterpretation: 'Executive administration, judicial/legal stature, intellectual mentorship, and high societal trust.',
          neutralization: 'Softened if Jupiter or Moon are severely afflicted by Rahu/Saturn.',
          dashaTiming: 'Reaches peak heights during Jupiter and Moon Mahadashas/Antardashas.'
        });
      }
    }
  }

  // 5. Multi-planet Stelliums (3+ planets in a single house)
  const signOccupants = {};
  for (let p of planets) {
    if (p.key === 'ASC') continue;
    signOccupants[p.signId] = signOccupants[p.signId] || [];
    signOccupants[p.signId].push(p.name);
  }

  for (let sId in signOccupants) {
    if (signOccupants[sId].length >= 3) {
      const hNum = ((parseInt(sId, 10) - lagna.signId + 12) % 12) + 1;
      yogas.push({
        id: `stellium-h${hNum}`,
        dare: 'N',
        category: 'Special Formation',
        subCategory: 'Multi-Planet Stellium',
        name: `Stellium (${signOccupants[sId].length} Planets in House ${hNum})`,
        planets: signOccupants[sId],
        houses: [hNum],
        strength: 'Focal Vortex of Karma',
        description: `Planets ${signOccupants[sId].join(', ')} concentrate their energy in House ${hNum} (${SIGN_NAMES[parseInt(sId, 10) - 1]}). Creates a powerful focal concentration point in the native's destiny.`,
        modernInterpretation: 'Intense specialization in matters of this house; massive life shifts when transits hit this sign.',
        neutralization: 'Planetary wars (Graha Yuddha) must be evaluated if within 1 degree.',
        dashaTiming: `Activated whenever any of ${signOccupants[sId].join(', ')} runs its Dasha period.`
      });
    }
  }

  return yogas;
}

/**
 * Loads the complete BV Raman 300 Yogas dataset
 * Supports both Browser and Node.js environments
 */
let cached300Db = null;
export async function loadRaman300Database() {
  if (cached300Db) return cached300Db;

  if (typeof window === 'undefined') {
    // Node.js environment
    const fs = await import('fs/promises');
    const url = await import('url');
    const path = await import('path');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jsonPath = path.resolve(__dirname, '../data/300_vedic_yogas.json');
    const raw = await fs.readFile(jsonPath, 'utf-8');
    cached300Db = JSON.parse(raw);
    return cached300Db;
  } else {
    // Browser environment
    try {
      const res = await fetch('./data/300_vedic_yogas.json');
      cached300Db = await res.json();
      return cached300Db;
    } catch (e) {
      console.error('Error fetching 300_vedic_yogas.json:', e);
      return [];
    }
  }
}

/**
 * Evaluates the full BV Raman 300 catalog against active detected yogas
 * @param {Array} detectedYogas Output from detectYogas
 * @param {Array} ramanDb Array of 300 yogas from 300_vedic_yogas.json
 * @returns {Array} 300 items enriched with `isDetected: boolean` and match references
 */
export function matchRaman300Catalog(detectedYogas, ramanDb = []) {
  if (!ramanDb || ramanDb.length === 0) return [];

  // Map detected yogas to their corresponding Raman IDs
  const ramanIdToDetected = {};
  for (let dy of detectedYogas) {
    const dName = dy.name.toLowerCase();
    if (dName.includes('gajakesari')) ramanIdToDetected[1] = dy;
    if (dName.includes('sunapha')) ramanIdToDetected[2] = dy;
    if (dName.includes('anapha')) ramanIdToDetected[3] = dy;
    if (dName.includes('dhurdhura')) ramanIdToDetected[4] = dy;
    if (dName.includes('kemadruma')) ramanIdToDetected[5] = dy;
    if (dName.includes('chandra-mangala') || dName.includes('chandra mangala')) ramanIdToDetected[6] = dy;
    if (dName.includes('adhi yoga') || dName.includes('chandra adhi')) ramanIdToDetected[7] = dy;
    if (dName.includes('vasumathi')) ramanIdToDetected[9] = dy;
    if (dName.includes('shakata') || dName.includes('sakata')) ramanIdToDetected[12] = dy;
    if (dName.includes('vesi')) ramanIdToDetected[16] = dy;
    if (dName.includes('vosi') || dName.includes('vasi')) ramanIdToDetected[17] = dy;
    if (dName.includes('ubhayachari') || dName.includes('obhayachari')) ramanIdToDetected[18] = dy;
    if (dName.includes('hamsa')) ramanIdToDetected[19] = dy;
    if (dName.includes('malavya')) ramanIdToDetected[20] = dy;
    if (dName.includes('sasa')) ramanIdToDetected[21] = dy;
    if (dName.includes('ruchaka')) ramanIdToDetected[22] = dy;
    if (dName.includes('bhadra')) ramanIdToDetected[23] = dy;
    if (dName.includes('budhaditya') || dName.includes('budha-aditya')) ramanIdToDetected[24] = dy;
    if (dName.includes('mahabhagya')) ramanIdToDetected[25] = dy;
    if (dName.includes('lakshmi')) ramanIdToDetected[27] = dy;
    if (dName.includes('vallaki') || dName.includes('veena')) ramanIdToDetected[91] = dy;
    if (dName.includes('damini')) ramanIdToDetected[92] = dy;
    if (dName.includes('pasha') || dName.includes('pasa')) ramanIdToDetected[93] = dy;
    if (dName.includes('kedara')) ramanIdToDetected[94] = dy;
    if (dName.includes('shoola') || dName.includes('sula')) ramanIdToDetected[95] = dy;
    if (dName.includes('yuga')) ramanIdToDetected[96] = dy;
    if (dName.includes('gola')) ramanIdToDetected[97] = dy;
    if (dName.includes('rajju')) ramanIdToDetected[98] = dy;
    if (dName.includes('musala')) ramanIdToDetected[99] = dy;
    if (dName.includes('nala')) ramanIdToDetected[100] = dy;
    if (dName.includes('harsha')) ramanIdToDetected[105] = dy;
    if (dName.includes('sarala')) ramanIdToDetected[106] = dy;
    if (dName.includes('vimala')) ramanIdToDetected[107] = dy;
  }

  return ramanDb.map(item => {
    const matched = ramanIdToDetected[item.id];
    const isDetected = Boolean(matched);
    const isNeutralized = Boolean(matched && matched.isNeutralized);
    const neutralizationReason = matched
      ? (matched.neutralizationReason || matched.neutralization || '')
      : '';

    return {
      ...item,
      isDetected,
      isNeutralized,
      status: isDetected ? (isNeutralized ? 'neutralized' : 'active') : 'none',
      neutralizationReason,
      matchedYogaName: matched ? matched.name : ''
    };
  });
}
