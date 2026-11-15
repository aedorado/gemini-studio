import { SIGNS } from './constants.js';
import { getDignity } from './shodashvarga.js';

/**
 * Renders an interactive North Indian Diamond Chart SVG.
 * Houses are fixed; Signs rotate based on Lagna sign.
 */
export function renderNorthIndianChart(vargaCode, vargaData, containerEl, transitPlanets = []) {
  const w = 400;
  const h = 400;

  // Find Lagna sign for this varga
  const ascRecord = vargaData.find(item => item.key === 'ASC');
  const lagnaSign = ascRecord ? (vargaCode === 'CHALIT' ? (ascRecord.vargas['D1'] || 1) : ascRecord.vargas[vargaCode]) : 1;

  // Group natal planets by house (1 to 12)
  const planetsInHouse = {};
  const transitsInHouse = {};
  for (let i = 1; i <= 12; i++) {
    planetsInHouse[i] = [];
    transitsInHouse[i] = [];
  }

  for (let item of vargaData) {
    if (!item || !item.vargas) continue;
    let house;
    if (vargaCode === 'CHALIT') {
      const chalitH = item.vargas['CHALIT'];
      house = chalitH !== undefined ? chalitH : (item.vargas['D1'] ? (((item.vargas['D1'] - lagnaSign + 12) % 12) + 1) : 1);
    } else {
      const sign = item.vargas[vargaCode];
      if (!sign || isNaN(sign)) continue;
      house = ((sign - lagnaSign + 12) % 12) + 1;
    }
    if (planetsInHouse[house]) {
      planetsInHouse[house].push(item);
    }
  }

  if (transitPlanets && transitPlanets.length > 0) {
    for (let tp of transitPlanets) {
      if (!tp.signId) continue;
      const tHouse = ((tp.signId - lagnaSign + 12) % 12) + 1;
      transitsInHouse[tHouse].push(tp);
    }
  }

  // Pre-calculated coordinates for the 12 North Indian houses (SVG 400x400)
  // Ensures all rashi numbers and planets stay strictly within their respective house boundaries
  const houseCoords = {
    1: { cx: 200, cy: 90, signX: 200, signY: 170 },
    2: { cx: 90, cy: 50, signX: 145, signY: 50 },
    3: { cx: 50, cy: 90, signX: 50, signY: 145 },
    4: { cx: 90, cy: 200, signX: 170, signY: 200 },
    5: { cx: 50, cy: 310, signX: 50, signY: 255 },
    6: { cx: 90, cy: 350, signX: 145, signY: 350 },
    7: { cx: 200, cy: 310, signX: 200, signY: 230 },
    8: { cx: 310, cy: 350, signX: 255, signY: 350 },
    9: { cx: 350, cy: 310, signX: 350, signY: 255 },
    10: { cx: 310, cy: 200, signX: 230, signY: 200 },
    11: { cx: 350, cy: 90, signX: 350, signY: 145 },
    12: { cx: 310, cy: 50, signX: 255, signY: 50 }
  };

  const hasOverlay = transitPlanets && transitPlanets.length > 0;

  let svg = `
  <svg viewBox="0 0 400 400" class="astro-chart-svg" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="400" height="400" fill="#0D1322" rx="12" />

    <!-- Outer Square -->
    <rect x="8" y="8" width="384" height="384" fill="none" stroke="#F59E0B" stroke-width="2.5" opacity="0.8" rx="8" />

    <!-- North Indian Traditional Lines -->
    <line x1="8" y1="8" x2="392" y2="392" stroke="#475569" stroke-width="1.5" />
    <line x1="392" y1="8" x2="8" y2="392" stroke="#475569" stroke-width="1.5" />

    <!-- Inner Diamond -->
    <polygon points="200,8 392,200 200,392 8,200" fill="none" stroke="#F59E0B" stroke-width="2" opacity="0.9" />
  `;

  // Draw Sign Numbers and Planet Labels for each house
  for (let h = 1; h <= 12; h++) {
    const signNum = ((lagnaSign - 1 + (h - 1)) % 12) + 1;
    const coords = houseCoords[h];
    const planets = planetsInHouse[h];
    const transits = transitsInHouse[h];

    // Sign number badge
    svg += `
      <text x="${coords.signX}" y="${coords.signY}" text-anchor="middle" dominant-baseline="central" class="chart-sign-num">${signNum}</text>
    `;

    // Render natal and transit planets inside this house
    const totalEntries = planets.length + transits.length;
    if (totalEntries > 0) {
      const stepY = totalEntries > 4 ? 12 : 15;
      const pGroupY = coords.cy - ((totalEntries - 1) * stepY) / 2;
      let currIdx = 0;

      // Natal planets
      planets.forEach((p) => {
        const py = pGroupY + (currIdx * stepY);
        const isAsc = p.key === 'ASC';
        const isAL = p.key === 'AL';
        const isUL = p.key === 'UL';
        const isA7 = p.key === 'A7';
        const isJaimini = isAL || isUL || isA7;

        // Distinct colors: ASC Cyan, AL Amber Gold, UL Tender Rose, A7 Royal Violet, Natal White
        let fill = '#F8FAFC';
        let fontWeight = '500';
        if (isAsc) {
          fill = '#38BDF8';
          fontWeight = '700';
        } else if (isAL) {
          fill = '#F59E0B'; // Amber Gold
          fontWeight = '700';
        } else if (isUL) {
          fill = '#F472B6'; // Vivid Rose Pink
          fontWeight = '700';
        } else if (isA7) {
          fill = '#A855F7'; // Royal Violet
          fontWeight = '700';
        }

        // Dignity and Combustion superscripts
        let digMarker = '';
        if (!isAsc && !isJaimini) {
          const dig = getDignity(p.key, signNum, p.degInSign);
          if (dig) {
            if (dig.badgeClass === 'badge-exalted') {
              digMarker = `<tspan fill="#34D399" font-size="8" font-weight="bold" dy="-3">ᴱˣ</tspan><tspan dy="3"></tspan>`;
            } else if (dig.badgeClass === 'badge-debilitated') {
              digMarker = `<tspan fill="#F87171" font-size="8" font-weight="bold" dy="-3">ᴰᵇ</tspan><tspan dy="3"></tspan>`;
            } else if (dig.badgeClass === 'badge-moola') {
              digMarker = `<tspan fill="#FBBF24" font-size="8" font-weight="bold" dy="-3">ᴹᵀ</tspan><tspan dy="3"></tspan>`;
            } else if (dig.badgeClass === 'badge-own') {
              digMarker = `<tspan fill="#F59E0B" font-size="8" font-weight="bold" dy="-3">ᴼʷⁿ</tspan><tspan dy="3"></tspan>`;
            }
          }
        }

        let combustMarker = '';
        if (p.isCombust && (vargaCode === 'D1' || !vargaCode)) {
          combustMarker = `<tspan fill="#F97316" font-size="7.5" font-weight="bold" dy="-3">ᶜᵒᵐ</tspan><tspan dy="3"></tspan>`;
        }

        const retroStr = p.isRetro ? `<tspan fill="#EF4444" font-size="8" font-weight="bold" dy="-3">ᴿ</tspan><tspan dy="3"></tspan>` : '';

        svg += `
          <text x="${coords.cx}" y="${py}" text-anchor="middle" dominant-baseline="central" class="chart-planet-tag" fill="${fill}" font-weight="${fontWeight}">
            ${p.symbol}${digMarker}${combustMarker}${retroStr}
          </text>
        `;
        currIdx++;
      });

      // Transit planets (distinct cyan color with ⟳ prefix)
      transits.forEach((tp) => {
        const py = pGroupY + (currIdx * stepY);
        let tDigMarker = '';
        if (tp.key) {
          const tDig = getDignity(tp.key, signNum);
          if (tDig && tDig.badgeClass === 'badge-exalted') {
            tDigMarker = `<tspan fill="#34D399" font-size="7.5" font-weight="bold" dy="-2.5">ᴱˣ</tspan><tspan dy="2.5"></tspan>`;
          } else if (tDig && tDig.badgeClass === 'badge-debilitated') {
            tDigMarker = `<tspan fill="#F87171" font-size="7.5" font-weight="bold" dy="-2.5">ᴰᵇ</tspan><tspan dy="2.5"></tspan>`;
          }
        }
        const retroStr = tp.isRetro ? `<tspan fill="#EF4444" font-size="7.5" font-weight="bold" dy="-2.5">ᴿ</tspan><tspan dy="2.5"></tspan>` : '';
        svg += `
          <text x="${coords.cx}" y="${py}" text-anchor="middle" dominant-baseline="central" class="chart-planet-tag" fill="#38BDF8" font-size="11.5" font-weight="700">
            ⟳${tp.symbol}${tDigMarker}${retroStr}
          </text>
        `;
        currIdx++;
      });
    }
  }

  svg += `</svg>`;
  containerEl.innerHTML = svg;
}

/**
 * Renders an interactive South Indian Square Chart SVG.
 * Signs are fixed clockwise; Lagna marked with diagonal slash.
 */
export function renderSouthIndianChart(vargaCode, vargaData, containerEl, transitPlanets = []) {
  const chartSize = 400;
  const pad = 12;
  const gridSize = chartSize - (pad * 2); // 376px
  const cellSize = gridSize / 4; // 94px exactly

  const signGrid = {
    12: [0, 0], 1: [0, 1], 2: [0, 2], 3: [0, 3],
    11: [1, 0], 4: [1, 3],
    10: [2, 0], 5: [2, 3],
    9: [3, 0], 8: [3, 1], 7: [3, 2], 6: [3, 3]
  };

  const SIGN_META = {
    1: { code: 'Mes', sanskrit: 'Mesha', name: 'Aries' },
    2: { code: 'Vri', sanskrit: 'Vrishabha', name: 'Taurus' },
    3: { code: 'Mit', sanskrit: 'Mithuna', name: 'Gemini' },
    4: { code: 'Kar', sanskrit: 'Karka', name: 'Cancer' },
    5: { code: 'Sim', sanskrit: 'Simha', name: 'Leo' },
    6: { code: 'Kan', sanskrit: 'Kanya', name: 'Virgo' },
    7: { code: 'Tul', sanskrit: 'Tula', name: 'Libra' },
    8: { code: 'Vrk', sanskrit: 'Vrischika', name: 'Scorpio' }, // Disambiguated from Vri (Taurus)
    9: { code: 'Dha', sanskrit: 'Dhanu', name: 'Sagittarius' },
    10: { code: 'Mak', sanskrit: 'Makara', name: 'Capricorn' },
    11: { code: 'Kum', sanskrit: 'Kumbha', name: 'Aquarius' },
    12: { code: 'Mee', sanskrit: 'Meena', name: 'Pisces' }
  };

  const ascRecord = vargaData.find(item => item.key === 'ASC');
  const lagnaSign = ascRecord ? (vargaCode === 'CHALIT' ? (ascRecord.vargas['D1'] || 1) : ascRecord.vargas[vargaCode]) : 1;

  // Group planets by sign (1 to 12)
  const planetsInSign = {};
  const transitsInSign = {};
  for (let s = 1; s <= 12; s++) {
    planetsInSign[s] = [];
    transitsInSign[s] = [];
  }

  for (let item of vargaData) {
    if (!item || !item.vargas) continue;
    const sign = vargaCode === 'CHALIT'
      ? (item.vargas['CHALIT_SIGN'] || item.vargas['D1'])
      : item.vargas[vargaCode];
    if (!sign || isNaN(sign)) continue;
    if (planetsInSign[sign]) {
      planetsInSign[sign].push(item);
    }
  }

  if (transitPlanets && transitPlanets.length > 0) {
    for (let tp of transitPlanets) {
      if (!tp.signId) continue;
      transitsInSign[tp.signId].push(tp);
    }
  }

  // Pre-calculate line coordinates
  const x0 = pad;
  const x1 = pad + cellSize;
  const x2 = pad + cellSize * 2;
  const x3 = pad + cellSize * 3;
  const x4 = pad + gridSize;

  const y0 = pad;
  const y1 = pad + cellSize;
  const y2 = pad + cellSize * 2;
  const y3 = pad + cellSize * 3;
  const y4 = pad + gridSize;

  let svg = `
  <svg viewBox="0 0 ${chartSize} ${chartSize}" class="astro-chart-svg" xmlns="http://www.w3.org/2000/svg">
    <!-- Chart Background -->
    <rect width="${chartSize}" height="${chartSize}" fill="#0D1322" rx="12" />

    <!-- Outer Gold Border -->
    <rect x="${pad}" y="${pad}" width="${gridSize}" height="${gridSize}" fill="#0E1322" stroke="#F59E0B" stroke-width="2.5" opacity="0.9" rx="8" />

    <!-- Center Hollow Box -->
    <rect x="${x1}" y="${y1}" width="${cellSize * 2}" height="${cellSize * 2}" fill="#111827" stroke="#334155" stroke-width="1.5" />
    <text x="200" y="192" text-anchor="middle" dominant-baseline="central" fill="#F59E0B" font-size="16" font-weight="700" letter-spacing="1">
      ${vargaCode}
    </text>
    <text x="200" y="216" text-anchor="middle" dominant-baseline="central" fill="#94A3B8" font-size="11">
      South Indian Chart
    </text>
  `;

  // Draw Lagna cell highlight before grid lines
  for (let s = 1; s <= 12; s++) {
    if (s === lagnaSign) {
      const [row, col] = signGrid[s];
      const cx = pad + col * cellSize;
      const cy = pad + row * cellSize;
      svg += `<rect x="${cx}" y="${cy}" width="${cellSize}" height="${cellSize}" fill="rgba(56, 189, 248, 0.1)" />`;
    }
  }

  // Internal Grid Lines (pixel-perfect, skipping hollow center)
  svg += `
    <!-- Vertical Grid Lines -->
    <line x1="${x1}" y1="${y0}" x2="${x1}" y2="${y4}" stroke="#334155" stroke-width="1.2" />
    <line x1="${x2}" y1="${y0}" x2="${x2}" y2="${y1}" stroke="#334155" stroke-width="1.2" />
    <line x1="${x2}" y1="${y3}" x2="${x2}" y2="${y4}" stroke="#334155" stroke-width="1.2" />
    <line x1="${x3}" y1="${y0}" x2="${x3}" y2="${y4}" stroke="#334155" stroke-width="1.2" />

    <!-- Horizontal Grid Lines -->
    <line x1="${x0}" y1="${y1}" x2="${x4}" y2="${y1}" stroke="#334155" stroke-width="1.2" />
    <line x1="${x0}" y1="${y2}" x2="${x1}" y2="${y2}" stroke="#334155" stroke-width="1.2" />
    <line x1="${x3}" y1="${y2}" x2="${x4}" y2="${y2}" stroke="#334155" stroke-width="1.2" />
    <line x1="${x0}" y1="${y3}" x2="${x4}" y2="${y3}" stroke="#334155" stroke-width="1.2" />
  `;

  // Draw Sign Labels, Lagna Badges, House Numbers, and Planets for each sign
  for (let s = 1; s <= 12; s++) {
    const [row, col] = signGrid[s];
    const x = pad + col * cellSize;
    const y = pad + row * cellSize;
    const isLagna = s === lagnaSign;
    const sMeta = SIGN_META[s];
    const houseFromLagna = ((s - lagnaSign + 12) % 12) + 1;

    // Top-Left: Sign Code + Number (e.g. "Mes (1)", "Vrk (8)")
    svg += `
      <text x="${x + 8}" y="${y + 14}" fill="#94A3B8" font-size="9.5" font-weight="700">
        ${sMeta.code} <tspan font-size="8" fill="#64748B" font-weight="normal">(${s})</tspan>
      </text>
    `;

    // Top-Right: If Lagna, classic corner slashes and ASC badge; Else House number
    if (isLagna) {
      svg += `
        <!-- Classic South Indian Corner Slashes -->
        <line x1="${x + cellSize - 22}" y1="${y}" x2="${x + cellSize}" y2="${y + 22}" stroke="#38BDF8" stroke-width="1.2" opacity="0.65" />
        <line x1="${x + cellSize - 16}" y1="${y}" x2="${x + cellSize}" y2="${y + 16}" stroke="#38BDF8" stroke-width="1.2" opacity="0.65" />
        <rect x="${x + cellSize - 32}" y="${y + 4}" width="28" height="15" rx="3" fill="rgba(56, 189, 248, 0.25)" stroke="#38BDF8" stroke-width="0.8" />
        <text x="${x + cellSize - 18}" y="${y + 12}" fill="#38BDF8" font-size="8.5" font-weight="800" text-anchor="middle" dominant-baseline="central">ASC</text>
      `;
    } else {
      svg += `
        <text x="${x + cellSize - 8}" y="${y + 14}" text-anchor="end" fill="#64748B" font-size="8.5" font-weight="600">H${houseFromLagna}</text>
      `;
    }

    // Render planets inside this sign box (centered in lower cell area)
    const planets = planetsInSign[s];
    const transits = transitsInSign[s];
    const totalEntries = planets.length + transits.length;

    if (totalEntries > 0) {
      const pAreaY = y + 24;
      const pAreaH = cellSize - 28;
      const stepY = totalEntries > 4 ? 11 : 14;
      const startY = pAreaY + (pAreaH - (totalEntries - 1) * stepY) / 2;
      let currIdx = 0;

      planets.forEach((p) => {
        const px = x + cellSize / 2;
        const py = startY + (currIdx * stepY);
        const isAsc = p.key === 'ASC';
        const isAL = p.key === 'AL';
        const isUL = p.key === 'UL';
        const isA7 = p.key === 'A7';
        const isJaimini = isAL || isUL || isA7;

        let fill = '#F8FAFC';
        let fontWeight = '500';
        if (isAsc) {
          fill = '#38BDF8';
          fontWeight = '700';
        } else if (isAL) {
          fill = '#F59E0B'; // Amber Gold
          fontWeight = '700';
        } else if (isUL) {
          fill = '#F472B6'; // Vivid Rose Pink
          fontWeight = '700';
        } else if (isA7) {
          fill = '#A855F7'; // Royal Violet
          fontWeight = '700';
        }

        // Dignity and Combustion superscripts
        let digMarker = '';
        if (!isAsc && !isJaimini) {
          const dig = getDignity(p.key, s, p.degInSign);
          if (dig) {
            if (dig.badgeClass === 'badge-exalted') {
              digMarker = `<tspan fill="#34D399" font-size="8" font-weight="bold" dy="-3">ᴱˣ</tspan><tspan dy="3"></tspan>`;
            } else if (dig.badgeClass === 'badge-debilitated') {
              digMarker = `<tspan fill="#F87171" font-size="8" font-weight="bold" dy="-3">ᴰᵇ</tspan><tspan dy="3"></tspan>`;
            } else if (dig.badgeClass === 'badge-moola') {
              digMarker = `<tspan fill="#FBBF24" font-size="8" font-weight="bold" dy="-3">ᴹᵀ</tspan><tspan dy="3"></tspan>`;
            } else if (dig.badgeClass === 'badge-own') {
              digMarker = `<tspan fill="#F59E0B" font-size="8" font-weight="bold" dy="-3">ᴼʷⁿ</tspan><tspan dy="3"></tspan>`;
            }
          }
        }

        let combustMarker = '';
        if (p.isCombust && (vargaCode === 'D1' || !vargaCode)) {
          combustMarker = `<tspan fill="#F97316" font-size="7.5" font-weight="bold" dy="-3">ᶜᵒᵐ</tspan><tspan dy="3"></tspan>`;
        }

        const retroStr = p.isRetro ? `<tspan fill="#EF4444" font-size="8" font-weight="bold" dy="-3">ᴿ</tspan><tspan dy="3"></tspan>` : '';

        svg += `
          <text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="central" class="chart-planet-tag" fill="${fill}" font-weight="${fontWeight}">
            ${p.symbol}${digMarker}${combustMarker}${retroStr}
          </text>
        `;
        currIdx++;
      });

      transits.forEach((tp) => {
        const px = x + cellSize / 2;
        const py = startY + (currIdx * stepY);
        let tDigMarker = '';
        if (tp.key) {
          const tDig = getDignity(tp.key, s, tp.degInSign);
          if (tDig) {
            if (tDig.badgeClass === 'badge-exalted') {
              tDigMarker = `<tspan fill="#34D399" font-size="7.5" font-weight="bold" dy="-2.5">ᴱˣ</tspan><tspan dy="2.5"></tspan>`;
            } else if (tDig.badgeClass === 'badge-debilitated') {
              tDigMarker = `<tspan fill="#F87171" font-size="7.5" font-weight="bold" dy="-2.5">ᴰᵇ</tspan><tspan dy="2.5"></tspan>`;
            } else if (tDig.badgeClass === 'badge-moola') {
              tDigMarker = `<tspan fill="#FBBF24" font-size="7.5" font-weight="bold" dy="-2.5">ᴹᵀ</tspan><tspan dy="2.5"></tspan>`;
            } else if (tDig.badgeClass === 'badge-own') {
              tDigMarker = `<tspan fill="#F59E0B" font-size="7.5" font-weight="bold" dy="-2.5">ᴼʷⁿ</tspan><tspan dy="2.5"></tspan>`;
            }
          }
        }
        const retroStr = tp.isRetro ? `<tspan fill="#EF4444" font-size="7.5" font-weight="bold" dy="-2.5">ᴿ</tspan><tspan dy="2.5"></tspan>` : '';

        svg += `
          <text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="central" class="chart-planet-tag" fill="#38BDF8" font-size="11.5" font-weight="700">
            ⟳${tp.symbol}${tDigMarker}${retroStr}
          </text>
        `;
        currIdx++;
      });
    }
  }

  svg += `</svg>`;
  containerEl.innerHTML = svg;
}
