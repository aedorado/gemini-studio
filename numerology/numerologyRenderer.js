/**
 * Vedic Numerology UI Renderer
 * Interactive 3x3 Vedic Grid, 120-Year Timeline, Dasha Views & Bilingual Predictions
 */

import {
  getRootNumber,
  getDestinyNumber,
  getWeekdayValue,
  collectGridNumbers,
  getDigitBreakdown,
  calculateMahadashas,
  calculateAntardashas,
  calculatePratyantars,
  calculateDailyDasha,
  buildMonths,
  findCurrentStatus,
  formatDateDMY,
  PLANET_MAP,
  PLANET_DEVANAGARI,
  VEDIC_GRID_LAYOUT,
  VEDIC_GRID_PLANES,
} from './numerologyEngine.js';

import {
  ROOT_PREDICTIONS,
  DESTINY_PREDICTIONS,
  getCombinedPrediction,
  getComboPrediction,
} from './predictionsData.js';

// Dasha Color Scheme
export const DASHA_COLORS = {
  md: { bg: '#DC2626', text: '#FFFFFF', label: 'Mahadasha', short: 'MD', glow: 'rgba(220, 38, 38, 0.35)' },
  ad: { bg: '#16A34A', text: '#FFFFFF', label: 'Antardasha', short: 'AD', glow: 'rgba(22, 163, 74, 0.35)' },
  pd: { bg: '#D97706', text: '#FFFFFF', label: 'Pratyantar', short: 'PD', glow: 'rgba(217, 119, 6, 0.35)' },
  dd: { bg: '#BE185D', text: '#FFFFFF', label: 'Daily Dasha', short: 'DD', glow: 'rgba(190, 24, 93, 0.35)' },
  bn: { bg: '#EA580C', text: '#FFFFFF', label: 'Birth Number', short: 'BN', glow: 'rgba(234, 88, 12, 0.35)' },
};

// Internal module state
let moduleState = {
  name: '',
  dob: null,
  activeView: 'charts', // 'charts' | 'table'
  filterRange: 'active', // 'active' | 'all' | '0-30' | '30-60' | '60-90' | '90-120'
  predLang: 'hi', // 'hi' | 'en'
  selectedAdForModal: null,
};

/**
 * Initialize or update the Numerology Studio tab
 */
export function renderNumerologyStudio(container, { dob, name }) {
  if (!container) return;

  if (dob) {
    moduleState.dob = dob instanceof Date ? dob : new Date(dob);
  }
  if (name !== undefined) {
    moduleState.name = name || 'Native';
  }

  // If no valid DOB yet
  if (!moduleState.dob || isNaN(moduleState.dob.getTime())) {
    container.innerHTML = `
      <div class="card" style="padding: 32px; text-align: center; margin-top: 16px;">
        <h3 style="color: var(--gold-primary); margin-bottom: 8px;">🔢 Vedic Numerology Studio</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Please calculate a birth chart above or enter a date of birth below to generate the Vedic Grid & 120-Year Dasha Timeline.</p>
        <div style="display: flex; gap: 12px; justify-content: center; align-items: center; max-width: 480px; margin: 0 auto; flex-wrap: wrap;">
          <input type="text" id="num-direct-name" class="text-input" placeholder="Name" value="${escapeHtml(moduleState.name)}" style="flex: 1; min-width: 140px;">
          <input type="date" id="num-direct-dob" class="text-input" style="flex: 1; min-width: 160px;">
          <button id="btn-num-direct-calc" class="btn btn-primary">Generate Grid</button>
        </div>
      </div>
    `;
    attachDirectInputListeners(container);
    return;
  }

  const currentDate = new Date();
  const mahadashas = calculateMahadashas(moduleState.dob);
  const antardashas = calculateAntardashas(moduleState.dob);
  const currentStatus = findCurrentStatus(moduleState.dob, mahadashas, antardashas, currentDate);

  const rn = getRootNumber(moduleState.dob);
  const dn = getDestinyNumber(moduleState.dob);
  const weekdayVal = getWeekdayValue(moduleState.dob);
  const { plainD, rnD, dnD } = getDigitBreakdown(moduleState.dob);
  const gridDigits = collectGridNumbers(moduleState.dob);

  // Build HTML
  let html = `
    <div class="numerology-studio-container" style="display: flex; flex-direction: column; gap: 20px; margin-top: 10px;">
      
      <!-- Top Action & Input Bar -->
      <div class="card" style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.25rem;">🔢</span>
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--gold-primary); margin: 0; line-height: 1.2;">
                Vedic Numerology & 120-Year Dasha
              </h3>
              <p style="font-size: 0.75rem; color: var(--text-dim); margin: 0;">
                Classical 3×3 Vedic Grid · Multi-tier Dasha Timeline · Bilingual Predictions
              </p>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <!-- Date / Name Quick Editor -->
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; background: var(--bg-card-alt); padding: 4px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <span style="color: var(--text-muted);">DOB:</span>
            <input type="date" id="num-bar-dob" value="${toInputDate(moduleState.dob)}" style="background: transparent; border: none; color: var(--text-main); font-family: monospace; font-size: 0.82rem; cursor: pointer;">
          </div>

          <!-- View Switcher -->
          <div style="display: inline-flex; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-card-alt);">
            <button id="btn-num-view-charts" class="btn btn-sm ${moduleState.activeView === 'charts' ? 'btn-primary' : 'btn-secondary'}" style="border: none; border-radius: 0; padding: 4px 12px; font-size: 0.76rem;">
              📊 Grid Charts
            </button>
            <button id="btn-num-view-table" class="btn btn-sm ${moduleState.activeView === 'table' ? 'btn-primary' : 'btn-secondary'}" style="border: none; border-radius: 0; padding: 4px 12px; font-size: 0.76rem;">
              📜 120y Table
            </button>
          </div>

          <!-- Predictions Button -->
          <button id="btn-open-predictions-modal" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #F59E0B, #D97706); border: none; font-weight: 600;">
            ✨ Predictions (भविष्यवाणी)
          </button>
        </div>
      </div>

      <!-- 4 Core Metric Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;">
        <div class="card" style="padding: 14px 16px; border-left: 4px solid var(--gold-primary);">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 2px;">Native</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(moduleState.name)}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: monospace; margin-top: 3px;">
            ${formatDateDMY(moduleState.dob)}
          </div>
        </div>

        <div class="card" style="padding: 14px 16px; border-left: 4px solid #3B82F6;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 2px;">Root Number (मूलांक)</div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-size: 1.8rem; font-weight: 800; color: #3B82F6; line-height: 1; font-family: monospace;">${rn}</span>
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">${PLANET_MAP[rn]} (${PLANET_DEVANAGARI[rn].split(' ')[0]})</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px;">Day ${moduleState.dob.getDate()} personality ruler</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-left: 4px solid #10B981;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 2px;">Destiny Number (भाग्यांक)</div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-size: 1.8rem; font-weight: 800; color: #10B981; line-height: 1; font-family: monospace;">${dn}</span>
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">${PLANET_MAP[dn]} (${PLANET_DEVANAGARI[dn].split(' ')[0]})</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px;">Sum of complete date · Life purpose</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-left: 4px solid #8B5CF6;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 2px;">Birth Weekday (वार)</div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-size: 1.8rem; font-weight: 800; color: #8B5CF6; line-height: 1; font-family: monospace;">${weekdayVal}</span>
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">${moduleState.dob.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px;">Ruler: ${PLANET_MAP[weekdayVal]}</div>
        </div>
      </div>

      <!-- Main Visual Section: 3x3 Vedic Grid (Left) + Active Dasha Showcase (Right) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 18px; align-items: stretch;">
        
        <!-- Left: Interactive 3x3 Vedic Grid Card -->
        <div class="card" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin: 0;">3×3 Vedic Grid</h4>
              <p style="font-size: 0.75rem; color: var(--text-dim); margin: 0;">Placement of DOB digits, Root (r) & Destiny (d)</p>
            </div>
            <div style="display: flex; gap: 8px; font-size: 0.72rem;">
              <span style="background: rgba(59, 130, 246, 0.15); color: #3B82F6; padding: 2px 7px; border-radius: 4px; font-weight: 700;">RN: ${rn}</span>
              <span style="background: rgba(16, 185, 129, 0.15); color: #10B981; padding: 2px 7px; border-radius: 4px; font-weight: 700;">DN: ${dn}</span>
            </div>
          </div>

          <!-- 3x3 Grid Matrix -->
          <div style="display: flex; justify-content: center; padding: 6px 0 16px;">
            ${renderVedicGridMatrix(moduleState.dob, currentStatus)}
          </div>

          <!-- Legend -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; font-size: 0.72rem; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #DC2626;"></span>
              <span style="color: var(--text-muted);">MD: Mahadasha</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #16A34A;"></span>
              <span style="color: var(--text-muted);">AD: Antardasha</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #D97706;"></span>
              <span style="color: var(--text-muted);">PD: Pratyantar</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #BE185D;"></span>
              <span style="color: var(--text-muted);">DD: Daily Dasha</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-weight: 800; color: #DC2626; font-size: 0.8rem;">r</span>
              <span style="color: var(--text-muted);">Root No.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-weight: 800; color: #16A34A; font-size: 0.8rem;">d</span>
              <span style="color: var(--text-muted);">Destiny No.</span>
            </div>
          </div>
        </div>

        <!-- Right: Real-time Active Dasha Showcase -->
        <div class="card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--gold-primary); margin: 0;">Active Dasha Showcase</h4>
                <p style="font-size: 0.75rem; color: var(--text-dim); margin: 0;">Real-time Dasha alignment for today</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.76rem; background: var(--bg-card-alt); border: 1px solid var(--border-subtle); padding: 3px 8px; border-radius: 4px; font-family: monospace; color: var(--text-main);">
                  📅 ${formatDateDMY(currentDate)}
                </span>
              </div>
            </div>

            <!-- Active Dasha Hierarchy Rows -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              
              <!-- Mahadasha Row -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card-alt); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 4px solid #DC2626;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="background: #DC2626; color: #FFF; font-weight: 800; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px;">MD</span>
                  <div>
                    <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
                      ${currentStatus.md ? `${PLANET_MAP[currentStatus.md.number]} (${currentStatus.md.number})` : '—'}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">
                      ${currentStatus.md ? `${formatDateDMY(currentStatus.md.startDate)} to ${formatDateDMY(currentStatus.md.endDate)} (${currentStatus.md.years}y)` : ''}
                    </div>
                  </div>
                </div>
                <span style="font-size: 0.85rem; font-weight: 700; color: #DC2626;">Maha Dasha</span>
              </div>

              <!-- Antardasha Row -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card-alt); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 4px solid #16A34A;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="background: #16A34A; color: #FFF; font-weight: 800; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px;">AD</span>
                  <div>
                    <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
                      ${currentStatus.ad ? `${PLANET_MAP[currentStatus.ad.number]} (${currentStatus.ad.number})` : '—'}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">
                      ${currentStatus.ad ? `Age ${currentStatus.ad.age} · ${formatDateDMY(currentStatus.ad.startDate)} to ${formatDateDMY(currentStatus.ad.endDate)}` : ''}
                    </div>
                  </div>
                </div>
                <span style="font-size: 0.85rem; font-weight: 700; color: #16A34A;">Antar Dasha</span>
              </div>

              <!-- Pratyantar Dasha Row -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card-alt); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 4px solid #D97706;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="background: #D97706; color: #FFF; font-weight: 800; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px;">PD</span>
                  <div>
                    <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
                      ${currentStatus.pd ? `${PLANET_MAP[currentStatus.pd.number]} (${currentStatus.pd.number})` : '—'}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">
                      ${currentStatus.pd ? `${formatDateDMY(currentStatus.pd.startDate)} to ${formatDateDMY(currentStatus.pd.endDate)} (${currentStatus.pd.days}d)` : ''}
                    </div>
                  </div>
                </div>
                <span style="font-size: 0.85rem; font-weight: 700; color: #D97706;">Pratyantar</span>
              </div>

              <!-- Daily Dasha Row -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card-alt); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 4px solid #BE185D;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="background: #BE185D; color: #FFF; font-weight: 800; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px;">DD</span>
                  <div>
                    <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
                      ${currentStatus.dd ? `${PLANET_MAP[currentStatus.dd]} (${currentStatus.dd})` : '—'}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">
                      ${currentDate.toLocaleDateString('en-US', { weekday: 'long' })} (Vedic Wd: ${getWeekdayValue(currentDate)})
                    </div>
                  </div>
                </div>
                <span style="font-size: 0.85rem; font-weight: 700; color: #BE185D;">Daily Dasha</span>
              </div>
            </div>
          </div>

          <!-- Birth Numbers Summary Bar -->
          <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem;">
            <span style="color: var(--text-dim);">Active Birth Digits:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${Array.from(new Set(gridDigits.filter(n => n >= 1 && n <= 9))).sort((a,b)=>a-b).map(num => `
                <span style="background: rgba(245, 158, 11, 0.15); color: var(--gold-primary); font-family: monospace; font-weight: 700; padding: 1px 6px; border-radius: 4px;">
                  ${num}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Planes of the Vedic Grid Analysis -->
      <div class="card" style="padding: 16px 20px;">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--gold-primary); margin-bottom: 10px;">
          🏛️ The 3 Planes of Life Manifestation (त्रिकोण विश्लेषण)
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
          ${VEDIC_GRID_PLANES.map(plane => {
            const hasAll = plane.numbers.every(num => gridDigits.includes(num));
            const count = plane.numbers.filter(num => gridDigits.includes(num)).length;
            const pct = Math.round((count / 3) * 100);
            return `
              <div style="background: var(--bg-card-alt); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-weight: 700; font-size: 0.84rem; color: var(--text-main);">${plane.name}</span>
                  <span style="font-size: 0.72rem; font-weight: 700; color: ${hasAll ? '#10B981' : 'var(--text-dim)'};">${count}/3 (${pct}%)</span>
                </div>
                <div style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 8px;">${plane.desc}</div>
                <div style="display: flex; gap: 6px;">
                  ${plane.numbers.map(n => `
                    <span style="font-size: 0.76rem; font-family: monospace; font-weight: 700; padding: 2px 8px; border-radius: 4px; ${gridDigits.includes(n) ? 'background: #10B981; color: #FFF;' : 'background: rgba(255,255,255,0.06); color: var(--text-dim);'}">
                      ${n} ${PLANET_MAP[n]}
                    </span>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 120-Year Timeline Section: Charts or Table -->
      <div class="card" style="padding: 20px;">
        
        <!-- Header & Filter Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0;">
              120-Year Dasha Timeline
            </h4>
            <p style="font-size: 0.75rem; color: var(--text-dim); margin: 0;">
              Yearly Antardasha progression and nested Pratyantars from Age 0 to 120
            </p>
          </div>

          <!-- Age Filter Tabs -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${[
              { id: 'active', label: '⚡ Active Now' },
              { id: 'all', label: 'All 120y' },
              { id: '0-30', label: 'Age 0–30' },
              { id: '30-60', label: 'Age 30–60' },
              { id: '60-90', label: 'Age 60–90' },
              { id: '90-120', label: 'Age 90–120' },
            ].map(f => `
              <button class="btn btn-sm num-filter-btn ${moduleState.filterRange === f.id ? 'btn-primary' : 'btn-secondary'}" data-filter="${f.id}" style="padding: 3px 9px; font-size: 0.72rem;">
                ${f.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Render active view (Charts or Table) -->
        <div id="num-timeline-view-container">
          ${moduleState.activeView === 'charts' 
            ? renderDashaChartsView(moduleState.dob, mahadashas, antardashas, moduleState.filterRange)
            : renderDashaTableView(moduleState.dob, mahadashas, antardashas, moduleState.filterRange)}
        </div>
      </div>

    </div>

    <!-- Modal for Sub-period Drilldown & Monthly Breakdown -->
    <div id="num-subperiod-modal" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" style="max-width: 650px; max-height: 85vh; overflow-y: auto; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <h4 id="num-modal-title" style="margin: 0; font-size: 1.05rem; color: var(--gold-primary); font-weight: 700;">
            Sub-period Breakdown
          </h4>
          <button id="btn-close-num-modal" class="btn btn-secondary btn-sm" style="padding: 2px 8px;">✕</button>
        </div>
        <div id="num-modal-body"></div>
      </div>
    </div>

    <!-- Modal for Bilingual Personalized Predictions -->
    <div id="num-predictions-modal" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" style="max-width: 720px; max-height: 85vh; overflow-y: auto; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">✨</span>
            <h4 style="margin: 0; font-size: 1.1rem; color: var(--gold-primary); font-weight: 700;">
              Personalized Vedic Predictions (भविष्यवाणी)
            </h4>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- Language Switcher -->
            <div style="display: inline-flex; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-card-alt);">
              <button id="btn-pred-lang-hi" class="btn btn-sm ${moduleState.predLang === 'hi' ? 'btn-primary' : 'btn-secondary'}" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 0;">
                हिंदी
              </button>
              <button id="btn-pred-lang-en" class="btn btn-sm ${moduleState.predLang === 'en' ? 'btn-primary' : 'btn-secondary'}" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 0;">
                English
              </button>
            </div>
            <button id="btn-close-pred-modal" class="btn btn-secondary btn-sm" style="padding: 2px 8px;">✕</button>
          </div>
        </div>

        <div id="num-predictions-body">
          ${renderPredictionsContent(rn, dn, moduleState.predLang)}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  attachEventListeners(container, mahadashas, antardashas);
}

/**
 * Render the 3x3 Vedic Grid Cell Matrix
 */
function renderVedicGridMatrix(dob, currentStatus) {
  const rn = getRootNumber(dob);
  const dn = getDestinyNumber(dob);
  const { plainD, rnD, dnD } = getDigitBreakdown(dob);

  let mdNum = currentStatus.md?.number;
  let adNum = currentStatus.ad?.number;
  let pdNum = currentStatus.pd?.number;
  let ddNum = currentStatus.dd;

  let matrixHtml = `
    <div style="display: grid; grid-template-columns: repeat(3, 86px); grid-template-rows: repeat(3, 86px); gap: 8px;">
  `;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cellNum = VEDIC_GRID_LAYOUT[row][col];
      const plainHits = plainD.filter(n => n === cellNum);
      const rnHits = rnD.filter(n => n === cellNum);
      const dnHits = dnD.filter(n => n === cellNum);
      const totalHits = plainHits.length + rnHits.length + dnHits.length;

      const activeDashas = [];
      if (mdNum === cellNum) activeDashas.push('md');
      if (adNum === cellNum) activeDashas.push('ad');
      if (pdNum === cellNum) activeDashas.push('pd');
      if (ddNum === cellNum) activeDashas.push('dd');

      const isRN = cellNum === rn;
      const isDN = cellNum === dn;

      let cellBorder = 'var(--border-subtle)';
      let cellBg = 'var(--bg-card-alt)';
      if (isRN && totalHits > 0) {
        cellBorder = 'rgba(59, 130, 246, 0.5)';
        cellBg = 'rgba(59, 130, 246, 0.08)';
      } else if (isDN && totalHits > 0) {
        cellBorder = 'rgba(16, 185, 129, 0.5)';
        cellBg = 'rgba(16, 185, 129, 0.08)';
      }

      matrixHtml += `
        <div style="position: relative; width: 86px; height: 86px; background: ${cellBg}; border: 1.5px solid ${cellBorder}; border-radius: var(--radius-md); display: flex; flex-direction: column; padding: 6px; box-sizing: border-box; overflow: hidden; box-shadow: ${totalHits > 0 ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};">
          
          <!-- Top Ghost Number -->
          <span style="position: absolute; top: 4px; right: 6px; font-size: 0.64rem; font-weight: 700; color: var(--text-dim); opacity: 0.5; user-select: none;">
            ${cellNum}
          </span>

          <!-- Digits Cluster -->
          <div style="flex: 1; display: flex; flex-wrap: wrap; gap: 2px 4px; align-content: flex-start; padding-top: 2px;">
            ${plainHits.map(() => `
              <span style="font-size: 1.25rem; font-weight: 800; font-family: monospace; color: var(--text-main); line-height: 1;">
                ${cellNum}
              </span>
            `).join('')}

            ${rnHits.map(() => `
              <span style="display: inline-flex; align-items: baseline;">
                <span style="font-size: 1.25rem; font-weight: 800; font-family: monospace; color: var(--text-main); line-height: 1;">${cellNum}</span>
                <span style="font-size: 0.72rem; font-weight: 800; color: #DC2626; line-height: 1;">r</span>
              </span>
            `).join('')}

            ${dnHits.map(() => `
              <span style="display: inline-flex; align-items: baseline;">
                <span style="font-size: 1.25rem; font-weight: 800; font-family: monospace; color: var(--text-main); line-height: 1;">${cellNum}</span>
                <span style="font-size: 0.72rem; font-weight: 800; color: #16A34A; line-height: 1;">d</span>
              </span>
            `).join('')}
          </div>

          <!-- Bottom Active Dasha Badges -->
          ${activeDashas.length > 0 ? `
            <div style="display: flex; gap: 3px; flex-wrap: wrap; margin-top: auto; padding-top: 2px;">
              ${activeDashas.map(type => `
                <span style="background: ${DASHA_COLORS[type].bg}; color: #FFF; font-size: 0.6rem; font-weight: 800; padding: 1px 3px; border-radius: 3px; line-height: 1.1; box-shadow: 0 1px 3px ${DASHA_COLORS[type].glow};">
                  ${DASHA_COLORS[type].short}
                </span>
              `).join('')}
            </div>
          ` : ''}

        </div>
      `;
    }
  }

  matrixHtml += `</div>`;
  return matrixHtml;
}

/**
 * Render Compact Dasha Charts View (Grid of Yearly Cards)
 */
function renderDashaChartsView(dob, mahadashas, antardashas, filterRange) {
  const nowMs = Date.now();
  let filtered = antardashas;

  if (filterRange === 'active') {
    const activeIndex = antardashas.findIndex(a => nowMs >= a.startDate.getTime() && nowMs < a.endDate.getTime());
    const startIdx = Math.max(0, activeIndex - 2);
    const endIdx = Math.min(antardashas.length, activeIndex + 8);
    filtered = antardashas.slice(startIdx, endIdx);
  } else if (filterRange === '0-30') {
    filtered = antardashas.slice(0, 30);
  } else if (filterRange === '30-60') {
    filtered = antardashas.slice(30, 60);
  } else if (filterRange === '60-90') {
    filtered = antardashas.slice(60, 90);
  } else if (filterRange === '90-120') {
    filtered = antardashas.slice(90, 120);
  }

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
      ${filtered.map(ad => {
        const isActive = nowMs >= ad.startDate.getTime() && nowMs < ad.endDate.getTime();
        const md = mahadashas.find(m => ad.startDate.getTime() >= m.startDate.getTime() && ad.startDate.getTime() < m.endDate.getTime()) || mahadashas[0];
        
        return `
          <div class="card num-year-card" data-age="${ad.age}" style="padding: 12px; cursor: pointer; transition: transform 0.15s, border-color 0.15s; border: 1.5px solid ${isActive ? 'var(--gold-primary)' : 'var(--border-subtle)'}; background: ${isActive ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card-alt)'}; border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.82rem; font-weight: 800; color: ${isActive ? 'var(--gold-primary)' : 'var(--text-main)'};">
                Age ${ad.age} (${ad.calYear})
              </span>
              ${isActive ? `
                <span style="background: var(--gold-primary); color: #000; font-size: 0.62rem; font-weight: 800; padding: 1px 4px; border-radius: 3px;">
                  Active
                </span>
              ` : ''}
            </div>

            <!-- Mini 3x3 Grid -->
            <div style="display: flex; justify-content: center; margin: 8px 0;">
              ${renderMiniVedicGrid(dob, ad.number, md.number)}
            </div>

            <!-- Labels -->
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim); border-top: 1px solid var(--border-subtle); padding-top: 6px;">
              <span>AD: <b style="color: #16A34A;">${ad.number} ${PLANET_MAP[ad.number]}</b></span>
              <span>MD: <b style="color: #DC2626;">${md.number}</b></span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render Mini 3x3 Grid for compact cards
 */
function renderMiniVedicGrid(dob, adNumber, mdNumber) {
  const gridNums = collectGridNumbers(dob);
  const counts = {};
  gridNums.forEach(n => {
    if (n >= 1 && n <= 9) counts[n] = (counts[n] || 0) + 1;
  });

  return `
    <div style="display: grid; grid-template-columns: repeat(3, 24px); grid-template-rows: repeat(3, 24px); gap: 3px;">
      ${VEDIC_GRID_LAYOUT.flat().map(cellNum => {
        const hasDigit = counts[cellNum] > 0;
        const isAD = cellNum === adNumber;
        const isMD = cellNum === mdNumber;

        let bg = 'var(--bg-card)';
        let textCol = 'var(--text-dim)';
        if (isAD) {
          bg = '#16A34A';
          textCol = '#FFFFFF';
        } else if (isMD) {
          bg = '#DC2626';
          textCol = '#FFFFFF';
        } else if (hasDigit) {
          bg = 'rgba(255, 255, 255, 0.1)';
          textCol = 'var(--text-main)';
        }

        return `
          <div style="width: 24px; height: 24px; border-radius: 3px; background: ${bg}; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; font-weight: 700; color: ${textCol}; font-family: monospace;">
            ${hasDigit || isAD || isMD ? cellNum : '·'}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render Detailed Dasha Table View (120 years)
 */
function renderDashaTableView(dob, mahadashas, antardashas, filterRange) {
  const nowMs = Date.now();
  let filtered = antardashas;

  if (filterRange === 'active') {
    const activeIndex = antardashas.findIndex(a => nowMs >= a.startDate.getTime() && nowMs < a.endDate.getTime());
    const startIdx = Math.max(0, activeIndex - 3);
    const endIdx = Math.min(antardashas.length, activeIndex + 12);
    filtered = antardashas.slice(startIdx, endIdx);
  } else if (filterRange === '0-30') {
    filtered = antardashas.slice(0, 30);
  } else if (filterRange === '30-60') {
    filtered = antardashas.slice(30, 60);
  } else if (filterRange === '60-90') {
    filtered = antardashas.slice(60, 90);
  } else if (filterRange === '90-120') {
    filtered = antardashas.slice(90, 120);
  }

  return `
    <div class="table-responsive" style="max-height: 520px; overflow-y: auto;">
      <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
        <thead>
          <tr style="position: sticky; top: 0; background: var(--bg-card); z-index: 2;">
            <th style="padding: 8px 12px; text-align: left;">Age</th>
            <th style="padding: 8px 12px; text-align: left;">Year</th>
            <th style="padding: 8px 12px; text-align: left;">Period Dates</th>
            <th style="padding: 8px 12px; text-align: left;">Maha Dasha</th>
            <th style="padding: 8px 12px; text-align: left;">Antar Dasha</th>
            <th style="padding: 8px 12px; text-align: left;">Status</th>
            <th style="padding: 8px 12px; text-align: right;">Drilldown</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(ad => {
            const isActive = nowMs >= ad.startDate.getTime() && nowMs < ad.endDate.getTime();
            const md = mahadashas.find(m => ad.startDate.getTime() >= m.startDate.getTime() && ad.startDate.getTime() < m.endDate.getTime()) || mahadashas[0];

            return `
              <tr style="border-bottom: 1px solid var(--border-subtle); background: ${isActive ? 'rgba(245, 158, 11, 0.08)' : 'transparent'};">
                <td style="padding: 8px 12px; font-weight: 700; color: ${isActive ? 'var(--gold-primary)' : 'var(--text-main)'}; font-family: monospace;">
                  ${ad.age}
                </td>
                <td style="padding: 8px 12px; font-family: monospace; color: var(--text-dim);">${ad.calYear}</td>
                <td style="padding: 8px 12px; font-family: monospace; color: var(--text-muted); font-size: 0.76rem;">
                  ${formatDateDMY(ad.startDate)} – ${formatDateDMY(ad.endDate)}
                </td>
                <td style="padding: 8px 12px;">
                  <span style="background: rgba(220, 38, 38, 0.15); color: #DC2626; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 0.74rem;">
                    MD ${md.number} · ${PLANET_MAP[md.number]}
                  </span>
                </td>
                <td style="padding: 8px 12px;">
                  <span style="background: rgba(22, 163, 74, 0.15); color: #16A34A; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 0.74rem;">
                    AD ${ad.number} · ${PLANET_MAP[ad.number]}
                  </span>
                </td>
                <td style="padding: 8px 12px;">
                  ${isActive ? `
                    <span style="display: inline-flex; align-items: center; gap: 4px; color: var(--gold-primary); font-weight: 700; font-size: 0.74rem;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--gold-primary); box-shadow: 0 0 6px var(--gold-primary);"></span>
                      Active
                    </span>
                  ` : '<span style="color: var(--text-dim);">—</span>'}
                </td>
                <td style="padding: 8px 12px; text-align: right;">
                  <button class="btn btn-secondary btn-sm num-inspect-btn" data-age="${ad.age}" style="padding: 2px 8px; font-size: 0.72rem;">
                    Inspect 9 PDs
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render Content for Predictions Modal
 */
function renderPredictionsContent(rn, dn, lang) {
  const rootData = ROOT_PREDICTIONS[rn];
  const destinyData = DESTINY_PREDICTIONS[dn];
  const comboData = getComboPrediction(rn, dn);
  const combinedSummary = getCombinedPrediction(rn, dn);

  const points = comboData ? (comboData[lang] || comboData['en']) : [];

  return `
    <div style="display: flex; flex-direction: column; gap: 18px;">
      
      <!-- Top Combination Highlight -->
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(139, 92, 246, 0.12)); border: 1px solid var(--border-glow); padding: 16px; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--gold-primary);">
            ${lang === 'hi' ? `मूलांक ${rn} × भाग्यांक ${dn} विश्लेषण` : `Root ${rn} × Destiny ${dn} Synergy`}
          </div>
          <span style="font-size: 0.78rem; background: var(--bg-card); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-subtle); color: var(--text-dim);">
            ${PLANET_MAP[rn]} + ${PLANET_MAP[dn]}
          </span>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-main); line-height: 1.6; margin: 0;">
          ${combinedSummary}
        </p>
      </div>

      <!-- In-Depth 10 Character / Karmic Points -->
      <div>
        <h5 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <span>🎯</span> ${lang === 'hi' ? 'विस्तृत लक्षण एवं भविष्यफल' : 'Detailed Traits & Life Manifestation'}
        </h5>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${points.map((pt, idx) => `
            <div style="display: flex; align-items: flex-start; gap: 10px; background: var(--bg-card-alt); padding: 9px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--gold-primary);">
              <span style="font-size: 0.75rem; font-family: monospace; font-weight: 800; color: var(--gold-primary); margin-top: 2px;">
                ${String(idx + 1).padStart(2, '0')}.
              </span>
              <span style="font-size: 0.84rem; color: var(--text-main); line-height: 1.5;">
                ${pt}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Individual Root & Destiny Deep Delineation -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 6px;">
        
        <div style="background: var(--bg-card-alt); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-md);">
          <div style="font-size: 0.74rem; text-transform: uppercase; letter-spacing: 1px; color: #3B82F6; font-weight: 700; margin-bottom: 4px;">
            Root Number ${rn} · ${rootData.title}
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
            ${rootData.text}
          </div>
        </div>

        <div style="background: var(--bg-card-alt); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-md);">
          <div style="font-size: 0.74rem; text-transform: uppercase; letter-spacing: 1px; color: #10B981; font-weight: 700; margin-bottom: 4px;">
            Destiny Number ${dn} · ${destinyData.title}
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
            ${destinyData.text}
          </div>
        </div>

      </div>

    </div>
  `;
}

/**
 * Open Drilldown Modal for 9 Pratyantars & Monthly Subdivisions
 */
function openSubperiodModal(ad, dob) {
  const modal = document.getElementById('num-subperiod-modal');
  const title = document.getElementById('num-modal-title');
  const body = document.getElementById('num-modal-body');
  if (!modal || !title || !body) return;

  const pds = calculatePratyantars(ad.number, ad.startDate);
  const months = buildMonths(ad);
  const nowMs = Date.now();

  title.innerHTML = `
    Year Analysis · Age ${ad.age} (${ad.calYear}) · AD: ${ad.number} (${PLANET_MAP[ad.number]})
  `;

  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 18px;">
      
      <!-- Summary -->
      <div style="font-size: 0.82rem; color: var(--text-muted); background: var(--bg-card-alt); padding: 10px 14px; border-radius: var(--radius-sm);">
        Duration: <b>${formatDateDMY(ad.startDate)}</b> to <b>${formatDateDMY(ad.endDate)}</b> (Formula: last2 + month + RN + weekday)
      </div>

      <!-- 9 Pratyantar Periods -->
      <div>
        <h5 style="font-size: 0.9rem; font-weight: 700; color: var(--gold-primary); margin-bottom: 10px;">
          9 Pratyantar Dashas (PD Periods)
        </h5>
        <div class="table-responsive">
          <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.78rem;">
            <thead>
              <tr style="background: var(--bg-card-alt);">
                <th style="padding: 6px 10px; text-align: left;">#</th>
                <th style="padding: 6px 10px; text-align: left;">Ruler</th>
                <th style="padding: 6px 10px; text-align: left;">Days</th>
                <th style="padding: 6px 10px; text-align: left;">Start</th>
                <th style="padding: 6px 10px; text-align: left;">End</th>
                <th style="padding: 6px 10px; text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${pds.map((pd, idx) => {
                const isCurrent = nowMs >= pd.startDate.getTime() && nowMs <= pd.endDate.getTime();
                return `
                  <tr style="border-bottom: 1px solid var(--border-subtle); background: ${isCurrent ? 'rgba(217, 119, 6, 0.12)' : 'transparent'};">
                    <td style="padding: 6px 10px; font-weight: 700; font-family: monospace;">${idx + 1}</td>
                    <td style="padding: 6px 10px; font-weight: 700; color: #D97706;">
                      PD ${pd.number} · ${pd.planet}
                    </td>
                    <td style="padding: 6px 10px; font-family: monospace;">${pd.days}d</td>
                    <td style="padding: 6px 10px; font-family: monospace; color: var(--text-dim);">${formatDateDMY(pd.startDate)}</td>
                    <td style="padding: 6px 10px; font-family: monospace; color: var(--text-dim);">${formatDateDMY(pd.endDate)}</td>
                    <td style="padding: 6px 10px; text-align: right;">
                      ${isCurrent ? `
                        <span style="color: #D97706; font-weight: 800; font-size: 0.72rem;">Active PD</span>
                      ` : '—'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 12 Monthly Segments -->
      <div>
        <h5 style="font-size: 0.9rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 10px;">
          12 Monthly Harmonic Divisions
        </h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;">
          ${months.map((m, i) => {
            const isMActive = nowMs >= m.start.getTime() && nowMs <= m.end.getTime();
            return `
              <div style="background: var(--bg-card-alt); border: 1px solid ${isMActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}; padding: 8px 10px; border-radius: var(--radius-sm); font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 2px;">
                  <span>Month ${i + 1}</span>
                  <span style="color: var(--accent-cyan);">${m.number}</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-dim);">${PLANET_MAP[m.number]}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted); font-family: monospace; margin-top: 3px;">
                  ${formatDateDMY(m.start)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;

  modal.style.display = 'flex';
}

/**
 * Attach UI event listeners
 */
function attachEventListeners(container, mahadashas, antardashas) {
  // View switcher
  const btnCharts = container.querySelector('#btn-num-view-charts');
  const btnTable = container.querySelector('#btn-num-view-table');

  if (btnCharts && btnTable) {
    btnCharts.addEventListener('click', () => {
      moduleState.activeView = 'charts';
      renderNumerologyStudio(container, { dob: moduleState.dob, name: moduleState.name });
    });
    btnTable.addEventListener('click', () => {
      moduleState.activeView = 'table';
      renderNumerologyStudio(container, { dob: moduleState.dob, name: moduleState.name });
    });
  }

  // DOB change inside bar
  const dobInput = container.querySelector('#num-bar-dob');
  if (dobInput) {
    dobInput.addEventListener('change', (e) => {
      if (e.target.value) {
        const d = new Date(e.target.value + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          moduleState.dob = d;
          renderNumerologyStudio(container, { dob: d, name: moduleState.name });
        }
      }
    });
  }

  // Filter Buttons
  container.querySelectorAll('.num-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      moduleState.filterRange = btn.getAttribute('data-filter');
      renderNumerologyStudio(container, { dob: moduleState.dob, name: moduleState.name });
    });
  });

  // Year Card Drilldown click
  container.querySelectorAll('.num-year-card, .num-inspect-btn').forEach(el => {
    el.addEventListener('click', () => {
      const age = parseInt(el.getAttribute('data-age'), 10);
      const ad = antardashas.find(a => a.age === age);
      if (ad) {
        openSubperiodModal(ad, moduleState.dob);
      }
    });
  });

  // Modal close
  const btnCloseModal = container.querySelector('#btn-close-num-modal');
  const subModal = container.querySelector('#num-subperiod-modal');
  if (btnCloseModal && subModal) {
    btnCloseModal.addEventListener('click', () => {
      subModal.style.display = 'none';
    });
    subModal.addEventListener('click', (e) => {
      if (e.target === subModal) subModal.style.display = 'none';
    });
  }

  // Predictions Modal
  const btnOpenPred = container.querySelector('#btn-open-predictions-modal');
  const predModal = container.querySelector('#num-predictions-modal');
  const btnClosePred = container.querySelector('#btn-close-pred-modal');
  const btnLangHi = container.querySelector('#btn-pred-lang-hi');
  const btnLangEn = container.querySelector('#btn-pred-lang-en');
  const predBody = container.querySelector('#num-predictions-body');

  if (btnOpenPred && predModal) {
    btnOpenPred.addEventListener('click', () => {
      predModal.style.display = 'flex';
    });
  }
  if (btnClosePred && predModal) {
    btnClosePred.addEventListener('click', () => {
      predModal.style.display = 'none';
    });
    predModal.addEventListener('click', (e) => {
      if (e.target === predModal) predModal.style.display = 'none';
    });
  }

  if (btnLangHi && btnLangEn && predBody) {
    btnLangHi.addEventListener('click', () => {
      moduleState.predLang = 'hi';
      btnLangHi.className = 'btn btn-sm btn-primary';
      btnLangEn.className = 'btn btn-sm btn-secondary';
      const rn = getRootNumber(moduleState.dob);
      const dn = getDestinyNumber(moduleState.dob);
      predBody.innerHTML = renderPredictionsContent(rn, dn, 'hi');
    });
    btnLangEn.addEventListener('click', () => {
      moduleState.predLang = 'en';
      btnLangEn.className = 'btn btn-sm btn-primary';
      btnLangHi.className = 'btn btn-sm btn-secondary';
      const rn = getRootNumber(moduleState.dob);
      const dn = getDestinyNumber(moduleState.dob);
      predBody.innerHTML = renderPredictionsContent(rn, dn, 'en');
    });
  }
}

function attachDirectInputListeners(container) {
  const calcBtn = container.querySelector('#btn-num-direct-calc');
  const nameInp = container.querySelector('#num-direct-name');
  const dobInp = container.querySelector('#num-direct-dob');

  if (calcBtn && dobInp) {
    calcBtn.addEventListener('click', () => {
      if (dobInp.value) {
        const d = new Date(dobInp.value + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          moduleState.name = nameInp?.value || 'Native';
          moduleState.dob = d;
          renderNumerologyStudio(container, { dob: d, name: moduleState.name });
        }
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toInputDate(d) {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
