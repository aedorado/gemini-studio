// Analytics Dashboard Controller
import { getAnalyticsData, rebuildAnalyticsCache, EXALTATION_DATA, OWN_SIGNS, PLANET_KEYS, SHADBALA_PLANETS } from './analyticsEngine.js';
import { SIGNS, PLANETS, NAKSHATRAS } from './constants.js';
import { initTheme } from './theme.js';

// DOM Elements
const cacheStatusPill = document.getElementById('cache-status-pill');
const btnRebuildCache = document.getElementById('btn-rebuild-cache');

const metricTotalCharts = document.getElementById('metric-total-charts');
const metricGenderBreakdown = document.getElementById('metric-gender-breakdown');
const metricTopAsc = document.getElementById('metric-top-asc');
const metricTopAscSub = document.getElementById('metric-top-asc-sub');
const metricTopRetro = document.getElementById('metric-top-retro');
const metricTopRetroSub = document.getElementById('metric-top-retro-sub');
const metricDeepExaltCount = document.getElementById('metric-deep-exalt-count');

// Heatmap Tabs & Containers
const tabMatrixHouse = document.getElementById('tab-matrix-house');
const tabMatrixRashi = document.getElementById('tab-matrix-rashi');
const tabMatrixHouseRashi = document.getElementById('tab-matrix-house-rashi');
const tabMatrixLords = document.getElementById('tab-matrix-lords');
const tabMatrixNakshatra = document.getElementById('tab-matrix-nakshatra');

const containerMatrixHouse = document.getElementById('container-matrix-house');
const containerMatrixRashi = document.getElementById('container-matrix-rashi');
const containerMatrixHouseRashi = document.getElementById('container-matrix-house-rashi');
const containerMatrixLords = document.getElementById('container-matrix-lords');
const containerMatrixNakshatra = document.getElementById('container-matrix-nakshatra');

const tableMatrixHouse = document.getElementById('table-matrix-house');
const tableMatrixRashi = document.getElementById('table-matrix-rashi');
const filterHouseRashiPlanet = document.getElementById('filter-house-rashi-planet');
const tabHrModeSign = document.getElementById('tab-hr-mode-sign');
const tabHrModeOccupants = document.getElementById('tab-hr-mode-occupants');
const wrapHouseRashiPlanetFilter = document.getElementById('wrap-house-rashi-planet-filter');
const labelHouseRashiModeDesc = document.getElementById('label-house-rashi-mode-desc');
let activeHouseRashiMode = 'sign'; // 'sign' (chart counts having given rashi) or 'occupants' (graha density)
const tableMatrixHouseRashi = document.getElementById('table-matrix-house-rashi');

const tabLordsHouse = document.getElementById('tab-lords-house');
const tabLordsRashi = document.getElementById('tab-lords-rashi');
const tableMatrixLords = document.getElementById('table-matrix-lords');
const tabNakVertical = document.getElementById('tab-nak-vertical');
const tabNakHorizontal = document.getElementById('tab-nak-horizontal');
let activeNakshatraOrientation = 'vertical'; // 'vertical' (27 rows) or 'horizontal' (27 cols)
const tableMatrixNakshatra = document.getElementById('table-matrix-nakshatra');
const tableDignityMatrix = document.getElementById('table-dignity-matrix');

// Potency & Norms Elements
const tableShadbalaNorms = document.getElementById('table-shadbala-norms');
const containerSavBars = document.getElementById('container-sav-bars');
const labhaVyayaRatioVal = document.getElementById('labha-vyaya-ratio-val');
const labhaVyayaSub = document.getElementById('labha-vyaya-sub');
const gridVargottamaBadges = document.getElementById('grid-vargottama-badges');

// Distributions Elements
const gridAscDist = document.getElementById('grid-asc-dist');
const gridMoonDist = document.getElementById('grid-moon-dist');
const gridNakshatraDist = document.getElementById('grid-nakshatra-dist');
const gridDecadeDist = document.getElementById('grid-decade-dist');
const gridRetroDist = document.getElementById('grid-retro-dist');

// Conjunctions Elements
const filterConjunctionPlanet = document.getElementById('filter-conjunction-planet');
const filterConjunctionType = document.getElementById('filter-conjunction-type');
const searchConjunctions = document.getElementById('search-conjunctions');
const conjunctionsCounterBadge = document.getElementById('conjunctions-counter-badge');
const containerConjunctionPairs = document.getElementById('container-conjunction-pairs');

// Stelliums Elements
const tabStelliumAll = document.getElementById('tab-stellium-all');
const tabStellium5 = document.getElementById('tab-stellium-5');
const tabStellium4 = document.getElementById('tab-stellium-4');
const tabStellium3 = document.getElementById('tab-stellium-3');
const filterStelliumHouse = document.getElementById('filter-stellium-house');
const searchStelliums = document.getElementById('search-stelliums');
const containerStelliums = document.getElementById('container-stelliums');
const stelliumsPillCounters = document.getElementById('stelliums-pill-counters');

// Drilldown Modal Elements
const drilldownModal = document.getElementById('drilldown-modal');
const drilldownModalTitle = document.getElementById('drilldown-modal-title');
const drilldownModalSub = document.getElementById('drilldown-modal-sub');
const drilldownItemsList = document.getElementById('drilldown-items-list');
const btnCloseDrilldown = document.getElementById('btn-close-drilldown');

let analyticsState = null;
let activeStelliumTab = 'all';
let activeLordsMode = 'house'; // 'house' or 'rashi'

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn', 'Rahu', 'Ketu'];
const PLANET_NAMES = {
  Sun: 'Sun (Surya)',
  Moon: 'Moon (Chandra)',
  Mars: 'Mars (Mangala)',
  Merc: 'Mercury (Budha)',
  Jupt: 'Jupiter (Guru)',
  Venu: 'Venus (Shukra)',
  Satn: 'Saturn (Shani)',
  Rahu: 'Rahu',
  Ketu: 'Ketu'
};

const PLANET_COLORS = {
  Sun: '#F59E0B',
  Moon: '#94A3B8',
  Mars: '#EF4444',
  Merc: '#10B981',
  Jupt: '#FBBF24',
  Venu: '#EC4899',
  Satn: '#3B82F6',
  Rahu: '#8B5CF6',
  Ketu: '#6B7280'
};

const BHAVA_NAMES = [
  'H1 (Tanu - Self)',
  'H2 (Dhana - Wealth)',
  'H3 (Sahaja - Courage)',
  'H4 (Sukha - Home)',
  'H5 (Putra - Intellect)',
  'H6 (Ari - Health & Obstacles)',
  'H7 (Yuvati - Marriage)',
  'H8 (Randhra - Transformation)',
  'H9 (Dharma - Fortune)',
  'H10 (Karma - Career)',
  'H11 (Labha - Gains)',
  'H12 (Vyaya - Expenditure)'
];

const BHAVASHA_NAMES = [
  '1st Lord (Lagnesha)',
  '2nd Lord (Dhanesha)',
  '3rd Lord (Sahajesha)',
  '4th Lord (Sukhesha)',
  '5th Lord (Putresha)',
  '6th Lord (Ripu-esha)',
  '7th Lord (Yuvatisha)',
  '8th Lord (Randhresha)',
  '9th Lord (Bhagyesha)',
  '10th Lord (Karmesha)',
  '11th Lord (Labhesha)',
  '12th Lord (Vyayesha)'
];

function resolveProfileItems(profileIds, mapperFn) {
  if (!profileIds || !analyticsState || !analyticsState.chartMap) return [];
  return profileIds.map(id => {
    const chart = analyticsState.chartMap[id];
    if (!chart) return { id, name: id };
    if (mapperFn) return mapperFn(chart);
    return {
      id: chart.id,
      name: chart.name,
      gender: chart.gender,
      sign: chart.ascSignName,
      house: 1
    };
  });
}

function init() {
  initTheme();
  loadDataAndRender();
  setupEventListeners();
}

function loadDataAndRender(forceRebuild = false) {
  analyticsState = forceRebuild ? rebuildAnalyticsCache() : getAnalyticsData();

  renderHeaderAndMetrics();
  renderMatrixHouse();
  renderMatrixRashi();
  renderMatrixHouseRashi();
  renderMatrixHouseLords();
  renderMatrixNakshatra();
  renderPotencyNorms();
  renderDistributions();
  renderDignityMatrix();
  renderConjunctions();
  renderStelliums();
}

/**
 * Setup UI Event Listeners
 */
function setupEventListeners() {
  if (btnRebuildCache) {
    btnRebuildCache.addEventListener('click', () => {
      btnRebuildCache.disabled = true;
      btnRebuildCache.textContent = '⏳ Rebuilding...';
      setTimeout(() => {
        loadDataAndRender(true);
        btnRebuildCache.disabled = false;
        btnRebuildCache.textContent = '⚡ Rebuild Cache';
      }, 50);
    });
  }

  // Heatmap Tabs
  if (tabMatrixHouse) tabMatrixHouse.addEventListener('click', () => switchMatrixTab('house'));
  if (tabMatrixRashi) tabMatrixRashi.addEventListener('click', () => switchMatrixTab('rashi'));
  if (tabMatrixHouseRashi) tabMatrixHouseRashi.addEventListener('click', () => switchMatrixTab('house-rashi'));
  if (tabMatrixLords) tabMatrixLords.addEventListener('click', () => switchMatrixTab('lords'));
  if (tabMatrixNakshatra) tabMatrixNakshatra.addEventListener('click', () => switchMatrixTab('nakshatra'));

  // House x Rashi planet filter and mode toggle
  if (filterHouseRashiPlanet) {
    filterHouseRashiPlanet.addEventListener('change', renderMatrixHouseRashi);
  }
  if (tabHrModeSign && tabHrModeOccupants) {
    tabHrModeSign.addEventListener('click', () => {
      activeHouseRashiMode = 'sign';
      tabHrModeSign.className = 'btn btn-sm btn-primary';
      tabHrModeOccupants.className = 'btn btn-sm btn-secondary';
      if (wrapHouseRashiPlanetFilter) wrapHouseRashiPlanetFilter.style.display = 'none';
      if (labelHouseRashiModeDesc) {
        labelHouseRashiModeDesc.innerHTML = 'Number of native charts where <strong>House H falls in Rashi R</strong> (e.g. H4 in Gemini = 2 charts).';
      }
      renderMatrixHouseRashi();
    });
    tabHrModeOccupants.addEventListener('click', () => {
      activeHouseRashiMode = 'occupants';
      tabHrModeSign.className = 'btn btn-sm btn-secondary';
      tabHrModeOccupants.className = 'btn btn-sm btn-primary';
      if (wrapHouseRashiPlanetFilter) wrapHouseRashiPlanetFilter.style.display = 'flex';
      if (labelHouseRashiModeDesc) {
        labelHouseRashiModeDesc.innerHTML = 'Planetary occupancy counts for each <strong>House × Rashi</strong> coordinate across all 102 charts.';
      }
      renderMatrixHouseRashi();
    });
  }

  // House Lords mode toggle
  if (tabLordsHouse && tabLordsRashi) {
    tabLordsHouse.addEventListener('click', () => {
      activeLordsMode = 'house';
      tabLordsHouse.className = 'btn btn-sm btn-primary';
      tabLordsRashi.className = 'btn btn-sm btn-secondary';
      renderMatrixHouseLords();
    });
    tabLordsRashi.addEventListener('click', () => {
      activeLordsMode = 'rashi';
      tabLordsHouse.className = 'btn btn-sm btn-secondary';
      tabLordsRashi.className = 'btn btn-sm btn-primary';
      renderMatrixHouseLords();
    });
  }

  // Nakshatra orientation toggle
  if (tabNakVertical && tabNakHorizontal) {
    tabNakVertical.addEventListener('click', () => {
      activeNakshatraOrientation = 'vertical';
      tabNakVertical.className = 'btn btn-sm btn-primary';
      tabNakHorizontal.className = 'btn btn-sm btn-secondary';
      renderMatrixNakshatra();
    });
    tabNakHorizontal.addEventListener('click', () => {
      activeNakshatraOrientation = 'horizontal';
      tabNakVertical.className = 'btn btn-sm btn-secondary';
      tabNakHorizontal.className = 'btn btn-sm btn-primary';
      renderMatrixNakshatra();
    });
  }

  // Conjunctions Filters
  if (filterConjunctionPlanet) filterConjunctionPlanet.addEventListener('change', renderConjunctions);
  if (filterConjunctionType) filterConjunctionType.addEventListener('change', renderConjunctions);
  if (searchConjunctions) searchConjunctions.addEventListener('input', renderConjunctions);

  // Stelliums Tabs & Filters
  if (tabStelliumAll) tabStelliumAll.addEventListener('click', () => switchStelliumTab('all'));
  if (tabStellium5) tabStellium5.addEventListener('click', () => switchStelliumTab('5+ Planets'));
  if (tabStellium4) tabStellium4.addEventListener('click', () => switchStelliumTab('4 Planets'));
  if (tabStellium3) tabStellium3.addEventListener('click', () => switchStelliumTab('3 Planets'));
  if (filterStelliumHouse) filterStelliumHouse.addEventListener('change', renderStelliums);
  if (searchStelliums) searchStelliums.addEventListener('input', renderStelliums);

  // Modal Close
  if (btnCloseDrilldown) btnCloseDrilldown.addEventListener('click', closeDrilldown);
  if (drilldownModal) {
    drilldownModal.addEventListener('click', (e) => {
      if (e.target === drilldownModal) closeDrilldown();
    });
  }
}

function switchMatrixTab(tab) {
  if (tabMatrixHouse) tabMatrixHouse.className = `btn btn-sm ${tab === 'house' ? 'btn-primary' : 'btn-secondary'}`;
  if (tabMatrixRashi) tabMatrixRashi.className = `btn btn-sm ${tab === 'rashi' ? 'btn-primary' : 'btn-secondary'}`;
  if (tabMatrixHouseRashi) tabMatrixHouseRashi.className = `btn btn-sm ${tab === 'house-rashi' ? 'btn-primary' : 'btn-secondary'}`;
  if (tabMatrixLords) tabMatrixLords.className = `btn btn-sm ${tab === 'lords' ? 'btn-primary' : 'btn-secondary'}`;
  if (tabMatrixNakshatra) tabMatrixNakshatra.className = `btn btn-sm ${tab === 'nakshatra' ? 'btn-primary' : 'btn-secondary'}`;

  if (containerMatrixHouse) containerMatrixHouse.style.display = tab === 'house' ? 'block' : 'none';
  if (containerMatrixRashi) containerMatrixRashi.style.display = tab === 'rashi' ? 'block' : 'none';
  if (containerMatrixHouseRashi) containerMatrixHouseRashi.style.display = tab === 'house-rashi' ? 'block' : 'none';
  if (containerMatrixLords) containerMatrixLords.style.display = tab === 'lords' ? 'block' : 'none';
  if (containerMatrixNakshatra) containerMatrixNakshatra.style.display = tab === 'nakshatra' ? 'block' : 'none';
}

function switchStelliumTab(tab) {
  activeStelliumTab = tab;
  if (tabStelliumAll) tabStelliumAll.className = `btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`;
  if (tabStellium5) tabStellium5.className = `btn btn-sm ${tab === '5+ Planets' ? 'btn-primary' : 'btn-secondary'}`;
  if (tabStellium4) tabStellium4.className = `btn btn-sm ${tab === '4 Planets' ? 'btn-primary' : 'btn-secondary'}`;
  if (tabStellium3) tabStellium3.className = `btn btn-sm ${tab === '3 Planets' ? 'btn-primary' : 'btn-secondary'}`;
  renderStelliums();
}

/**
 * Top Metrics
 */
function renderHeaderAndMetrics() {
  if (!analyticsState) return;

  const { totalCharts, maleCount, femaleCount, fromCache, durationMs, distributions, dignityCounts } = analyticsState;

  if (cacheStatusPill) {
    cacheStatusPill.textContent = fromCache ? `⚡ Cached (${totalCharts} charts)` : `⚡ Freshly Computed in ${durationMs}ms`;
  }

  if (metricTotalCharts) metricTotalCharts.textContent = totalCharts;
  if (metricGenderBreakdown) metricGenderBreakdown.textContent = `${maleCount} Males • ${femaleCount} Females`;

  // Top Ascendant
  if (distributions && distributions.ascDist) {
    const sortedAsc = [...distributions.ascDist].sort((a, b) => b.count - a.count);
    const top = sortedAsc[0];
    if (top && metricTopAsc) {
      const pct = totalCharts > 0 ? ((top.count / totalCharts) * 100).toFixed(1) : 0;
      metricTopAsc.textContent = `${top.name} ${top.symbol}`;
      if (metricTopAscSub) metricTopAscSub.textContent = `${top.count} charts (${pct}%)`;
    }
  }

  // Most Retrograde Planet
  if (distributions && distributions.retroPlanets) {
    const sortedRetro = Object.entries(distributions.retroPlanets).sort((a, b) => b[1].count - a[1].count);
    const top = sortedRetro[0];
    if (top && metricTopRetro) {
      const pName = PLANET_NAMES[top[0]] || top[0];
      const pct = totalCharts > 0 ? ((top[1].count / totalCharts) * 100).toFixed(1) : 0;
      metricTopRetro.textContent = pName.split(' ')[0];
      if (metricTopRetroSub) metricTopRetroSub.textContent = `${top[1].count} occurrences (${pct}%)`;
    }
  }

  // Deep Exaltations
  let deepExaltSum = 0;
  if (dignityCounts) {
    Object.values(dignityCounts).forEach(item => {
      if (item['Deep Exalt']) deepExaltSum += item['Deep Exalt'].count;
    });
  }
  if (metricDeepExaltCount) metricDeepExaltCount.textContent = deepExaltSum;
}

/**
 * Color interpolation helper for heatmaps
 */
function getHeatmapBgColor(count, maxCount) {
  if (count === 0) return 'rgba(0, 0, 0, 0.04)';
  const ratio = Math.min(1, count / (maxCount || 1));
  const alpha = 0.12 + ratio * 0.58;
  return `rgba(99, 102, 241, ${alpha.toFixed(2)})`;
}

/**
 * Render Planets × Houses Matrix
 */
function renderMatrixHouse() {
  if (!tableMatrixHouse || !analyticsState) return;

  const matrix = analyticsState.planetHouseMatrix;
  let maxCount = 1;
  PLANET_ORDER.forEach(k => {
    for (let h = 0; h < 12; h++) {
      const len = matrix[k][h].length;
      if (len > maxCount) maxCount = len;
    }
  });

  let html = '<thead><tr>';
  html += '<th class="planet-col-header">Planet \\ House</th>';
  for (let h = 1; h <= 12; h++) {
    html += `<th>House ${h}</th>`;
  }
  html += '</tr></thead><tbody>';

  PLANET_ORDER.forEach(k => {
    const pColor = PLANET_COLORS[k] || 'var(--text-main)';
    html += `<tr>`;
    html += `<td class="planet-label-cell" style="color: ${pColor};">● ${PLANET_NAMES[k] || k}</td>`;

    for (let h = 0; h < 12; h++) {
      const items = matrix[k][h] || [];
      const count = items.length;
      const bg = getHeatmapBgColor(count, maxCount);
      const isPositive = count > 0;

      html += `
        <td class="matrix-cell" style="background: ${bg};"
            data-type="house" data-planet="${k}" data-val="${h + 1}"
            title="${PLANET_NAMES[k]} in House ${h + 1}: ${count} charts">
          <span class="matrix-val" style="color: ${isPositive ? 'var(--text-main)' : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};">
            ${count}
          </span>
        </td>
      `;
    }
    html += `</tr>`;
  });

  html += '</tbody>';
  tableMatrixHouse.innerHTML = html;

  tableMatrixHouse.querySelectorAll('td.matrix-cell').forEach(td => {
    td.addEventListener('click', () => {
      const pKey = td.dataset.planet;
      const houseNum = parseInt(td.dataset.val, 10);
      const items = matrix[pKey][houseNum - 1] || [];
      openDrilldown(`${PLANET_NAMES[pKey]} in House ${houseNum}`, items, `Found in ${items.length} charts`);
    });
  });
}

/**
 * Render Planets × Rashis (12 Signs) Matrix
 */
function renderMatrixRashi() {
  if (!tableMatrixRashi || !analyticsState) return;

  const matrix = analyticsState.planetRashiMatrix;
  let maxCount = 1;
  PLANET_ORDER.forEach(k => {
    for (let s = 0; s < 12; s++) {
      const len = matrix[k][s].length;
      if (len > maxCount) maxCount = len;
    }
  });

  let html = '<thead><tr>';
  html += '<th class="planet-col-header">Planet \\ Rashi</th>';
  SIGNS.forEach(sign => {
    html += `<th>${sign.symbol} ${sign.name}</th>`;
  });
  html += '</tr></thead><tbody>';

  PLANET_ORDER.forEach(k => {
    const pColor = PLANET_COLORS[k] || 'var(--text-main)';
    html += `<tr>`;
    html += `<td class="planet-label-cell" style="color: ${pColor};">● ${PLANET_NAMES[k] || k}</td>`;

    for (let s = 0; s < 12; s++) {
      const items = matrix[k][s] || [];
      const count = items.length;
      const bg = getHeatmapBgColor(count, maxCount);
      const isPositive = count > 0;

      html += `
        <td class="matrix-cell" style="background: ${bg};"
            data-type="rashi" data-planet="${k}" data-val="${s}"
            title="${PLANET_NAMES[k]} in ${SIGNS[s].name}: ${count} charts">
          <span class="matrix-val" style="color: ${isPositive ? 'var(--text-main)' : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};">
            ${count}
          </span>
        </td>
      `;
    }
    html += `</tr>`;
  });

  html += '</tbody>';
  tableMatrixRashi.innerHTML = html;

  tableMatrixRashi.querySelectorAll('td.matrix-cell').forEach(td => {
    td.addEventListener('click', () => {
      const pKey = td.dataset.planet;
      const signIdx = parseInt(td.dataset.val, 10);
      const items = matrix[pKey][signIdx] || [];
      openDrilldown(`${PLANET_NAMES[pKey]} in ${SIGNS[signIdx].name}`, items, `Found in ${items.length} charts`);
    });
  });
}

/**
 * Render Houses × Rashis (12 Bhavas × 12 Signs) Matrix
 */
function renderMatrixHouseRashi() {
  if (!tableMatrixHouseRashi || !analyticsState) return;

  const isSignMode = activeHouseRashiMode === 'sign';

  if (isSignMode) {
    // MODE 1: Chart Counts (How many charts have House H falling in Sign S)
    let maxCount = 1;
    for (let h = 0; h < 12; h++) {
      for (let s = 0; s < 12; s++) {
        const requiredAsc = (s - h + 12) % 12;
        const count = analyticsState.distributions.ascDist[requiredAsc]?.count || 0;
        if (count > maxCount) maxCount = count;
      }
    }

    let html = '<thead><tr>';
    html += '<th class="planet-col-header">House \\ Rashi (Chart Counts)</th>';
    SIGNS.forEach(sign => {
      html += `<th>${sign.symbol} ${sign.name}</th>`;
    });
    html += '</tr></thead><tbody>';

    for (let h = 0; h < 12; h++) {
      html += `<tr>`;
      html += `<td class="planet-label-cell" style="color: var(--gold-light);">🏛️ ${BHAVA_NAMES[h]}</td>`;

      for (let s = 0; s < 12; s++) {
        const requiredAsc = (s - h + 12) % 12;
        const ascData = analyticsState.distributions.ascDist[requiredAsc];
        const count = ascData ? ascData.count : 0;
        const bg = getHeatmapBgColor(count, maxCount);
        const isPositive = count > 0;

        html += `
          <td class="matrix-cell" style="background: ${bg};"
              data-house="${h + 1}" data-rashi="${s}" data-asc="${requiredAsc}"
              title="House ${h + 1} is ${SIGNS[s].name} in ${count} charts (${SIGNS[requiredAsc].name} Ascendant)">
            <span class="matrix-val" style="color: ${isPositive ? 'var(--text-main)' : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};">
              ${count}
            </span>
          </td>
        `;
      }
      html += `</tr>`;
    }

    html += '</tbody>';
    tableMatrixHouseRashi.innerHTML = html;

    tableMatrixHouseRashi.querySelectorAll('td.matrix-cell').forEach(td => {
      td.addEventListener('click', () => {
        const hNum = parseInt(td.dataset.house, 10);
        const signIdx = parseInt(td.dataset.rashi, 10);
        const ascIdx = parseInt(td.dataset.asc, 10);
        const ascData = analyticsState.distributions.ascDist[ascIdx];
        if (!ascData || !ascData.profileIds) return;

        const list = resolveProfileItems(ascData.profileIds, (c) => ({
          id: c.id,
          name: c.name,
          gender: c.gender,
          sign: `Lagna: ${c.ascSignName}`,
          house: hNum,
          dignity: `House ${hNum} in ${SIGNS[signIdx].name}`
        }));

        openDrilldown(`House ${hNum} (${BHAVA_NAMES[hNum - 1]}) in ${SIGNS[signIdx].name}`, list, `${list.length} native charts have ${SIGNS[signIdx].name} as House ${hNum} (${SIGNS[ascIdx].name} Ascendant)`);
      });
    });

  } else {
    // MODE 2: Planetary Occupancy (Graha Density)
    const rawMatrix = analyticsState.houseRashiMatrix;
    if (!rawMatrix) return;

    const pFilter = filterHouseRashiPlanet?.value || 'ALL';

    const filteredMatrix = Array.from({ length: 12 }, (_, h) => {
      return Array.from({ length: 12 }, (_, s) => {
        const allItems = rawMatrix[h][s] || [];
        if (pFilter === 'ALL') return allItems;
        return allItems.filter(item => item.planetKey === pFilter);
      });
    });

    let maxCount = 1;
    for (let h = 0; h < 12; h++) {
      for (let s = 0; s < 12; s++) {
        const len = filteredMatrix[h][s].length;
        if (len > maxCount) maxCount = len;
      }
    }

    let html = '<thead><tr>';
    html += '<th class="planet-col-header">House \\ Rashi (Grahas)</th>';
    SIGNS.forEach(sign => {
      html += `<th>${sign.symbol} ${sign.name}</th>`;
    });
    html += '</tr></thead><tbody>';

    for (let h = 0; h < 12; h++) {
      html += `<tr>`;
      html += `<td class="planet-label-cell" style="color: var(--gold-light);">🏛️ ${BHAVA_NAMES[h]}</td>`;

      for (let s = 0; s < 12; s++) {
        const items = filteredMatrix[h][s] || [];
        const count = items.length;
        const bg = getHeatmapBgColor(count, maxCount);
        const isPositive = count > 0;

        html += `
          <td class="matrix-cell" style="background: ${bg};"
              data-house="${h + 1}" data-rashi="${s}"
              title="House ${h + 1} in ${SIGNS[s].name}: ${count} planetary occupants">
            <span class="matrix-val" style="color: ${isPositive ? 'var(--text-main)' : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};">
              ${count}
            </span>
          </td>
        `;
      }
      html += `</tr>`;
    }

    html += '</tbody>';
    tableMatrixHouseRashi.innerHTML = html;

    tableMatrixHouseRashi.querySelectorAll('td.matrix-cell').forEach(td => {
      td.addEventListener('click', () => {
        const hNum = parseInt(td.dataset.house, 10);
        const signIdx = parseInt(td.dataset.rashi, 10);
        const items = filteredMatrix[hNum - 1][signIdx] || [];

        const requiredAscSignIdx = (signIdx - (hNum - 1) + 12) % 12;
        const ascSign = SIGNS[requiredAscSignIdx];
        const matchingCharts = Object.values(analyticsState.chartMap).filter(c => c.ascSignIndex === requiredAscSignIdx);

        const list = items.map(item => ({
          id: item.id,
          name: item.name,
          gender: item.gender,
          sign: `${item.planetKey} in ${SIGNS[signIdx].name}`,
          deg: item.deg,
          house: hNum,
          dignity: item.dignity,
          isRetro: item.isRetro
        }));

        let subText = '';
        if (items.length > 0) {
          subText = `${items.length} planetary occupant(s) in House ${hNum} (${SIGNS[signIdx].name}) across ${matchingCharts.length} ${ascSign.name} Ascendant charts in the databank.`;
        } else {
          const names = matchingCharts.map(c => c.name).join(', ') || 'None';
          subText = `House ${hNum} falls in ${SIGNS[signIdx].name} for ${matchingCharts.length} ${ascSign.name} Ascendant charts (${names}), but House ${hNum} is vacant / empty with 0 occupying planets.`;
        }

        openDrilldown(`House ${hNum} (${BHAVA_NAMES[hNum - 1]}) in ${SIGNS[signIdx].name}`, list, subText);
      });
    });
  }
}

/**
 * Render House Lords (Bhaveshas 1–12) Placement Matrix
 */
function renderMatrixHouseLords() {
  if (!tableMatrixLords || !analyticsState) return;

  const isHouseMode = activeLordsMode === 'house';
  const matrix = isHouseMode ? analyticsState.lordHouseMatrix : analyticsState.lordRashiMatrix;
  if (!matrix) return;

  let maxCount = 1;
  for (let h = 0; h < 12; h++) {
    for (let col = 0; col < 12; col++) {
      const len = matrix[h][col]?.length || 0;
      if (len > maxCount) maxCount = len;
    }
  }

  let html = '<thead><tr>';
  html += `<th class="planet-col-header">House Lord \\ ${isHouseMode ? 'Target House' : 'Target Sign'}</th>`;

  if (isHouseMode) {
    for (let h = 1; h <= 12; h++) {
      html += `<th>House ${h}</th>`;
    }
  } else {
    SIGNS.forEach(sign => {
      html += `<th>${sign.symbol} ${sign.name}</th>`;
    });
  }
  html += '</tr></thead><tbody>';

  for (let h = 0; h < 12; h++) {
    const lordName = BHAVASHA_NAMES[h];
    html += `<tr>`;
    html += `<td class="planet-label-cell" style="color: var(--gold-light);">👑 ${lordName}</td>`;

    for (let col = 0; col < 12; col++) {
      const items = matrix[h][col] || [];
      const count = items.length;
      let bg = getHeatmapBgColor(count, maxCount);
      let yogaBorder = '';
      let yogaBadge = '';

      if (isHouseMode) {
        // 1. Own House (Diagonal) -> Swakshetra / Bhava Bala
        if (h === col && count > 0) {
          bg = 'rgba(245, 158, 11, 0.22)';
          yogaBorder = 'outline: 2px dashed rgba(245, 158, 11, 0.6);';
          yogaBadge = '👑';
        }
        // 2. Dharma-Karmadhipati Supreme Raja Yoga (9th in 10th or 10th in 9th)
        else if (((h === 8 && col === 9) || (h === 9 && col === 8)) && count > 0) {
          bg = 'rgba(16, 185, 129, 0.25)';
          yogaBorder = 'outline: 2px solid rgba(16, 185, 129, 0.7);';
          yogaBadge = '✨';
        }
        // 3. Viparita Raja Yogas (6, 8, 12 in 6, 8, 12)
        else if ([5, 7, 11].includes(h) && [5, 7, 11].includes(col) && count > 0) {
          bg = 'rgba(139, 92, 246, 0.22)';
          yogaBorder = 'outline: 2px solid rgba(139, 92, 246, 0.6);';
          yogaBadge = '⚡';
        }
      }

      const isPositive = count > 0;

      html += `
        <td class="matrix-cell" style="background: ${bg}; ${yogaBorder}"
            data-lord="${h + 1}" data-col="${col}"
            title="${lordName} placed in ${isHouseMode ? `House ${col + 1}` : SIGNS[col].name}: ${count} charts">
          <span class="matrix-val" style="color: ${isPositive ? 'var(--text-main)' : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};">
            ${count} ${yogaBadge}
          </span>
        </td>
      `;
    }
    html += `</tr>`;
  }

  html += '</tbody>';
  tableMatrixLords.innerHTML = html;

  tableMatrixLords.querySelectorAll('td.matrix-cell').forEach(td => {
    td.addEventListener('click', () => {
      const lordIdx = parseInt(td.dataset.lord, 10) - 1;
      const colIdx = parseInt(td.dataset.col, 10);
      const items = matrix[lordIdx][colIdx] || [];

      const list = items.map(item => {
        let yogaTag = '';
        if (isHouseMode) {
          if (lordIdx === colIdx) yogaTag = '👑 Swakshetra (Own House)';
          else if ((lordIdx === 8 && colIdx === 9) || (lordIdx === 9 && colIdx === 8)) yogaTag = '✨ Dharma-Karmadhipati Raja Yoga';
          else if ([5, 7, 11].includes(lordIdx) && [5, 7, 11].includes(colIdx)) yogaTag = '⚡ Viparita Raja Yoga';
        }

        return {
          id: item.id,
          name: item.name,
          gender: item.gender,
          sign: `${item.lordKey} in ${item.targetSignName || ''}`,
          house: item.targetHouse,
          deg: item.deg,
          dignity: yogaTag || item.dignity,
          isRetro: item.isRetro
        };
      });

      const targetTitle = isHouseMode ? `House ${colIdx + 1}` : SIGNS[colIdx].name;
      openDrilldown(`${BHAVASHA_NAMES[lordIdx]} placed in ${targetTitle}`, list, `Found in ${list.length} native charts`);
    });
  });
}

/**
 * Render Planets × Nakshatras (27 Stars) Matrix
 */
function renderMatrixNakshatra() {
  if (!tableMatrixNakshatra || !analyticsState) return;

  const matrix = analyticsState.planetNakshatraMatrix;
  if (!matrix) return;

  const NAKSHATRA_ENTITIES = ['ASC', ...PLANET_ORDER];
  const NAKSHATRA_ENTITY_LABELS = {
    ASC: '🏹 Lagna',
    Sun: '☀️ Sun',
    Moon: '🌙 Moon',
    Mars: '♂ Mars',
    Merc: '☿ Merc',
    Jupt: '♃ Jupt',
    Venu: '♀ Venu',
    Satn: '♄ Satn',
    Rahu: '☊ Rahu',
    Ketu: '☋ Ketu'
  };

  let maxCount = 1;
  NAKSHATRA_ENTITIES.forEach(k => {
    for (let n = 0; n < 27; n++) {
      const len = matrix[k] ? (matrix[k][n]?.length || 0) : 0;
      if (len > maxCount) maxCount = len;
    }
  });

  const isVertical = activeNakshatraOrientation === 'vertical';

  if (isVertical) {
    // VERTICAL LAYOUT: 27 Nakshatras as Rows, Lagna + 9 Planets as Columns
    let html = '<thead><tr>';
    html += '<th class="planet-col-header" style="min-width: 150px;">Nakshatra</th>';
    html += '<th style="min-width: 75px;">Lord</th>';
    
    NAKSHATRA_ENTITIES.forEach(k => {
      const pColor = k === 'ASC' ? '#06B6D4' : (PLANET_COLORS[k] || 'var(--text-main)');
      const label = NAKSHATRA_ENTITY_LABELS[k] || k;
      const title = k === 'ASC' ? 'Ascendant (Lagna) Star' : (k === 'Moon' ? 'Moon (Janma Nakshatra)' : (PLANET_NAMES[k] || k));
      html += `<th style="color: ${pColor}; min-width: 65px;" title="${title}">${label}</th>`;
    });
    html += '<th style="color: var(--gold-primary); min-width: 65px;">Total Grahas</th>';
    html += '</tr></thead><tbody>';

    for (let n = 0; n < 27; n++) {
      const nak = NAKSHATRAS[n];

      // Sum all 9 grahas for this nakshatra (excluding ASC from planet count)
      let nakTotal = 0;
      PLANET_ORDER.forEach(k => {
        nakTotal += (matrix[k] ? (matrix[k][n]?.length || 0) : 0);
      });

      html += `<tr>`;
      html += `<td class="planet-label-cell" style="color: var(--text-main);">#${n + 1} ${nak.name}</td>`;
      html += `<td style="color: var(--text-dim); font-size: 0.76rem; font-weight: 600;">${nak.lord}</td>`;

      NAKSHATRA_ENTITIES.forEach(k => {
        const items = matrix[k] ? (matrix[k][n] || []) : [];
        const count = items.length;
        const bg = getHeatmapBgColor(count, maxCount);
        const isPositive = count > 0;
        const pLabel = k === 'ASC' ? 'Lagna' : (PLANET_NAMES[k] || k);

        html += `
          <td class="matrix-cell" style="background: ${bg};"
              data-entity="${k}" data-nak="${n}"
              title="${pLabel} in #${n + 1} ${nak.name}: ${count} charts">
            <span class="matrix-val" style="color: ${isPositive ? (k === 'ASC' ? '#06B6D4' : 'var(--text-main)') : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};">
              ${count}
            </span>
          </td>
        `;
      });

      // Total 9 Grahas in this Nakshatra
      html += `
        <td class="matrix-cell" style="background: ${nakTotal > 0 ? 'rgba(245, 158, 11, 0.08)' : 'transparent'};"
            data-nak-total="${n}" title="Total ${nakTotal} planets in #${n + 1} ${nak.name}">
          <span class="matrix-val" style="color: ${nakTotal > 0 ? 'var(--gold-light)' : 'var(--text-dim)'}; font-weight: 800;">
            ${nakTotal}
          </span>
        </td>
      `;

      html += `</tr>`;
    }

    html += '</tbody>';
    tableMatrixNakshatra.innerHTML = html;

    // Attach click listeners for Vertical view
    tableMatrixNakshatra.querySelectorAll('td.matrix-cell[data-entity]').forEach(td => {
      td.addEventListener('click', () => {
        const eKey = td.dataset.entity;
        const nakIdx = parseInt(td.dataset.nak, 10);
        const nak = NAKSHATRAS[nakIdx];
        const items = matrix[eKey] ? (matrix[eKey][nakIdx] || []) : [];

        if (eKey === 'ASC') {
          const list = items.map(item => ({
            id: item.id,
            name: item.name,
            gender: item.gender,
            sign: `Lagna in ${nak.name} (${nak.lord})`,
            deg: item.deg,
            dignity: `Pada ${item.pada || 1}`
          }));
          openDrilldown(`Lagna (Ascendant) in #${nakIdx + 1} ${nak.name} (${nak.lord})`, list, `${list.length} charts with Ascendant in this star`);
        } else if (eKey === 'Moon') {
          const list = items.map(item => ({
            id: item.id,
            name: item.name,
            gender: item.gender,
            sign: `Moon in ${nak.name} (${nak.lord})`,
            deg: item.deg,
            dignity: `Pada ${item.pada || 1} • Janma Nakshatra`
          }));
          openDrilldown(`Janma Nakshatra (Moon) in #${nakIdx + 1} ${nak.name} (${nak.lord})`, list, `${list.length} charts with Janma Moon in this star`);
        } else {
          openDrilldown(`${PLANET_NAMES[eKey]} in #${nakIdx + 1} ${nak.name} (${nak.lord})`, items, `Found in ${items.length} charts`);
        }
      });
    });

    tableMatrixNakshatra.querySelectorAll('td.matrix-cell[data-nak-total]').forEach(td => {
      td.addEventListener('click', () => {
        const nakIdx = parseInt(td.dataset.nakTotal, 10);
        const nak = NAKSHATRAS[nakIdx];
        const allItems = [];
        PLANET_ORDER.forEach(k => {
          (matrix[k] ? (matrix[k][nakIdx] || []) : []).forEach(item => {
            allItems.push({
              id: item.id,
              name: item.name,
              gender: item.gender,
              sign: `${k} in ${nak.name}`,
              deg: item.deg,
              dignity: item.dignity,
              house: item.house
            });
          });
        });
        openDrilldown(`All Planets in #${nakIdx + 1} ${nak.name} (${nak.lord})`, allItems, `Total ${allItems.length} planetary occupants`);
      });
    });

  } else {
    // HORIZONTAL LAYOUT: 27 Nakshatras as Columns, Lagna + 9 Planets as Rows
    let html = '<thead><tr>';
    html += '<th class="planet-col-header">Planet / Star</th>';
    NAKSHATRAS.forEach((nak, i) => {
      html += `<th title="${nak.name} (${nak.lord}) - ${nak.deity}">#${i + 1} ${nak.name}<br><small style="color: var(--text-dim); font-size: 0.68rem;">(${nak.lord})</small></th>`;
    });
    html += '</tr></thead><tbody>';

    NAKSHATRA_ENTITIES.forEach(k => {
      const pColor = k === 'ASC' ? '#06B6D4' : (PLANET_COLORS[k] || 'var(--text-main)');
      const label = NAKSHATRA_ENTITY_LABELS[k] || k;
      html += `<tr>`;
      html += `<td class="planet-label-cell" style="color: ${pColor};">${label}</td>`;

      for (let n = 0; n < 27; n++) {
        const items = matrix[k] ? (matrix[k][n] || []) : [];
        const count = items.length;
        const bg = getHeatmapBgColor(count, maxCount);
        const isPositive = count > 0;
        const nak = NAKSHATRAS[n];
        const pLabel = k === 'ASC' ? 'Lagna' : (PLANET_NAMES[k] || k);

        html += `
          <td class="matrix-cell" style="background: ${bg};"
              data-entity="${k}" data-nak="${n}"
              title="${pLabel} in ${nak.name}: ${count} charts">
            <span class="matrix-val" style="color: ${isPositive ? (k === 'ASC' ? '#06B6D4' : 'var(--text-main)') : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};">
              ${count}
            </span>
          </td>
        `;
      }
      html += `</tr>`;
    });

    html += '</tbody>';
    tableMatrixNakshatra.innerHTML = html;

    tableMatrixNakshatra.querySelectorAll('td.matrix-cell').forEach(td => {
      td.addEventListener('click', () => {
        const eKey = td.dataset.entity;
        const nakIdx = parseInt(td.dataset.nak, 10);
        const nak = NAKSHATRAS[nakIdx];
        const items = matrix[eKey] ? (matrix[eKey][nakIdx] || []) : [];
        const pLabel = eKey === 'ASC' ? 'Lagna (Ascendant)' : (PLANET_NAMES[eKey] || eKey);
        openDrilldown(`${pLabel} in #${nakIdx + 1} ${nak.name} (${nak.lord})`, items, `Found in ${items.length} charts`);
      });
    });
  }
}

/**
 * Render Section 2: Quantitative Potency (Shadbala & Ashtakavarga Norms)
 */
function renderPotencyNorms() {
  if (!analyticsState) return;

  const { shadbalaNorms, ashtakavargaNorms, vargottamaStats, totalCharts } = analyticsState;

  // 1. Shadbala Norms Table
  if (tableShadbalaNorms && shadbalaNorms) {
    let html = `
      <thead>
        <tr>
          <th>Graha</th>
          <th>Avg Virupas</th>
          <th>Req. Virupas</th>
          <th>Potency Ratio</th>
          <th>Pass Rate</th>
          <th>Top #1 Rank</th>
        </tr>
      </thead>
      <tbody>
    `;

    SHADBALA_PLANETS.forEach(k => {
      const s = shadbalaNorms[k];
      if (!s) return;
      const pColor = PLANET_COLORS[k] || 'var(--text-main)';
      const isPass = s.ratio >= 1.0;
      const ratioColor = isPass ? '#059669' : '#EF4444';

      html += `
        <tr style="cursor: pointer;" data-shadbala-planet="${k}" title="Click to view all ${s.profiles.length} charts sorted by ${PLANET_NAMES[k]} Shadbala">
          <td style="color: ${pColor};">● ${PLANET_NAMES[k] || k}</td>
          <td style="font-weight: 700; color: var(--text-main);">${s.avgVirupas} <small style="color: var(--text-dim);">(${s.rupasAvg} R)</small></td>
          <td style="color: var(--text-muted);">${s.required} <small style="color: var(--text-dim);">(${s.requiredRupas || (s.required / 60).toFixed(1)} R)</small></td>
          <td style="font-weight: 800; color: ${ratioColor};">${s.ratio}x</td>
          <td><span style="font-size: 0.74rem; padding: 2px 6px; border-radius: 4px; background: ${isPass ? 'rgba(5, 150, 105, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${ratioColor}; font-weight: 700;">${s.passRate}%</span></td>
          <td style="font-weight: 700; color: var(--gold-light);">${s.rank1Count} charts</td>
        </tr>
      `;
    });

    html += `</tbody>`;
    tableShadbalaNorms.innerHTML = html;

    tableShadbalaNorms.querySelectorAll('tr[data-shadbala-planet]').forEach(tr => {
      tr.addEventListener('click', () => {
        const pKey = tr.getAttribute('data-shadbala-planet');
        const s = shadbalaNorms[pKey];
        if (!s) return;
        const list = s.profiles.map(p => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          dignity: `${p.virupas} Virupas (Rank #${p.rank})`,
          deg: p.rupas,
          sign: `Shadbala: ${p.rupas} Rupas`
        }));
        openDrilldown(`${PLANET_NAMES[pKey]} Shadbala Distribution`, list, `Sorted by descending Virupas across ${list.length} charts`);
      });
    });
  }

  // 2. Sarvashtakavarga (SAV) 12 Bhavas
  if (containerSavBars && ashtakavargaNorms) {
    const { houseAverages, benchmarkDiff, labhaAvg, vyayaAvg, labhaVyayaRatio, extremes } = ashtakavargaNorms;

    let html = '';
    for (let h = 0; h < 12; h++) {
      const avg = houseAverages[h];
      const diff = benchmarkDiff[h];
      const pctWidth = Math.min(100, Math.max(10, ((avg - 18) / 18) * 100)); // Scaled around 18-36 range
      const isPositive = diff >= 0;
      const diffColor = isPositive ? '#059669' : '#DC2626';
      const fillColor = avg >= 30 ? 'linear-gradient(90deg, #F59E0B, #10B981)' : (avg >= 28 ? 'var(--gold-primary)' : 'linear-gradient(90deg, #3B82F6, #6366F1)');

      html += `
        <div class="sav-house-row" style="cursor: pointer;" data-sav-house="${h + 1}" title="Click to inspect all charts for ${BHAVA_NAMES[h]}">
          <span class="sav-house-label">H${h + 1}</span>
          <div class="sav-bar-wrap">
            <div class="sav-bar-fill" style="width: ${pctWidth}%; background: ${fillColor};"></div>
          </div>
          <span class="sav-pts-val">${avg} pts</span>
          <span class="sav-diff-badge" style="background: ${isPositive ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)'}; color: ${diffColor};">
            ${diff >= 0 ? '+' : ''}${diff}
          </span>
        </div>
      `;
    }
    containerSavBars.innerHTML = html;

    if (labhaVyayaRatioVal) labhaVyayaRatioVal.textContent = `${labhaVyayaRatio}x`;
    if (labhaVyayaSub) labhaVyayaSub.textContent = `H11 (${labhaAvg} pts) ÷ H12 (${vyayaAvg} pts)`;

    containerSavBars.querySelectorAll('.sav-house-row').forEach(row => {
      row.addEventListener('click', () => {
        const hNum = parseInt(row.getAttribute('data-sav-house'), 10);
        const extreme = extremes[hNum - 1];
        if (!extreme || !extreme.distribution) return;

        const sorted = [...extreme.distribution].sort((a, b) => b.points - a.points);
        const list = sorted.map(item => ({
          id: item.id,
          name: item.name,
          dignity: `${item.points} SAV Bindus`,
          sign: BHAVA_NAMES[hNum - 1]
        }));

        openDrilldown(`${BHAVA_NAMES[hNum - 1]} Sarvashtakavarga`, list, `Average: ${houseAverages[hNum - 1]} pts (Min: ${extreme.minPts}, Max: ${extreme.maxPts})`);
      });
    });
  }

  // 3. Vargottama Badges Row
  if (gridVargottamaBadges && vargottamaStats) {
    let html = '';
    const allVargKeys = ['ASC', ...PLANET_KEYS];

    allVargKeys.forEach(k => {
      const v = vargottamaStats[k] || { count: 0, profileIds: [] };
      const pct = totalCharts > 0 ? ((v.count / totalCharts) * 100).toFixed(1) : 0;
      const pColor = PLANET_COLORS[k] || 'var(--gold-primary)';

      html += `
        <div class="vargottama-badge-card" data-varg-key="${k}" title="Click to view ${v.count} charts with Vargottama ${k}">
          <div style="font-size: 0.8rem; font-weight: 700; color: ${pColor};">${k === 'ASC' ? 'Ascendant' : k}</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 2px 0;">${v.count}</div>
          <div style="font-size: 0.7rem; color: var(--text-dim);">${pct}%</div>
        </div>
      `;
    });
    gridVargottamaBadges.innerHTML = html;

    gridVargottamaBadges.querySelectorAll('.vargottama-badge-card').forEach(card => {
      card.addEventListener('click', () => {
        const k = card.getAttribute('data-varg-key');
        const v = vargottamaStats[k];
        if (!v || !v.profileIds) return;

        const list = resolveProfileItems(v.profileIds, (c) => {
          const pl = k === 'ASC' ? { signName: c.ascSignName } : c.planets[k];
          return {
            id: c.id,
            name: c.name,
            gender: c.gender,
            sign: pl ? pl.signName : '',
            dignity: 'Vargottama (D1 ≡ D9)'
          };
        });

        openDrilldown(`Vargottama ${k === 'ASC' ? 'Ascendant (Lagna)' : k}`, list, `Occurs in ${list.length} native charts`);
      });
    });
  }
}

/**
 * Render Section 3: Macro Distributions
 */
function renderDistributions() {
  if (!analyticsState) return;
  const { distributions, totalCharts } = analyticsState;

  // 1. Ascendant
  if (gridAscDist && distributions.ascDist) {
    let html = '';
    const sorted = [...distributions.ascDist].sort((a, b) => b.count - a.count);
    const max = sorted[0]?.count || 1;

    sorted.forEach(item => {
      const pct = totalCharts > 0 ? ((item.count / totalCharts) * 100).toFixed(1) : 0;
      const barPct = (item.count / max) * 100;
      html += `
        <div class="meter-item" data-type="asc" data-idx="${item.signIndex}" title="Click to view charts">
          <div class="meter-labels">
            <span>${item.symbol} ${item.name}</span>
            <span>${item.count} <small style="color: var(--text-dim);">(${pct}%)</small></span>
          </div>
          <div class="meter-bar-track">
            <div class="meter-bar-fill" style="width: ${barPct}%; background: #6366F1;"></div>
          </div>
        </div>
      `;
    });
    gridAscDist.innerHTML = html;

    gridAscDist.querySelectorAll('.meter-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        const data = distributions.ascDist.find(d => d.signIndex === idx);
        if (data && data.profileIds) {
          const list = resolveProfileItems(data.profileIds, (c) => ({
            id: c.id,
            name: c.name,
            gender: c.gender,
            sign: c.ascSignName,
            house: 1
          }));
          openDrilldown(`Ascendant (Lagna): ${data.name}`, list);
        }
      });
    });
  }

  // 2. Moon Sign
  if (gridMoonDist && distributions.moonDist) {
    let html = '';
    const sorted = [...distributions.moonDist].sort((a, b) => b.count - a.count);
    const max = sorted[0]?.count || 1;

    sorted.forEach(item => {
      const pct = totalCharts > 0 ? ((item.count / totalCharts) * 100).toFixed(1) : 0;
      const barPct = (item.count / max) * 100;
      html += `
        <div class="meter-item" data-type="moon" data-idx="${item.signIndex}" title="Click to view charts">
          <div class="meter-labels">
            <span>${item.symbol} ${item.name}</span>
            <span>${item.count} <small style="color: var(--text-dim);">(${pct}%)</small></span>
          </div>
          <div class="meter-bar-track">
            <div class="meter-bar-fill" style="width: ${barPct}%; background: #06B6D4;"></div>
          </div>
        </div>
      `;
    });
    gridMoonDist.innerHTML = html;

    gridMoonDist.querySelectorAll('.meter-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        const data = distributions.moonDist.find(d => d.signIndex === idx);
        if (data && data.profileIds) {
          const list = resolveProfileItems(data.profileIds, (c) => ({
            id: c.id,
            name: c.name,
            gender: c.gender,
            sign: c.moonSignName,
            dignity: `Moon in ${c.moonSignName}`
          }));
          openDrilldown(`Moon Sign: ${data.name}`, list);
        }
      });
    });
  }

  // 3. Moon Nakshatras (Top 8)
  if (gridNakshatraDist && distributions.nakshatraDist) {
    let html = '';
    const sorted = [...distributions.nakshatraDist].sort((a, b) => b.moonCount - a.moonCount).slice(0, 8);
    const max = sorted[0]?.moonCount || 1;

    sorted.forEach(item => {
      const pct = totalCharts > 0 ? ((item.moonCount / totalCharts) * 100).toFixed(1) : 0;
      const barPct = max > 0 ? (item.moonCount / max) * 100 : 0;
      html += `
        <div class="meter-item" data-type="nak" data-idx="${item.nakIndex}" title="Click to view charts with Moon in ${item.name}">
          <div class="meter-labels">
            <span>#${item.nakIndex + 1} ${item.name} <small style="color: var(--text-dim);">(${item.lord})</small></span>
            <span>${item.moonCount} <small style="color: var(--text-dim);">(${pct}%)</small></span>
          </div>
          <div class="meter-bar-track">
            <div class="meter-bar-fill" style="width: ${barPct}%; background: var(--gold-primary);"></div>
          </div>
        </div>
      `;
    });
    gridNakshatraDist.innerHTML = html;

    gridNakshatraDist.querySelectorAll('.meter-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        const data = distributions.nakshatraDist[idx];
        if (data && data.profileIds) {
          const list = resolveProfileItems(data.profileIds, (c) => ({
            id: c.id,
            name: c.name,
            gender: c.gender,
            sign: c.moonSignName,
            dignity: `Moon in ${data.name} (${data.lord})`
          }));
          openDrilldown(`Janma Nakshatra: ${data.name} (${data.lord})`, list);
        }
      });
    });
  }

  // 4. Decades
  if (gridDecadeDist && distributions.decadeDist) {
    let html = '';
    const entries = Object.entries(distributions.decadeDist);
    const max = Math.max(...entries.map(e => e[1].count), 1);

    entries.forEach(([dec, data]) => {
      const pct = totalCharts > 0 ? ((data.count / totalCharts) * 100).toFixed(1) : 0;
      const barPct = (data.count / max) * 100;
      html += `
        <div class="meter-item" data-type="decade" data-key="${dec}" title="Click to view charts">
          <div class="meter-labels">
            <span>${dec}</span>
            <span>${data.count} <small style="color: var(--text-dim);">(${pct}%)</small></span>
          </div>
          <div class="meter-bar-track">
            <div class="meter-bar-fill" style="width: ${barPct}%; background: #3B82F6;"></div>
          </div>
        </div>
      `;
    });
    gridDecadeDist.innerHTML = html;

    gridDecadeDist.querySelectorAll('.meter-item').forEach(item => {
      item.addEventListener('click', () => {
        const dec = item.dataset.key;
        const data = distributions.decadeDist[dec];
        if (data && data.profileIds) {
          const list = resolveProfileItems(data.profileIds, (c) => ({
            id: c.id,
            name: c.name,
            gender: c.gender,
            sign: `YOB: ${c.yob || 'N/A'}`
          }));
          openDrilldown(`Birth Decade: ${dec}`, list);
        }
      });
    });
  }

  // 5. Retrogrades
  if (gridRetroDist && distributions.retroPlanets) {
    let html = '';
    const entries = Object.entries(distributions.retroPlanets);
    const max = Math.max(...entries.map(e => e[1].count), 1);

    entries.forEach(([pKey, data]) => {
      const pct = totalCharts > 0 ? ((data.count / totalCharts) * 100).toFixed(1) : 0;
      const barPct = (data.count / max) * 100;
      const pColor = PLANET_COLORS[pKey] || '#F59E0B';

      html += `
        <div class="meter-item" data-type="retro" data-key="${pKey}" title="Click to view charts">
          <div class="meter-labels">
            <span style="color: ${pColor};">● ${PLANET_NAMES[pKey]}</span>
            <span>${data.count} <small style="color: var(--text-dim);">(${pct}%)</small></span>
          </div>
          <div class="meter-bar-track">
            <div class="meter-bar-fill" style="width: ${barPct}%; background: ${pColor};"></div>
          </div>
        </div>
      `;
    });
    gridRetroDist.innerHTML = html;

    gridRetroDist.querySelectorAll('.meter-item').forEach(item => {
      item.addEventListener('click', () => {
        const pKey = item.dataset.key;
        const data = distributions.retroPlanets[pKey];
        if (data && data.profileIds) {
          const list = resolveProfileItems(data.profileIds, (c) => {
            const pl = c.planets ? c.planets[pKey] : null;
            return {
              id: c.id,
              name: c.name,
              gender: c.gender,
              sign: pl ? pl.signName : '',
              isRetro: true,
              house: pl ? pl.house : undefined
            };
          });
          openDrilldown(`Retrograde: ${PLANET_NAMES[pKey]} [R]`, list);
        }
      });
    });
  }
}

/**
 * Render Planetary Dignity Frequency Table
 */
function renderDignityMatrix() {
  if (!tableDignityMatrix || !analyticsState) return;

  const dignities = analyticsState.dignityCounts;
  const DIGNITY_COLS = [
    { key: 'Deep Exalt', label: 'Deep Exalt 👑', color: '#059669', bg: 'rgba(5, 150, 105, 0.15)' },
    { key: 'Exalted', label: 'Exalted ✨', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
    { key: 'Moola', label: 'Moolatrikona 🏛️', color: '#D97706', bg: 'rgba(217, 119, 6, 0.15)' },
    { key: 'Own', label: 'Own Sign 🏰', color: '#B45309', bg: 'rgba(180, 83, 9, 0.12)' },
    { key: 'Friendly', label: 'Friendly 🤝', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' },
    { key: 'Neutral', label: 'Neutral ⚖️', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.08)' },
    { key: 'Enemy', label: 'Enemy ⚔️', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)' },
    { key: 'Debilitated', label: 'Debilitated 🔻', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' },
    { key: 'Deep Debi', label: 'Deep Debi ⚠️', color: '#991B1B', bg: 'rgba(153, 27, 27, 0.18)' },
    { key: 'Combust', label: 'Combust 🔥', color: '#C2410C', bg: 'rgba(194, 65, 12, 0.15)' }
  ];

  let html = '<thead><tr>';
  html += '<th class="planet-col-header">Planet</th>';
  DIGNITY_COLS.forEach(c => {
    html += `<th style="color: ${c.color};">${c.label}</th>`;
  });
  html += '</tr></thead><tbody>';

  PLANET_ORDER.forEach(k => {
    const pColor = PLANET_COLORS[k] || 'var(--text-main)';
    html += `<tr>`;
    html += `<td class="planet-label-cell" style="color: ${pColor};">● ${PLANET_NAMES[k] || k}</td>`;

    DIGNITY_COLS.forEach(c => {
      const data = dignities[k][c.key] || { count: 0, profileIds: [] };
      const count = data.count;
      const isPositive = count > 0;
      const clickableClass = isPositive ? 'clickable' : '';

      html += `
        <td class="dignity-cell ${clickableClass}" style="background: ${isPositive ? c.bg : 'transparent'}; color: ${isPositive ? c.color : 'var(--text-dim)'}; font-weight: ${isPositive ? '700' : '400'};"
            data-planet="${k}" data-dignity="${c.key}" data-label="${c.label}"
            title="${isPositive ? `Click to inspect ${count} charts with ${PLANET_NAMES[k]} in ${c.label}` : 'No charts'}">
          ${count}
        </td>
      `;
    });
    html += `</tr>`;
  });

  html += '</tbody>';
  tableDignityMatrix.innerHTML = html;

  tableDignityMatrix.querySelectorAll('td.dignity-cell.clickable').forEach(td => {
    td.addEventListener('click', () => {
      const pKey = td.dataset.planet;
      const digKey = td.dataset.dignity;
      const digLabel = td.dataset.label;
      const dData = dignities[pKey][digKey];
      if (!dData || !dData.profileIds) return;

      const list = resolveProfileItems(dData.profileIds, (c) => {
        const pl = c.planets ? c.planets[pKey] : null;
        return {
          id: c.id,
          name: c.name,
          gender: c.gender,
          sign: pl ? pl.signName : '',
          deg: pl ? pl.degInSign : undefined,
          isRetro: pl ? pl.isRetro : false,
          dignity: digKey,
          house: pl ? pl.house : undefined
        };
      });

      openDrilldown(`${PLANET_NAMES[pKey]} Dignity: ${digLabel}`, list, `Found in ${list.length} native charts`);
    });
  });
}

/**
 * Render Exhaustive 2-Planet Conjunctions (All 36 Pairs)
 */
function renderConjunctions() {
  if (!analyticsState || !containerConjunctionPairs) return;
  const { conjunctionPairs, totalCharts } = analyticsState;

  const planetFilter = filterConjunctionPlanet?.value || 'ALL';
  const typeFilter = filterConjunctionType?.value || 'ALL';
  const searchTerm = (searchConjunctions?.value || '').trim().toLowerCase();

  let pairs = Object.values(conjunctionPairs);

  // Filter by Planet
  if (planetFilter !== 'ALL') {
    pairs = pairs.filter(p => p.p1 === planetFilter || p.p2 === planetFilter);
  }

  // Filter by Type
  if (typeFilter === 'TIGHT') {
    pairs = pairs.filter(p => p.tightCount > 0);
  } else if (typeFilter === 'YUDDHA') {
    pairs = pairs.filter(p => p.grahaYuddhaCount > 0);
  }

  // Filter by Search Term
  if (searchTerm) {
    pairs = pairs.filter(p => {
      const p1N = (PLANET_NAMES[p.p1] || p.p1).toLowerCase();
      const p2N = (PLANET_NAMES[p.p2] || p.p2).toLowerCase();
      const yogaN = (p.yogaName || '').toLowerCase();
      const descN = (p.yogaDesc || '').toLowerCase();
      return p1N.includes(searchTerm) || p2N.includes(searchTerm) || yogaN.includes(searchTerm) || descN.includes(searchTerm);
    });
  }

  // Sort by count descending
  pairs.sort((a, b) => {
    if (typeFilter === 'TIGHT') return b.tightCount - a.tightCount;
    if (typeFilter === 'YUDDHA') return b.grahaYuddhaCount - a.grahaYuddhaCount;
    return b.sameHouseCount - a.sameHouseCount;
  });

  if (conjunctionsCounterBadge) {
    conjunctionsCounterBadge.textContent = `Showing ${pairs.length} of 36 pairs`;
  }

  if (pairs.length === 0) {
    containerConjunctionPairs.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        No conjunction pairs found matching the selected filters.
      </div>
    `;
    return;
  }

  let html = '';
  pairs.forEach(pair => {
    const p1Col = PLANET_COLORS[pair.p1] || 'var(--text-main)';
    const p2Col = PLANET_COLORS[pair.p2] || 'var(--text-main)';

    const count = typeFilter === 'TIGHT' ? pair.tightCount : (typeFilter === 'YUDDHA' ? pair.grahaYuddhaCount : pair.sameHouseCount);
    const pct = totalCharts > 0 ? ((count / totalCharts) * 100).toFixed(1) : 0;

    html += `
      <div class="conjunction-card" data-pair-key="${pair.pairKey}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">
              <span style="color: ${p1Col};">●</span> ${pair.p1} + <span style="color: ${p2Col};">●</span> ${pair.p2}
            </div>
            ${pair.yogaTag ? `<div style="font-size: 0.74rem; font-weight: 700; color: var(--gold-light); margin-top: 2px;">${pair.yogaTag}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <span style="font-size: 1.15rem; font-weight: 800; color: var(--gold-light);">${count}</span>
            <div style="font-size: 0.7rem; color: var(--text-dim);">${pct}%</div>
          </div>
        </div>

        ${pair.yogaDesc ? `<div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.3;">${pair.yogaDesc}</div>` : ''}

        <div style="display: flex; gap: 8px; font-size: 0.7rem; color: var(--text-dim); margin-top: 4px; border-top: 1px solid var(--border-subtle); padding-top: 6px;">
          <span>Same House: <strong>${pair.sameHouseCount}</strong></span>
          <span>•</span>
          <span>Tight (≤5°): <strong style="color: ${pair.tightCount > 0 ? '#059669' : 'inherit'};">${pair.tightCount}</strong></span>
          ${pair.grahaYuddhaCount > 0 ? `<span>•</span><span style="color: #DC2626; font-weight: 700;">War (≤1°): ${pair.grahaYuddhaCount}</span>` : ''}
        </div>
      </div>
    `;
  });

  containerConjunctionPairs.innerHTML = html;

  containerConjunctionPairs.querySelectorAll('.conjunction-card').forEach(card => {
    card.addEventListener('click', () => {
      const pKey = card.getAttribute('data-pair-key');
      const pair = conjunctionPairs[pKey];
      if (!pair) return;

      const p1N = PLANET_NAMES[pair.p1] || pair.p1;
      const p2N = PLANET_NAMES[pair.p2] || pair.p2;

      let targetIds = pair.profileIds;
      let filterTitle = `Same House Conjunction (${pair.sameHouseCount} charts)`;
      if (typeFilter === 'TIGHT') {
        targetIds = pair.tightProfileIds.map(item => item.id);
        filterTitle = `Tight Conjunction ≤ 5.0° Orb (${pair.tightCount} charts)`;
      } else if (typeFilter === 'YUDDHA') {
        targetIds = pair.yuddhaProfileIds.map(item => item.id);
        filterTitle = `Graha Yuddha (Planetary War ≤ 1.0°) (${pair.grahaYuddhaCount} charts)`;
      }

      const list = resolveProfileItems(targetIds, (c) => {
        const pl1 = c.planets ? c.planets[pair.p1] : null;
        const pl2 = c.planets ? c.planets[pair.p2] : null;
        let diffStr = '';
        if (pl1 && pl2) {
          let diff = Math.abs(pl1.totalDeg - pl2.totalDeg);
          if (diff > 180) diff = 360 - diff;
          diffStr = ` (Orb: ${diff.toFixed(2)}°)`;
        }

        return {
          id: c.id,
          name: c.name,
          gender: c.gender,
          sign: pl1 ? pl1.signName : '',
          house: pl1 ? pl1.house : undefined,
          dignity: `${pair.p1} + ${pair.p2}${diffStr}`
        };
      });

      openDrilldown(`Yuti: ${p1N} + ${p2N}`, list, `${pair.yogaName ? pair.yogaName + ' • ' : ''}${filterTitle}`);
    });
  });
}

/**
 * Render Exhaustive Stelliums (3+ Planets in Single House)
 */
function renderStelliums() {
  if (!analyticsState || !containerStelliums) return;
  const { stelliums } = analyticsState;

  const houseFilter = filterStelliumHouse?.value || 'ALL';
  const searchTerm = (searchStelliums?.value || '').trim().toLowerCase();

  // Pill counters
  if (stelliumsPillCounters && stelliums) {
    stelliumsPillCounters.innerHTML = `
      <span style="font-size: 0.74rem; padding: 4px 10px; border-radius: 12px; background: rgba(99, 102, 241, 0.12); color: #4338CA; font-weight: 700;">
        All: ${stelliums.all?.length || 0}
      </span>
      <span style="font-size: 0.74rem; padding: 4px 10px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); color: #B45309; font-weight: 700;">
        3 Planets: ${stelliums['3 Planets']?.length || 0}
      </span>
      <span style="font-size: 0.74rem; padding: 4px 10px; border-radius: 12px; background: rgba(5, 150, 105, 0.12); color: #059669; font-weight: 700;">
        4 Planets: ${stelliums['4 Planets']?.length || 0}
      </span>
      <span style="font-size: 0.74rem; padding: 4px 10px; border-radius: 12px; background: rgba(220, 38, 38, 0.12); color: #DC2626; font-weight: 700;">
        5+ Planets: ${stelliums['5+ Planets']?.length || 0}
      </span>
    `;
  }

  let list = activeStelliumTab === 'all' ? (stelliums.all || []) : (stelliums[activeStelliumTab] || []);

  // Filter by House
  if (houseFilter !== 'ALL') {
    const hNum = parseInt(houseFilter, 10);
    list = list.filter(st => st.house === hNum);
  }

  // Filter by Search Term
  if (searchTerm) {
    list = list.filter(st => {
      const nameMatch = st.name.toLowerCase().includes(searchTerm);
      const planetMatch = st.planets.some(p => p.toLowerCase().includes(searchTerm));
      const signMatch = (st.signName || '').toLowerCase().includes(searchTerm);
      return nameMatch || planetMatch || signMatch;
    });
  }

  if (list.length === 0) {
    containerStelliums.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        No stelliums found matching the selected filters.
      </div>
    `;
    return;
  }

  let html = '';
  list.forEach(st => {
    const genderSymbol = st.gender === 'female' ? '♀' : '♂';
    const genderColor = st.gender === 'female' ? '#EC4899' : '#2563EB';

    const planetBadges = st.planets.map(pKey => {
      const col = PLANET_COLORS[pKey] || 'var(--text-main)';
      return `<span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.06); border: 1px solid var(--border-subtle); color: ${col}; font-weight: 700;">● ${pKey}</span>`;
    }).join(' ');

    html += `
      <div class="drilldown-card-item" style="padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; align-items: stretch;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.88rem;">
              ${st.name} <span style="color: ${genderColor}; font-weight: 600;">${genderSymbol}</span>
            </div>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">
              House ${st.house} • ${st.signName || ''} • <span style="color: var(--gold-light); font-weight: 600;">Span: ${st.degreeSpan}°</span>
            </div>
          </div>
          <a href="studio.html?profileId=${st.id}" class="btn btn-secondary btn-sm" style="text-decoration: none; padding: 4px 10px; font-size: 0.74rem;">
            🚀 Kundali
          </a>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${planetBadges}
        </div>
      </div>
    `;
  });

  containerStelliums.innerHTML = html;
}

/**
 * Open Drilldown Modal for Inspection
 */
function openDrilldown(title, profileItems, subText = '') {
  if (!drilldownModal) return;

  drilldownModalTitle.textContent = title;
  drilldownModalSub.textContent = subText || `${profileItems.length} matching charts`;

  if (!profileItems || profileItems.length === 0) {
    drilldownItemsList.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-dim); font-size: 0.85rem;">
        No native charts found matching this specific placement.
      </div>
    `;
  } else {
    let html = '';
    profileItems.forEach(item => {
      const initials = (item.name || 'C').substring(0, 2).toUpperCase();
      const degStr = item.deg !== undefined && typeof item.deg === 'number' ? `${item.deg.toFixed(2)}°` : '';
      const dignityBadge = item.dignity ? `<span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: var(--gold-light); font-weight: 600;">${item.dignity}</span>` : '';
      const retroBadge = item.isRetro ? `<span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(239, 68, 68, 0.15); color: #EF4444; font-weight: 700;">[R]</span>` : '';
      const genderSymbol = item.gender === 'female' ? '♀' : '♂';
      const genderColor = item.gender === 'female' ? '#EC4899' : '#2563EB';

      html += `
        <div class="drilldown-card-item">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 34px; height: 34px; border-radius: 6px; background: rgba(0, 0, 0, 0.08); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; color: var(--text-main);">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 0.88rem;">
                ${item.name} <span style="color: ${genderColor}; font-weight: 600; font-size: 0.78rem;">${genderSymbol}</span>
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span>${item.sign || ''} ${degStr}</span>
                ${item.house ? `<span>• House ${item.house}</span>` : ''}
                ${item.pada ? `<span>• Pada ${item.pada}</span>` : ''}
                ${dignityBadge}
                ${retroBadge}
              </div>
            </div>
          </div>
          <a href="studio.html?profileId=${item.id}" class="btn btn-primary btn-sm" style="text-decoration: none; padding: 4px 12px; font-size: 0.78rem;">
            🚀 Open Kundali
          </a>
        </div>
      `;
    });
    drilldownItemsList.innerHTML = html;
  }

  drilldownModal.style.display = 'flex';
}

function closeDrilldown() {
  if (drilldownModal) drilldownModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', init);
