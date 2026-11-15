import { SIGNS, SHODASHVARGA_DEFS } from './constants.js';
import { parsePlanetaryInput } from './parser.js';
import { calculateShodashvargaMatrix } from './shodashvarga.js';
import { calculateAshtakavarga } from './ashtakavarga.js';
import { calculateVimshottariDasha } from './dasha.js';
import { calculateYoginiDasha, YOGINI_ORDER } from './yogini.js';
import { detectYogas, loadRaman300Database, matchRaman300Catalog } from './yogas.js';
import { renderNorthIndianChart, renderSouthIndianChart } from './chartRenderer.js?v=12';
import { PROMPT_PRESETS, generateGeminiPrompt } from './geminiPrompt.js';
import { POPULAR_CITIES, calculateChartFromBirthDetails, calculateTransits } from './ephemeris.js';
import { analyzeTransits } from './transits.js';
import { searchCities, getTimezoneOffsetHours, loadAtlas } from './atlas.js';
import { calculatePanchanga } from './panchanga.js';
import { calculateDrishti } from './drishti.js';
import { getProfiles, saveProfile, deleteProfile, exportProfilesJSON, importProfilesJSON, getProfileById } from './storage.js';
import { calculateCharaKarakas, calculateJaiminiPadas } from './jaimini.js?v=4';
import { calculateAshtakoota, checkMangalDosha } from './milan.js';
import { calculateSadeSati } from './sadeSati.js';
import { calculateShadbala, calculateBhavabala } from './shadbala.js?v=4';
import { calculateBhavaChalit } from './bhavaChalit.js';
import { calculateAllFriendshipTables } from './friendship.js';
import { LIFE_EVENT_CATEGORIES, getCategoryMeta, correlateLifeEvent, getDashaAtDate, getTransitsAtDate, calculateAgeAtEvent } from './lifeEvents.js';
import { evaluateHouse } from '../bhavas/bhavasEngine.js';
import { initTheme } from './theme.js';
import { renderNumerologyStudio } from '../numerology/numerologyRenderer.js';

// Default chart from user query
const USER_SAMPLE_INPUT = `Planets Sign Latitude Nakshatra Pada
ASC Gemini 09-01-55 Ardra 1
Sun Pisces 00-40-34 Purvabhadra 4
Moon Aries 03-17-28 Ashvini 1
Mars Aquarius 12-23-13 Satabhisa 2
Merc Aquarius 03-20-21 Dhanishta 4
Jupt [R] Libra 20-32-06 Vishakha 1
Venu Pisces 14-31-50 Uttarabhadra 4
Satn Aquarius 11-38-43 Satabhisa 2
Rahu [R] Scorpion 03-25-58 Anuradha 1
Ketu [R] Taurus 03-25-58 Krittika 3`;

// State
let appState = {
  inputMode: 'birth', // 'birth' or 'paste'
  planets: [],
  shodashvarga: null,
  ashtakavarga: null,
  dasha: null,
  yoginiDasha: null,
  dashaSubtab: 'vimshottari',
  activeBhavaHouse: 1,
  transits: null,
  transitAnalysis: null,
  panchanga: null,
  drishti: null,
  shadbala: null,
  friendship: null,
  overlayTransits: false,
  showJaiminiOverlay: true,
  jaiminiPadas: null,
  charaKarakas: null,
  sadeSati: null,
  yogas: [],
  yogasSubtab: 'dare',
  yogasDareFilter: 'all',
  yogasRamanFilter: 'all',
  yogasDareSearch: '',
  yogasRamanSearch: '',
  raman300Catalog: [],
  selectedVarga: 'D1',
  chartStyle: 'north',
  selectedPresetId: 'general',
  customQuestion: '',
  generatedPrompt: '',
  currentProfileId: null,
  currentProfileName: '',
  currentProfileNotes: '',
  lifeEvents: [],
  tmLagnaRef: 'lagna', // 'lagna' or 'moon'
  tmChartStyle: 'north', // 'north' or 'south'
  tmFocusedEvent: null, // { id, title, icon, date }
  isEditorOpen: false,
  isDirty: false,
  lastSavedSnapshot: null
};

// Profile Static Strip Elements
const profileStaticStrip = document.getElementById('profile-static-strip');
const sectionInputPanel = document.getElementById('section-input-panel');
const staticAvatar = document.getElementById('static-avatar');
const staticName = document.getElementById('static-name');
const staticGenderBadge = document.getElementById('static-gender-badge');
const staticTypeBadge = document.getElementById('static-type-badge');
const staticDatetime = document.getElementById('static-datetime');
const staticLocation = document.getElementById('static-location');
const staticCoords = document.getElementById('static-coords');
const staticNotes = document.getElementById('static-notes');
const btnToggleEditPanel = document.getElementById('btn-toggle-edit-panel');
const btnToggleEditText = document.getElementById('btn-toggle-edit-text');
const btnStripNewChart = document.getElementById('btn-strip-new-chart');

// DOM Elements
const btnModeBirth = document.getElementById('btn-mode-birth');
const btnModePaste = document.getElementById('btn-mode-paste');
const sectionModeBirth = document.getElementById('section-mode-birth');
const sectionModePaste = document.getElementById('section-mode-paste');

// Birth Details Inputs
const birthNameEl = document.getElementById('birth-name');
const birthGenderEl = document.getElementById('birth-gender');
const birthDateEl = document.getElementById('birth-date');
const birthTimeEl = document.getElementById('birth-time');
const citySearchInput = document.getElementById('city-search-input');
const citySuggestionsBox = document.getElementById('city-suggestions-box');
const birthLatEl = document.getElementById('birth-lat');
const birthLonEl = document.getElementById('birth-lon');
const birthTzEl = document.getElementById('birth-tz');
const btnCalcFromBirth = document.getElementById('btn-calc-from-birth');
const quickCityChips = document.querySelectorAll('.chip-btn');

// Paste Inputs
const rawInputEl = document.getElementById('raw-input');
const btnParseCalc = document.getElementById('btn-parse-calc');
const btnClearInput = document.getElementById('btn-clear-input');

// Dates & Header
const refDateEl = document.getElementById('reference-date');
const btnTodayDate = document.getElementById('btn-today-date');
const btnHeaderGemini = document.getElementById('btn-header-gemini');

// Top Stat Chips
const statNative = document.getElementById('stat-native');
const chartNativeBadge = document.getElementById('chart-native-badge');
const statLagna = document.getElementById('stat-lagna');
const statMoon = document.getElementById('stat-moon');
const statDasha = document.getElementById('stat-dasha');
const statSav = document.getElementById('stat-sav');

// Panchanga Strip elements
const panchangaTithi = document.getElementById('panchanga-tithi');
const panchangaVaara = document.getElementById('panchanga-vaara');
const panchangaNakshatra = document.getElementById('panchanga-nakshatra');
const panchangaYoga = document.getElementById('panchanga-yoga');
const panchangaKarana = document.getElementById('panchanga-karana');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Chart elements
const vargaSelectEl = document.getElementById('varga-select');
const btnChartNorth = document.getElementById('btn-chart-north');
const btnChartSouth = document.getElementById('btn-chart-south');
const chkTransitOverlay = document.getElementById('chk-transit-overlay');
const chartSvgContainer = document.getElementById('chart-svg-container');
const chartVargaTitle = document.getElementById('chart-varga-title');
const chartVargaDesc = document.getElementById('chart-varga-desc');
const chartPlacementsSummary = document.getElementById('chart-placements-summary');

// Table elements
const tbodyPlanets = document.getElementById('tbody-planets');
const theadShodashvarga = document.getElementById('thead-shodashvarga');
const tbodyShodashvarga = document.getElementById('tbody-shodashvarga');
const vargottamaSummaryTag = document.getElementById('vargottama-summary-tag');

// Ashtakavarga elements
const savVisualBars = document.getElementById('sav-visual-bars');
const tbodyAshtakavarga = document.getElementById('tbody-ashtakavarga');

// Dasha elements
const currentDashaBanner = document.getElementById('current-dasha-banner');
const dashaTreeContainer = document.getElementById('dasha-tree-container');
const currentYoginiBanner = document.getElementById('current-yogini-banner');
const yoginiTreeContainer = document.getElementById('yogini-tree-container');
const dualDashaConvergenceCard = document.getElementById('dual-dasha-convergence-card');
const viewDashaVimshottari = document.getElementById('view-dasha-vimshottari');
const viewDashaYogini = document.getElementById('view-dasha-yogini');
const viewDashaDual = document.getElementById('view-dasha-dual');
const subtabDashaVimshottari = document.getElementById('subtab-dasha-vimshottari');
const subtabDashaYogini = document.getElementById('subtab-dasha-yogini');
const subtabDashaDual = document.getElementById('subtab-dasha-dual');

// Transit elements
const transitDateLabel = document.getElementById('transit-date-label');
const transitAlertsContainer = document.getElementById('transit-alerts-container');
const tbodyTransits = document.getElementById('tbody-transits');

// Drishti (Aspects) elements
const mutualAspectsList = document.getElementById('mutual-aspects-list');
const tbodyAspectsPlanets = document.getElementById('tbody-aspects-planets');
const tbodyAspectsHouses = document.getElementById('tbody-aspects-houses');

// Databank Modal elements
const btnOpenDatabank = document.getElementById('btn-open-databank');
const btnSaveCurrentProfile = document.getElementById('btn-save-current-profile');
const btnCloseDatabank = document.getElementById('btn-close-databank');
const databankModal = document.getElementById('databank-modal');
const saveProfileName = document.getElementById('save-profile-name');
const saveProfileNotes = document.getElementById('save-profile-notes');
const btnUpdateProfile = document.getElementById('btn-update-profile');
const btnSaveAsNew = document.getElementById('btn-save-as-new');
const btnUnlinkProfile = document.getElementById('btn-unlink-profile');
const saveModalProfileStatus = document.getElementById('save-modal-profile-status');
const profileCountBadge = document.getElementById('profile-count-badge');
const databankTotalCount = document.getElementById('databank-total-count');
const profilesListContainer = document.getElementById('profiles-list-container');
const filterProfilesInput = document.getElementById('filter-profiles-input');
const btnExportProfiles = document.getElementById('btn-export-profiles');
const importProfilesFile = document.getElementById('import-profiles-file');

// Yogas
const yogasContainer = document.getElementById('yogas-container');

// Time-Machine & Sade Sati
const timeMachineDate = document.getElementById('time-machine-date');
const timeJumpButtons = document.querySelectorAll('.btn-time-jump');
const sadeSatiContainer = document.getElementById('sade-sati-container');
const bhavaSiddhiContainer = document.getElementById('bhava-siddhi-container');
const tmChartCard = document.getElementById('tm-chart-card');
const tmChartTitle = document.getElementById('tm-chart-title');
const tmChartSubtitle = document.getElementById('tm-chart-subtitle');
const tmChartSvgContainer = document.getElementById('tm-chart-svg-container');
const tmChartSummaryPanel = document.getElementById('tm-chart-summary-panel');
const btnTmRefLagna = document.getElementById('btn-tm-ref-lagna');
const btnTmRefMoon = document.getElementById('btn-tm-ref-moon');
const btnTmStyleNorth = document.getElementById('btn-tm-style-north');
const btnTmStyleSouth = document.getElementById('btn-tm-style-south');
const tmEventBanner = document.getElementById('tm-event-banner');
const tmEventBannerIcon = document.getElementById('tm-event-banner-icon');
const tmEventBannerTitle = document.getElementById('tm-event-banner-title');
const tmEventBannerSubtitle = document.getElementById('tm-event-banner-subtitle');
const btnTmClearEvent = document.getElementById('btn-tm-clear-event');

// Jaimini Elements
const chkJaiminiOverlay = document.getElementById('chk-jaimini-overlay');
const jaiminiPadasContainer = document.getElementById('jaimini-padas-container');
const tbodyJaiminiKarakas = document.getElementById('tbody-jaimini-karakas');

// Milan Elements
const milanSelectGroom = document.getElementById('milan-select-groom');
const milanSelectBride = document.getElementById('milan-select-bride');
const milanGroomSummary = document.getElementById('milan-groom-summary');
const milanBrideSummary = document.getElementById('milan-bride-summary');
const btnCalculateMilan = document.getElementById('btn-calculate-milan');
const milanResultsContainer = document.getElementById('milan-results-container');

// Shadbala Elements
const shadbalaTopPlanet = document.getElementById('shadbala-top-planet');
const shadbalaTopDesc = document.getElementById('shadbala-top-desc');
const shadbalaWeakPlanet = document.getElementById('shadbala-weak-planet');
const shadbalaWeakDesc = document.getElementById('shadbala-weak-desc');
const shadbalaOverallPotency = document.getElementById('shadbala-overall-potency');
const shadbalaOverallDesc = document.getElementById('shadbala-overall-desc');
const shadbalaBarsContainer = document.getElementById('shadbala-bars-container');
const tbodyShadbala = document.getElementById('tbody-shadbala');
const tbodyShadbalaDetailed = document.getElementById('tbody-shadbala-detailed');

// Bhavabala Elements
const bhavabalaTopHouse = document.getElementById('bhavabala-top-house');
const bhavabalaTopDesc = document.getElementById('bhavabala-top-desc');
const bhavabalaWeakHouse = document.getElementById('bhavabala-weak-house');
const bhavabalaWeakDesc = document.getElementById('bhavabala-weak-desc');
const bhavabalaAvgPotency = document.getElementById('bhavabala-avg-potency');
const bhavabalaAvgDesc = document.getElementById('bhavabala-avg-desc');
const bhavabalaBarsContainer = document.getElementById('bhavabala-bars-container');
const tbodyBhavabala = document.getElementById('tbody-bhavabala');
const tbodyBhavabalaHorizontal = document.getElementById('tbody-bhavabala-horizontal');

// 12 Bhavas Studio Elements
const bhavasSubtabsContainer = document.getElementById('bhavas-subtabs-container');
const bhavaActiveHouseContainer = document.getElementById('bhava-active-house-container');

// Maitri Chakra Elements
const tableFivefoldFriendship = document.getElementById('table-fivefold-friendship');
const tablePermanentFriendship = document.getElementById('table-permanent-friendship');
const tableTemporalFriendship = document.getElementById('table-temporal-friendship');

// Gemini Studio elements
const presetButtonsContainer = document.getElementById('preset-buttons-container');
const customQuestionGroup = document.getElementById('custom-question-group');
const customQuestionInput = document.getElementById('custom-question-input');
const promptPreviewBox = document.getElementById('prompt-preview-box');
const promptCharCount = document.getElementById('prompt-char-count');
const btnCopyPrompt = document.getElementById('btn-copy-prompt');
const btnCopyPromptInline = document.getElementById('btn-copy-prompt-inline');
const btnSelectAllPrompt = document.getElementById('btn-select-all-prompt');
const btnCopyPromptBottom = document.getElementById('btn-copy-prompt-bottom');
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');

// Timeline & Life Events elements
const tabTimelineBtn = document.querySelector('[data-tab="tab-timeline"]');
const btnAddLifeEvent = document.getElementById('btn-add-life-event');
const btnExportTimeline = document.getElementById('btn-export-timeline');
const quickCategoryChips = document.getElementById('quick-category-chips');
const statTotalEvents = document.getElementById('stat-total-events');
const statEarliestEvent = document.getElementById('stat-earliest-event');
const statLatestEvent = document.getElementById('stat-latest-event');
const statEventsDashas = document.getElementById('stat-events-dashas');
const timelineEventsContainer = document.getElementById('timeline-events-container');

// Life Event Modal elements
const lifeEventModal = document.getElementById('life-event-modal');
const modalEventHeading = document.getElementById('modal-event-heading');
const modalEventIcon = document.getElementById('modal-event-icon');
const btnCloseEventModal = document.getElementById('btn-close-event-modal');
const btnCancelEventModal = document.getElementById('btn-cancel-event-modal');
const btnSaveLifeEvent = document.getElementById('btn-save-life-event');
const eventEditId = document.getElementById('event-edit-id');
const eventCategorySelect = document.getElementById('event-category-select');
const eventCategoryHint = document.getElementById('event-category-hint');
const eventDateInput = document.getElementById('event-date-input');
const eventNatureSelect = document.getElementById('event-nature-select');
const eventTitleInput = document.getElementById('event-title-input');
const eventNotesInput = document.getElementById('event-notes-input');
const modalPreviewDasha = document.getElementById('modal-preview-dasha');
const modalPreviewTransits = document.getElementById('modal-preview-transits');

/**
 * Initialize Application
 */
function init() {
  // Initialize Light / Dark theme
  try { initTheme(); } catch (e) { console.error('Error initializing theme:', e); }

  // Pre-warm atlas on initial load
  loadAtlas();

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  if (refDateEl) refDateEl.value = today;

  // Prepopulate raw input
  rawInputEl.value = USER_SAMPLE_INPUT;

  // Render Prompt Presets
  renderPresetButtons();

  // Update Databank badge
  updateProfileCountBadge();

  // Load BV Raman 300 Yogas database in background
  loadRaman300Database().then(db => {
    appState.raman300Catalog = matchRaman300Catalog(appState.yogas, db);
    renderYogasView();
  }).catch(e => console.error('Error loading Raman 300 database:', e));

  // Initialize Life Events & Timeline UI
  initLifeEventsUI();

  // Initialize Time-Machine Gochar Kundali UI
  initTimeMachineChartUI();

  // Attach event listeners
  setupEventListeners();

  // Check URL parameters for direct profile loading (e.g. from databank.html?profileId=...) or Portal inputs
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('profileId');
  if (profileId) {
    loadProfileItem(profileId);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      const targetTab = tabParam.startsWith('tab-') ? tabParam : `tab-${tabParam}`;
      setTimeout(() => switchTab(targetTab), 50);
    }
  } else if (urlParams.get('date')) {
    // Loaded from Home Portal or external URL: autosave as new profile so it immediately enters Databank!
    const name = urlParams.get('name') || `Client ${urlParams.get('date')}`;
    const saved = saveProfile({
      name,
      gender: urlParams.get('gender') || 'male',
      mode: 'birth',
      birthDate: urlParams.get('date'),
      birthTime: urlParams.get('time') || '12:00:00',
      city: urlParams.get('city') || '',
      lat: parseFloat(urlParams.get('lat')) || 28.6139,
      lon: parseFloat(urlParams.get('lon')) || 77.2090,
      tz: parseFloat(urlParams.get('tz')) || 5.5,
      notes: `Imported on ${new Date().toLocaleDateString()}`
    });

    if (saved && saved.id) {
      loadProfileItem(saved.id);
      const url = new URL(window.location.href);
      url.search = `?profileId=${saved.id}`;
      window.history.replaceState({}, '', url.toString());
    } else {
      appState.currentProfileId = null;
      appState.currentProfileName = name;
      if (birthNameEl) birthNameEl.value = name;
      if (birthGenderEl && urlParams.get('gender')) birthGenderEl.value = urlParams.get('gender');
      if (birthDateEl && urlParams.get('date')) birthDateEl.value = urlParams.get('date');
      if (birthTimeEl && urlParams.get('time')) birthTimeEl.value = urlParams.get('time');
      if (citySearchInput && urlParams.get('city')) citySearchInput.value = urlParams.get('city');
      if (birthLatEl && urlParams.get('lat')) birthLatEl.value = urlParams.get('lat');
      if (birthLonEl && urlParams.get('lon')) birthLonEl.value = urlParams.get('lon');
      if (birthTzEl && urlParams.get('tz')) birthTzEl.value = urlParams.get('tz');
      setMode('birth');
      updateNativeNameDisplays();
      updateActiveProfileIndicator();
      calculateFromBirthForm(false);
    }
  } else if (urlParams.get('mode') === 'paste') {
    const rawVal = sessionStorage.getItem('jyotish_pending_raw') || urlParams.get('raw');
    setMode('paste');
    if (rawVal && rawInputEl) {
      rawInputEl.value = rawVal;
      sessionStorage.removeItem('jyotish_pending_raw');
    }
    updateNativeNameDisplays();
    updateActiveProfileIndicator();
    calculateFromPaste();
  } else {
    // By default, no profile is loaded. Start with a fresh, unlinked session.
    appState.currentProfileId = null;
    appState.currentProfileName = '';
    appState.currentProfileNotes = '';
    if (birthNameEl) birthNameEl.value = '';
    updateNativeNameDisplays();
    updateActiveProfileIndicator();
    calculateFromBirthForm();
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Mode toggles
  btnModeBirth.addEventListener('click', () => {
    setMode('birth');
  });

  btnModePaste.addEventListener('click', () => {
    setMode('paste');
  });

  // Atlas City Search Input
  let searchDebounce = null;
  citySearchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    clearTimeout(searchDebounce);
    if (val.length < 2) {
      citySuggestionsBox.style.display = 'none';
      return;
    }
    searchDebounce = setTimeout(async () => {
      const results = await searchCities(val);
      renderCitySuggestions(results);
    }, 150);
  });

  citySearchInput.addEventListener('focus', () => {
    loadAtlas();
    if (citySearchInput.value.trim().length >= 2) {
      searchCities(citySearchInput.value.trim()).then(renderCitySuggestions);
    }
  });

  document.addEventListener('click', (e) => {
    if (!citySearchInput.contains(e.target) && !citySuggestionsBox.contains(e.target)) {
      citySuggestionsBox.style.display = 'none';
    }
  });

  // Quick City Chips
  quickCityChips.forEach(chip => {
    chip.addEventListener('click', async () => {
      const cityName = chip.getAttribute('data-city');
      const results = await searchCities(cityName, 1);
      if (results && results.length > 0) {
        selectCity(results[0]);
        calculateFromBirthForm();
      }
    });
  });


  // Birth Name Input listener
  if (birthNameEl) {
    birthNameEl.addEventListener('input', (e) => {
      appState.currentProfileName = e.target.value.trim() || 'Active Client';
      updateNativeNameDisplays();
      updateGeminiPrompt();
    });
  }

  // Calculate from Birth Details
  btnCalcFromBirth.addEventListener('click', () => {
    calculateFromBirthForm(true);
  });

  if (birthGenderEl) {
    birthGenderEl.addEventListener('change', () => {
      if (appState.planets && appState.planets.length > 0) {
        runPostCalculationPipeline();
        showToast(`Updated yogas and interpretations for ${birthGenderEl.value === 'female' ? 'Female ♀' : 'Male ♂'} native.`);
      }
    });
  }

  // Calculate from Paste
  btnParseCalc.addEventListener('click', () => {
    calculateFromPaste(true);
  });

  btnClearInput.addEventListener('click', () => {
    rawInputEl.value = '';
    rawInputEl.focus();
  });

  btnTodayDate.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    refDateEl.value = today;
    recalcDashaAndTransits();
    updateGeminiPrompt();
    showToast('Updated to today\'s date');
  });

  btnHeaderGemini.addEventListener('click', () => {
    switchTab('tab-gemini');
  });

  // Main Tabs navigation
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Chart style toggle
  btnChartNorth.addEventListener('click', () => {
    appState.chartStyle = 'north';
    btnChartNorth.className = 'btn btn-sm btn-primary';
    btnChartSouth.className = 'btn btn-sm btn-secondary';
    renderCurrentChart();
  });

  btnChartSouth.addEventListener('click', () => {
    appState.chartStyle = 'south';
    btnChartSouth.className = 'btn btn-sm btn-primary';
    btnChartNorth.className = 'btn btn-sm btn-secondary';
    renderCurrentChart();
  });

  // Varga selection
  vargaSelectEl.addEventListener('change', (e) => {
    appState.selectedVarga = e.target.value;
    renderCurrentChart();
  });

  // Reference date change
  refDateEl.addEventListener('change', () => {
    recalcDashaAndTransits();
    updateGeminiPrompt();
    if (appState.overlayTransits) renderCurrentChart();
  });

  // Transit Overlay toggle
  if (chkTransitOverlay) {
    chkTransitOverlay.addEventListener('change', (e) => {
      appState.overlayTransits = e.target.checked;
      renderCurrentChart();
      if (appState.overlayTransits) {
        showToast('Live transits (⟳ cyan) overlaid on Kundali!');
      } else {
        showToast('Transit overlay disabled.');
      }
    });
  }

  // Jaimini Padas Overlay toggle
  if (chkJaiminiOverlay) {
    chkJaiminiOverlay.addEventListener('change', (e) => {
      appState.showJaiminiOverlay = e.target.checked;
      renderCurrentChart();
      if (appState.showJaiminiOverlay) {
        showToast('Jaimini Padas overlaid: AL (Gold), UL (Pink), A7 (Purple)!');
      } else {
        showToast('Jaimini padas overlay disabled.');
      }
    });
  }

  // Time-Machine Transit Controls
  if (timeMachineDate) {
    timeMachineDate.addEventListener('change', (e) => {
      if (refDateEl) refDateEl.value = e.target.value;
      if (appState.tmFocusedEvent && appState.tmFocusedEvent.date !== e.target.value) {
        appState.tmFocusedEvent = null;
        updateTmEventBanner();
      }
      recalcDashaAndTransits();
      renderTransitsView();
      if (appState.overlayTransits) renderCurrentChart();
      updateGeminiPrompt();
      showToast(`Transits calculated for ${e.target.value}`);
    });
  }

  timeJumpButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const jump = btn.getAttribute('data-jump');
      let current = refDateEl.value ? new Date(refDateEl.value) : new Date();
      if (isNaN(current.getTime())) current = new Date();

      if (jump === 'today') {
        current = new Date();
      } else if (jump === '-365d') {
        current.setFullYear(current.getFullYear() - 1);
      } else if (jump === '+365d') {
        current.setFullYear(current.getFullYear() + 1);
      } else if (jump === '-30d') {
        current.setMonth(current.getMonth() - 1);
      } else if (jump === '+30d') {
        current.setMonth(current.getMonth() + 1);
      } else if (jump === '-7d') {
        current.setDate(current.getDate() - 7);
      } else if (jump === '+7d') {
        current.setDate(current.getDate() + 7);
      }

      const iso = current.toISOString().split('T')[0];
      if (refDateEl) refDateEl.value = iso;
      if (timeMachineDate) timeMachineDate.value = iso;
      if (appState.tmFocusedEvent && appState.tmFocusedEvent.date !== iso) {
        appState.tmFocusedEvent = null;
        updateTmEventBanner();
      }
      recalcDashaAndTransits();
      renderTransitsView();
      if (appState.overlayTransits) renderCurrentChart();
      updateGeminiPrompt();
      showToast(`Time-Machine jumped to ${iso}`);
    });
  });

  // Milan (Matchmaking) Controls
  if (milanSelectGroom) {
    milanSelectGroom.addEventListener('change', updateMilanPersonSummaries);
  }
  if (milanSelectBride) {
    milanSelectBride.addEventListener('change', updateMilanPersonSummaries);
  }
  if (btnCalculateMilan) {
    btnCalculateMilan.addEventListener('click', runMilanCalculation);
  }

  // Databank Modal Listeners
  if (btnSaveCurrentProfile) {
    btnSaveCurrentProfile.addEventListener('click', () => {
      openDatabankModal();
    });
  }
  if (btnCloseDatabank) {
    btnCloseDatabank.addEventListener('click', closeDatabankModal);
  }
  if (databankModal) {
    databankModal.addEventListener('click', (e) => {
      if (e.target === databankModal) closeDatabankModal();
    });
  }
  if (btnUpdateProfile) {
    btnUpdateProfile.addEventListener('click', () => handleSaveProfile(false));
  }
  if (btnSaveAsNew) {
    btnSaveAsNew.addEventListener('click', () => handleSaveProfile(true));
  }
  if (btnUnlinkProfile) {
    btnUnlinkProfile.addEventListener('click', unlinkCurrentProfile);
  }
  if (filterProfilesInput) {
    filterProfilesInput.addEventListener('input', (e) => {
      renderProfilesList(e.target.value);
    });
  }
  if (btnExportProfiles) {
    btnExportProfiles.addEventListener('click', handleExportProfiles);
  }
  if (importProfilesFile) {
    importProfilesFile.addEventListener('change', handleImportProfiles);
  }
  if (btnToggleEditPanel) {
    btnToggleEditPanel.addEventListener('click', toggleEditPanel);
  }
  if (btnStripNewChart) {
    btnStripNewChart.addEventListener('click', handleStripNewChart);
  }

  // Dirty state tracking on input changes
  const trackedInputs = [birthNameEl, birthGenderEl, birthDateEl, birthTimeEl, citySearchInput, birthLatEl, birthLonEl, birthTzEl, rawInputEl];
  trackedInputs.forEach(el => {
    if (el) {
      el.addEventListener('input', checkDirtyState);
      el.addEventListener('change', checkDirtyState);
    }
  });

  // Custom question input
  customQuestionInput.addEventListener('input', (e) => {
    appState.customQuestion = e.target.value;
    updateGeminiPrompt();
  });

  // Copy prompt event handlers
  if (btnCopyPrompt) {
    btnCopyPrompt.addEventListener('click', () => {
      copyPromptWithFeedback(btnCopyPrompt, 'Prompt copied! Paste it directly into Gemini.');
    });
  }
  if (btnCopyPromptInline) {
    btnCopyPromptInline.addEventListener('click', () => {
      copyPromptWithFeedback(btnCopyPromptInline, 'Prompt copied to clipboard!');
    });
  }
  if (btnCopyPromptBottom) {
    btnCopyPromptBottom.addEventListener('click', () => {
      copyPromptWithFeedback(btnCopyPromptBottom, 'Prompt copied! Paste it directly into Gemini.');
    });
  }
  if (btnSelectAllPrompt) {
    btnSelectAllPrompt.addEventListener('click', () => {
      if (!promptPreviewBox) return;
      const range = document.createRange();
      range.selectNodeContents(promptPreviewBox);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      showToast('All prompt text selected! Press ⌘C / Ctrl+C to copy.');
    });
  }

  // Yogas Studio Subtabs
  const btnSubtabDare = document.getElementById('subtab-yogas-dare');
  const btnSubtab300 = document.getElementById('subtab-yogas-300');
  if (btnSubtabDare) {
    btnSubtabDare.addEventListener('click', () => {
      appState.yogasSubtab = 'dare';
      renderYogasView();
    });
  }
  if (btnSubtab300) {
    btnSubtab300.addEventListener('click', () => {
      appState.yogasSubtab = '300';
      renderYogasView();
    });
  }

  // Dasha Subtabs (Vimshottari, Yogini, Dual Dasha)
  if (subtabDashaVimshottari) {
    subtabDashaVimshottari.addEventListener('click', () => {
      appState.dashaSubtab = 'vimshottari';
      renderDashaView();
    });
  }
  if (subtabDashaYogini) {
    subtabDashaYogini.addEventListener('click', () => {
      appState.dashaSubtab = 'yogini';
      renderDashaView();
    });
  }
  if (subtabDashaDual) {
    subtabDashaDual.addEventListener('click', () => {
      appState.dashaSubtab = 'dual';
      renderDashaView();
    });
  }

  // Yogas Metric Chips (quick jump & filter)
  const metricChips = document.querySelectorAll('.yoga-metric-chip');
  metricChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter') || 'all';
      metricChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      appState.yogasSubtab = 'dare';
      appState.yogasDareFilter = filter;
      // sync chip-filter active state
      document.querySelectorAll('#dare-filter-chips .chip-filter').forEach(cf => {
        cf.classList.toggle('active', cf.getAttribute('data-dare') === filter);
      });
      renderYogasView();
    });
  });

  // D-A-R-E Filter Chips
  const dareFilterChips = document.querySelectorAll('#dare-filter-chips .chip-filter');
  dareFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dareFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      appState.yogasDareFilter = chip.getAttribute('data-dare') || 'all';
      renderYogasView();
    });
  });

  // D-A-R-E Search Input
  const searchDareInput = document.getElementById('search-dare-yogas');
  if (searchDareInput) {
    searchDareInput.addEventListener('input', (e) => {
      appState.yogasDareSearch = e.target.value;
      renderYogasView();
    });
  }

  // Raman 300 Filter Chips
  const ramanFilterChips = document.querySelectorAll('#raman-filter-chips .chip-filter');
  ramanFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      ramanFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      appState.yogasRamanFilter = chip.getAttribute('data-cat') || 'all';
      renderYogasView();
    });
  });

  // Raman 300 Search Input
  const searchRamanInput = document.getElementById('search-raman-yogas');
  if (searchRamanInput) {
    searchRamanInput.addEventListener('input', (e) => {
      appState.yogasRamanSearch = e.target.value;
      renderYogasView();
    });
  }
}

function setMode(mode) {
  appState.inputMode = mode;
  if (mode === 'birth') {
    btnModeBirth.className = 'btn btn-sm btn-primary';
    btnModePaste.className = 'btn btn-sm btn-secondary';
    sectionModeBirth.style.display = 'block';
    sectionModePaste.style.display = 'none';
  } else {
    btnModePaste.className = 'btn btn-sm btn-primary';
    btnModeBirth.className = 'btn btn-sm btn-secondary';
    sectionModePaste.style.display = 'block';
    sectionModeBirth.style.display = 'none';
  }
}

function switchTab(tabId) {
  tabButtons.forEach(b => {
    if (b.getAttribute('data-tab') === tabId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  tabContents.forEach(c => {
    if (c.id === tabId) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  if (tabId === 'tab-milan') {
    try { populateMilanSelects(); } catch (e) { console.error('Error refreshing Milan dropdowns:', e); }
  }
  if (tabId === 'tab-bhavas') {
    try { renderBhavasView(); } catch (e) { console.error('Error refreshing Bhavas view:', e); }
  }
  if (tabId === 'tab-numerology') {
    try { renderNumerologyView(); } catch (e) { console.error('Error refreshing Numerology view:', e); }
  }
}

function renderCitySuggestions(results) {
  if (!results || results.length === 0) {
    citySuggestionsBox.style.display = 'none';
    return;
  }

  let html = '';
  results.forEach((city, idx) => {
    html += `
      <div class="suggestion-item" data-idx="${idx}">
        <div>
          <strong>${city.cityName}</strong>${city.province ? ', ' + city.province : ''}
          <div class="suggestion-sub">${city.country} (${city.lat > 0 ? city.lat + '°N' : -city.lat + '°S'}, ${city.lon > 0 ? city.lon + '°E' : -city.lon + '°W'})</div>
        </div>
        <span style="font-size: 0.72rem; color: var(--gold-light); font-weight: 600;">${city.timezone ? city.timezone.split('/')[1] || city.timezone : ''}</span>
      </div>
    `;
  });

  citySuggestionsBox.innerHTML = html;
  citySuggestionsBox.style.display = 'block';

  citySuggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-idx'), 10);
      selectCity(results[idx]);
    });
  });
}

function selectCity(city) {
  citySearchInput.value = city.displayLabel;
  birthLatEl.value = city.lat;
  birthLonEl.value = city.lon;

  // Calculate historical timezone offset based on entered birth date
  const birthDateVal = birthDateEl.value ? new Date(birthDateEl.value) : new Date();
  const tzOffset = getTimezoneOffsetHours(city.timezone, birthDateVal);
  birthTzEl.value = tzOffset;

  citySuggestionsBox.style.display = 'none';
  showToast(`Selected ${city.cityName} (Lat: ${city.lat}°, Lon: ${city.lon}°, TZ: UTC${tzOffset >= 0 ? '+' : ''}${tzOffset})`);
}

/**
 * Calculate Kundali directly from Date, Time, and Location
 */
function calculateFromBirthForm(shouldAutosave = false) {
  const enteredName = birthNameEl ? birthNameEl.value.trim() : '';
  if (enteredName) {
    appState.currentProfileName = enteredName;
  }
  updateNativeNameDisplays();

  const dateStr = birthDateEl.value;
  const timeStr = birthTimeEl.value || '12:00:00';
  const lat = parseFloat(birthLatEl.value) || 28.6139;
  const lon = parseFloat(birthLonEl.value) || 77.2090;
  const tz = parseFloat(birthTzEl.value) || 5.5;

  if (!dateStr) {
    showToast('Please select a valid birth date.');
    return;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const timeParts = timeStr.split(':').map(Number);
  const hour = timeParts[0] || 0;
  const minute = timeParts[1] || 0;
  const second = timeParts[2] || 0;

  try {
    const chartRes = calculateChartFromBirthDetails({
      year, month, day, hour, minute, second, lat, lon, tz
    });

    appState.planets = chartRes.planets;
    appState.mcDeg = chartRes.mcSidereal;
    runPostCalculationPipeline();

    if (shouldAutosave) {
      const isExisting = Boolean(appState.currentProfileId);
      const name = enteredName || appState.currentProfileName || `Kundali ${dateStr}`;
      const saved = saveProfile({
        id: isExisting ? appState.currentProfileId : undefined,
        name,
        gender: birthGenderEl ? birthGenderEl.value : 'male',
        mode: 'birth',
        birthDate: dateStr,
        birthTime: timeStr,
        city: citySearchInput ? citySearchInput.value : '',
        lat,
        lon,
        tz,
        notes: appState.currentProfileNotes || (isExisting ? '' : `Created in Studio on ${new Date().toLocaleDateString()}`)
      });

      if (saved) {
        appState.currentProfileId = saved.id;
        appState.currentProfileName = saved.name;
        appState.isEditorOpen = false; // Transition to clean static banner
        const url = new URL(window.location.href);
        url.search = `?profileId=${saved.id}`;
        window.history.replaceState({}, '', url.toString());

        updateActiveProfileIndicator();
        updateStaticProfileStrip();
        updateProfileCountBadge();
        showToast(isExisting ? `✓ Updated "${saved.name}" in Databank!` : `✓ Autosaved new profile "${saved.name}" to Databank!`);
        return;
      }
    }

    showToast(`Kundali calculated with sub-arcminute accuracy! Ayanamsha: ${chartRes.ayanamsha.toFixed(2)}°`);
  } catch (err) {
    console.error(err);
    showToast('Error calculating chart from birth details: ' + err.message);
  }
}

/**
 * Calculate Kundali from pasted text
 */
function calculateFromPaste(shouldAutosave = false) {
  const rawText = rawInputEl.value;
  const parsed = parsePlanetaryInput(rawText);

  if (parsed.length === 0) {
    showToast('Could not parse any planetary coordinates. Check format.');
    return;
  }

  appState.planets = parsed;
  runPostCalculationPipeline();

  if (shouldAutosave) {
    const isExisting = Boolean(appState.currentProfileId);
    const name = appState.currentProfileName || `Raw Chart ${new Date().toLocaleDateString()}`;
    const saved = saveProfile({
      id: isExisting ? appState.currentProfileId : undefined,
      name,
      gender: birthGenderEl ? birthGenderEl.value : 'male',
      mode: 'paste',
      rawInput: rawText,
      notes: appState.currentProfileNotes || `Imported via Raw Coordinates on ${new Date().toLocaleDateString()}`
    });

    if (saved) {
      appState.currentProfileId = saved.id;
      appState.currentProfileName = saved.name;
      appState.isEditorOpen = false;
      const url = new URL(window.location.href);
      url.search = `?profileId=${saved.id}`;
      window.history.replaceState({}, '', url.toString());

      updateActiveProfileIndicator();
      updateStaticProfileStrip();
      updateProfileCountBadge();
      showToast(isExisting ? `✓ Updated "${saved.name}" in Databank!` : `✓ Autosaved raw chart "${saved.name}" to Databank!`);
    }
  }
}

/**
 * Common pipeline executed after any chart is loaded or calculated
 */
function runPostCalculationPipeline() {
  // 1. Shodashvarga
  try {
    appState.shodashvarga = calculateShodashvargaMatrix(appState.planets);
  } catch (e) {
    console.error('Error in Shodashvarga calculation:', e);
  }

  // 2. Ashtakavarga
  try {
    appState.ashtakavarga = calculateAshtakavarga(appState.planets);
  } catch (e) {
    console.error('Error in Ashtakavarga calculation:', e);
  }

  // 3. Birth Panchanga (Five Limbs)
  try {
    const sun = appState.planets.find(p => p.key === 'Sun');
    const moon = appState.planets.find(p => p.key === 'Moon');
    const bDate = birthDateEl.value ? new Date(birthDateEl.value) : new Date();
    appState.panchanga = calculatePanchanga(sun, moon, bDate);
  } catch (e) {
    console.error('Error in Panchanga calculation:', e);
  }

  // 4. Parashari Drishti (Aspects)
  try {
    appState.drishti = calculateDrishti(appState.planets);
  } catch (e) {
    console.error('Error in Drishti calculation:', e);
  }

  // 5. Jaimini Karakas & Padas
  try {
    const lagna = appState.planets.find(p => p.key === 'ASC');
    if (lagna) {
      const lagnaSignIdx = lagna.signIndex !== undefined ? lagna.signIndex : (lagna.signId ? lagna.signId - 1 : 0);
      appState.jaiminiPadas = calculateJaiminiPadas(lagnaSignIdx, appState.planets);
      appState.charaKarakas = calculateCharaKarakas(appState.planets);
    }
  } catch (e) {
    console.error('Error in Jaimini calculation:', e);
  }

  // 6. Vimshottari Dasha & Real-Time Transits
  try {
    recalcDashaAndTransits();
  } catch (e) {
    console.error('Error in Dasha & Transits calculation:', e);
  }

  // 7. Special Yogas
  try {
    const gender = birthGenderEl ? birthGenderEl.value : (appState.currentProfileGender || 'male');
    appState.yogas = detectYogas(appState.planets, { gender });
    if (appState.raman300Catalog && appState.raman300Catalog.length > 0) {
      appState.raman300Catalog = matchRaman300Catalog(appState.yogas, appState.raman300Catalog);
    }
  } catch (e) {
    console.error('Error in Yogas calculation:', e);
  }

  // 8. Classical Parashari Shadbala & Bhavabala (Planetary & House Strengths)
  try {
    const bTime = birthTimeEl ? birthTimeEl.value : '12:00';
    const bDate = birthDateEl && birthDateEl.value ? new Date(birthDateEl.value) : new Date();
    appState.shadbala = calculateShadbala(appState.planets, appState.shodashvarga ? appState.shodashvarga.matrix : [], bTime, bDate);
    const lagna = appState.planets.find(p => p.key === 'ASC');
    const lagnaSignIdx = lagna ? (lagna.signIndex !== undefined ? lagna.signIndex : (lagna.signId ? lagna.signId - 1 : 0)) : 0;
    appState.bhavabala = calculateBhavabala(appState.planets, appState.shadbala, lagnaSignIdx);
  } catch (e) {
    console.error('Error in Shadbala/Bhavabala calculation:', e);
  }

  // 8b. Classical Sripati Bhava Chalit (Unequal House Placements)
  try {
    appState.bhavaChalit = calculateBhavaChalit(appState.planets, { mcDeg: appState.mcDeg });
  } catch (e) {
    console.error('Error in Bhava Chalit calculation:', e);
  }

  // 8c. Planetary Friendship Tables (Maitri Chakra)
  try {
    appState.friendship = calculateAllFriendshipTables(appState.planets);
  } catch (e) {
    console.error('Error in Friendship calculation:', e);
  }

  // 9. Update UI
  try { updateQuickStats(); } catch (e) { console.error('Error in updateQuickStats:', e); }
  try { updateStaticProfileStrip(); } catch (e) { console.error('Error in updateStaticProfileStrip:', e); }
  try { renderPanchangaStrip(); } catch (e) { console.error('Error in renderPanchangaStrip:', e); }
  try { renderCurrentChart(); } catch (e) { console.error('Error in renderCurrentChart:', e); }
  try { renderPlanetaryTable(); } catch (e) { console.error('Error in renderPlanetaryTable:', e); }
  try { renderShodashvargaTable(); } catch (e) { console.error('Error in renderShodashvargaTable:', e); }
  try { renderAshtakavargaView(); } catch (e) { console.error('Error in renderAshtakavargaView:', e); }
  try { renderDashaView(); } catch (e) { console.error('Error in renderDashaView:', e); }
  try { renderTransitsView(); } catch (e) { console.error('Error in renderTransitsView:', e); }
  try { renderDrishtiView(); } catch (e) { console.error('Error in renderDrishtiView:', e); }
  try { renderYogasView(); } catch (e) { console.error('Error in renderYogasView:', e); }
  try { renderJaiminiView(); } catch (e) { console.error('Error in renderJaiminiView:', e); }
  try { renderShadbalaView(); } catch (e) { console.error('Error in renderShadbalaView:', e); }
  try { renderFriendshipView(); } catch (e) { console.error('Error in renderFriendshipView:', e); }
  try { populateMilanSelects(); } catch (e) { console.error('Error in populateMilanSelects:', e); }
  try { renderLifeEventsTimeline(); } catch (e) { console.error('Error in renderLifeEventsTimeline:', e); }
  try { renderBhavasView(); } catch (e) { console.error('Error in renderBhavasView:', e); }
  try { renderNumerologyView(); } catch (e) { console.error('Error in renderNumerologyView:', e); }

  // 10. Generate Gemini Prompt
  try { updateGeminiPrompt(); } catch (e) { console.error('Error in updateGeminiPrompt:', e); }
}

function recalcDashaAndTransits() {
  const moon = appState.planets.find(p => p.key === 'Moon');
  const targetDateStr = (timeMachineDate && timeMachineDate.value) ? timeMachineDate.value : (refDateEl.value || new Date().toISOString().split('T')[0]);

  if (timeMachineDate) {
    timeMachineDate.value = targetDateStr;
  }

  if (moon) {
    appState.dasha = calculateVimshottariDasha(moon, birthDateEl.value || '1994-03-15', appState.planets, appState.houses, new Date(targetDateStr));
    appState.yoginiDasha = calculateYoginiDasha(moon, birthDateEl.value || '1994-03-15', 3, new Date(targetDateStr));
  }

  // Calculate real-time transits for target date
  try {
    const transitRes = calculateTransits(new Date(targetDateStr));
    appState.transits = transitRes;
    appState.transitAnalysis = analyzeTransits(appState.planets, transitRes.planets, appState.ashtakavarga);

    // Calculate Shani Sade Sati
    if (moon && transitRes.planets) {
      const saturnTransit = transitRes.planets.find(p => p.name === 'Saturn' || p.key === 'Saturn' || p.key === 'Satn');
      if (saturnTransit) {
        const saturnBav = appState.ashtakavarga && appState.ashtakavarga.BAV ? appState.ashtakavarga.BAV['Saturn'] : null;
        const asc = appState.planets ? appState.planets.find(p => p.key === 'ASC' || p.name === 'Ascendant' || p.key === 'Lagna') : null;
        appState.sadeSati = calculateSadeSati(moon, saturnTransit, saturnBav, asc);
      }
    }
  } catch (err) {
    console.error('Error calculating transits:', err);
  }
}

/**
 * Update Native / Client Name Across UI Chips and Headers
 */
function updateNativeNameDisplays() {
  const name = appState.currentProfileName || (birthNameEl ? birthNameEl.value.trim() : '') || 'Active Client';
  if (statNative) statNative.textContent = name;
  if (chartNativeBadge) chartNativeBadge.textContent = name;
  if (milanSelectGroom && milanSelectGroom.options.length > 0 && milanSelectGroom.options[0].value === 'current') {
    milanSelectGroom.options[0].textContent = `Active Natal Chart: ${name} (${birthDateEl ? (birthDateEl.value || 'Active') : 'Active'})`;
  }
}

/**
 * Update Top Stat Chips
 */
function updateQuickStats() {
  updateNativeNameDisplays();
  const lagna = appState.planets.find(p => p.key === 'ASC');
  const moon = appState.planets.find(p => p.key === 'Moon');

  if (lagna) {
    statLagna.textContent = `${lagna.signName} ${lagna.dmsFormatted}`;
  } else {
    statLagna.textContent = 'Not specified';
  }

  if (moon) {
    statMoon.textContent = `${moon.signName} (${moon.nakshatraName} ${moon.pada})`;
  } else {
    statMoon.textContent = 'Not specified';
  }

  if (appState.dasha && appState.dasha.currentRunning) {
    const cr = appState.dasha.currentRunning;
    statDasha.textContent = `${cr.md} - ${cr.ad} - ${cr.pd}`;
  } else if (appState.dasha) {
    statDasha.textContent = appState.dasha.balanceText.split(' of ')[1] || 'Calculated';
  }

  if (appState.ashtakavarga) {
    statSav.textContent = `${appState.ashtakavarga.totalSAV} pts (Strongest: H${appState.ashtakavarga.strongestHouse.house})`;
  }
}

/**
 * Render Interactive Kundali Chart
 */
function renderCurrentChart() {
  if (!appState.shodashvarga) return;

  const vCode = appState.selectedVarga;
  const vMeta = SHODASHVARGA_DEFS.find(d => d.code === vCode) || SHODASHVARGA_DEFS[0];

  if (vCode === 'CHALIT') {
    chartVargaTitle.textContent = 'CHALIT - Sripati Bhava Chalit Chart';
    chartVargaDesc.textContent = 'Classical Sripati Bhava Chalit representing unequal house allocations and planetary shifts across Bhav Sandhis.';
  } else {
    chartVargaTitle.textContent = `${vMeta.code} - ${vMeta.name} Chart`;
    chartVargaDesc.textContent = vMeta.significance;
  }

  // Pass live transit planets if transit overlay toggle is active
  const transitPlanetsToPass = appState.overlayTransits && appState.transits ? appState.transits.planets : [];

  let matrixToPass = [...appState.shodashvarga.matrix];

  // Attach Chalit house allocations if available
  if (appState.bhavaChalit && appState.bhavaChalit.planetPlacements) {
    matrixToPass = matrixToPass.map(row => {
      const pl = appState.bhavaChalit.planetPlacements.find(p => p.key === row.key);
      return {
        ...row,
        vargas: {
          ...row.vargas,
          CHALIT: pl ? pl.chalitHouse : (row.key === 'ASC' ? 1 : undefined),
          CHALIT_SIGN: pl ? pl.signId : undefined
        }
      };
    });
  }
  if (appState.showJaiminiOverlay && vCode === 'D1') {
    if (!appState.jaiminiPadas && appState.planets && appState.planets.length > 0) {
      const lagna = appState.planets.find(p => p.key === 'ASC');
      const lagnaSignIdx = lagna ? (lagna.signIndex !== undefined ? lagna.signIndex : (lagna.signId ? lagna.signId - 1 : 0)) : 0;
      appState.jaiminiPadas = calculateJaiminiPadas(lagnaSignIdx, appState.planets);
    }
    if (appState.jaiminiPadas) {
      matrixToPass = [
        ...matrixToPass,
        { key: 'AL', name: 'Arudha Lagna', symbol: 'AL', isRetro: false, vargas: { D1: appState.jaiminiPadas.AL.signIndex + 1 } },
        { key: 'UL', name: 'Upapada Lagna', symbol: 'UL', isRetro: false, vargas: { D1: appState.jaiminiPadas.UL.signIndex + 1 } },
        { key: 'A7', name: 'Darapada', symbol: 'A7', isRetro: false, vargas: { D1: appState.jaiminiPadas.A7.signIndex + 1 } }
      ];
    }
  }

  if (appState.chartStyle === 'north') {
    renderNorthIndianChart(vCode, matrixToPass, chartSvgContainer, transitPlanetsToPass);
  } else {
    renderSouthIndianChart(vCode, matrixToPass, chartSvgContainer, transitPlanetsToPass);
  }

  // Update external live transits banner (kept cleanly outside the chart)
  const transitBadgeBar = document.getElementById('chart-transit-badge-bar');
  if (transitBadgeBar) {
    transitBadgeBar.style.display = appState.overlayTransits ? 'block' : 'none';
  }

  // Update external Jaimini padas legend
  const padasLegend = document.getElementById('chart-legend-padas');
  if (padasLegend) {
    padasLegend.style.display = (appState.showJaiminiOverlay && vCode === 'D1') ? 'inline-flex' : 'none';
  }

  // Render Summary Table underneath Chart
  if (vCode === 'CHALIT' && appState.bhavaChalit) {
    let html = `<table class="data-table" style="font-size: 0.8rem;">
      <thead>
        <tr>
          <th>Bhav</th>
          <th>Bhav Begin (Sandhi)</th>
          <th>Mid Bhav (Madhya)</th>
          <th>Planets in Bhava</th>
          <th>Chalit Shift Notes</th>
        </tr>
      </thead>
      <tbody>`;

    for (let h of appState.bhavaChalit.houses) {
      const pInH = h.planets.length > 0 ? h.planets.join(', ') : '<span style="color:#64748B;">None</span>';
      const shiftsInH = appState.bhavaChalit.shiftedPlanets
        .filter(sp => sp.chalitHouse === h.house)
        .map(sp => `⚡ <strong>${sp.name}</strong> shifted from H${sp.rashiHouse} (${sp.signName})`)
        .join('<br>') || '-';

      html += `<tr>
        <td><strong>Bhava ${h.house}</strong></td>
        <td><code>${h.bhavBegin.dmsDotFormatted}</code></td>
        <td><code>${h.midBhav.dmsDotFormatted}</code></td>
        <td><strong style="color: #38BDF8;">${pInH}</strong></td>
        <td><span style="color: #F59E0B;">${shiftsInH}</span></td>
      </tr>`;
    }

    html += `</tbody></table>`;
    chartPlacementsSummary.innerHTML = html;
    return;
  }

  let html = `<table class="data-table" style="font-size: 0.8rem;">
    <thead>
      <tr><th>Planet</th><th>Sign in ${vCode}</th><th>Dignity & Avastha</th></tr>
    </thead>
    <tbody>`;

  for (let row of appState.shodashvarga.matrix) {
    const signId = row.vargas[vCode];
    const signObj = SIGNS[signId - 1];
    const retro = row.isRetro ? ' <span style="color: #EF4444; font-weight: bold;">[R]</span>' : '';
    const vargBadge = row.isVargottama && row.key !== 'ASC' ? ' <span class="badge badge-vargottama">Vargottama</span>' : '';
    const combust = (row.isCombust && (vCode === 'D1'))
      ? ` <span class="badge" style="background: rgba(249, 115, 22, 0.2); color: #FB923C; border: 1px solid rgba(249, 115, 22, 0.4);" title="${row.combustDist !== null ? row.combustDist + '° from Sun' : 'Combust (Asta)'}">🔥 Combust</span>`
      : '';
    const dig = vCode === 'D1' ? row.dignityD1 : getDignity(row.key, signId, row.degInSign);

    html += `<tr>
      <td><strong>${row.name}</strong>${retro}${vargBadge}</td>
      <td>${signObj.name} (${signObj.sanskrit})</td>
      <td><span class="badge ${dig.badgeClass}">${dig.label}</span>${combust}</td>
    </tr>`;
  }

  html += `</tbody></table>`;
  chartPlacementsSummary.innerHTML = html;
}

/**
 * Render Planetary Positions Table
 */
function renderPlanetaryTable() {
  const lagna = appState.planets.find(p => p.key === 'ASC');
  const lagnaSign = lagna ? lagna.signId : 1;

  let html = '';
  for (let p of appState.planets) {
    const houseFromLagna = ((p.signId - lagnaSign + 12) % 12) + 1;
    const vRow = appState.shodashvarga.matrix.find(r => r.key === p.key);
    const dignity = vRow ? vRow.dignityD1 : { label: '-', badgeClass: 'badge-neutral' };
    const combustBadge = (vRow && vRow.isCombust)
      ? ` <span class="badge" style="background: rgba(249, 115, 22, 0.2); color: #FB923C; border: 1px solid rgba(249, 115, 22, 0.4);" title="${vRow.combustDist !== null ? vRow.combustDist + '° from Sun' : 'Combust (Asta)'}">🔥 Combust</span>`
      : '';
    const retroBadge = p.isRetro ? '<span style="color:#EF4444; font-weight:700;">[R] Retrograde</span>' : '<span style="color:#10B981;">Direct</span>';
    const isLagna = p.key === 'ASC';

    html += `<tr>
      <td><strong style="color: ${p.color};">${p.name}</strong> (${p.symbol})</td>
      <td>${p.signName} (${p.signSanskrit})</td>
      <td><code>${p.dmsFormatted}</code></td>
      <td>${p.absLongitude}°</td>
      <td>${p.nakshatraName}</td>
      <td>${p.pada}</td>
      <td><strong>${isLagna ? 'Lagna (1st)' : `House ${houseFromLagna}`}</strong></td>
      <td><span class="badge ${dignity.badgeClass}">${dignity.label}</span>${combustBadge}</td>
      <td>${retroBadge}</td>
    </tr>`;
  }

  tbodyPlanets.innerHTML = html;
}

/**
 * Render Shodashvarga 16-Varga Table
 */
function renderShodashvargaTable() {
  let headerHtml = `<tr><th>Graha / Body</th>`;
  for (let def of SHODASHVARGA_DEFS) {
    headerHtml += `<th title="${def.name}: ${def.significance}">${def.code}</th>`;
  }
  headerHtml += `</tr>`;
  theadShodashvarga.innerHTML = headerHtml;

  if (appState.shodashvarga.vargottamaList.length > 0) {
    vargottamaSummaryTag.innerHTML = `
      <span class="badge badge-vargottama">
        ✨ Vargottama Planets: ${appState.shodashvarga.vargottamaList.join(', ')}
      </span>
    `;
  } else {
    vargottamaSummaryTag.innerHTML = '';
  }

  let bodyHtml = '';
  for (let row of appState.shodashvarga.matrix) {
    const retro = row.isRetro ? ' <span style="color:#EF4444;">(R)</span>' : '';
    const vargBadge = row.isVargottama && row.key !== 'ASC' ? ' ⭐' : '';
    bodyHtml += `<tr><td><strong>${row.name}</strong>${retro}${vargBadge}</td>`;

    for (let def of SHODASHVARGA_DEFS) {
      const sId = row.vargas[def.code];
      const signObj = SIGNS[sId - 1];
      const isD1D9Match = def.code === 'D9' && row.isVargottama;
      const cellStyle = isD1D9Match ? 'background: rgba(245, 158, 11, 0.15); font-weight: 700; color: #FDE047;' : '';
      bodyHtml += `<td style="${cellStyle}" title="${def.code} in ${signObj.name}">${signObj.sanskrit.substring(0, 3)} (${sId})</td>`;
    }
    bodyHtml += `</tr>`;
  }

  tbodyShodashvarga.innerHTML = bodyHtml;
}

/**
 * Render Ashtakavarga View
 */
function renderAshtakavargaView() {
  const { bav, savBySign, savByHouse, totalSAV } = appState.ashtakavarga;
  const lagna = appState.planets.find(p => p.key === 'ASC');
  const lagnaSign = lagna ? lagna.signId : 1;

  let barHtml = '';
  for (let item of savByHouse) {
    const pts = item.points;
    const heightPct = Math.min(100, Math.max(15, (pts / 45) * 100));
    let fillClass = '';
    if (pts >= 28) fillClass = 'strong';
    else if (pts < 25) fillClass = 'weak';

    barHtml += `
      <div class="sav-col">
        <span class="sav-points-lbl">${pts}</span>
        <div class="sav-pillar">
          <div class="sav-fill ${fillClass}" style="height: ${heightPct}%;"></div>
        </div>
        <span class="sav-house-lbl">H${item.house}</span>
        <span style="font-size: 0.65rem; color: #64748B;">${item.signName.substring(0, 3)}</span>
      </div>
    `;
  }
  savVisualBars.innerHTML = barHtml;

  const pKeys = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];
  let tableHtml = '';

  for (let k of pKeys) {
    const pMeta = appState.planets.find(p => p.key === k);
    const rowPoints = bav[k];
    const rowSum = rowPoints.reduce((a, b) => a + b, 0);

    tableHtml += `<tr><td><strong>${pMeta ? pMeta.name : k}</strong></td>`;
    for (let sIdx = 0; sIdx < 12; sIdx++) {
      const isLagnaSign = (sIdx + 1) === lagnaSign;
      const cellBg = isLagnaSign ? 'background: rgba(56, 189, 248, 0.08); font-weight: 700;' : '';
      tableHtml += `<td style="${cellBg}">${rowPoints[sIdx]}</td>`;
    }
    tableHtml += `<td><strong>${rowSum}</strong></td></tr>`;
  }

  tableHtml += `<tr style="background: rgba(245, 158, 11, 0.12); font-weight: 700; color: var(--gold-light);">
    <td>Sarvashtakavarga (SAV)</td>`;
  for (let sIdx = 0; sIdx < 12; sIdx++) {
    tableHtml += `<td>${savBySign[sIdx]}</td>`;
  }
  tableHtml += `<td><strong>${totalSAV}</strong></td></tr>`;

  tbodyAshtakavarga.innerHTML = tableHtml;
}

/**
 * Render Dasha Command Center (Vimshottari, Yogini & Dual Dasha Convergence)
 * Based on M.S. Mehta Chapters XV & XVI and K.N. Rao Classical Research
 */
function renderDashaView() {
  if (!appState.dasha) return;

  // 1. Sync Subtab Buttons & View Visibility
  const currentSubtab = appState.dashaSubtab || 'vimshottari';
  if (subtabDashaVimshottari) subtabDashaVimshottari.className = currentSubtab === 'vimshottari' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
  if (subtabDashaYogini) subtabDashaYogini.className = currentSubtab === 'yogini' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
  if (subtabDashaDual) subtabDashaDual.className = currentSubtab === 'dual' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';

  if (viewDashaVimshottari) viewDashaVimshottari.style.display = currentSubtab === 'vimshottari' ? 'block' : 'none';
  if (viewDashaYogini) viewDashaYogini.style.display = currentSubtab === 'yogini' ? 'block' : 'none';
  if (viewDashaDual) viewDashaDual.style.display = currentSubtab === 'dual' ? 'block' : 'none';

  // 2. Render Vimshottari Dasha
  renderVimshottariSubView();

  // 3. Render Yogini Dasha
  renderYoginiSubView();

  // 4. Render Dual-Dasha Convergence Matrix
  renderDualDashaConvergenceSubView();
}

/**
 * Render Section 1: Vimshottari Dasha Tree & Chidra Metrics
 */
function renderVimshottariSubView() {
  const { nakshatraName, nakshatraLord, balanceText, mahadashas, currentRunning } = appState.dasha;
  if (!currentDashaBanner) return;

  if (currentRunning) {
    const chidraBadgeHtml = currentRunning.chidraStatus
      ? `<span class="${currentRunning.chidraStatus.phase.includes('Terminal') ? 'badge-chidra-terminal' : 'badge-chidra-incipient'}">⚡ ${currentRunning.chidraStatus.phase}</span>`
      : '';
    const sambandhaBadgeHtml = currentRunning.sambandha
      ? `<span class="badge-sambandha ${currentRunning.sambandha.isChallenging ? 'badge-sambandha-challenging' : 'badge-sambandha-favorable'}">${currentRunning.sambandha.label}</span>`
      : '';
    const warningHtml = currentRunning.specialWarning
      ? `<div style="margin-top: 6px; font-size: 0.78rem; color: #F87171; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #EF4444; padding: 6px 10px; border-radius: 4px;">⚠️ ${currentRunning.specialWarning}</div>`
      : '';

    currentDashaBanner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div class="hero-title">🔥 Currently Running Vimshottari Dasha</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${chidraBadgeHtml}
          ${sambandhaBadgeHtml}
        </div>
      </div>
      <div class="dasha-line">
        <span style="color: var(--gold-light);">${currentRunning.md} Mahadasha</span>
        <span style="color: var(--text-dim);">▸</span>
        <span style="color: var(--accent-cyan);">${currentRunning.ad} Antardasha</span>
        <span style="color: var(--text-dim);">▸</span>
        <span style="color: #A78BFA;">${currentRunning.pd} Pratyantardasha</span>
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span>Pratyantar Window: <strong>${currentRunning.startStr}</strong> to <strong>${currentRunning.endStr}</strong></span>
        <span>Sub-Period Progress: <strong>${currentRunning.progressPct}%</strong></span>
      </div>
      <div class="dasha-progress-bar">
        <div class="dasha-progress-fill" style="width: ${currentRunning.progressPct}%;"></div>
      </div>
      ${currentRunning.sambandha ? `<div style="font-size: 0.76rem; color: #CBD5E1; margin-top: 3px;"><strong>Sambandha Dynamics:</strong> ${currentRunning.sambandha.description}</div>` : ''}
      ${currentRunning.chidraStatus ? `<div style="font-size: 0.75rem; color: #FCA5A5; margin-top: 2px;"><strong>Chidra Notice:</strong> ${currentRunning.chidraStatus.description}</div>` : ''}
      ${warningHtml}
      <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 4px;">
        Birth Nakshatra: <strong>${nakshatraName}</strong> (Lord: ${nakshatraLord}) • ${balanceText}
      </div>
    `;
  } else {
    currentDashaBanner.innerHTML = `
      <div class="hero-title">Vimshottari Dasha Balance</div>
      <div class="dasha-line" style="font-size: 1.1rem; color: var(--gold-light);">
        ${balanceText}
      </div>
    `;
  }

  let treeHtml = '';
  mahadashas.forEach((md, mIdx) => {
    const isMdActive = currentRunning && currentRunning.md === md.lord;
    const borderStyle = isMdActive ? 'border-color: rgba(245, 158, 11, 0.6); background: rgba(245, 158, 11, 0.05);' : '';

    treeHtml += `
      <div class="dasha-row" style="${borderStyle}" id="md-row-${mIdx}">
        <div class="dasha-row-header" onclick="window.toggleDashaRow(${mIdx})">
          <div class="dasha-lord-title">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${md.color}; display: inline-block;"></span>
            <strong>${md.lord} Mahadasha</strong>
            <span style="font-size: 0.78rem; color: var(--text-muted);">(${md.actualDurationYears} yrs)</span>
            ${isMdActive ? '<span class="badge badge-exalted">Active</span>' : ''}
            ${md.specialWarning ? '<span style="font-size: 0.7rem; color: #F87171; background: rgba(239, 68, 68, 0.15); padding: 1px 6px; border-radius: 4px;">⚠️ Mehta Alert</span>' : ''}
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 12px;">
            <span>${md.startStr} → ${md.endStr}</span>
            <span id="md-arrow-${mIdx}">▼</span>
          </div>
        </div>

        <div class="antardasha-sublist" id="ad-list-${mIdx}" style="display: ${isMdActive ? 'grid' : 'none'};">
    `;

    for (let ad of md.antardashas) {
      const isAdActive = currentRunning && isMdActive && currentRunning.ad === ad.lord;
      let adBg = 'background: #090D1A;';
      let borderStyle = '';
      let opacityStyle = '';

      if (ad.isPreNatal) {
        opacityStyle = 'opacity: 0.5;';
        adBg = 'background: rgba(9, 13, 26, 0.6);';
      } else if (isAdActive) {
        adBg = 'background: rgba(56, 189, 248, 0.15);';
        borderStyle = 'border: 1px solid rgba(56, 189, 248, 0.4);';
      }

      const chidraChip = ad.chidraStatus
        ? `<span style="font-size: 0.68rem; color: #F87171; background: rgba(239, 68, 68, 0.18); padding: 1px 5px; border-radius: 4px;">⚡ Chidra</span>`
        : '';
      const sambandhaChip = ad.sambandha && ad.sambandha.distance
        ? `<span style="font-size: 0.68rem; color: ${ad.sambandha.isChallenging ? '#FCD34D' : '#6EE7B7'};">${ad.sambandha.type.split(' ')[0]}</span>`
        : '';
      const statusChip = ad.isPreNatal
        ? `<span style="font-size: 0.65rem; color: #64748B; background: rgba(100, 116, 139, 0.15); padding: 1px 5px; border-radius: 3px;">Pre-natal</span>`
        : (ad.isBirthDasha
          ? `<span style="font-size: 0.65rem; color: #38BDF8; background: rgba(56, 189, 248, 0.18); padding: 1px 5px; border-radius: 3px;">Birth AD</span>`
          : '');

      treeHtml += `
        <div style="${adBg} ${borderStyle} ${opacityStyle} padding: 8px 12px; border-radius: 6px; font-size: 0.78rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 600;">
            <span style="color: ${isAdActive ? '#38BDF8' : (ad.isPreNatal ? '#94A3B8' : '#F8FAFC')};">${md.lord} - ${ad.lord}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              ${statusChip}
              ${chidraChip}
              ${sambandhaChip}
            </div>
          </div>
          <div style="color: var(--text-dim); font-size: 0.72rem; margin-top: 3px; display: flex; justify-content: space-between;">
            <span>From: ${ad.startStr}</span>
            <span>To: ${ad.endStr}</span>
          </div>
        </div>
      `;
    }

    treeHtml += `</div></div>`;
  });

  if (dashaTreeContainer) dashaTreeContainer.innerHTML = treeHtml;
}

/**
 * Render Section 2: Yogini Dasha (36-Year Cycles per Mehta Ch. XVI)
 */
function renderYoginiSubView() {
  if (!appState.yoginiDasha || !yoginiTreeContainer) return;
  const yd = appState.yoginiDasha;
  const { currentRunning, cycles, balanceText, nakshatraName } = yd;

  if (currentRunning && currentYoginiBanner) {
    currentYoginiBanner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div class="hero-title" style="color: #34D399;">✨ Currently Running Yogini Dasha (36-Year Cycle ${currentRunning.cycle})</div>
        <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #6EE7B7; border: 1px solid rgba(16, 185, 129, 0.5); font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px;">
          ${currentRunning.mdNature} Mahadasha • ${currentRunning.adNature} Antardasha
        </span>
      </div>
      <div class="dasha-line">
        <span style="color: #6EE7B7;">${currentRunning.mdName} (${currentRunning.mdLord}) MD</span>
        <span style="color: var(--text-dim);">▸</span>
        <span style="color: #38BDF8;">${currentRunning.adName} (${currentRunning.adLord}) AD</span>
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span>Yogini Window: <strong>${currentRunning.startStr}</strong> to <strong>${currentRunning.endStr}</strong></span>
        <span>Sub-Period Progress: <strong>${currentRunning.progressPct}%</strong></span>
      </div>
      <div class="dasha-progress-bar">
        <div class="dasha-progress-fill" style="width: ${currentRunning.progressPct}%; background: linear-gradient(to right, #10B981, #38BDF8);"></div>
      </div>
      <div style="margin-top: 8px; padding: 12px 14px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; border-radius: 6px; font-size: 0.84rem; color: #E2E8F0; line-height: 1.45;">
        <div style="font-weight: 700; color: #34D399; margin-bottom: 3px;">📖 Classical Prediction (Mansagri / Mehta Ch. XVI):</div>
        "${currentRunning.classicalReading}"
      </div>
      <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 6px;">
        Birth Nakshatra: <strong>${nakshatraName}</strong> • ${balanceText}
      </div>
    `;
  }

  let yoginiHtml = '';
  cycles.forEach((cycle, cIdx) => {
    yoginiHtml += `
      <div style="margin-top: 14px; margin-bottom: 8px; font-size: 0.88rem; font-weight: 700; color: var(--gold-light); display: flex; align-items: center; gap: 8px;">
        <span>☸️ ${cycle.name}</span>
        <span style="font-size: 0.74rem; color: var(--text-muted); font-weight: 400;">(Complete 8-Yogini Cycle)</span>
      </div>
    `;

    cycle.mahadashas.forEach((md, mIdx) => {
      const isMdActive = currentRunning && currentRunning.cycle === cycle.cycleNumber && currentRunning.mdName === md.name;
      const borderStyle = isMdActive ? 'border-color: rgba(16, 185, 129, 0.6); background: rgba(16, 185, 129, 0.05);' : '';

      yoginiHtml += `
        <div class="dasha-row" style="${borderStyle}" id="ymd-row-${cIdx}-${mIdx}">
          <div class="dasha-row-header" onclick="window.toggleYoginiRow(${cIdx}, ${mIdx})">
            <div class="dasha-lord-title">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${md.color}; display: inline-block;"></span>
              <strong>${md.name}</strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">(${md.lord} • ${md.actualDurationYears} yrs)</span>
              ${isMdActive ? '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #6EE7B7; border: 1px solid rgba(16, 185, 129, 0.5); font-size: 0.72rem; padding: 1px 6px; border-radius: 4px;">Active</span>' : ''}
              <span style="font-size: 0.72rem; color: ${md.nature === 'Benefic' ? '#34D399' : '#F87171'};">[${md.nature}]</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 12px;">
              <span>${md.startStr} → ${md.endStr}</span>
              <span id="ymd-arrow-${cIdx}-${mIdx}">▼</span>
            </div>
          </div>

          <div class="antardasha-sublist" id="yad-list-${cIdx}-${mIdx}" style="display: ${isMdActive ? 'grid' : 'none'};">
      `;

      for (let ad of md.antardashas) {
        const isAdActive = isMdActive && currentRunning.adName === ad.name;
        let adBg = 'background: #090D1A;';
        let borderStyle = '';
        let opacityStyle = '';

        if (ad.isPreNatal) {
          opacityStyle = 'opacity: 0.5;';
          adBg = 'background: rgba(9, 13, 26, 0.6);';
        } else if (isAdActive) {
          adBg = 'background: rgba(16, 185, 129, 0.18);';
          borderStyle = 'border: 1px solid rgba(16, 185, 129, 0.5);';
        }

        const statusChip = ad.isPreNatal
          ? `<span style="font-size: 0.65rem; color: #64748B; background: rgba(100, 116, 139, 0.15); padding: 1px 5px; border-radius: 3px;">Pre-natal</span>`
          : (ad.isBirthDasha
            ? `<span style="font-size: 0.65rem; color: #34D399; background: rgba(16, 185, 129, 0.18); padding: 1px 5px; border-radius: 3px;">Birth AD</span>`
            : '');

        yoginiHtml += `
          <div style="${adBg} ${borderStyle} ${opacityStyle} padding: 10px 12px; border-radius: 6px; font-size: 0.78rem; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-weight: 600;">
              <span style="color: ${isAdActive ? '#34D399' : (ad.isPreNatal ? '#94A3B8' : '#F8FAFC')};">${md.name} - ${ad.name} (${ad.lord})</span>
              <div style="display: flex; gap: 4px; align-items: center;">
                ${statusChip}
                <span style="color: var(--text-dim); font-size: 0.72rem;">${ad.years}y</span>
              </div>
            </div>
            <div style="color: var(--text-dim); font-size: 0.72rem;">
              ${ad.startStr} → ${ad.endStr}
            </div>
            <div style="font-size: 0.72rem; color: #94A3B8; margin-top: 2px; font-style: italic;">
              ${ad.classicalReading.substring(0, 75)}...
            </div>
          </div>
        `;
      }

      yoginiHtml += `</div></div>`;
    });
  });

  yoginiTreeContainer.innerHTML = yoginiHtml;
}

/**
 * Render Section 3: Dual-Dasha Convergence Matrix (Mehta & KN Rao Method)
 */
function renderDualDashaConvergenceSubView() {
  if (!dualDashaConvergenceCard) return;
  const vd = appState.dasha ? appState.dasha.currentRunning : null;
  const yd = appState.yoginiDasha ? appState.yoginiDasha.currentRunning : null;

  if (!vd || !yd) {
    dualDashaConvergenceCard.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px;">Dual-Dasha convergence data requires valid birth details.</div>`;
    return;
  }

  dualDashaConvergenceCard.innerHTML = `
    <div style="margin-bottom: 12px;">
      <h4 style="font-size: 1rem; color: var(--gold-light); margin: 0 0 4px 0;">⚡ Dual-Dasha Synchronization Engine</h4>
      <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Cross-verifying current timing between Vimshottari (120y) and Yogini (36y) as taught by K.N. Rao and M.S. Mehta.</p>
    </div>

    <div class="dual-dasha-grid">
      <!-- Vimshottari Status Card -->
      <div class="dual-dasha-card">
        <div class="dual-dasha-card-header">
          <span style="font-weight: 700; color: var(--gold-light);">⏳ Vimshottari Dasha</span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #FCD34D;">120-Year Baseline</span>
        </div>
        <div style="font-size: 0.88rem; display: flex; flex-direction: column; gap: 6px;">
          <div><strong>Mahadasha (MD):</strong> <span style="color: var(--gold-light);">${vd.md}</span></div>
          <div><strong>Antardasha (AD):</strong> <span style="color: var(--accent-cyan);">${vd.ad}</span></div>
          <div><strong>Pratyantardasha (PD):</strong> <span style="color: #A78BFA;">${vd.pd}</span></div>
          <div><strong>Window:</strong> ${vd.startStr} → ${vd.endStr} (${vd.progressPct}% elapsed)</div>
          <div><strong>Mutual Sambandha:</strong> ${vd.sambandha ? vd.sambandha.label : 'General'}</div>
          ${vd.chidraStatus ? `<div style="color: #F87171; font-weight: 600;">⚡ ${vd.chidraStatus.phase}</div>` : ''}
        </div>
      </div>

      <!-- Yogini Status Card -->
      <div class="dual-dasha-card">
        <div class="dual-dasha-card-header">
          <span style="font-weight: 700; color: #34D399;">✨ Yogini Dasha</span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #6EE7B7;">36-Year Cycle ${yd.cycle}</span>
        </div>
        <div style="font-size: 0.88rem; display: flex; flex-direction: column; gap: 6px;">
          <div><strong>Mahadasha (MD):</strong> <span style="color: #34D399;">${yd.mdName}</span> (Lord: ${yd.mdLord}, ${yd.mdNature})</div>
          <div><strong>Antardasha (AD):</strong> <span style="color: #38BDF8;">${yd.adName}</span> (Lord: ${yd.adLord}, ${yd.adNature})</div>
          <div><strong>Window:</strong> ${yd.startStr} → ${yd.endStr} (${yd.progressPct}% elapsed)</div>
          <div><strong>Classical Sub-Period:</strong> ${yd.comboKey}</div>
          <div style="font-size: 0.78rem; color: #CBD5E1; font-style: italic; background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 4px;">
            "${yd.classicalReading}"
          </div>
        </div>
      </div>
    </div>

    <!-- Classical Synthesis Box -->
    <div class="convergence-synthesis-box">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 1.1rem;">🏛️</span>
        <h5 style="margin: 0; font-size: 0.92rem; color: #CBD5E1; font-weight: 700;">Classical Correlation Dictum (Mehta Ch. XVI & K.N. Rao)</h5>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 8px 0;">
        "Events of consequence occur only when both Vimshottari and Yogini dashas confirm each other." If Vimshottari indicates professional elevation or transfer while Yogini runs a benefic sub-period (${yd.adName} ruled by ${yd.adLord}), the event manifests smoothly and decisively. If either indicates Dasha Chidra or adverse axes (like 6/8 Shadashtaka or Sankata/Ulka), progress is accompanied by major adjustments.
      </p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; font-size: 0.76rem; color: var(--gold-light);">
        <span>✓ Dual Dasha Active: <strong>${vd.md}-${vd.ad}</strong> / <strong>${yd.mdName}-${yd.adName}</strong></span>
        <span>• Timing Concordance Verified</span>
      </div>
    </div>
  `;
}

window.toggleDashaRow = function (idx) {
  const adList = document.getElementById(`ad-list-${idx}`);
  const arrow = document.getElementById(`md-arrow-${idx}`);
  if (!adList) return;
  if (adList.style.display === 'none' || !adList.style.display) {
    adList.style.display = 'grid';
    if (arrow) arrow.textContent = '▲';
  } else {
    adList.style.display = 'none';
    if (arrow) arrow.textContent = '▼';
  }
};

window.toggleYoginiRow = function (cIdx, mIdx) {
  const adList = document.getElementById(`yad-list-${cIdx}-${mIdx}`);
  const arrow = document.getElementById(`ymd-arrow-${cIdx}-${mIdx}`);
  if (!adList) return;
  if (adList.style.display === 'none' || !adList.style.display) {
    adList.style.display = 'grid';
    if (arrow) arrow.textContent = '▲';
  } else {
    adList.style.display = 'none';
    if (arrow) arrow.textContent = '▼';
  }
};

/**
 * Render Live Transits (Gochar) Tab
 */
function renderTransitsView() {
  if (!appState.transitAnalysis || !appState.transits) return;

  const targetDateStr = (timeMachineDate && timeMachineDate.value) ? timeMachineDate.value : (refDateEl.value || new Date().toISOString().split('T')[0]);
  if (transitDateLabel && appState.transits && appState.transits.ayanamsha !== undefined) {
    transitDateLabel.textContent = `Transit Date: ${targetDateStr} (Ayanamsha: ${appState.transits.ayanamsha.toFixed(2)}°)`;
  }

  // Render Time-Machine Gochar Kundali Chart & Side Summary Panel
  renderTimeMachineChart();

  // Render Alerts (Sade Sati, Kantaka, Guru Bala)
  const alerts = appState.transitAnalysis.alerts;
  if (alerts && alerts.length > 0) {
    let alertHtml = '';
    for (let al of alerts) {
      let bg = 'rgba(245, 158, 11, 0.1)';
      let border = 'rgba(245, 158, 11, 0.4)';
      if (al.type === 'caution') {
        bg = 'rgba(239, 68, 68, 0.12)';
        border = 'rgba(239, 68, 68, 0.5)';
      } else if (al.type === 'success') {
        bg = 'rgba(16, 185, 129, 0.12)';
        border = 'rgba(16, 185, 129, 0.5)';
      }

      alertHtml += `
        <div style="background: ${bg}; border: 1px solid ${border}; border-radius: 8px; padding: 12px 16px;">
          <strong style="color: #FFF; font-size: 0.9rem;">${al.title}</strong>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">${al.desc}</p>
        </div>
      `;
    }
    transitAlertsContainer.innerHTML = alertHtml;
  } else {
    transitAlertsContainer.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: var(--text-dim);">
        No intense transit affliction (No active Sade Sati or Ashtama Shani).
      </div>
    `;
  }

  // Render Sade Sati Hero Card
  renderSadeSatiHero();

  // Render Transits Table
  let tableHtml = '';
  for (let tp of appState.transitAnalysis.transitSummary) {
    const retro = tp.isRetro ? '<span style="color:#EF4444; font-weight:700;">[R] Retrograde</span>' : '<span style="color:#10B981;">Direct</span>';
    const qualityBadge = tp.overallBadge || (tp.savVerdict.includes('High') ? 'badge-exalted' : (tp.savVerdict.includes('Low') ? 'badge-debilitated' : 'badge-neutral'));
    const displayQuality = tp.overallVerdict || tp.savVerdict;

    const moonBadge = tp.isMoonFavorable
      ? `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34D399; font-size: 0.68rem; margin-left: 6px; border: 1px solid rgba(16, 185, 129, 0.3); vertical-align: middle;" title="Auspicious Janma Rashi Gochar: ${tp.moonRuleText}">✓ Shubha</span>`
      : `<span class="badge" style="background: rgba(239, 68, 68, 0.12); color: #F87171; font-size: 0.68rem; margin-left: 6px; border: 1px solid rgba(239, 68, 68, 0.25); vertical-align: middle;" title="Adverse Janma Rashi Gochar. Favorable only in: ${tp.moonRuleText}">✗ Ashubha</span>`;

    const savBadge = tp.savPoints >= 30
      ? `<span style="color: #34D399; font-weight: 700;">${tp.savPoints}</span> <span style="font-size: 0.72rem; color: #34D399;">(High Kavach)</span>`
      : (tp.savPoints < 25
        ? `<span style="color: #F87171; font-weight: 700;">${tp.savPoints}</span> <span style="font-size: 0.72rem; color: #F87171;">(Low / Friction)</span>`
        : `<span style="color: var(--text-light); font-weight: 700;">${tp.savPoints}</span> <span style="font-size: 0.72rem; color: var(--text-dim);">(Baseline Avg)</span>`);

    tableHtml += `
      <tr>
        <td><strong>${tp.name}</strong> (${tp.symbol})</td>
        <td>${tp.signName} <code>${tp.dmsFormatted}</code></td>
        <td>${tp.nakshatraName} (${tp.pada})</td>
        <td>House ${tp.houseFromLagna}</td>
        <td><strong>House ${tp.houseFromMoon}</strong> ${moonBadge}</td>
        <td>${savBadge}</td>
        <td><span class="badge ${qualityBadge}" style="cursor: help;" title="${tp.overallReason || ''}">${displayQuality}</span></td>
        <td>${retro}</td>
      </tr>
    `;
  }
  tbodyTransits.innerHTML = tableHtml;

  // Render Bhava Siddhi Kala (Classical Event Fruition Timing - APA Notes, pp. 172-175)
  renderBhavaSiddhiView();
}

/**
 * Render Bhava Siddhi Kala (Classical Event Manifestation Windows)
 * Provenance: APA (Advanced Predictive Astrology) Hindi Notes, pp. 172–175
 */
function renderBhavaSiddhiView() {
  if (!bhavaSiddhiContainer) return;
  const bs = appState.transitAnalysis && appState.transitAnalysis.bhavaSiddhi;
  if (!bs || !bs.bhavas || bs.bhavas.length === 0) {
    bhavaSiddhiContainer.innerHTML = '';
    return;
  }

  const activeCount = bs.activeBhavas.length;
  const approachingCount = bs.approachingBhavas.length;
  const haaniCount = bs.haaniBhavas.length;

  let cardsHtml = '';
  for (let b of bs.bhavas) {
    const cardBorder = b.siddhiScore >= 50
      ? 'border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05);'
      : (b.haaniRisk && b.siddhiScore < 25
        ? 'border: 1px solid rgba(239, 68, 68, 0.25); background: rgba(239, 68, 68, 0.03);'
        : 'border: 1px solid var(--border-subtle); background: rgba(255, 255, 255, 0.02);');

    let triggersHtml = '';
    if (b.triggers && b.triggers.length > 0) {
      triggersHtml = `
        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
          ${b.triggers.map(t => `
            <div style="font-size: 0.73rem; color: #E2E8F0; display: flex; gap: 6px; align-items: flex-start;">
              <span style="color: #34D399; font-weight: 700;">✓</span>
              <span><strong>${t.rule}:</strong> ${t.detail}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      triggersHtml = `<p style="font-size: 0.72rem; color: var(--text-dim); margin-top: 6px;">No active classical transit triggers in this window.</p>`;
    }

    let haaniHtml = '';
    if (b.haaniRisk) {
      haaniHtml = `
        <div style="margin-top: 8px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #EF4444; padding: 6px 8px; border-radius: 0 4px 4px 0; font-size: 0.72rem; color: #FCA5A5;">
          <strong>🛡️ Bhava Haani Filter:</strong> ${b.haaniDetail}
        </div>
      `;
    }

    cardsHtml += `
      <div style="border-radius: var(--radius-md); padding: 12px 14px; ${cardBorder} display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #FFF;">H${b.houseNum} • ${b.houseName}</span>
            <span class="badge ${b.badgeClass}" style="font-size: 0.7rem; padding: 2px 7px;">${b.siddhiScore}/100</span>
          </div>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 6px;">
            Lord: <strong>${b.bhavesha}</strong> • Lagnesha: <strong>${b.lagnesha}</strong> • Karaka: <strong>${b.karaka}</strong>
          </div>
          <div style="width: 100%; background: rgba(255, 255, 255, 0.08); height: 5px; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${b.siddhiScore}%; height: 100%; background: ${b.siddhiScore >= 50 ? '#10B981' : (b.siddhiScore >= 25 ? '#F59E0B' : '#64748B')}; transition: width 0.3s ease;"></div>
          </div>
          ${triggersHtml}
        </div>
        ${haaniHtml}
      </div>
    `;
  }

  bhavaSiddhiContainer.innerHTML = `
    <div class="card" style="padding: 20px; background: rgba(14, 19, 34, 0.88); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.25rem;">🎯</span>
            <h4 style="font-size: 1.05rem; color: var(--gold-light); font-weight: 800; margin: 0;">
              Bhava Siddhi Kala (भावसिद्धि काल) — Classical Event Fruition Windows
            </h4>
          </div>
          <p style="font-size: 0.76rem; color: var(--text-muted); margin: 4px 0 0 0;">
            Exact mathematical timing when transiting Lagnesha, Bhavesha, and Karaka activate natal karmic promises per <em>APA Hindi Notes, pp. 172–175</em>
          </p>
          <p style="font-size: 0.73rem; color: #F59E0B; font-style: italic; margin: 4px 0 0 0; font-family: serif;">
            ${bs.classicalShloka}
          </p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.74rem;">
            🌟 ${activeCount} Active Window${activeCount !== 1 ? 's' : ''}
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 0.74rem;">
            ⚡ ${approachingCount} Approaching
          </span>
          <span class="badge" style="background: rgba(239, 68, 68, 0.12); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.25); font-size: 0.74rem;">
            🛡️ ${haaniCount} Under Saturnine Testing
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
        ${cardsHtml}
      </div>
    </div>
  `;
}

/**
 * Time-Machine Interactive Gochar Kundali Chart Controls
 */
function initTimeMachineChartUI() {
  const btnLagna = document.getElementById('btn-tm-ref-lagna');
  const btnMoon = document.getElementById('btn-tm-ref-moon');
  const btnNorth = document.getElementById('btn-tm-style-north');
  const btnSouth = document.getElementById('btn-tm-style-south');
  const btnClear = document.getElementById('btn-tm-clear-event');

  if (btnLagna && btnMoon) {
    btnLagna.addEventListener('click', () => {
      appState.tmLagnaRef = 'lagna';
      btnLagna.className = 'btn btn-xs btn-primary';
      btnMoon.className = 'btn btn-xs btn-secondary';
      renderTimeMachineChart();
    });
    btnMoon.addEventListener('click', () => {
      appState.tmLagnaRef = 'moon';
      btnMoon.className = 'btn btn-xs btn-primary';
      btnLagna.className = 'btn btn-xs btn-secondary';
      renderTimeMachineChart();
    });
  }

  if (btnNorth && btnSouth) {
    btnNorth.addEventListener('click', () => {
      appState.tmChartStyle = 'north';
      btnNorth.className = 'btn btn-xs btn-primary';
      btnSouth.className = 'btn btn-xs btn-secondary';
      renderTimeMachineChart();
    });
    btnSouth.addEventListener('click', () => {
      appState.tmChartStyle = 'south';
      btnSouth.className = 'btn btn-xs btn-primary';
      btnNorth.className = 'btn btn-xs btn-secondary';
      renderTimeMachineChart();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      const todayIso = new Date().toISOString().split('T')[0];
      jumpToTimeMachine(todayIso, null);
    });
  }
}

/**
 * Update Life Event Calibration Banner in Time Machine
 */
function updateTmEventBanner() {
  const banner = document.getElementById('tm-event-banner');
  const bannerIcon = document.getElementById('tm-event-banner-icon');
  const bannerTitle = document.getElementById('tm-event-banner-title');
  const bannerSubtitle = document.getElementById('tm-event-banner-subtitle');

  if (!banner) return;

  if (appState.tmFocusedEvent) {
    banner.style.display = 'flex';
    if (bannerIcon) bannerIcon.textContent = appState.tmFocusedEvent.icon || '🎯';
    if (bannerTitle) bannerTitle.textContent = `Calibrated to Life Event: ${appState.tmFocusedEvent.title || 'Major Milestone'}`;
    if (bannerSubtitle) {
      bannerSubtitle.textContent = `Date: ${appState.tmFocusedEvent.date} • Astrological coordinates locked to event milestone for retrospective analysis`;
    }
  } else {
    banner.style.display = 'none';
  }
}

/**
 * Render Interactive Gochar Kundali in Time Machine
 */
function renderTimeMachineChart() {
  const svgBox = document.getElementById('tm-chart-svg-container');
  if (!svgBox || !appState.shodashvarga || !appState.transits) return;

  const targetDateStr = (timeMachineDate && timeMachineDate.value) ? timeMachineDate.value : (refDateEl.value || new Date().toISOString().split('T')[0]);

  // Determine Lagna reference
  let matrixToPass = [...appState.shodashvarga.matrix];
  const moon = appState.planets.find(p => p.key === 'Moon');

  if (appState.tmLagnaRef === 'moon' && moon) {
    const moonSign = moon.signId || 1;
    matrixToPass = matrixToPass.map(row => {
      if (row.key === 'ASC') {
        return {
          ...row,
          vargas: {
            ...row.vargas,
            D1: moonSign
          }
        };
      }
      return row;
    });
    if (tmChartTitle) {
      tmChartTitle.innerHTML = `<span>🌙</span> Chandra (Moon) Gochar Kundali <span style="font-size:0.75rem; color: #38BDF8; font-weight: normal;">• Janma Rashi as Lagna</span>`;
    }
  } else {
    if (tmChartTitle) {
      tmChartTitle.innerHTML = `<span>🌌</span> Gochar Kundali (Transits on Calibrated Date)`;
    }
  }

  // Render SVG into tm-chart-svg-container
  if (appState.tmChartStyle === 'south') {
    renderSouthIndianChart('D1', matrixToPass, svgBox, appState.transits.planets);
  } else {
    renderNorthIndianChart('D1', matrixToPass, svgBox, appState.transits.planets);
  }

  // Populate Side Summary Panel
  renderTimeMachineSummaryPanel(targetDateStr);
}

/**
 * Render Gochar Summary Cards Beside Chart
 */
function renderTimeMachineSummaryPanel(targetDateStr) {
  const panel = document.getElementById('tm-chart-summary-panel');
  if (!panel) return;

  const birthDateStr = birthDateEl ? birthDateEl.value : null;
  const ageText = calculateAgeAtEvent(birthDateStr, targetDateStr);
  const formattedDate = new Date(targetDateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  // Running Dasha at this date
  let dashaStr = 'N/A';
  let dashaRange = '';
  let chidraBadge = '';
  if (appState.dasha) {
    const dAtDate = getDashaAtDate(appState.dasha, targetDateStr);
    if (dAtDate) {
      dashaStr = dAtDate.dashaStr;
      if (dAtDate.md) dashaRange = `MD Range: ${dAtDate.md.startStr} → ${dAtDate.md.endStr}`;
      if (dAtDate.ad && dAtDate.ad.chidra) {
        chidraBadge = `<span class="badge" style="background: rgba(244, 63, 94, 0.2); color: #FDA4AF; border: 1px solid rgba(244, 63, 94, 0.4); font-size: 0.68rem; padding: 2px 6px;">⚠️ ${dAtDate.ad.chidra.phase}</span>`;
      }
    } else if (appState.dasha.currentRunning) {
      const cr = appState.dasha.currentRunning;
      dashaStr = `${cr.md} › ${cr.ad} › ${cr.pd}`;
    }
  }

  // Shani Sade Sati Status
  let sadeSatiPill = '';
  if (appState.sadeSati) {
    const ss = appState.sadeSati;
    if (ss.isSadeSati || ss.isActive) {
      sadeSatiPill = `<span style="color: #F87171; font-weight: 700;">⚠️ ${ss.phaseName || ss.phase} (${ss.saturnSign || ss.currentShaniSign} • H${ss.relHouse || ss.houseFromMoon} Moon)</span>`;
    } else if (ss.relHouse === 4 || ss.isKantaka) {
      sadeSatiPill = `<span style="color: #FBBF24; font-weight: 700;">⚡ Ardha-Ashtama Shani (H4 from Moon in ${ss.saturnSign || ss.currentShaniSign})</span>`;
    } else if (ss.relHouse === 8 || ss.isAshtama) {
      sadeSatiPill = `<span style="color: #EF4444; font-weight: 700;">🛡️ Ashtama Shani (H8 from Moon in ${ss.saturnSign || ss.currentShaniSign})</span>`;
    } else {
      sadeSatiPill = `<span style="color: #10B981; font-weight: 600;">✓ Free from Sade Sati (Saturn in ${ss.saturnSign || ss.currentShaniSign})</span>`;
    }
  }

  // Guru Bala Status
  let guruBalaPill = '';
  const trPlanets = appState.transits ? appState.transits.planets : [];
  const natalMoon = appState.planets.find(p => p.key === 'Moon');
  const natalLagna = appState.planets.find(p => p.key === 'ASC');
  const trJup = trPlanets.find(p => p.key === 'Jupt');
  const trSat = trPlanets.find(p => p.key === 'Satn');
  const trRahu = trPlanets.find(p => p.key === 'Rahu');
  const trKetu = trPlanets.find(p => p.key === 'Ketu');
  const trMars = trPlanets.find(p => p.key === 'Mars');

  if (trJup && natalMoon) {
    const hFromMoon = ((trJup.signId - natalMoon.signId + 12) % 12) + 1;
    const isGuruBala = [2, 5, 7, 9, 11].includes(hFromMoon);
    guruBalaPill = isGuruBala
      ? `<span style="color: #34D399; font-weight: 700;">✨ Active Guru Bala (${hFromMoon}th from Moon)</span>`
      : `<span style="color: var(--text-muted);">${hFromMoon}th from Moon</span>`;
  }

  // Build HTML
  let html = `
    <!-- Dasha & Milestone Card -->
    <div class="tm-summary-card">
      <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gold-light); font-weight: 700; margin-bottom: 5px;">
        👑 Active Vimshottari Dasha on ${formattedDate}:
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 1rem; font-weight: 700; color: #FFF;">${dashaStr}</span>
        ${chidraBadge}
      </div>
      <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap;">
        ${ageText !== '—' ? `<span>⏳ Age: <strong>${ageText}</strong></span> • ` : ''}
        <span>${dashaRange || `Target: ${targetDateStr}`}</span>
      </div>
    </div>

    <!-- Shani & Guru Transit Status -->
    <div class="tm-summary-card">
      <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent-cyan); font-weight: 700; margin-bottom: 6px;">
        ⚡ Crucial Transit Alignments (Gochar):
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
          <span style="color: var(--text-muted);">🪐 Shani Influence:</span>
          <span>${sadeSatiPill || 'Calculating...'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
          <span style="color: var(--text-muted);">🌟 Jupiter (Guru Bala):</span>
          <span>${guruBalaPill || 'Calculating...'}</span>
        </div>
      </div>
    </div>

    <!-- Key Planets Grid -->
    <div class="tm-summary-card" style="display: flex; flex-direction: column; gap: 5px;">
      <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">
        🪐 Key Planetary Positions in Sky:
      </div>
  `;

  const keyGrahas = [
    { p: trSat, icon: '🪐', name: 'Saturn' },
    { p: trJup, icon: '🌟', name: 'Jupiter' },
    { p: trRahu, icon: '🐉', name: 'Rahu' },
    { p: trKetu, icon: '☄️', name: 'Ketu' },
    { p: trMars, icon: '⚔️', name: 'Mars' }
  ];

  for (let item of keyGrahas) {
    if (!item.p) continue;
    const p = item.p;
    const hLagna = natalLagna ? (((p.signId - natalLagna.signId + 12) % 12) + 1) : null;
    const hMoon = natalMoon ? (((p.signId - natalMoon.signId + 12) % 12) + 1) : null;
    const retroTag = p.isRetro ? '<span style="color:#EF4444; font-weight:700; font-size:0.7rem;">[R]</span>' : '';

    html += `
      <div class="tm-transit-pill-row">
        <span>${item.icon} <strong>${item.name}:</strong> ${p.signName} <code>${p.dmsFormatted}</code> ${retroTag}</span>
        <span style="color: var(--accent-cyan); font-weight: 600;">
          ${hLagna ? `H${hLagna} Lagna` : ''}${hMoon ? ` • H${hMoon} Moon` : ''}
        </span>
      </div>
    `;
  }

  html += `</div>`;
  panel.innerHTML = html;
}

/**
 * Render Yogas View
 */
/**
 * Render Yogas View (D-A-R-E & BV Raman 300)
 */
function renderYogasView() {
  const yogasContainer = document.getElementById('yogas-container');
  const ramanContainer = document.getElementById('raman-300-container');
  const subviewDare = document.getElementById('subview-yogas-dare');
  const subview300 = document.getElementById('subview-yogas-300');
  const btnSubtabDare = document.getElementById('subtab-yogas-dare');
  const btnSubtab300 = document.getElementById('subtab-yogas-300');

  // Toggle Subviews
  if (appState.yogasSubtab === '300') {
    if (subviewDare) subviewDare.style.display = 'none';
    if (subview300) subview300.style.display = 'block';
    if (btnSubtabDare) {
      btnSubtabDare.className = 'btn btn-sm btn-secondary';
    }
    if (btnSubtab300) {
      btnSubtab300.className = 'btn btn-sm btn-primary';
    }
  } else {
    if (subviewDare) subviewDare.style.display = 'block';
    if (subview300) subview300.style.display = 'none';
    if (btnSubtabDare) {
      btnSubtabDare.className = 'btn btn-sm btn-primary';
    }
    if (btnSubtab300) {
      btnSubtab300.className = 'btn btn-sm btn-secondary';
    }
  }

  // Update Metric Counters
  const yogas = appState.yogas || [];
  const cntTotal = yogas.length;
  const cntRaja = yogas.filter(y => y.dare === 'R').length;
  const cntDhana = yogas.filter(y => y.dare === 'D').length;
  const cntExchanges = yogas.filter(y => y.dare === 'E').length;
  const cntArishta = yogas.filter(y => y.dare === 'A').length;
  const cntNeutralized = yogas.filter(y => y.isNeutralized).length;
  const cntNabhas = yogas.filter(y => y.dare === 'N').length;

  const elTotal = document.getElementById('cnt-yogas-total');
  const elRaja = document.getElementById('cnt-yogas-raja');
  const elDhana = document.getElementById('cnt-yogas-dhana');
  const elExchanges = document.getElementById('cnt-yogas-exchanges');
  const elArishta = document.getElementById('cnt-yogas-arishta');
  const elNeutralized = document.getElementById('cnt-yogas-neutralized');
  const elNabhas = document.getElementById('cnt-yogas-nabhas');

  if (elTotal) elTotal.textContent = cntTotal;
  if (elRaja) elRaja.textContent = cntRaja;
  if (elDhana) elDhana.textContent = cntDhana;
  if (elExchanges) elExchanges.textContent = cntExchanges;
  if (elArishta) elArishta.textContent = cntArishta;
  if (elNeutralized) elNeutralized.textContent = cntNeutralized;
  if (elNabhas) elNabhas.textContent = cntNabhas;

  // Active and Neutralized in Raman 300 badge
  const ramanCatalog = appState.raman300Catalog || [];
  const activeRamanCount = ramanCatalog.filter(m => m.isDetected && !m.isNeutralized).length;
  const neutralizedRamanCount = ramanCatalog.filter(m => m.isDetected && m.isNeutralized).length;

  const elRamanActiveBadge = document.getElementById('raman-active-badge');
  if (elRamanActiveBadge) elRamanActiveBadge.textContent = activeRamanCount;

  const elRamanNeutralizedBadge = document.getElementById('raman-neutralized-badge');
  if (elRamanNeutralizedBadge) elRamanNeutralizedBadge.textContent = neutralizedRamanCount;

  // 1. Render D-A-R-E Cards
  if (yogasContainer) {
    let dareFiltered = yogas;
    const filterDare = appState.yogasDareFilter || 'all';
    if (filterDare === 'neutralized') {
      dareFiltered = dareFiltered.filter(y => y.isNeutralized);
    } else if (filterDare !== 'all') {
      dareFiltered = dareFiltered.filter(y => y.dare === filterDare);
    }

    const searchQuery = (appState.yogasDareSearch || '').toLowerCase().trim();
    if (searchQuery) {
      dareFiltered = dareFiltered.filter(y =>
        (y.name && y.name.toLowerCase().includes(searchQuery)) ||
        (y.category && y.category.toLowerCase().includes(searchQuery)) ||
        (y.subCategory && y.subCategory.toLowerCase().includes(searchQuery)) ||
        (y.description && y.description.toLowerCase().includes(searchQuery)) ||
        (y.modernInterpretation && y.modernInterpretation.toLowerCase().includes(searchQuery)) ||
        (y.planets && y.planets.some(p => p.toLowerCase().includes(searchQuery)))
      );
    }

    if (dareFiltered.length === 0) {
      yogasContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <h4 style="color: #FFF; font-size: 1.05rem; margin-bottom: 4px;">No matching yogas found</h4>
          <p style="font-size: 0.82rem; margin: 0;">Try adjusting your category filter or search keyword.</p>
        </div>
      `;
    } else {
      const dareBadges = {
        R: '👑 Raja Yoga [R]',
        D: '💰 Dhana Yoga [D]',
        E: '🔄 Exchange [E]',
        A: '⚠️ Arishta [A]',
        N: '🌌 Nabhas [N]'
      };

      let html = '';
      for (let y of dareFiltered) {
        const dareClass = (y.dare || 'N').toLowerCase();
        const badgeLabel = dareBadges[y.dare] || y.category;

        const planetChips = (y.planets || []).map(p =>
          `<span class="yoga-planet-chip">🪐 ${p}</span>`
        ).join('');

        const houseChips = (y.houses || []).map(h =>
          `<span class="yoga-house-chip">H${h}</span>`
        ).join('');

        html += `
          <div class="yoga-card dare-${dareClass} ${y.isNeutralized ? 'neutralized-in-chart' : ''}">
            <div class="yoga-card-header">
              <span class="yoga-dare-badge dare-badge-${dareClass}">${badgeLabel}</span>
              <div class="yoga-header-badges">
                ${y.isNeutralized
            ? '<span class="yoga-status-badge badge-neutralized">⚖️ Neutralized (Bhanga)</span>'
            : '<span class="yoga-status-badge badge-active">✓ Active</span>'}
                ${y.strength ? `<span class="yoga-strength-pill">${y.strength}</span>` : ''}
              </div>
            </div>

            <div>
              <h4 class="yoga-name">${y.name}</h4>
              <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 600; margin-top: 2px;">
                ${y.subCategory || y.category}
              </div>
            </div>

            <div class="yoga-tags-strip">
              ${planetChips}
              ${houseChips}
            </div>

            <p class="yoga-desc">${y.description}</p>

            ${y.modernInterpretation ? `
              <div class="yoga-modern-box">
                <strong style="color: var(--gold-light);">💡 Real-World Manifestation:</strong>
                <div>${y.modernInterpretation}</div>
              </div>
            ` : ''}

            ${y.dashaTiming ? `
              <div class="yoga-dasha-pill">
                <span>⏳</span>
                <span><strong>Dasha Activation:</strong> ${y.dashaTiming}</span>
              </div>
            ` : ''}

            ${y.neutralization ? `
              <div class="yoga-bhanga-pill">
                <span>⚖️</span>
                <span><strong>Bhanga / Neutralization:</strong> ${y.neutralization}</span>
              </div>
            ` : ''}
          </div>
        `;
      }
      yogasContainer.innerHTML = html;
    }
  }

  // 2. Render Raman 300 Cards
  if (ramanContainer && ramanCatalog.length > 0) {
    let ramanFiltered = ramanCatalog;
    const filterCat = appState.yogasRamanFilter || 'all';

    if (filterCat === 'detected') {
      ramanFiltered = ramanFiltered.filter(r => r.isDetected && !r.isNeutralized);
    } else if (filterCat === 'neutralized') {
      ramanFiltered = ramanFiltered.filter(r => r.isDetected && r.isNeutralized);
    } else if (filterCat !== 'all') {
      ramanFiltered = ramanFiltered.filter(r => (r.category && r.category.toLowerCase().includes(filterCat.toLowerCase())));
    }

    const search300 = (appState.yogasRamanSearch || '').toLowerCase().trim();
    if (search300) {
      ramanFiltered = ramanFiltered.filter(r =>
        (r.name && r.name.toLowerCase().includes(search300)) ||
        (String(r.id) === search300) ||
        (r.category && r.category.toLowerCase().includes(search300)) ||
        (r.formation && r.formation.toLowerCase().includes(search300)) ||
        (r.effect && r.effect.toLowerCase().includes(search300)) ||
        (r.modern_interpretation && r.modern_interpretation.toLowerCase().includes(search300)) ||
        (r.participating_planets && r.participating_planets.some(p => p.toLowerCase().includes(search300)))
      );
    }

    const showingStatusEl = document.getElementById('raman-showing-status');
    if (showingStatusEl) {
      showingStatusEl.textContent = `Showing ${ramanFiltered.length} of 300 yogas (${activeRamanCount} active, ${neutralizedRamanCount} neutralized in chart)`;
    }

    if (ramanFiltered.length === 0) {
      ramanContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted); background: rgba(0,0,0,0.15); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 2rem; margin-bottom: 8px;">📖</div>
          <h4 style="color: #FFF; font-size: 1.05rem; margin-bottom: 4px;">No matching Raman yogas found</h4>
          <p style="font-size: 0.82rem; margin: 0;">Try broadening your filter or search query.</p>
        </div>
      `;
    } else {
      let html = '';
      for (let item of ramanFiltered) {
        const planetChips = (item.participating_planets || []).map(p =>
          `<span class="yoga-planet-chip">🪐 ${p}</span>`
        ).join('');

        const houseChips = (item.houses_involved || []).map(h =>
          `<span class="yoga-house-chip">H${h}</span>`
        ).join('');

        const isDetectedActive = item.isDetected && !item.isNeutralized;
        const isDetectedNeutralized = item.isDetected && item.isNeutralized;

        html += `
          <div class="yoga-card raman-card ${isDetectedNeutralized ? 'neutralized-in-chart' : (isDetectedActive ? 'active-in-chart' : '')}">
            <div class="yoga-card-header">
              <span class="yoga-dare-badge ${isDetectedNeutralized ? 'dare-badge-a' : (isDetectedActive ? 'dare-badge-r' : 'dare-badge-n')}">
                #${item.id} • ${item.category}
              </span>
              <div class="yoga-header-badges">
                ${isDetectedActive ? '<span class="raman-status-badge badge-active">✓ Active in Chart</span>' : ''}
                ${isDetectedNeutralized ? '<span class="raman-status-badge badge-neutralized">⚖️ Neutralized (Bhanga)</span>' : ''}
                ${item.relevance ? `<span class="yoga-strength-pill">Relevance: ${item.relevance}</span>` : ''}
              </div>
            </div>

            <div>
              <h4 class="yoga-name">${item.name}</h4>
            </div>

            <div class="yoga-tags-strip">
              ${planetChips}
              ${houseChips}
            </div>

            <p class="yoga-desc">
              <strong style="color: #E2E8F0;">Formation Rule:</strong> ${item.formation}
            </p>

            <p class="yoga-desc">
              <strong style="color: #CBD5E1;">Classical Effect:</strong> ${item.effect}
            </p>

            ${item.modern_interpretation ? `
              <div class="yoga-modern-box">
                <strong style="color: var(--gold-light);">💡 Modern Meaning:</strong>
                <div>${item.modern_interpretation}</div>
              </div>
            ` : ''}

            ${isDetectedNeutralized && item.neutralizationReason ? `
              <div class="yoga-bhanga-pill" style="margin-top: 2px;">
                <span>⚖️</span>
                <span><strong>Neutralization Factor:</strong> ${item.neutralizationReason}</span>
              </div>
            ` : (item.neutralization ? `
              <div class="yoga-bhanga-pill" style="margin-top: 2px;">
                <span>⚖️</span>
                <span><strong>Neutralization / Bhanga:</strong> ${item.neutralization}</span>
              </div>
            ` : '')}

            ${item.additional_info ? `
              <div class="yoga-dasha-pill">
                <span>⏳</span>
                <span><strong>Timing / Notes:</strong> ${item.additional_info}</span>
              </div>
            ` : ''}
          </div>
        `;
      }
      ramanContainer.innerHTML = html;
    }
  }
}

/**
 * Render Prompt Preset Buttons
 */
function renderPresetButtons() {
  let html = '';
  for (let p of PROMPT_PRESETS) {
    const isActive = p.id === appState.selectedPresetId;
    html += `
      <div class="preset-chip ${isActive ? 'active' : ''}" data-preset-id="${p.id}">
        <span class="preset-chip-title">${p.title}</span>
        <button type="button" class="btn-copy-preset" data-preset-id="${p.id}" title="Copy this prompt preset directly to clipboard">
          📋 Copy
        </button>
      </div>
    `;
  }
  presetButtonsContainer.innerHTML = html;

  presetButtonsContainer.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      if (e.target.closest('.btn-copy-preset')) return;

      const pId = chip.getAttribute('data-preset-id');
      appState.selectedPresetId = pId;

      presetButtonsContainer.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      if (pId === 'custom') {
        customQuestionGroup.style.display = 'block';
        customQuestionInput.focus();
      } else {
        customQuestionGroup.style.display = 'none';
      }

      updateGeminiPrompt();
    });
  });

  presetButtonsContainer.querySelectorAll('.btn-copy-preset').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const pId = btn.getAttribute('data-preset-id');
      appState.selectedPresetId = pId;

      presetButtonsContainer.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      const parentChip = btn.closest('.preset-chip');
      if (parentChip) parentChip.classList.add('active');

      if (pId === 'custom') {
        customQuestionGroup.style.display = 'block';
      } else {
        customQuestionGroup.style.display = 'none';
      }

      updateGeminiPrompt();

      const presetObj = PROMPT_PRESETS.find(p => p.id === pId);
      const titleClean = presetObj ? presetObj.title.replace(/^[^a-zA-Z0-9]+/, '').trim() : 'Prompt';
      await copyPromptWithFeedback(btn, `Copied "${titleClean}" prompt!`);
    });
  });
}

/**
 * Render Birth Panchanga (Five Limbs of Time)
 */
function renderPanchangaStrip() {
  if (!appState.panchanga) return;
  const p = appState.panchanga;

  if (panchangaTithi) {
    panchangaTithi.textContent = `${p.tithi.name} (${p.tithi.paksha})`;
  }
  if (panchangaVaara) {
    panchangaVaara.textContent = `${p.vaara.name} (${p.vaara.sanskrit}) • ${p.vaara.lord}`;
  }
  if (panchangaNakshatra) {
    panchangaNakshatra.textContent = `${p.nakshatra.name} (Pada ${p.nakshatra.pada}) • ${p.nakshatra.lord}`;
  }
  if (panchangaYoga) {
    panchangaYoga.innerHTML = `${p.yoga.name} <span style="font-size: 0.72rem; color: ${p.yoga.isAuspicious ? 'var(--accent-emerald)' : 'var(--gold-primary)'};">(${p.yoga.isAuspicious ? 'Auspicious' : 'Sensitive'})</span>`;
  }
  if (panchangaKarana) {
    panchangaKarana.textContent = p.karana.name;
  }
}

/**
 * Render Parashari Drishti (Aspects) View
 */
function renderDrishtiView() {
  if (!appState.drishti) return;
  const d = appState.drishti;
  const lagna = appState.planets.find(p => p.key === 'ASC');
  const lagnaSign = lagna ? lagna.signId : 1;

  // 1. Mutual Aspects
  if (mutualAspectsList) {
    if (!d.mutualAspects || d.mutualAspects.length === 0) {
      mutualAspectsList.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-muted); font-style: italic;">No exact mutual Parashari planetary aspects present in this chart.</p>`;
    } else {
      let mHtml = '';
      d.mutualAspects.forEach(ma => {
        mHtml += `
          <div class="mutual-aspect-card">
            <span style="font-size: 1.1rem; color: var(--gold-light);">⚡</span>
            <div>
              <strong style="color: #FFF; font-size: 0.9rem;">${ma.planetA} ⟷ ${ma.planetB}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${ma.description}</div>
            </div>
          </div>
        `;
      });
      mutualAspectsList.innerHTML = mHtml;
    }
  }

  // 2. Planet to Planet Aspects Table
  if (tbodyAspectsPlanets) {
    if (!d.aspectsOnPlanets || d.aspectsOnPlanets.length === 0) {
      tbodyAspectsPlanets.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No direct planetary aspects found.</td></tr>`;
    } else {
      let pHtml = '';
      d.aspectsOnPlanets.forEach(ap => {
        const isSpecial = ['4th Aspect', '8th Aspect', '5th Aspect', '9th Aspect', '3rd Aspect', '10th Aspect'].includes(ap.aspectType);
        const badgeClass = isSpecial ? 'badge-aspect-special' : 'badge-aspect';

        // Check if mutual
        const isMutual = d.mutualAspects.some(ma =>
          (ma.planetA === ap.aspectingPlanet && ma.planetB === ap.aspectedPlanet) ||
          (ma.planetB === ap.aspectingPlanet && ma.planetA === ap.aspectedPlanet)
        );

        pHtml += `
          <tr>
            <td><strong>${ap.aspectingPlanet}</strong></td>
            <td>House ${ap.fromHouse}</td>
            <td><span class="badge-aspect ${badgeClass}">${ap.aspectType}</span></td>
            <td><strong style="color: var(--accent-cyan);">${ap.aspectedPlanet}</strong></td>
            <td>House ${ap.toHouse}</td>
            <td>${isMutual ? '<span class="badge badge-vargottama">⚡ Mutual Aspect</span>' : '<span style="color: var(--text-dim); font-size: 0.78rem;">Unilateral Aspect</span>'}</td>
          </tr>
        `;
      });
      tbodyAspectsPlanets.innerHTML = pHtml;
    }
  }

  // 3. House by House Drishti Breakdown
  if (tbodyAspectsHouses) {
    let hHtml = '';
    for (let h = 1; h <= 12; h++) {
      const signId = ((lagnaSign - 1 + (h - 1)) % 12) + 1;
      const signObj = SIGNS[signId - 1];

      // Occupants with generous padding and clean badges
      const occupants = appState.planets.filter(p => p.key !== 'ASC' && p.signId === signId).map(p => p.name);
      const occupantsStr = occupants.length > 0
        ? occupants.map(occ => `<span style="display: inline-flex; align-items: center; margin: 3px 5px; padding: 4px 10px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: var(--gold-light);">${occ}</span>`).join('')
        : '<span style="color: var(--text-dim); font-style: italic;">Empty</span>';

      // Aspects on this house with generous padding and distinct aspect colors
      const houseAspects = d.aspectsOnHouses[h] || [];
      const aspectsStr = houseAspects.length > 0
        ? houseAspects.map(ha => `<span style="display: inline-flex; align-items: center; margin: 3px 5px; padding: 4px 10px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.22); border-radius: 6px; font-size: 0.78rem; color: #F8FAFC;"><strong>${ha.planetName}</strong> <span style="color: var(--accent-cyan); margin-left: 5px; font-weight: 600;">(${ha.aspectNumber}th)</span></span>`).join('')
        : '<span style="color: var(--text-dim); font-style: italic;">No incoming aspects</span>';

      hHtml += `
        <tr>
          <td><strong style="color: var(--gold-light); font-size: 0.92rem;">House ${h}</strong></td>
          <td>${signObj.name} <span style="color: var(--text-muted); font-size: 0.78rem;">(${signObj.sanskrit})</span></td>
          <td>${occupantsStr}</td>
          <td>${aspectsStr}</td>
          <td style="text-align: center;"><strong style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background: ${houseAspects.length >= 2 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)'}; color: ${houseAspects.length >= 2 ? 'var(--gold-light)' : 'var(--text-muted)'};">${houseAspects.length}</strong></td>
        </tr>
      `;
    }
    tbodyAspectsHouses.innerHTML = hHtml;
  }
}

/**
 * Databank Management System & Profile Distinction
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function updateActiveProfileIndicator() {
  const pill = document.getElementById('active-profile-pill');
  const icon = document.getElementById('active-profile-icon');
  const text = document.getElementById('active-profile-text');
  const btnUnlink = document.getElementById('btn-unlink-profile');

  if (!pill || !text) return;

  if (appState.currentProfileId) {
    pill.classList.remove('is-unsaved');
    if (icon) icon.textContent = '📂';
    text.innerHTML = `Profile: <strong>${escapeHtml(appState.currentProfileName)}</strong>`;
    if (btnUnlink) btnUnlink.style.display = 'inline-block';
    pill.style.display = 'inline-flex';
  } else {
    pill.classList.add('is-unsaved');
    if (icon) icon.textContent = '✨';
    text.innerHTML = `<span>New / Unsaved</span>`;
    if (btnUnlink) btnUnlink.style.display = 'none';
    pill.style.display = 'inline-flex';
  }

  updateStaticProfileStrip();
}

/**
 * Toggle the Birth Details / Paste editor panel open and closed
 */
function toggleEditPanel() {
  appState.isEditorOpen = !appState.isEditorOpen;
  if (sectionInputPanel) {
    sectionInputPanel.style.display = appState.isEditorOpen ? 'block' : 'none';
    if (appState.isEditorOpen) {
      sectionInputPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  if (btnToggleEditText) {
    btnToggleEditText.textContent = appState.isEditorOpen ? '✕ Close Editor' : 'Edit Birth Details';
  }
}

/**
 * Start a new fresh unlinked chart session
 */
function handleStripNewChart() {
  appState.currentProfileId = null;
  appState.currentProfileName = '';
  appState.currentProfileNotes = '';
  appState.isEditorOpen = true;
  if (birthNameEl) birthNameEl.value = '';
  const url = new URL(window.location.href);
  url.searchParams.delete('profileId');
  window.history.replaceState({}, '', url.pathname);
  updateNativeNameDisplays();
  updateActiveProfileIndicator();
  updateStaticProfileStrip();
  showToast('Switched to fresh unsaved draft chart.');
}

/**
 * Update the sleek static profile information strip
 */
function updateStaticProfileStrip() {
  if (!profileStaticStrip) return;

  if (appState.currentProfileId) {
    profileStaticStrip.style.display = 'flex';

    if (sectionInputPanel) {
      sectionInputPanel.style.display = appState.isEditorOpen ? 'block' : 'none';
    }
    if (btnToggleEditText) {
      btnToggleEditText.textContent = appState.isEditorOpen ? '✕ Close Editor' : 'Edit Birth Details';
    }

    const name = appState.currentProfileName || (birthNameEl ? birthNameEl.value.trim() : '') || 'Client Profile';
    if (staticName) staticName.textContent = name;

    if (staticAvatar) {
      const parts = name.split(/\s+/).filter(Boolean);
      const initials = parts.slice(0, 2).map(p => p[0].toUpperCase()).join('');
      staticAvatar.textContent = initials || '✨';
    }

    const gender = (birthGenderEl ? birthGenderEl.value : 'male');
    if (staticGenderBadge) {
      if (gender === 'female') {
        staticGenderBadge.textContent = 'Female ♀';
        staticGenderBadge.style.background = 'rgba(236, 72, 153, 0.15)';
        staticGenderBadge.style.borderColor = 'rgba(236, 72, 153, 0.35)';
        staticGenderBadge.style.color = '#F472B6';
      } else {
        staticGenderBadge.textContent = 'Male ♂';
        staticGenderBadge.style.background = 'rgba(99, 102, 241, 0.15)';
        staticGenderBadge.style.borderColor = 'rgba(99, 102, 241, 0.35)';
        staticGenderBadge.style.color = '#A5B4FC';
      }
    }

    if (staticTypeBadge) {
      staticTypeBadge.textContent = `Saved Profile • ${appState.currentProfileId}`;
    }

    const dateVal = birthDateEl ? birthDateEl.value : '';
    const timeVal = birthTimeEl ? birthTimeEl.value : '';
    if (staticDatetime) {
      if (dateVal) {
        const dObj = new Date(dateVal + 'T' + (timeVal || '12:00'));
        const formattedDate = !isNaN(dObj.getTime())
          ? dObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : dateVal;
        staticDatetime.textContent = `🗓️ ${formattedDate}, ${timeVal || '12:00'}`;
      } else {
        staticDatetime.textContent = '🗓️ Custom Ephemeris';
      }
    }

    const cityVal = citySearchInput ? citySearchInput.value.trim() : '';
    const latVal = birthLatEl ? parseFloat(birthLatEl.value) : 28.6139;
    const lonVal = birthLonEl ? parseFloat(birthLonEl.value) : 77.2090;
    const tzVal = birthTzEl ? parseFloat(birthTzEl.value) : 5.5;

    if (staticLocation) {
      staticLocation.textContent = cityVal ? `📍 ${cityVal}` : '📍 Custom Location';
    }

    if (staticCoords) {
      const latDir = latVal >= 0 ? 'N' : 'S';
      const lonDir = lonVal >= 0 ? 'E' : 'W';
      const tzSign = tzVal >= 0 ? '+' : '-';
      const tzHrs = Math.floor(Math.abs(tzVal));
      const tzMins = Math.round((Math.abs(tzVal) - tzHrs) * 60);
      const tzStr = `UTC${tzSign}${String(tzHrs).padStart(2, '0')}:${String(tzMins).padStart(2, '0')}`;
      staticCoords.textContent = `${Math.abs(latVal).toFixed(4)}° ${latDir}, ${Math.abs(lonVal).toFixed(4)}° ${lonDir} • ${tzStr}`;
    }

    if (staticNotes) {
      if (appState.currentProfileNotes && appState.currentProfileNotes.trim()) {
        staticNotes.style.display = 'inline-block';
        staticNotes.textContent = `📝 ${appState.currentProfileNotes.trim()}`;
      } else {
        staticNotes.style.display = 'none';
      }
    }
  } else {
    // No profile active: hide static strip, ensure editor is open
    profileStaticStrip.style.display = 'none';
    if (sectionInputPanel) {
      sectionInputPanel.style.display = 'block';
    }
  }
}

function captureCurrentFormSnapshot() {
  return JSON.stringify({
    mode: appState.inputMode,
    name: birthNameEl ? birthNameEl.value.trim() : '',
    gender: birthGenderEl ? birthGenderEl.value : 'male',
    birthDate: birthDateEl ? birthDateEl.value : '',
    birthTime: birthTimeEl ? birthTimeEl.value : '',
    city: citySearchInput ? citySearchInput.value.trim() : '',
    lat: birthLatEl ? birthLatEl.value : '',
    lon: birthLonEl ? birthLonEl.value : '',
    tz: birthTzEl ? birthTzEl.value : '',
    rawInput: rawInputEl ? rawInputEl.value.trim() : ''
  });
}

function checkDirtyState() {
  if (!appState.lastSavedSnapshot) {
    appState.lastSavedSnapshot = captureCurrentFormSnapshot();
    appState.isDirty = false;
  } else {
    const current = captureCurrentFormSnapshot();
    appState.isDirty = current !== appState.lastSavedSnapshot;
  }
  updateSaveButtonState();
}

function updateSaveButtonState() {
  if (!btnSaveCurrentProfile) return;
  const btnUpdate = document.getElementById('btn-update-profile');

  if (appState.currentProfileId) {
    if (!appState.isDirty) {
      btnSaveCurrentProfile.disabled = true;
      btnSaveCurrentProfile.innerHTML = '✓ Saved';
      btnSaveCurrentProfile.className = 'btn btn-secondary btn-sm';
      btnSaveCurrentProfile.style.opacity = '0.6';
      btnSaveCurrentProfile.style.cursor = 'default';
      btnSaveCurrentProfile.title = 'No changes made to this profile';
      if (btnUpdate) {
        btnUpdate.disabled = true;
        btnUpdate.style.opacity = '0.6';
        btnUpdate.title = 'No changes detected to update';
      }
    } else {
      btnSaveCurrentProfile.disabled = false;
      btnSaveCurrentProfile.innerHTML = '💾 Save Changes';
      btnSaveCurrentProfile.className = 'btn btn-primary btn-sm';
      btnSaveCurrentProfile.style.opacity = '1';
      btnSaveCurrentProfile.style.cursor = 'pointer';
      btnSaveCurrentProfile.title = 'Save modifications to Databank';
      if (btnUpdate) {
        btnUpdate.disabled = false;
        btnUpdate.style.opacity = '1';
        btnUpdate.title = 'Update active profile in Databank';
      }
    }
  } else {
    // New unsaved chart
    btnSaveCurrentProfile.disabled = false;
    btnSaveCurrentProfile.innerHTML = '💾 Save Profile';
    btnSaveCurrentProfile.className = 'btn btn-primary btn-sm';
    btnSaveCurrentProfile.style.opacity = '1';
    btnSaveCurrentProfile.style.cursor = 'pointer';
    btnSaveCurrentProfile.title = 'Save this chart into Databank';
    if (btnUpdate) {
      btnUpdate.disabled = false;
      btnUpdate.style.opacity = '1';
    }
  }
}

function updateSaveModalControls() {
  const statusEl = document.getElementById('save-modal-profile-status');
  const btnUpdate = document.getElementById('btn-update-profile');
  const btnSaveNew = document.getElementById('btn-save-as-new');
  const nameInput = document.getElementById('save-profile-name');
  const notesInput = document.getElementById('save-profile-notes');

  if (nameInput) {
    nameInput.value = appState.currentProfileName || (birthNameEl ? birthNameEl.value.trim() : '');
  }
  if (notesInput) {
    notesInput.value = appState.currentProfileNotes || '';
  }

  if (appState.currentProfileId) {
    if (statusEl) {
      statusEl.style.background = 'rgba(99, 102, 241, 0.15)';
      statusEl.style.borderColor = 'rgba(99, 102, 241, 0.3)';
      statusEl.style.color = '#C7D2FE';
      statusEl.innerHTML = `📂 Editing Profile: <strong style="color: #FFF;">${escapeHtml(appState.currentProfileName)}</strong>`;
    }
    if (btnUpdate) {
      btnUpdate.style.display = 'inline-flex';
      btnUpdate.textContent = `🔄 Update "${appState.currentProfileName}"`;
      btnUpdate.disabled = !appState.isDirty;
      btnUpdate.style.opacity = appState.isDirty ? '1' : '0.6';
    }
    if (btnSaveNew) {
      btnSaveNew.className = 'btn btn-secondary btn-sm';
      btnSaveNew.textContent = '➕ Save as New Copy';
    }
  } else {
    if (statusEl) {
      statusEl.style.background = 'rgba(245, 158, 11, 0.12)';
      statusEl.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      statusEl.style.color = 'var(--gold-light)';
      statusEl.innerHTML = '✨ New Unsaved Chart';
    }
    if (btnUpdate) {
      btnUpdate.style.display = 'none';
    }
    if (btnSaveNew) {
      btnSaveNew.className = 'btn btn-primary btn-sm';
      btnSaveNew.textContent = '💾 Save New Profile';
    }
  }
}

function unlinkCurrentProfile() {
  appState.currentProfileId = null;
  appState.currentProfileNotes = '';
  appState.isEditorOpen = true;
  appState.isDirty = true;
  updateActiveProfileIndicator();
  updateStaticProfileStrip();
  updateSaveModalControls();
  updateSaveButtonState();
  showToast('Unlinked from active profile. Next save will create a new profile.');
}

function openDatabankModal() {
  if (!databankModal) return;
  databankModal.style.display = 'flex';
  renderProfilesList();
  updateProfileCountBadge();
  updateSaveModalControls();
}

function closeDatabankModal() {
  if (!databankModal) return;
  databankModal.style.display = 'none';
}

function updateProfileCountBadge() {
  const profiles = getProfiles();
  if (profileCountBadge) profileCountBadge.textContent = profiles.length;
  if (databankTotalCount) databankTotalCount.textContent = profiles.length;
  document.querySelectorAll('.footer-databank-count').forEach(el => {
    el.textContent = profiles.length;
  });
}

function renderProfilesList(filterText = '') {
  if (!profilesListContainer) return;
  const profiles = getProfiles();
  const query = filterText.toLowerCase().trim();

  const filtered = query
    ? profiles.filter(p => (p.name && p.name.toLowerCase().includes(query)) || (p.notes && p.notes.toLowerCase().includes(query)) || (p.city && p.city.toLowerCase().includes(query)))
    : profiles;

  if (filtered.length === 0) {
    profilesListContainer.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-dim); font-size: 0.85rem;">
        ${profiles.length === 0 ? 'No client profiles saved yet. Save the current chart above to get started!' : 'No matching profiles found.'}
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(p => {
    const dateFormatted = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Saved';
    const subDesc = p.mode === 'birth'
      ? `🗓️ ${p.birthDate || ''} ${p.birthTime || ''} • 📍 ${p.city || 'Custom Coords'}`
      : `📜 Raw Planetary Coordinates Entry`;

    html += `
      <div class="profile-card">
        <div class="profile-info">
          <h5>${p.name || 'Unnamed Chart'} <span style="font-size: 0.72rem; opacity: 0.85; color: ${p.gender === 'female' ? '#F472B6' : '#60A5FA'};">(${p.gender === 'female' ? '♀ Female' : '♂ Male'})</span></h5>
          <p>${subDesc}</p>
          ${p.notes ? `<div style="font-size: 0.74rem; color: var(--gold-light); margin-top: 3px;">📝 ${p.notes}</div>` : ''}
          <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 3px;">Updated: ${dateFormatted}</div>
        </div>
        <div class="profile-actions">
          <button class="btn btn-primary btn-sm btn-load-profile" data-id="${p.id}">Load Chart</button>
          <button class="btn btn-secondary btn-sm btn-delete-profile" data-id="${p.id}" style="color: #EF4444;">Delete</button>
        </div>
      </div>
    `;
  });

  profilesListContainer.innerHTML = html;

  // Attach buttons
  profilesListContainer.querySelectorAll('.btn-load-profile').forEach(b => {
    b.addEventListener('click', () => loadProfileItem(b.getAttribute('data-id')));
  });
  profilesListContainer.querySelectorAll('.btn-delete-profile').forEach(b => {
    b.addEventListener('click', () => deleteProfileItem(b.getAttribute('data-id')));
  });
}

function handleSaveProfile(isNewCopy = false) {
  const name = (saveProfileName ? saveProfileName.value.trim() : '') ||
    appState.currentProfileName ||
    (birthNameEl ? birthNameEl.value.trim() : '') ||
    `Chart ${new Date().toLocaleDateString()}`;
  const notes = saveProfileNotes ? saveProfileNotes.value.trim() : '';

  const isUpdatingExisting = !isNewCopy && !!appState.currentProfileId;

  const profileData = {
    id: isUpdatingExisting ? appState.currentProfileId : undefined,
    name,
    notes,
    mode: appState.inputMode,
    lifeEvents: appState.lifeEvents || []
  };

  if (appState.inputMode === 'birth') {
    profileData.birthDate = birthDateEl.value;
    profileData.birthTime = birthTimeEl.value;
    profileData.city = citySearchInput.value;
    profileData.lat = parseFloat(birthLatEl.value) || 28.6139;
    profileData.lon = parseFloat(birthLonEl.value) || 77.2090;
    profileData.tz = parseFloat(birthTzEl.value) || 5.5;
    if (birthGenderEl) profileData.gender = birthGenderEl.value;
  } else {
    profileData.rawInput = rawInputEl.value;
    if (birthGenderEl) profileData.gender = birthGenderEl.value;
  }

  const saved = saveProfile(profileData);
  if (!saved) {
    showToast('Failed to save profile.');
    return;
  }

  appState.currentProfileId = saved.id;
  appState.currentProfileName = saved.name;
  appState.currentProfileNotes = saved.notes || '';
  if (birthNameEl) birthNameEl.value = saved.name;

  updateNativeNameDisplays();
  updateActiveProfileIndicator();
  updateStaticProfileStrip();
  updateSaveModalControls();

  renderProfilesList();
  updateProfileCountBadge();

  appState.lastSavedSnapshot = captureCurrentFormSnapshot();
  appState.isDirty = false;
  updateSaveButtonState();

  if (isUpdatingExisting) {
    showToast(`Updated existing profile "${saved.name}" in Databank!`);
  } else {
    showToast(`Saved as new profile "${saved.name}" in Databank!`);
  }
}

function loadProfileItem(id) {
  const profiles = getProfiles();
  const prof = profiles.find(p => p.id === id);
  if (!prof) return;

  appState.currentProfileId = prof.id;
  appState.currentProfileName = prof.name || 'Unnamed Client';
  appState.currentProfileNotes = prof.notes || '';
  appState.lifeEvents = Array.isArray(prof.lifeEvents) ? [...prof.lifeEvents] : [];
  appState.isEditorOpen = false; // Collapse editor by default for sleek static profile display!
  if (prof.gender && birthGenderEl) {
    birthGenderEl.value = prof.gender;
  }
  if (birthNameEl) birthNameEl.value = appState.currentProfileName;
  updateNativeNameDisplays();
  updateActiveProfileIndicator();
  updateStaticProfileStrip();

  if (prof.mode === 'birth' && prof.birthDate) {
    setMode('birth');
    birthDateEl.value = prof.birthDate;
    birthTimeEl.value = prof.birthTime || '12:00';
    if (prof.city) citySearchInput.value = prof.city;
    if (prof.lat) birthLatEl.value = prof.lat;
    if (prof.lon) birthLonEl.value = prof.lon;
    if (prof.tz !== undefined) birthTzEl.value = prof.tz;
    calculateFromBirthForm();
  } else if (prof.rawInput) {
    setMode('paste');
    rawInputEl.value = prof.rawInput;
    calculateFromPaste();
  }

  appState.lastSavedSnapshot = captureCurrentFormSnapshot();
  appState.isDirty = false;
  updateSaveButtonState();

  closeDatabankModal();
  showToast(`Loaded profile "${prof.name}"!`);
}

function deleteProfileItem(id) {
  if (appState.currentProfileId === id) {
    appState.currentProfileId = null;
    appState.currentProfileNotes = '';
    updateActiveProfileIndicator();
    updateSaveModalControls();
  }
  deleteProfile(id);
  renderProfilesList(filterProfilesInput ? filterProfilesInput.value : '');
  updateProfileCountBadge();
  showToast('Profile deleted from Databank.');
}

function handleExportProfiles() {
  const jsonStr = exportProfilesJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jyotish_profiles_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded client databank JSON backup!');
}

function handleImportProfiles(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      importProfilesJSON(event.target.result);
      renderProfilesList();
      updateProfileCountBadge();
      showToast('Profiles imported successfully into Databank!');
    } catch (err) {
      console.error(err);
      showToast('Invalid JSON file format.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/**
 * Cross-environment robust clipboard copy with fallback
 */
async function copyTextToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard failed, attempting fallback:', err);
  }

  // Fallback using textarea execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (fallbackErr) {
    console.error('Copy fallback failed:', fallbackErr);
    return false;
  }
}

/**
 * Handle copy prompt action with button visual feedback and toast
 */
async function copyPromptWithFeedback(btn = null, customToast = 'Prompt copied! Paste it directly into Gemini.') {
  if (!appState.generatedPrompt) {
    showToast('No prompt generated yet.');
    return;
  }

  const success = await copyTextToClipboard(appState.generatedPrompt);
  if (success) {
    showToast(customToast);
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.classList.add('btn-copied-success', 'copied');
      btn.innerHTML = '✓ Copied!';
      setTimeout(() => {
        btn.classList.remove('btn-copied-success', 'copied');
        btn.innerHTML = originalHTML;
      }, 2000);
    }
  } else {
    showToast('Failed to copy. Please manually select and copy text.');
  }
}

/**
 * Generate & Update Live Gemini AI Prompt
 */
function updateGeminiPrompt() {
  if (!appState.planets || appState.planets.length === 0) return;

  const promptText = generateGeminiPrompt({
    clientName: appState.currentProfileName || (birthNameEl ? birthNameEl.value.trim() : ''),
    birthDate: birthDateEl ? birthDateEl.value : null,
    lifeEvents: appState.lifeEvents,
    gender: birthGenderEl ? birthGenderEl.value : (appState.currentProfileGender || 'male'),
    planets: appState.planets,
    shodashvarga: appState.shodashvarga,
    ashtakavarga: appState.ashtakavarga,
    dasha: appState.dasha,
    yoginiDasha: appState.yoginiDasha,
    yogas: appState.yogas,
    transits: appState.transitAnalysis,
    panchanga: appState.panchanga,
    drishti: appState.drishti,
    shadbala: appState.shadbala,
    selectedPresetId: appState.selectedPresetId,
    customQuestion: appState.customQuestion
  });

  appState.generatedPrompt = promptText;
  if (promptPreviewBox) promptPreviewBox.textContent = promptText;
  if (promptCharCount) {
    const charCount = promptText.length;
    const wordCount = promptText.trim().split(/\s+/).filter(Boolean).length;
    promptCharCount.textContent = `${charCount.toLocaleString()} chars • ~${wordCount.toLocaleString()} words`;
  }
}

/**
 * Toast Notification Helper
 */
function showToast(msg) {
  if (!toastEl) return;
  toastMessageEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2600);
}

/**
 * ============================================================================
 * Life Events Timeline & Planetary Correlator Controller
 * ============================================================================
 */
function initLifeEventsUI() {
  if (eventCategorySelect) {
    let opts = '';
    for (let c of LIFE_EVENT_CATEGORIES) {
      opts += `<option value="${c.id}">${c.icon} ${c.label}</option>`;
    }
    eventCategorySelect.innerHTML = opts;

    eventCategorySelect.addEventListener('change', () => {
      const meta = getCategoryMeta(eventCategorySelect.value);
      if (modalEventIcon) modalEventIcon.textContent = meta.icon;
      if (eventCategoryHint) {
        eventCategoryHint.innerHTML = `<strong>⚡ Astrological Focus:</strong> ${meta.targetHouses} • <strong>Karakas:</strong> ${meta.karakas} • <strong>Varga:</strong> ${meta.divisional}`;
      }
    });
  }

  // Quick suggestion chips strip
  if (quickCategoryChips) {
    const popularKeys = ['marriage', 'job_change', 'promotion', 'house_shift', 'property', 'vehicle', 'foreign_travel', 'child_birth', 'graduation', 'illness_injury', 'bereavement'];
    let chipsHtml = '';
    for (let k of popularKeys) {
      const cat = getCategoryMeta(k);
      chipsHtml += `<button type="button" class="quick-chip-btn" data-cat="${cat.id}">${cat.icon} ${cat.label.split(' / ')[0]}</button>`;
    }
    quickCategoryChips.innerHTML = chipsHtml;
    quickCategoryChips.querySelectorAll('.quick-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-cat');
        openLifeEventModal(null, catId);
      });
    });
  }

  if (btnAddLifeEvent) {
    btnAddLifeEvent.addEventListener('click', () => openLifeEventModal());
  }

  if (btnExportTimeline) {
    btnExportTimeline.addEventListener('click', exportLifeEventsJSON);
  }

  if (btnCloseEventModal) {
    btnCloseEventModal.addEventListener('click', closeLifeEventModal);
  }
  if (btnCancelEventModal) {
    btnCancelEventModal.addEventListener('click', closeLifeEventModal);
  }
  if (btnSaveLifeEvent) {
    btnSaveLifeEvent.addEventListener('click', handleSaveLifeEvent);
  }

  if (lifeEventModal) {
    lifeEventModal.addEventListener('click', (e) => {
      if (e.target === lifeEventModal) closeLifeEventModal();
    });
  }

  if (eventDateInput) {
    eventDateInput.addEventListener('input', updateModalLivePreview);
  }
}

function openLifeEventModal(eventId = null, presetType = null) {
  if (!lifeEventModal) return;
  eventEditId.value = eventId || '';

  if (eventId) {
    const ev = appState.lifeEvents.find(e => e.id === eventId);
    if (!ev) return;
    const meta = getCategoryMeta(ev.type);
    modalEventHeading.textContent = `Edit Life Event: ${ev.title || meta.label}`;
    modalEventIcon.textContent = meta.icon;
    eventCategorySelect.value = ev.type || 'marriage';
    eventDateInput.value = ev.date || '';
    eventNatureSelect.value = ev.nature || '';
    eventTitleInput.value = ev.title || '';
    eventNotesInput.value = ev.notes || '';
    if (eventCategoryHint) {
      eventCategoryHint.innerHTML = `<strong>⚡ Astrological Focus:</strong> ${meta.targetHouses} • <strong>Karakas:</strong> ${meta.karakas} • <strong>Varga:</strong> ${meta.divisional}`;
    }
  } else {
    const catId = presetType || 'marriage';
    const meta = getCategoryMeta(catId);
    modalEventHeading.textContent = 'Log Major Life Event';
    modalEventIcon.textContent = meta.icon;
    eventCategorySelect.value = catId;
    eventNatureSelect.value = '';
    eventTitleInput.value = '';
    eventNotesInput.value = '';
    const defaultDate = (refDateEl && refDateEl.value) ? refDateEl.value : new Date().toISOString().split('T')[0];
    eventDateInput.value = defaultDate;
    if (eventCategoryHint) {
      eventCategoryHint.innerHTML = `<strong>⚡ Astrological Focus:</strong> ${meta.targetHouses} • <strong>Karakas:</strong> ${meta.karakas} • <strong>Varga:</strong> ${meta.divisional}`;
    }
  }

  updateModalLivePreview();
  lifeEventModal.style.display = 'flex';
  setTimeout(() => eventTitleInput.focus(), 100);
}

function closeLifeEventModal() {
  if (lifeEventModal) lifeEventModal.style.display = 'none';
}

function updateModalLivePreview() {
  if (!modalPreviewDasha || !modalPreviewTransits) return;
  const dStr = eventDateInput ? eventDateInput.value : '';
  if (!dStr || isNaN(new Date(dStr).getTime())) {
    modalPreviewDasha.textContent = 'Select a date above to inspect real-time cosmic clockwork.';
    modalPreviewTransits.textContent = '';
    return;
  }

  const dashaRes = getDashaAtDate(appState.dasha, dStr);
  const transitRes = getTransitsAtDate(appState.planets, dStr, appState.ashtakavarga);

  modalPreviewDasha.innerHTML = dashaRes && dashaRes.dashaStr
    ? `👑 <strong>Running Dasha:</strong> <span style="color: #A78BFA;">${dashaRes.dashaStr}</span>`
    : `👑 <strong>Running Dasha:</strong> Before/After 120-Year Dasha Range`;

  if (transitRes) {
    let tHtml = [];
    if (transitRes.saturn) {
      tHtml.push(`🪐 <strong>Saturn:</strong> in ${transitRes.saturn.signName} (H${transitRes.saturn.houseFromLagna} Lagna, H${transitRes.saturn.houseFromMoon} Moon) <span style="color: var(--accent-gold);">${transitRes.saturnCondition !== 'Regular Transit' ? `[${transitRes.saturnCondition}]` : ''}</span>`);
    }
    if (transitRes.jupiter) {
      tHtml.push(`🌟 <strong>Jupiter:</strong> in ${transitRes.jupiter.signName} (H${transitRes.jupiter.houseFromLagna} Lagna, H${transitRes.jupiter.houseFromMoon} Moon) <span style="color: #34D399;">${transitRes.jupiterCondition.includes('Active Guru Bala') ? `[${transitRes.jupiterCondition}]` : ''}</span>`);
    }
    if (transitRes.rahu) {
      tHtml.push(`🐉 <strong>Rahu:</strong> in ${transitRes.rahu.signName} (H${transitRes.rahu.houseFromLagna})`);
    }
    modalPreviewTransits.innerHTML = tHtml.join(' • ');
  } else {
    modalPreviewTransits.textContent = 'Calculate chart first to view historical planetary transits.';
  }
}

function handleSaveLifeEvent() {
  const dStr = eventDateInput ? eventDateInput.value.trim() : '';
  if (!dStr) {
    showToast('Please select a valid date for this event.');
    eventDateInput.focus();
    return;
  }

  const type = eventCategorySelect ? eventCategorySelect.value : 'custom';
  const meta = getCategoryMeta(type);
  const nature = eventNatureSelect ? eventNatureSelect.value : '';
  const title = (eventTitleInput ? eventTitleInput.value.trim() : '') || meta.label;
  const notes = eventNotesInput ? eventNotesInput.value.trim() : '';
  const editId = eventEditId ? eventEditId.value : '';

  if (editId) {
    const idx = appState.lifeEvents.findIndex(e => e.id === editId);
    if (idx >= 0) {
      appState.lifeEvents[idx] = {
        ...appState.lifeEvents[idx],
        type,
        date: dStr,
        nature,
        title,
        notes,
        updatedAt: new Date().toISOString()
      };
      showToast(`Updated event "${title}"`);
    }
  } else {
    const newEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      date: dStr,
      nature,
      title,
      notes,
      createdAt: new Date().toISOString()
    };
    appState.lifeEvents.push(newEvent);
    showToast(`Logged life event "${title}"!`);
  }

  closeLifeEventModal();
  renderLifeEventsTimeline();
  updateGeminiPrompt();

  // If a profile is loaded, auto-persist to localStorage
  if (appState.currentProfileId) {
    const activeProf = getProfileById(appState.currentProfileId);
    if (activeProf) {
      activeProf.lifeEvents = appState.lifeEvents;
      saveProfile(activeProf);
    }
  }
}

function deleteLifeEvent(eventId) {
  appState.lifeEvents = appState.lifeEvents.filter(e => e.id !== eventId);
  renderLifeEventsTimeline();
  updateGeminiPrompt();

  if (appState.currentProfileId) {
    const activeProf = getProfileById(appState.currentProfileId);
    if (activeProf) {
      activeProf.lifeEvents = appState.lifeEvents;
      saveProfile(activeProf);
    }
  }
  showToast('Life event removed.');
}

function jumpToTimeMachine(dateStr, eventMeta = null) {
  if (!dateStr) return;
  if (refDateEl) refDateEl.value = dateStr;
  if (timeMachineDate) timeMachineDate.value = dateStr;

  appState.tmFocusedEvent = eventMeta;
  updateTmEventBanner();

  recalcDashaAndTransits();
  renderTransitsView();
  if (appState.overlayTransits) renderCurrentChart();
  updateGeminiPrompt();
  switchTab('tab-transits');

  const titleText = eventMeta ? `event "${eventMeta.title || 'Milestone'}" (${dateStr})` : dateStr;
  showToast(`Time-Machine & Gochar Kundali calibrated to ${titleText}!`);
}

function exportLifeEventsJSON() {
  if (!appState.lifeEvents || appState.lifeEvents.length === 0) {
    showToast('No life events logged to export.');
    return;
  }
  const nameSlug = (appState.currentProfileName || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const filename = `${nameSlug}_life_events.json`;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState.lifeEvents, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', filename);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
  showToast(`Exported ${appState.lifeEvents.length} life events as ${filename}!`);
}

/**
 * Render Life Events Timeline Cards & Summary Statistics
 */
function renderLifeEventsTimeline() {
  if (!timelineEventsContainer) return;

  const events = [...(appState.lifeEvents || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const birthDateStr = birthDateEl ? birthDateEl.value : null;

  // Update Stats Bar
  if (statTotalEvents) statTotalEvents.textContent = events.length;
  if (statEarliestEvent) {
    statEarliestEvent.textContent = events.length > 0 ? events[0].date : '—';
  }
  if (statLatestEvent) {
    statLatestEvent.textContent = events.length > 0 ? events[events.length - 1].date : '—';
  }

  // Empty State
  if (events.length === 0) {
    if (statEventsDashas) statEventsDashas.textContent = '—';
    timelineEventsContainer.innerHTML = `
      <div class="timeline-empty-box">
        <span style="font-size: 2.2rem;">🌌</span>
        <h3 style="color: #FFF; font-size: 1.15rem; margin: 0;">No Major Life Events Logged Yet</h3>
        <p style="color: var(--text-muted); font-size: 0.82rem; max-width: 580px; margin: 0; line-height: 1.5;">
          Vedic astrologers utilize verified past milestones to perform <strong>Birth Time Rectification (BTR)</strong>, calibrating whether your birth hour matches your actual Lagna and divisional placements. Log your marriage, career shifts, relocations, or purchases to correlate with your cosmic clockwork.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 8px;">
          <button type="button" class="btn btn-secondary btn-sm btn-starter-event" data-cat="marriage">💍 + Add Marriage</button>
          <button type="button" class="btn btn-secondary btn-sm btn-starter-event" data-cat="job_change">💼 + Add Job Change</button>
          <button type="button" class="btn btn-secondary btn-sm btn-starter-event" data-cat="house_shift">🏠 + Add Relocation</button>
          <button type="button" class="btn btn-secondary btn-sm btn-starter-event" data-cat="property">🏡 + Add Property Purchase</button>
          <button type="button" class="btn btn-secondary btn-sm btn-starter-event" data-cat="child_birth">👶 + Add Child Birth</button>
        </div>
      </div>
    `;

    timelineEventsContainer.querySelectorAll('.btn-starter-event').forEach(b => {
      b.addEventListener('click', () => {
        openLifeEventModal(null, b.getAttribute('data-cat'));
      });
    });
    return;
  }

  // Count distinct Dasha lords
  const mdLords = new Set();
  let cardsHtml = '';

  for (let ev of events) {
    const c = correlateLifeEvent(ev, appState.planets, appState.dasha, appState.ashtakavarga, birthDateStr);
    if (c.dasha && c.dasha.md) mdLords.add(c.dasha.md.lord);

    const natureClass = c.nature ? `nature-${c.nature}` : '';
    const naturePillClass = c.nature ? `timeline-pill-nature-${c.nature}` : '';
    const natureLabel = c.nature === 'challenging' ? '⚡ Challenging' : (c.nature === 'neutral' ? '⚖️ Neutral' : (c.nature === 'positive' ? '🌟 Auspicious' : ''));
    const formattedDate = new Date(c.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

    let dashaContent = 'N/A';
    if (c.dasha && c.dasha.md) {
      dashaContent = `
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-weight: 700; color: #FFF; display: inline-flex; align-items: center; gap: 4px;">
            <span>👑</span> ${c.dasha.dashaStr}
          </span>
          ${c.dasha.ad && c.dasha.ad.chidra ? `
            <span class="badge" style="background: rgba(244, 63, 94, 0.2); color: #FDA4AF; border: 1px solid rgba(244, 63, 94, 0.4); font-size: 0.7rem; padding: 2px 7px; border-radius: 4px;" title="${c.dasha.ad.chidra.description}">
              ⚠️ ${c.dasha.ad.chidra.phase}
            </span>
          ` : ''}
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">
          MD Range: ${c.dasha.md.startStr} → ${c.dasha.md.endStr}
        </div>
      `;
    }

    let transitsGridHtml = '';
    if (c.transits) {
      const t = c.transits;
      transitsGridHtml = `
        <div class="timeline-transits-grid">
          ${t.saturn ? `
            <div class="transit-item-chip">
              <span>🪐 <strong>Saturn:</strong> ${t.saturn.signName} (H${t.saturn.houseFromLagna} Lagna, H${t.saturn.houseFromMoon} Moon)</span>
              ${t.saturnCondition !== 'Regular Transit' ? `<span style="color: var(--gold-light); font-weight: 700; font-size: 0.7rem;">${t.saturnCondition}</span>` : ''}
            </div>
          ` : ''}
          ${t.jupiter ? `
            <div class="transit-item-chip">
              <span>🌟 <strong>Jupiter:</strong> ${t.jupiter.signName} (H${t.jupiter.houseFromLagna} Lagna, H${t.jupiter.houseFromMoon} Moon)</span>
              ${t.jupiterCondition.includes('Active Guru Bala') ? `<span style="color: #34D399; font-weight: 700; font-size: 0.7rem;">Guru Bala ✨</span>` : ''}
            </div>
          ` : ''}
          ${t.rahu ? `
            <div class="transit-item-chip">
              <span>🐉 <strong>Rahu:</strong> ${t.rahu.signName} (H${t.rahu.houseFromLagna})</span>
              <span>Ketu in H${t.ketu ? t.ketu.houseFromLagna : '—'}</span>
            </div>
          ` : ''}
          ${t.mars ? `
            <div class="transit-item-chip">
              <span>⚔️ <strong>Mars:</strong> ${t.mars.signName} (H${t.mars.houseFromLagna})</span>
              <span>Sun in H${t.sun ? t.sun.houseFromLagna : '—'}</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    cardsHtml += `
      <div class="timeline-card ${natureClass}" data-id="${c.id}">
        <div class="timeline-card-header">
          <div>
            <div class="timeline-card-title">
              <span>${c.categoryMeta.icon}</span>
              <span>${c.title || c.categoryMeta.label}</span>
            </div>
            <div class="timeline-card-meta">
              <span class="timeline-pill-date">🗓️ ${formattedDate}</span>
              <span class="timeline-pill-age">⏳ ${c.ageText}</span>
              ${c.nature ? `<span class="${naturePillClass}">${natureLabel}</span>` : ''}
              <span style="color: var(--text-muted); font-size: 0.74rem;">Category: ${c.categoryMeta.label}</span>
            </div>
          </div>
          <div style="font-size: 0.74rem; color: var(--accent-cyan); background: rgba(56, 189, 248, 0.08); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.2);">
            Houses: <strong>${c.categoryMeta.targetHouses}</strong> • Karakas: <strong>${c.categoryMeta.karakas}</strong>
          </div>
        </div>

        ${c.notes ? `
          <div style="font-size: 0.82rem; color: var(--text-main); line-height: 1.5; margin-bottom: 10px; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: var(--radius-sm);">
            📝 ${c.notes}
          </div>
        ` : ''}

        <!-- Dasha Ribbon -->
        <div class="timeline-dasha-ribbon">
          ${dashaContent}
        </div>

        <!-- Gochar Transits Box -->
        <div class="timeline-transits-box">
          <div style="font-size: 0.74rem; font-weight: 700; color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.5px;">
            🌌 Planetary Sky (Gochar Transits) on ${formattedDate}:
          </div>
          ${transitsGridHtml}
        </div>

        <div class="timeline-card-actions">
          <button type="button" class="btn btn-secondary btn-sm btn-jump-tm" 
            data-date="${c.date}" 
            data-title="${c.title || c.categoryMeta.label}" 
            data-icon="${c.categoryMeta.icon}" 
            data-id="${c.id}" 
            style="display: inline-flex; align-items: center; gap: 5px;">
            🚀 View Sky in Time-Machine
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm btn-edit-event" data-id="${c.id}" title="Edit event">✏️ Edit</button>
            <button type="button" class="btn btn-secondary btn-sm btn-del-event" data-id="${c.id}" style="color: #EF4444;" title="Delete event">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  if (statEventsDashas) {
    statEventsDashas.textContent = Array.from(mdLords).join(', ') || '—';
  }

  timelineEventsContainer.innerHTML = cardsHtml;

  // Attach card action listeners
  timelineEventsContainer.querySelectorAll('.btn-jump-tm').forEach(b => {
    b.addEventListener('click', () => {
      const date = b.getAttribute('data-date');
      const title = b.getAttribute('data-title');
      const icon = b.getAttribute('data-icon');
      const id = b.getAttribute('data-id');
      jumpToTimeMachine(date, { id, title, icon, date });
    });
  });
  timelineEventsContainer.querySelectorAll('.btn-edit-event').forEach(b => {
    b.addEventListener('click', () => openLifeEventModal(b.getAttribute('data-id')));
  });
  timelineEventsContainer.querySelectorAll('.btn-del-event').forEach(b => {
    b.addEventListener('click', () => deleteLifeEvent(b.getAttribute('data-id')));
  });
}

/**
 * Render Shani Sade Sati Hero Card
 */
function renderSadeSatiHero() {
  if (!sadeSatiContainer) return;
  const ss = appState.sadeSati;
  if (!ss) {
    sadeSatiContainer.innerHTML = '';
    return;
  }

  const p1Active = ss.phaseNum === 1 ? 'active' : '';
  const p2Active = ss.phaseNum === 2 ? 'active' : '';
  const p3Active = ss.phaseNum === 3 ? 'active' : '';
  const badgeClass = ss.isSadeSati ? (ss.phaseNum === 2 ? 'verdict-bad' : 'verdict-good') : 'verdict-excellent';

  sadeSatiContainer.innerHTML = `
    <div class="sade-sati-hero">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
        <div>
          <span style="font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gold-light); font-weight: 700;">
            Shani Gochar & Sade Sati Analysis
          </span>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #FFF; margin-top: 4px;">
            ${ss.phaseName}
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            Natal Moon: <strong>${ss.moonSign}</strong> • Transit Saturn: <strong>${ss.saturnSign}</strong> (${ss.isRetrograde ? 'Retrograde ℞' : 'Direct'})
          </p>
        </div>
        <span class="verdict-badge ${badgeClass}">
          ${ss.severity}
        </span>
      </div>

      <div class="phase-indicator-bar">
        <div class="phase-step ${p1Active}">
          <strong>1. Rising Phase</strong><br>12th from Moon
        </div>
        <div class="phase-step ${p2Active}">
          <strong>2. Peak (Janma Shani)</strong><br>Conjunct Moon
        </div>
        <div class="phase-step ${p3Active}">
          <strong>3. Setting Phase</strong><br>2nd from Moon
        </div>
      </div>

      <p style="font-size: 0.82rem; color: #E2E8F0; line-height: 1.5; margin-bottom: 8px;">
        ${ss.description}
      </p>

      ${ss.dualGocharNote ? `<p style="font-size: 0.78rem; color: #94A3B8; margin-bottom: 6px;">🧭 ${ss.dualGocharNote}</p>` : ''}
      ${ss.elementalCommentary ? `<p style="font-size: 0.78rem; color: #CBD5E1; margin-bottom: 6px;">🔥 ${ss.elementalCommentary}</p>` : ''}
      ${ss.trikonaNote ? `
        <div style="background: rgba(245, 158, 11, 0.12); border-left: 3px solid #F59E0B; padding: 8px 12px; border-radius: 0 4px 4px 0; font-size: 0.78rem; color: #FDE68A; margin-bottom: 8px;">
          <strong style="color: #FBBF24;">🛡️ Classical Trikona Mitigation:</strong> ${ss.trikonaNote}
        </div>
      ` : ''}

      ${ss.bavStatus ? `<p style="font-size: 0.78rem; color: var(--gold-light); margin-bottom: 8px;">📊 ${ss.bavStatus}</p>` : ''}

      ${ss.recommendations ? `
        <div style="background: rgba(0,0,0,0.3); border-left: 3px solid var(--accent-cyan); padding: 8px 12px; border-radius: 0 4px 4px 0; font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">
          <strong style="color: var(--accent-cyan);">Remedies & Upayas:</strong> ${ss.recommendations}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render Jaimini Astrology View
 */
function renderJaiminiView() {
  if (!jaiminiPadasContainer || !tbodyJaiminiKarakas) return;
  const padas = appState.jaiminiPadas;
  const karakas = appState.charaKarakas;
  if (!padas || !karakas) return;

  // Render Padas with distinctive colors and icons
  let padaHtml = '';
  const padaConfig = {
    AL: { icon: '👑', className: 'jaimini-pada-card-al', badgeColor: '#F59E0B' },
    UL: { icon: '💍', className: 'jaimini-pada-card-ul', badgeColor: '#F472B6' },
    A7: { icon: '🤝', className: 'jaimini-pada-card-a7', badgeColor: '#C084FC' }
  };
  const padaKeys = ['AL', 'UL', 'A7'];
  for (let key of padaKeys) {
    const p = padas[key];
    const cfg = padaConfig[key] || { icon: '💎', className: '', badgeColor: 'var(--gold-light)' };
    padaHtml += `
      <div class="jaimini-pada-card ${cfg.className}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="jaimini-pada-badge">${cfg.icon} ${key}</span>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan);">${p.signName} (House ${p.houseNumber})</span>
        </div>
        <h4 style="font-size: 0.98rem; font-weight: 700; color: #FFF; margin-top: 4px;">${p.label}</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">${p.desc}</p>
      </div>
    `;
  }
  jaiminiPadasContainer.innerHTML = padaHtml;

  // Render 7 Chara Karakas
  let kHtml = '';
  for (let k of karakas) {
    const isAK = k.karakaKey === 'AK';
    const isDK = k.karakaKey === 'DK';
    const highlight = isAK ? 'color: var(--gold-light); font-weight: 800;' : (isDK ? 'color: #F472B6; font-weight: 800;' : 'font-weight: 700;');

    kHtml += `
      <tr>
        <td><span class="badge ${isAK ? 'badge-exalted' : (isDK ? 'badge-vargottama' : 'badge-neutral')}" style="font-weight: 800;">${k.karakaKey}</span></td>
        <td><strong style="${highlight}">${k.planet}</strong></td>
        <td><code>${k.degInSignFormatted}</code></td>
        <td>${k.signName}</td>
        <td><strong>${k.karakaTitle}</strong> (${k.karakaName})</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${k.karakaRole}</td>
      </tr>
    `;
  }
  tbodyJaiminiKarakas.innerHTML = kHtml;
}

/**
 * Render Classical Parashari Shadbala (Sixfold Planetary Strength)
 */
function renderShadbalaView() {
  if (!tbodyShadbala || !appState.shadbala) return;
  const sb = appState.shadbala;
  const planets = sb.planets || [];
  if (planets.length === 0) return;

  const topP = sb.summary?.topPlanet || sb.strongest || planets[0];
  const weakP = sb.summary?.weakPlanet || sb.weakest || planets[planets.length - 1];
  const strongCount = sb.summary?.strongCount !== undefined ? sb.summary.strongCount : (sb.strongCount !== undefined ? sb.strongCount : planets.filter(p => (p.ratioPercent || p.strengthRatio || 0) >= 100).length);
  const avgRatio = sb.summary?.averageRatio || sb.averageRatio || 100;

  const planetGlyphs = {
    Sun: '☉', Moon: '☽', Mars: '♂',
    Mercury: '☿', Merc: '☿',
    Jupiter: '♃', Jupt: '♃',
    Venus: '♀', Venu: '♀',
    Saturn: '♄', Satn: '♄'
  };

  // 1. KPI Cards
  if (shadbalaTopPlanet && topP) {
    const topRatio = topP.ratioPercent !== undefined ? topP.ratioPercent : topP.strengthRatio;
    shadbalaTopPlanet.textContent = `${topP.name} (${topRatio}%)`;
    if (shadbalaTopDesc) {
      shadbalaTopDesc.textContent = `Scoring ${Number(topP.totalRupas).toFixed(2)} Rupas vs ${Number(topP.requiredRupas).toFixed(1)} req. Primary astrological pillar of success.`;
    }
  }

  if (shadbalaWeakPlanet && weakP) {
    const weakRatio = weakP.ratioPercent !== undefined ? weakP.ratioPercent : weakP.strengthRatio;
    shadbalaWeakPlanet.textContent = `${weakP.name} (${weakRatio}%)`;
    if (shadbalaWeakDesc) {
      shadbalaWeakDesc.textContent = `Scoring ${Number(weakP.totalRupas).toFixed(2)} Rupas vs ${Number(weakP.requiredRupas).toFixed(1)} req (${weakP.verdict || 'Vulnerable'}). May benefit from remedies.`;
    }
  }

  if (shadbalaOverallPotency) {
    shadbalaOverallPotency.textContent = `${strongCount} / 7 Balavan`;
    if (shadbalaOverallDesc) {
      shadbalaOverallDesc.textContent = `${avgRatio}% average planetary strength ratio across the natal chart.`;
    }
  }

  // 2. Comparative Visual Progress Bars
  if (shadbalaBarsContainer) {
    let barHtml = '';
    // Scale: 160% of required is 100% of visual track width.
    // The 100% required threshold line is situated at (100 / 160) * 100% = 62.5%
    for (let p of planets) {
      const ratio = p.ratioPercent !== undefined ? p.ratioPercent : (p.strengthRatio !== undefined ? p.strengthRatio : 100);
      const visualPct = Math.min(100, Math.max(6, (ratio / 160) * 100));
      const barColor = ratio >= 100 ? '#34D399' : (ratio >= 85 ? '#FBBF24' : '#F87171');
      const badgeStyle = ratio >= 100 ? 'shadbala-badge-strong' : (ratio >= 85 ? 'shadbala-badge-adequate' : 'shadbala-badge-weak');
      const glyph = planetGlyphs[p.name] || planetGlyphs[p.key] || '✦';

      barHtml += `
        <div class="shadbala-bar-row">
          <div class="shadbala-bar-header">
            <span class="shadbala-bar-name">
              <span style="font-size: 1.1rem; color: ${barColor}; display: inline-block; width: 22px; text-align: center;">${glyph}</span>
              <strong style="color: #FFF;">${p.name}</strong>
              <span style="font-size: 0.76rem; color: var(--text-dim);">(${p.sanskrit || ''})</span>
              <span class="shadbala-badge ${badgeStyle}">Rank #${p.rank}</span>
            </span>
            <span class="shadbala-bar-stats">
              <strong>${Number(p.totalRupas).toFixed(2)} R</strong> / ${Number(p.requiredRupas).toFixed(1)} R req
              <span style="color: ${barColor}; font-weight: 700; margin-left: 8px;">(${ratio}%)</span>
            </span>
          </div>
          <div class="shadbala-bar-track">
            <div class="shadbala-threshold-line" style="left: 62.5%;"></div>
            <div class="shadbala-bar-fill" style="width: ${visualPct}%; background: ${barColor};"></div>
          </div>
        </div>
      `;
    }
    shadbalaBarsContainer.innerHTML = barHtml;
  }

  // 3. Matrix Table
  let rowsHtml = '';
  for (let p of planets) {
    const ratio = p.ratioPercent !== undefined ? p.ratioPercent : (p.strengthRatio !== undefined ? p.strengthRatio : 100);
    const badgeStyle = ratio >= 100 ? 'shadbala-badge-strong' : (ratio >= 85 ? 'shadbala-badge-adequate' : 'shadbala-badge-weak');
    const glyph = planetGlyphs[p.name] || planetGlyphs[p.key] || '✦';
    const ratioColor = ratio >= 100 ? '#34D399' : (ratio >= 85 ? '#FBBF24' : '#F87171');

    const sthanaVal = p.balas?.sthana?.total !== undefined ? p.balas.sthana.total : (p.sthanaBala || 0);
    const digVal = p.balas?.dig !== undefined ? p.balas.dig : (p.digBala || 0);
    const kalaVal = p.balas?.kala?.total !== undefined ? p.balas.kala.total : (p.kalaBala || 0);
    const chestaVal = p.balas?.chesta !== undefined ? p.balas.chesta : (p.chestaBala || 0);
    const naisargikaVal = p.balas?.naisargika !== undefined ? p.balas.naisargika : (p.naisargikaBala || 0);
    const drikVal = p.balas?.drik !== undefined ? p.balas.drik : (p.drikBala || 0);

    rowsHtml += `
      <tr>
        <td style="font-weight: 800; color: var(--gold-light); text-align: center;">#${p.rank}</td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.05rem; color: ${ratioColor};">${glyph}</span>
            <strong style="color: #FFF;">${p.name}</strong>
            <span style="font-size: 0.72rem; color: var(--text-dim);">(${p.sanskrit || ''})</span>
          </span>
        </td>
        <td><code>${Number(sthanaVal).toFixed(1)}</code></td>
        <td><code>${Number(digVal).toFixed(1)}</code></td>
        <td><code>${Number(kalaVal).toFixed(1)}</code></td>
        <td><code>${Number(chestaVal).toFixed(1)}</code></td>
        <td><code>${Number(naisargikaVal).toFixed(1)}</code></td>
        <td><code>${Number(drikVal).toFixed(1)}</code></td>
        <td style="font-weight: 700; color: #E2E8F0;"><code>${Number(p.totalVirupas).toFixed(1)}</code></td>
        <td style="font-weight: 800; color: #FFF; font-size: 0.94rem;">${Number(p.totalRupas).toFixed(2)}</td>
        <td style="color: var(--text-muted); font-size: 0.88rem;">${Number(p.requiredRupas).toFixed(1)}</td>
        <td><strong style="color: ${ratioColor}; font-size: 0.94rem;">${ratio}%</strong></td>
        <td><span class="shadbala-badge ${badgeStyle}">${p.verdict}</span></td>
      </tr>
    `;
  }
  tbodyShadbala.innerHTML = rowsHtml;

  // 3.1 Detailed Sub-Component Matrix (Ochcha, Saptavarga, Kendra, Drekkana, Ayana, etc.)
  if (tbodyShadbalaDetailed) {
    const pKeys = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];
    const pList = pKeys.map(k => planets.find(p => p.key === k || p.name === k || (k === 'Merc' && p.name === 'Mercury') || (k === 'Jupt' && p.name === 'Jupiter') || (k === 'Venu' && p.name === 'Venus') || (k === 'Satn' && p.name === 'Saturn'))).filter(Boolean);

    const detailedRows = [
      { name: 'Ochcha Bala (उच्च बल)', fn: p => p.sthanaBreakdown?.uchcha ?? p.balas?.sthana?.uchcha ?? 0 },
      { name: 'Saptavargaja Bala (सप्तवर्गज बल)', fn: p => p.sthanaBreakdown?.saptavarga ?? p.balas?.sthana?.saptavarga ?? 0 },
      { name: 'Ojayugmarasyamsa Bala (ओजयुग्म बल)', fn: p => p.sthanaBreakdown?.ojhayugma ?? p.balas?.sthana?.ojhayugma ?? 0 },
      { name: 'Kendra Bala (केन्द्र बल)', fn: p => p.sthanaBreakdown?.kendra ?? p.balas?.sthana?.kendra ?? 0 },
      { name: 'Drekkana Bala (द्रेष्काण बल)', fn: p => p.sthanaBreakdown?.drekkana ?? p.balas?.sthana?.drekkana ?? 0 },
      { name: 'Total Sthan Bala (स्थान बल)', highlight: true, fn: p => p.sthanaBala ?? p.balas?.sthana?.total ?? 0 },
      { name: 'Total Dig Bala (दिक् बल)', highlight: true, fn: p => p.digBala ?? p.balas?.dig ?? 0 },
      { name: 'Nathonnatha Bala (नथोन्नत बल)', fn: p => p.kalaBreakdown?.natonnatha ?? p.balas?.kala?.natonnatha ?? 0 },
      { name: 'Paksha Bala (पक्ष बल)', fn: p => p.kalaBreakdown?.paksha ?? p.balas?.kala?.paksha ?? 0 },
      { name: 'Thribhaga Bala (त्रिभाग बल)', fn: p => p.kalaBreakdown?.tribhaga ?? p.balas?.kala?.tribhaga ?? 0 },
      { name: 'Abda Bala (अब्द बल)', fn: p => p.kalaBreakdown?.abda ?? p.balas?.kala?.abda ?? 0 },
      { name: 'Masa Bala (मास बल)', fn: p => p.kalaBreakdown?.masa ?? p.balas?.kala?.masa ?? 0 },
      { name: 'Vara Bala (वार बल)', fn: p => p.kalaBreakdown?.vara ?? p.balas?.kala?.vara ?? 0 },
      { name: 'Hora Bala (होरा बल)', fn: p => p.kalaBreakdown?.hora ?? p.balas?.kala?.hora ?? 0 },
      { name: 'Ayana Bala (आयन बल)', fn: p => p.kalaBreakdown?.ayana ?? p.balas?.kala?.ayana ?? 0 },
      { name: 'Yuddha Bala (युद्ध बल)', fn: p => p.kalaBreakdown?.yuddha ?? p.balas?.kala?.yuddha ?? 0 },
      { name: 'Total Kala Bala (काल बल)', highlight: true, fn: p => p.kalaBala ?? p.balas?.kala?.total ?? 0 },
      { name: 'Total Chesta Bala (चेष्टा बल)', highlight: true, fn: p => p.chestaBala ?? p.balas?.chesta ?? 0 },
      { name: 'Total Naisargeka Bala (नैसर्गिक बल)', highlight: true, fn: p => p.naisargikaBala ?? p.balas?.naisargika ?? 0 },
      { name: 'Total Drik Bala (दृग् बल)', highlight: true, fn: p => p.drikBala ?? p.balas?.drik ?? 0 },
      { name: 'Total Shad Bala (षड्बल)', prominent: true, fn: p => p.totalVirupas ?? 0 },
      { name: 'Shadbala In Rupas (रूप में)', prominent: true, isRupas: true, fn: p => p.totalRupas ?? (p.totalVirupas / 60) },
      { name: 'Minimum Requirements (न्यूनतम)', fn: p => p.requiredRupas ?? 5.0 },
      { name: 'Ratio (अनुपात)', fn: p => Number(((p.totalRupas || (p.totalVirupas / 60)) / (p.requiredRupas || 5)).toFixed(2)) },
      { name: 'Relative Rank (स्थान)', rank: true, fn: p => p.rank ?? 1 }
    ];

    let detHtml = '';
    for (let r of detailedRows) {
      const bgStyle = r.prominent ? 'background: rgba(245, 158, 11, 0.08); font-weight: 800;' : (r.highlight ? 'background: rgba(255, 255, 255, 0.025); font-weight: 700;' : '');
      const labelColor = r.prominent ? 'color: #F59E0B;' : (r.highlight ? 'color: #34D399;' : 'color: var(--text-main);');

      detHtml += `<tr style="${bgStyle}">`;
      detHtml += `<td style="padding: 10px 16px; ${labelColor}">${r.name}</td>`;
      for (let p of pList) {
        const rawVal = r.fn(p);
        let valStr = '';
        if (typeof rawVal === 'number') {
          if (r.rank) valStr = String(rawVal);
          else if (Number.isInteger(rawVal)) valStr = String(rawVal);
          else valStr = Number(rawVal.toFixed(2)).toString();
        } else {
          valStr = String(rawVal);
        }
        const cellColor = r.prominent ? '#FFF' : (r.highlight ? '#E2E8F0' : 'var(--text-muted)');
        detHtml += `<td style="padding: 10px 14px; text-align: right; color: ${cellColor}; font-family: monospace;">${valStr}</td>`;
      }
      detHtml += `</tr>`;
    }
    tbodyShadbalaDetailed.innerHTML = detHtml;
  }

  // 4. Bhavabala View
  if (appState.bhavabala && appState.bhavabala.houses) {
    const bb = appState.bhavabala;
    const houses = bb.houses || [];
    const topH = bb.strongestHouse || houses[0];
    const weakH = bb.weakestHouse || houses[houses.length - 1];
    const avgRupas = houses.length > 0 ? (houses.reduce((acc, h) => acc + h.totalRupas, 0) / houses.length).toFixed(2) : '6.50';

    if (bhavabalaTopHouse && topH) {
      bhavabalaTopHouse.textContent = `H${topH.house}: ${topH.name.split(' (')[0]} (${topH.totalRupas} R)`;
      if (bhavabalaTopDesc) {
        bhavabalaTopDesc.textContent = `Scoring ${topH.totalVirupas} Virupas (${topH.signName}, ruled by ${topH.lordName}). Peak life arena for extraordinary accomplishment.`;
      }
    }

    if (bhavabalaWeakHouse && weakH) {
      bhavabalaWeakHouse.textContent = `H${weakH.house}: ${weakH.name.split(' (')[0]} (${weakH.totalRupas} R)`;
      if (bhavabalaWeakDesc) {
        bhavabalaWeakDesc.textContent = `Scoring ${weakH.totalVirupas} Virupas (${weakH.signName}, ruled by ${weakH.lordName}). Sphere requiring conscious mindfulness.`;
      }
    }

    if (bhavabalaAvgPotency) {
      bhavabalaAvgPotency.textContent = `${avgRupas} Rupas`;
      if (bhavabalaAvgDesc) {
        bhavabalaAvgDesc.textContent = `Average house potency across the 12 Bhavas (Parashara benchmark is 6.0 Rupas).`;
      }
    }

    // Bhavabala Progress Bars
    if (bhavabalaBarsContainer) {
      let bHtml = '';
      for (let h of houses) {
        const visualPct = Math.min(100, Math.max(8, (h.totalRupas / 10) * 100));
        const barColor = h.totalRupas >= 6.5 ? '#34D399' : (h.totalRupas >= 5.5 ? '#FBBF24' : '#F87171');
        const badgeStyle = h.totalRupas >= 6.5 ? 'shadbala-badge-strong' : (h.totalRupas >= 5.5 ? 'shadbala-badge-adequate' : 'shadbala-badge-weak');

        bHtml += `
          <div class="shadbala-bar-row">
            <div class="shadbala-bar-header">
              <span class="shadbala-bar-name">
                <span class="shadbala-badge ${badgeStyle}">H${h.house}</span>
                <strong style="color: #FFF;">${h.name}</strong>
                <span style="font-size: 0.74rem; color: var(--text-dim);">(${h.signName} / Lord: ${h.lordName})</span>
                <span class="shadbala-badge ${badgeStyle}">Rank #${h.rank}</span>
              </span>
              <span class="shadbala-bar-stats">
                <strong style="color: ${barColor};">${h.totalRupas} Rupas</strong>
                <span style="color: var(--text-muted); font-size: 0.78rem; margin-left: 6px;">(${h.totalVirupas} V)</span>
              </span>
            </div>
            <div class="shadbala-bar-track">
              <div class="shadbala-threshold-line" style="left: 60%;" title="6.0 Rupas Parashara Standard"></div>
              <div class="shadbala-bar-fill" style="width: ${visualPct}%; background: ${barColor};"></div>
            </div>
          </div>
        `;
      }
      bhavabalaBarsContainer.innerHTML = bHtml;
    }

    // Bhavabala Matrix Table
    if (tbodyBhavabala) {
      let hHtml = '';
      for (let h of houses) {
        const barColor = h.totalRupas >= 6.5 ? '#34D399' : (h.totalRupas >= 5.5 ? '#FBBF24' : '#F87171');
        const badgeStyle = h.totalRupas >= 6.5 ? 'shadbala-badge-strong' : (h.totalRupas >= 5.5 ? 'shadbala-badge-adequate' : 'shadbala-badge-weak');
        const verdict = h.totalRupas >= 6.5 ? 'Balavan (Fortified)' : (h.totalRupas >= 5.5 ? 'Madhyama (Balanced)' : 'Nirbala (Vulnerable)');

        hHtml += `
          <tr>
            <td style="font-weight: 800; color: var(--gold-light); text-align: center;">#${h.rank}</td>
            <td>
              <span style="display: inline-flex; align-items: center; gap: 8px;">
                <span style="font-weight: 700; color: var(--accent-cyan);">H${h.house}</span>
                <strong style="color: #FFF;">${h.name}</strong>
              </span>
            </td>
            <td>
              <span>${h.signName} <span style="font-size: 0.75rem; color: var(--text-dim);">(Lord: ${h.lordName})</span></span>
            </td>
            <td><code>${h.adhipatiBala.toFixed(1)}</code></td>
            <td><code>${h.digBala.toFixed(1)}</code></td>
            <td><code style="color: ${h.drishtiBala >= 0 ? '#34D399' : '#F87171'};">${h.drishtiBala >= 0 ? '+' : ''}${h.drishtiBala.toFixed(1)}</code></td>
            <td style="font-weight: 700; color: #E2E8F0;"><code>${h.totalVirupas.toFixed(1)}</code></td>
            <td style="font-weight: 800; color: ${barColor}; font-size: 0.94rem;">${h.totalRupas.toFixed(2)}</td>
            <td><span class="shadbala-badge ${badgeStyle}">${verdict}</span></td>
          </tr>
        `;
      }
      tbodyBhavabala.innerHTML = hHtml;
    }

    // Bhavabala Horizontal Matrix
    if (tbodyBhavabalaHorizontal) {
      const sortedHouses = [...houses].sort((a, b) => a.house - b.house);
      const bbRows = [
        { name: 'Bhavadhipati Bala (भावाधिपति)', fn: h => Number(h.adhipatiBala.toFixed(2)) },
        { name: 'Bhavdig Bala (भावदिक्)', fn: h => Number(h.digBala.toFixed(2)) },
        { name: 'Bhavdrishti Bala (भावदृष्टि)', fn: h => Number(h.drishtiBala.toFixed(2)) },
        { name: 'Total Bhav Bala (कुल भावबल)', highlight: true, fn: h => Number(h.totalVirupas.toFixed(2)) },
        { name: 'Total Bhav In Rupas (रूप में)', prominent: true, fn: h => Number(h.totalRupas.toFixed(2)) },
        { name: 'Relative Rank (सापेक्ष स्थान)', rank: true, fn: h => h.rank }
      ];

      let bHHtml = '';
      for (let r of bbRows) {
        const bgStyle = r.prominent ? 'background: rgba(245, 158, 11, 0.08); font-weight: 800;' : (r.highlight ? 'background: rgba(255, 255, 255, 0.025); font-weight: 700;' : '');
        const labelColor = r.prominent ? 'color: #F59E0B;' : (r.highlight ? 'color: var(--gold-light);' : 'color: var(--text-main);');

        bHHtml += `<tr style="${bgStyle}">`;
        bHHtml += `<td style="padding: 10px 16px; ${labelColor}">${r.name}</td>`;
        for (let h of sortedHouses) {
          const val = r.fn(h);
          const cellColor = r.prominent ? '#FFF' : (r.highlight ? '#E2E8F0' : 'var(--text-muted)');
          bHHtml += `<td style="padding: 10px 8px; text-align: center; color: ${cellColor}; font-family: monospace;">${val}</td>`;
        }
        bHHtml += `</tr>`;
      }
      tbodyBhavabalaHorizontal.innerHTML = bHHtml;
    }
  }
}

/**
 * Populate Milan Selectors with Databank Profiles (Filtered strictly by Gender)
 */
function populateMilanSelects() {
  if (!milanSelectGroom || !milanSelectBride) return;
  const profiles = getProfiles();
  const currentGroomVal = milanSelectGroom.value || 'current';
  const currentBrideVal = milanSelectBride.value || '';

  const currentChartName = appState.currentProfileName || (birthNameEl ? birthNameEl.value.trim() : '') || 'Active Client';
  const currentChartGender = birthGenderEl ? birthGenderEl.value : (appState.currentProfileGender || 'male');
  const birthDateStr = birthDateEl ? (birthDateEl.value || 'Active') : 'Active';

  // Groom (Var): Show Active Chart if male/unspecified, plus Databank profiles that are male or unspecified
  let groomOptions = '';
  if (currentChartGender !== 'female') {
    groomOptions += `<option value="current">Active Natal Chart: ${currentChartName} (${birthDateStr}) ♂</option>`;
  }

  // Bride (Kanya): Show Active Chart if female/unspecified, plus Databank profiles that are female or unspecified
  let brideOptions = '';
  if (currentChartGender !== 'male') {
    brideOptions += `<option value="current">Active Natal Chart: ${currentChartName} (${birthDateStr}) ♀</option>`;
  }

  profiles.forEach(p => {
    const isFemale = p.gender === 'female';
    const isMale = p.gender === 'male';
    const symbol = isFemale ? '♀' : (isMale ? '♂' : '✦');
    const genderTag = (!p.gender || p.gender === 'unspecified') ? ' [Unspecified]' : '';
    const label = `${symbol} ${p.name} (${p.city || 'Chart'})${genderTag}`;

    // Groom (Var): ONLY charts of male gender or gender missing
    if (!isFemale) {
      groomOptions += `<option value="${p.id}">${label}</option>`;
    }

    // Bride (Kanya): ONLY charts of female gender or gender missing
    if (!isMale) {
      brideOptions += `<option value="${p.id}">${label}</option>`;
    }
  });

  milanSelectGroom.innerHTML = groomOptions || '<option value="">No Male / Unspecified Profiles</option>';
  milanSelectBride.innerHTML = brideOptions || '<option value="">No Female / Unspecified Profiles</option>';

  const validGroomValues = Array.from(milanSelectGroom.options).map(o => o.value).filter(Boolean);
  const validBrideValues = Array.from(milanSelectBride.options).map(o => o.value).filter(Boolean);

  if (currentGroomVal && validGroomValues.includes(currentGroomVal)) {
    milanSelectGroom.value = currentGroomVal;
  } else if (validGroomValues.length > 0) {
    milanSelectGroom.value = validGroomValues[0];
  }

  if (currentBrideVal && validBrideValues.includes(currentBrideVal)) {
    milanSelectBride.value = currentBrideVal;
  } else if (validBrideValues.length > 0) {
    const diffOption = validBrideValues.find(v => v !== milanSelectGroom.value);
    milanSelectBride.value = diffOption || validBrideValues[0];
  }

  try {
    updateMilanPersonSummaries();
  } catch (e) {
    console.error('Error in updateMilanPersonSummaries:', e);
  }
}

/**
 * Get Lunar and Planetary Data for Milan Matchmaking
 */
function getPersonMilanData(val) {
  if (val === 'current') {
    const moon = appState.planets.find(p => p.key === 'Moon');
    const lagna = appState.planets.find(p => p.key === 'ASC');
    const mars = appState.planets.find(p => p.key === 'Mars');
    if (!moon || !lagna) return null;
    const moonLon = moon.absLongitude !== undefined ? moon.absLongitude : (moon.longitude !== undefined ? moon.longitude : 0);
    const lagnaSign = lagna.signIndex !== undefined ? lagna.signIndex : (lagna.signId ? lagna.signId - 1 : 0);
    const marsSign = mars ? (mars.signIndex !== undefined ? mars.signIndex : (mars.signId ? mars.signId - 1 : 0)) : 0;
    return {
      name: appState.currentProfileName || 'Active Natal Client',
      moonLon: Number(moonLon) || 0,
      lagnaSign: lagnaSign,
      marsSign: marsSign,
      marsHouse: (((marsSign - lagnaSign + 12) % 12) + 1)
    };
  }

  const prof = getProfileById(val);
  if (!prof) return null;

  if (prof.mode === 'birth' && prof.birthDate) {
    const timeParts = (prof.birthTime || '12:00:00').split(':').map(Number);
    const dateParts = prof.birthDate.split('-').map(Number);
    try {
      const res = calculateChartFromBirthDetails({
        year: dateParts[0],
        month: dateParts[1],
        day: dateParts[2],
        hour: timeParts[0] || 0,
        minute: timeParts[1] || 0,
        second: timeParts[2] || 0,
        lat: prof.lat || 28.6139,
        lon: prof.lon || 77.2090,
        tz: prof.tz !== undefined ? prof.tz : 5.5
      });
      const moon = res.planets.find(p => p.key === 'Moon');
      const lagna = res.planets.find(p => p.key === 'ASC');
      const mars = res.planets.find(p => p.key === 'Mars');
      const moonLon = moon ? (moon.absLongitude !== undefined ? moon.absLongitude : (moon.longitude || 0)) : 0;
      const lagnaSign = lagna ? (lagna.signIndex !== undefined ? lagna.signIndex : (lagna.signId ? lagna.signId - 1 : 0)) : 0;
      const marsSign = mars ? (mars.signIndex !== undefined ? mars.signIndex : (mars.signId ? mars.signId - 1 : 0)) : 0;
      return {
        name: prof.name,
        moonLon: Number(moonLon) || 0,
        lagnaSign: lagnaSign,
        marsSign: marsSign,
        marsHouse: (((marsSign - lagnaSign + 12) % 12) + 1)
      };
    } catch (e) {
      console.error('Error computing profile for milan:', e);
      return null;
    }
  } else if (prof.rawInput) {
    try {
      const planets = parsePlanetaryInput(prof.rawInput);
      const moon = planets.find(p => p.key === 'Moon');
      const lagna = planets.find(p => p.key === 'ASC');
      const mars = planets.find(p => p.key === 'Mars');
      const moonLon = moon ? (moon.absLongitude !== undefined ? moon.absLongitude : (moon.longitude || 0)) : 0;
      const lagnaSign = lagna ? (lagna.signIndex !== undefined ? lagna.signIndex : (lagna.signId ? lagna.signId - 1 : 0)) : 0;
      const marsSign = mars ? (mars.signIndex !== undefined ? mars.signIndex : (mars.signId ? mars.signId - 1 : 0)) : 0;
      return {
        name: prof.name,
        moonLon: Number(moonLon) || 0,
        lagnaSign: lagnaSign,
        marsSign: marsSign,
        marsHouse: (((marsSign - lagnaSign + 12) % 12) + 1)
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  return null;
}

/**
 * Update Milan Summary Chips
 */
function updateMilanPersonSummaries() {
  if (!milanGroomSummary || !milanBrideSummary) return;
  const gData = getPersonMilanData(milanSelectGroom.value);
  const bData = getPersonMilanData(milanSelectBride.value);

  if (gData && !isNaN(gData.moonLon)) {
    const gSignIdx = Math.floor(((gData.moonLon % 360 + 360) % 360) / 30);
    const gSignName = SIGNS[gSignIdx] ? SIGNS[gSignIdx].name : '';
    const gLagnaName = SIGNS[gData.lagnaSign] ? SIGNS[gData.lagnaSign].name : '';
    milanGroomSummary.innerHTML = `<strong>${gData.name}</strong> • Moon: <strong>${gSignName}</strong> • Lagna: <strong>${gLagnaName}</strong>`;
  } else {
    milanGroomSummary.textContent = 'Chart details pending.';
  }

  if (bData && !isNaN(bData.moonLon)) {
    const bSignIdx = Math.floor(((bData.moonLon % 360 + 360) % 360) / 30);
    const bSignName = SIGNS[bSignIdx] ? SIGNS[bSignIdx].name : '';
    const bLagnaName = SIGNS[bData.lagnaSign] ? SIGNS[bData.lagnaSign].name : '';
    milanBrideSummary.innerHTML = `<strong>${bData.name}</strong> • Moon: <strong>${bSignName}</strong> • Lagna: <strong>${bLagnaName}</strong>`;
  } else {
    milanBrideSummary.textContent = 'Select bride from Databank.';
  }
}

/**
 * Run Kundali Milan Calculation
 */
function runMilanCalculation() {
  const gData = getPersonMilanData(milanSelectGroom.value);
  const bData = getPersonMilanData(milanSelectBride.value);

  if (!gData || !bData) {
    showToast('Please select valid Groom and Bride charts from Databank.');
    return;
  }

  const ashtakoota = calculateAshtakoota(gData, bData);
  const gMangal = checkMangalDosha(gData.marsSign, gData.lagnaSign, Math.floor(gData.moonLon / 30));
  const bMangal = checkMangalDosha(bData.marsSign, bData.lagnaSign, Math.floor(bData.moonLon / 30));

  let mangalVerdict = '✅ Safe Mangal Compatibility: Neither chart has afflictive Kuja Dosha.';
  let mangalVerdictColor = '#10B981';

  if (gMangal.hasDosha && bMangal.hasDosha) {
    mangalVerdict = '⚖️ Mutual Kuja Dosha Cancellation: Both partners have Mangal Dosha, neutralizing each other!';
    mangalVerdictColor = '#38BDF8';
  } else if (gMangal.hasDosha || bMangal.hasDosha) {
    if (gMangal.isCancelled || bMangal.isCancelled) {
      mangalVerdict = '🛡️ Mangal Dosha Cancelled: Planetary position grants classical parihara.';
      mangalVerdictColor = '#F59E0B';
    } else {
      mangalVerdict = `⚠️ Unbalanced Manglik: ${gMangal.hasDosha ? gData.name : bData.name} has ${gMangal.hasDosha ? gMangal.intensity : bMangal.intensity} while partner is non-Manglik. Remedial consultation advised.`;
      mangalVerdictColor = '#EF4444';
    }
  }

  let kootaRows = '';
  ashtakoota.kootas.forEach(k => {
    const isFull = k.obtained === k.max;
    const isZero = k.obtained === 0;
    const badgeClass = isFull ? 'badge-exalted' : (isZero ? 'badge-debilitated' : 'badge-neutral');

    kootaRows += `
      <tr>
        <td><strong>${k.name}</strong></td>
        <td><span class="badge ${badgeClass}" style="font-size: 0.85rem; font-weight: 700;">${k.obtained} / ${k.max}</span></td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${k.desc}</td>
      </tr>
    `;
  });

  milanResultsContainer.innerHTML = `
    <!-- Score Hero -->
    <div class="milan-score-hero">
      <div class="milan-score-display">
        <div class="milan-guna-number">${ashtakoota.totalGunas} <span style="font-size: 1.5rem; color: var(--text-muted); font-weight: 500;">/ 36</span></div>
        <div>
          <span class="verdict-badge ${ashtakoota.verdictClass}" style="font-size: 1rem; padding: 8px 16px;">
            ${ashtakoota.verdict}
          </span>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">
            Compatibility: <strong>${ashtakoota.percentage}%</strong> • Minimum recommended score is <strong>18 Gunas</strong>.
          </p>
        </div>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); text-align: right;">
        🤵 <strong>${gData.name}</strong> (${ashtakoota.groom.sign}, ${ashtakoota.groom.nakshatra} ${ashtakoota.groom.pada})<br>
        👰 <strong>${bData.name}</strong> (${ashtakoota.bride.sign}, ${ashtakoota.bride.nakshatra} ${ashtakoota.bride.pada})
      </div>
    </div>

    <!-- Mangal Dosha Card -->
    <div class="mangal-status-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #FFF;">🔥 Mangal (Kuja) Dosha Analysis</h4>
        <span style="font-size: 0.82rem; font-weight: 700; color: ${mangalVerdictColor};">${mangalVerdict}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.8rem; margin-top: 6px;">
        <div style="background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: var(--radius-sm);">
          🤵 <strong>${gData.name}</strong>: ${gMangal.intensity} ${gMangal.cancelReason ? `(${gMangal.cancelReason})` : ''}
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: var(--radius-sm);">
          👰 <strong>${bData.name}</strong>: ${bMangal.intensity} ${bMangal.cancelReason ? `(${bMangal.cancelReason})` : ''}
        </div>
      </div>
    </div>

    <!-- 8 Kootas Detailed Table -->
    <div class="table-responsive">
      <h4 style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 10px;">Classical Ashtakoota (8-Factor) Detailed Breakdown:</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Koota (Factor)</th>
            <th>Obtained / Max</th>
            <th>Compatibility Description & Parihara</th>
          </tr>
        </thead>
        <tbody>
          ${kootaRows}
        </tbody>
      </table>
    </div>
  `;

  milanResultsContainer.style.display = 'flex';
  milanResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`Match calculated: ${ashtakoota.totalGunas} / 36 Gunas (${ashtakoota.verdict})`);
}

/**
 * Render Classical Parashari Planetary Friendship Tables (Maitri Chakra)
 */
function renderFriendshipView() {
  if (!appState.friendship) return;
  const { permanent, temporal, fiveFold } = appState.friendship;
  const pKeys = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];
  const pLabels = {
    Sun: 'SUN', Moon: 'MOON', Mars: 'MARS', Merc: 'MERC', Jupt: 'JUPT', Venu: 'VENU', Satn: 'SATN'
  };
  const pNames = {
    Sun: 'Sun (Surya)', Moon: 'Moon (Chandra)', Mars: 'Mars (Mangal)',
    Merc: 'Mercury (Budha)', Jupt: 'Jupiter (Guru)', Venu: 'Venus (Shukra)',
    Satn: 'Saturn (Shani)'
  };
  const planetGlyphs = {
    Sun: '☉', Moon: '☽', Mars: '♂', Merc: '☿', Jupt: '♃', Venu: '♀', Satn: '♄'
  };

  const getBadge = (val) => {
    if (val === '---') return '<span class="badge-maitri-self">---</span>';
    if (val === 'Intimat') return '<span class="badge-maitri-intimate">Intimate</span>';
    if (val === 'Friend') return '<span class="badge-maitri-friend">Friend</span>';
    if (val === 'Neutral') return '<span class="badge-maitri-neutral">Neutral</span>';
    if (val === 'Enemy') return '<span class="badge-maitri-enemy">Enemy</span>';
    if (val === 'Bitter') return '<span class="badge-maitri-bitter">Bitter</span>';
    return `<span>${val}</span>`;
  };

  const buildTable = (tableData) => {
    let html = '<thead><tr><th class="planet-col">Planet</th>';
    for (const k of pKeys) {
      html += `<th>${pLabels[k]}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (const p1 of pKeys) {
      html += '<tr>';
      html += `<td class="planet-col"><span style="margin-right: 6px; color: var(--gold-light);">${planetGlyphs[p1]}</span><strong>${pLabels[p1]}</strong> <span style="font-size: 0.72rem; color: var(--text-dim); display: block;">${pNames[p1].split(' ')[1] || ''}</span></td>`;
      for (const p2 of pKeys) {
        const val = tableData[p1] ? tableData[p1][p2] : '---';
        html += `<td>${getBadge(val)}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';
    return html;
  };

  if (tableFivefoldFriendship && fiveFold) {
    tableFivefoldFriendship.innerHTML = buildTable(fiveFold);
  }
  if (tablePermanentFriendship && permanent) {
    tablePermanentFriendship.innerHTML = buildTable(permanent);
  }
  if (tableTemporalFriendship && temporal) {
    tableTemporalFriendship.innerHTML = buildTable(temporal);
  }
}

// ========================================================
// 🏛️ 12 Bhavas Studio (House Delineation) Controller
// Source: MS Mehta & Classical Treatises
// ========================================================

const BHAVA_SUBTABS = [
  { num: 1, title: '1. Tanu (Self)', sanskrit: 'तनु भाव', tag: 'Body & Personality' },
  { num: 2, title: '2. Dhana (Wealth)', sanskrit: 'धन भाव', tag: 'Speech & Assets' },
  { num: 3, title: '3. Sahaja (Courage)', sanskrit: 'सहज भाव', tag: 'Siblings & Drive' },
  { num: 4, title: '4. Sukha (Home)', sanskrit: 'सुख भाव', tag: 'Mother & Land' },
  { num: 5, title: '5. Putra (Intellect)', sanskrit: 'पुत्र भाव', tag: 'Children & Mind' },
  { num: 6, title: '6. Ari (Enemies)', sanskrit: 'अरि भाव', tag: 'Debts & Health' },
  { num: 7, title: '7. Kalatra (Spouse)', sanskrit: 'कलत्र भाव', tag: 'Marriage & Trade' },
  { num: 8, title: '8. Ayu (Occult)', sanskrit: 'आयु भाव', tag: 'Longevity & Secrets' },
  { num: 9, title: '9. Dharma (Fortune)', sanskrit: 'धर्म भाव', tag: 'Father & Wisdom' },
  { num: 10, title: '10. Karma (Career)', sanskrit: 'कर्म भाव', tag: 'Status & Eminence' },
  { num: 11, title: '11. Labha (Gains)', sanskrit: 'लाभ भाव', tag: 'Prosperity & Network' },
  { num: 12, title: '12. Moksha (Losses)', sanskrit: 'मोक्ष भाव', tag: 'Expenses & Spirit' }
];

function renderNumerologyView() {
  const container = document.getElementById('numerology-container');
  if (!container) return;

  let dob = null;
  let nativeName = 'Native';

  if (birthDateEl && birthDateEl.value) {
    dob = new Date(birthDateEl.value + 'T00:00:00');
  }

  if (birthNameEl && birthNameEl.value) {
    nativeName = birthNameEl.value;
  } else if (appState.currentProfileName) {
    nativeName = appState.currentProfileName;
  }

  if (!dob || isNaN(dob.getTime())) {
    dob = new Date('1994-03-15T00:00:00');
  }

  renderNumerologyStudio(container, { dob, name: nativeName });
}

function renderBhavasView() {
  if (!bhavasSubtabsContainer || !bhavaActiveHouseContainer) return;
  if (!appState.planets || appState.planets.length === 0) return;

  const asc = appState.planets.find(p => p.key === 'ASC');
  if (!asc) return;
  const ascSignId = asc.signId;

  const currentHouse = appState.activeBhavaHouse || 1;

  // Render 12 Sub-Tabs Pills
  let subtabsHtml = '';
  BHAVA_SUBTABS.forEach(item => {
    const occupantsCount = appState.planets.filter(p => {
      if (p.key === 'ASC') return false;
      return (((p.signId - ascSignId + 12) % 12) + 1) === item.num;
    }).length;

    const isActive = item.num === currentHouse;
    subtabsHtml += `
      <button type="button" class="bhava-subtab-btn ${isActive ? 'active' : ''}" data-house="${item.num}">
        <span>${item.title}</span>
        <span class="bhava-subtab-badge ${occupantsCount > 0 ? 'has-planets' : ''}" title="${occupantsCount} resident planet(s)">
          ${occupantsCount}
        </span>
      </button>
    `;
  });
  bhavasSubtabsContainer.innerHTML = subtabsHtml;

  // Add click listeners to subtabs
  bhavasSubtabsContainer.querySelectorAll('.bhava-subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const hNum = parseInt(btn.getAttribute('data-house'), 10);
      appState.activeBhavaHouse = hNum;
      renderBhavasView();
    });
  });

  // Evaluate House via bhavasEngine
  let report = null;
  try {
    report = evaluateHouse(appState.planets, currentHouse, {
      ashtakavarga: appState.ashtakavarga,
      bhavabala: appState.bhavabala,
      birthDate: birthDateEl ? birthDateEl.value : null,
      gender: birthGenderEl ? birthGenderEl.value : 'male'
    });
  } catch (err) {
    console.error('Error evaluating house:', err);
    bhavaActiveHouseContainer.innerHTML = `
      <div class="timeline-empty-box">
        <p style="color:var(--accent-rose);">Error evaluating House ${currentHouse}: ${err.message}</p>
      </div>
    `;
    return;
  }

  // Build View for Active House
  bhavaActiveHouseContainer.innerHTML = buildBhavaHouseHtml(report, currentHouse);

  // Bind click listeners for 12 House Lords overview cards
  bhavaActiveHouseContainer.querySelectorAll('.bhava-all-lord-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetH = parseInt(card.getAttribute('data-nav-house'), 10);
      if (targetH >= 1 && targetH <= 12) {
        appState.activeBhavaHouse = targetH;
        renderBhavasView();
      }
    });
  });
}

function buildBhavaHouseHtml(report, currentHouse) {
  // Kartari Badge
  let kartariBadgeClass = 'bhava-badge';
  let kartariIcon = '⚖️';
  if (report.kartari.type === 'Shubh Kartari') {
    kartariBadgeClass += ' badge-green';
    kartariIcon = '🛡️';
  } else if (report.kartari.type === 'Pap Kartari') {
    kartariBadgeClass += ' badge-red';
    kartariIcon = '⚠️';
  }

  // Dignity Badge Class
  let lordDignityClass = 'bhava-badge';
  if (report.lord.dignity.includes('Exalted') || report.lord.dignity.includes('Own')) {
    lordDignityClass += ' badge-gold';
  } else if (report.lord.dignity.includes('Debilitated')) {
    lordDignityClass += ' badge-red';
  } else {
    lordDignityClass += ' badge-green';
  }

  // SAV Badge
  const savPts = report.metrics.savPoints;
  const savClass = (savPts !== null && savPts >= 28) ? 'badge-green' : 'badge-gold';

  // Bhavabala String
  const bbScore = report.metrics.bhavabalaScore;
  const bbText = bbScore ? `${bbScore.totalBala.toFixed(1)} Virupas (Rank #${bbScore.rank})` : 'Calculated';

  let html = `
    <!-- 1. Bhava Anatomy & Dignity Header Card -->
    <div class="bhava-anatomy-card">
      <div class="bhava-anatomy-header">
        <div class="bhava-title-group">
          <h3>House ${report.houseNumber}: ${report.name}</h3>
          <div class="bhava-sanskrit-subtitle">${report.sanskritName} • Natural Karaka: ${report.naturalKaraka.join(', ') || 'N/A'}</div>
        </div>
        <div class="bhava-badges-strip">
          <span class="bhava-badge badge-gold">
            <span>♈ Sign:</span>
            <strong>${report.sign.name} ${report.sign.symbol}</strong>
          </span>
          <span class="${lordDignityClass}">
            <span>👑 Lord:</span>
            <strong>${report.lord.name} in H${report.lord.currentHouse} (${report.lord.currentSign})</strong>
          </span>
          <span class="${kartariBadgeClass}">
            <span>${kartariIcon} Kartari:</span>
            <strong>${report.kartari.type}</strong>
          </span>
          ${savPts !== null ? `
            <span class="bhava-badge ${savClass}">
              <span>📈 SAV:</span>
              <strong>${savPts} pts ${savPts >= 28 ? '(Fortified)' : '(Moderate)'}</strong>
            </span>
          ` : ''}
          ${bbScore ? `
            <span class="bhava-badge badge-purple">
              <span>⚖️ Bhavabala:</span>
              <strong>${bbText}</strong>
            </span>
          ` : ''}
        </div>
      </div>

      <!-- 4-Column Anatomy Stats Grid -->
      <div class="bhava-stats-grid">
        <div class="bhava-stat-box">
          <div class="stat-label">Rising Sign on Cusp</div>
          <div class="stat-val">${report.sign.name} ${report.sign.symbol}</div>
          <div class="stat-sub">${report.sign.sanskrit} • ${report.sign.element} / ${report.sign.mobility}</div>
        </div>

        <div class="bhava-stat-box">
          <div class="stat-label">House Lord Placement</div>
          <div class="stat-val" style="color: var(--gold-light);">${report.lord.name} in House ${report.lord.currentHouse}</div>
          <div class="stat-sub">${report.lord.currentSign} • ${report.lord.dignity}${report.lord.isRetrograde ? ' [Retrograde]' : ''}</div>
        </div>

        <div class="bhava-stat-box">
          <div class="stat-label">Ashtakavarga Matrix</div>
          <div class="stat-val" style="color: ${savPts >= 28 ? '#34D399' : '#FCD34D'};">${savPts !== null ? savPts + ' Bindus' : 'N/A'}</div>
          <div class="stat-sub">${savPts >= 28 ? 'Auspicious Strength (≥28 average)' : 'Subtle Vulnerability (<28 points)'}</div>
        </div>

        <div class="bhava-stat-box">
          <div class="stat-label">Bhavabala Potency</div>
          <div class="stat-val" style="color: #C084FC;">${bbScore ? bbScore.totalBala.toFixed(1) + ' Virupas' : 'N/A'}</div>
          <div class="stat-sub">${bbScore ? 'Bhavabala Rank #' + bbScore.rank + ' of 12 Houses' : 'Calculated in Shadbala Module'}</div>
        </div>
      </div>
    </div>
  `;

  // 2. Mehta's Master Placement Card
  if (report.lordPlacementReport) {
    const lRep = report.lordPlacementReport;
    html += `
      <div class="bhava-lord-card">
        <div class="bhava-lord-header">
          <div class="bhava-lord-title">
            <span style="font-size: 1.4rem;">📖</span>
            <h4>MS Mehta's Classical Dictum: ${lRep.title}</h4>
          </div>
          <span class="bhava-badge badge-gold">
            <span>Dignity:</span>
            <strong>${lRep.dignity}</strong>
          </span>
        </div>

        <div class="bhava-lord-body">
          ${lRep.text}
        </div>

        <div class="bhava-lord-meta-box">
          ${lRep.favorableText ? `
            <div class="bhava-lord-meta-row">
              <span class="bhava-lord-meta-label" style="color: #34D399;">🌟 Favorable Fruits:</span>
              <span class="bhava-lord-meta-value">${lRep.favorableText}</span>
            </div>
          ` : ''}
          ${lRep.afflictedText ? `
            <div class="bhava-lord-meta-row">
              <span class="bhava-lord-meta-label" style="color: #F87171;">⚠️ If Afflicted / Weak:</span>
              <span class="bhava-lord-meta-value">${lRep.afflictedText}</span>
            </div>
          ` : ''}
          ${lRep.mehtaNotes ? `
            <div class="bhava-lord-meta-row" style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08);">
              <span class="bhava-lord-meta-label" style="color: var(--gold-light);">💡 Master Note:</span>
              <span class="bhava-lord-meta-value" style="font-style: italic;">${lRep.mehtaNotes}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else {
    // Roadmapped chapter placeholder for Houses 2-12
    html += `
      <div class="bhava-lord-card">
        <div class="bhava-lord-header">
          <div class="bhava-lord-title">
            <span style="font-size: 1.4rem;">📖</span>
            <h4>House Lord Placement: ${report.lord.name} in House ${report.lord.currentHouse}</h4>
          </div>
          <span class="bhava-badge badge-gold">
            <span>Astronomical Placement:</span>
            <strong>${report.lord.currentSign} (${report.lord.dignity})</strong>
          </span>
        </div>
        <div class="bhava-lord-body">
          House ${report.houseNumber} Lord <strong>${report.lord.name}</strong> is situated in House ${report.lord.currentHouse} (${report.lord.currentSign}), holding <em>${report.lord.dignity}</em> dignity${report.lord.isRetrograde ? ' (Retrograde motion)' : ''}. The astronomical coordinates, aspect grids, and strength meters are actively computed above.
        </div>
        <div class="bhava-lord-meta-box">
          <div class="bhava-lord-meta-row">
            <span class="bhava-lord-meta-label" style="color: var(--accent-cyan);">📚 Roadmap Status:</span>
            <span class="bhava-lord-meta-value">Mehta's Chapter ${report.houseNumber} textual rules are scheduled for structured JSON ingestion in the upcoming phase as per <code>AGENTS.md</code> protocol.</span>
          </div>
        </div>
      </div>
    `;
  }

  // 2.5 Indu Lagna Card (when viewing House 2)
  if (currentHouse === 2 && report.induLagna) {
    const il = report.induLagna;
    html += `
      <div class="bhava-lord-card" style="border-color: rgba(56, 189, 248, 0.4); background: linear-gradient(135deg, rgba(14, 25, 45, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%);">
        <div class="bhava-lord-header">
          <div class="bhava-lord-title">
            <span style="font-size: 1.4rem;">💎</span>
            <h4 style="color: #38BDF8;">Indu Lagna (Dhana Lagna / Visesha Chandra Yoga)</h4>
          </div>
          <span class="bhava-badge ${il.isKoteshwaraActive ? 'badge-gold' : 'badge-green'}">
            <span>Status:</span>
            <strong>${il.isKoteshwaraActive ? '✨ Koteshwara Yoga Active' : 'Calculated'}</strong>
          </span>
        </div>

        <div class="bhava-lord-body">
          ${il.summary}
        </div>

        <div class="bhava-lord-meta-box">
          <div class="bhava-lord-meta-row">
            <span class="bhava-lord-meta-label" style="color: var(--gold-light);">Indu Ascendant:</span>
            <span class="bhava-lord-meta-value"><strong>${il.sign.name} ${il.sign.symbol}</strong> (House ${il.houseFromLagna} from Natal Lagna) • Lord: <strong>${il.sign.lord}</strong></span>
          </div>
          <div class="bhava-lord-meta-row">
            <span class="bhava-lord-meta-label" style="color: var(--text-dim);">Kala Formula:</span>
            <span class="bhava-lord-meta-value">9th Lord from Lagna (${il.h9FromLagna.lord} = ${il.h9FromLagna.kalas} Kalas) + 9th Lord from Moon (${il.h9FromMoon.lord} = ${il.h9FromMoon.kalas} Kalas) = <strong>${il.totalKalas} Kalas</strong> (Remainder: <strong>${il.remainder}</strong>)</span>
          </div>
          <div class="bhava-lord-meta-row">
            <span class="bhava-lord-meta-label" style="color: #34D399;">Occupants & Aspects:</span>
            <span class="bhava-lord-meta-value">${il.occupants.length > 0 ? il.occupants.map(o => `${o.name} (${o.dignity})`).join(', ') : 'None'} • Aspecting: ${il.aspects.length > 0 ? il.aspects.map(a => `${a.name} [${a.aspectType}]`).join(', ') : 'None'}</span>
          </div>
        </div>
      </div>
    `;
  }

  // 2.6 Beeja & Kshetra Sphuta and Double Transit Timeline (when viewing House 5)
  if (currentHouse === 5) {
    if (report.beejaKshetra) {
      const bk = report.beejaKshetra;
      const isMale = bk.isMale;
      const primary = bk.primarySphuta;
      const partner = bk.partnerSphuta;
      const accentColor = isMale ? '#38BDF8' : '#F43F5E';
      const genderSymbol = isMale ? '♂' : '♀';
      const cardTitle = isMale ? 'Beeja Sphuta (Male Seed Vitality & Potency)' : 'Kshetra Sphuta (Female Reproductive Field / Womb)';
      const partnerTitle = isMale ? 'Kshetra Sphuta (Female Partner / Wife)' : 'Beeja Sphuta (Male Partner / Husband)';

      html += `
        <div class="bhava-lord-card" style="border-color: ${isMale ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 63, 94, 0.4)'}; background: linear-gradient(135deg, ${isMale ? 'rgba(14, 25, 45, 0.85)' : 'rgba(30, 15, 25, 0.85)'} 0%, rgba(10, 12, 20, 0.95) 100%);">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🧬</span>
              <h4 style="color: ${accentColor};">${genderSymbol} ${cardTitle}</h4>
            </div>
            <span class="bhava-badge ${isMale ? 'badge-blue' : 'badge-purple'}">
              <span>${isMale ? 'Male Native Calculation' : 'Female Native Calculation'}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Parashari Dictum (Mehta Ch. 5, p. 86 & Jataka Parijata)</strong>: 
            ${isMale ? `
              For a <strong>male native</strong>, classical treatises prescribe calculating <strong>Beeja Sphuta only</strong> (Sun + Venus + Jupiter) to evaluate seed vitality and reproductive potency. Kshetra Sphuta governs the female womb and is verified from the wife's chart.
            ` : `
              For a <strong>female native</strong>, classical treatises prescribe calculating <strong>Kshetra Sphuta only</strong> (Mars + Moon + Jupiter) to evaluate ovum vitality, menstrual cycles, and uterine receptivity. Beeja Sphuta governs male seed and is verified from the husband's chart.
            `}
          </p>

          <!-- Primary Active Native Sphuta Card -->
          <div class="bhava-sphuta-subcard" style="border-left: 4px solid ${accentColor}; background: rgba(0, 0, 0, 0.4); padding: 16px;">
            <div class="bhava-sphuta-title">
              <span style="color: ${accentColor}; font-size: 1rem;">
                ${genderSymbol} ${primary.name}
              </span>
              <span style="font-size: 0.85rem; color: var(--gold-light); font-weight: 700;">${primary.degFormatted}</span>
            </div>

            <div style="font-size: 0.92rem; color: #FFF; font-weight: 600; margin-top: 4px;">
              ${primary.signName} (${primary.sanskritSign}) • Navamsa: <strong>${primary.navamsaSign}</strong>
            </div>

            <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">
              Formula: <code>${primary.formula}</code> • <em>${primary.rationale}</em>
            </div>

            <div class="bhava-sphuta-status-badge ${(isMale ? (primary.isOddSign && primary.navamsaIsOdd) : (primary.isEvenSign && primary.navamsaIsEven)) ? 'badge-green' : 'badge-gold'}" style="margin-top: 8px; font-size: 0.78rem;">
              ${primary.status}
            </div>
          </div>

          <!-- Partner Theoretical Reference (Collapsible) -->
          <details style="margin-top: 12px; font-size: 0.78rem; color: var(--text-muted);">
            <summary style="cursor: pointer; color: var(--text-dim); font-size: 0.76rem; user-select: none;">
              🔍 Click to view theoretical partner reference (${partnerTitle})
            </summary>
            <div class="bhava-sphuta-subcard" style="border-left: 2px solid rgba(255, 255, 255, 0.2); margin-top: 8px; background: rgba(0, 0, 0, 0.25);">
              <div class="bhava-sphuta-title">
                <span style="color: var(--text-muted);">${partner.name} (Theoretical Reference)</span>
                <span style="font-size: 0.78rem; color: var(--text-dim);">${partner.degFormatted}</span>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-main);">
                ${partner.signName} (${partner.sanskritSign}) • Navamsa: ${partner.navamsaSign}
              </div>
              <div style="font-size: 0.74rem; color: var(--text-dim);">
                Formula: <code>${partner.formula}</code>
              </div>
              <p style="font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; font-style: italic;">
                Note: In actual practice, this metric must be calculated from the partner's own birth chart, not the native's chart.
              </p>
            </div>
          </details>
        </div>
      `;
    }

    if (report.progenyWindows && report.progenyWindows.windows) {
      const pw = report.progenyWindows;
      const pts = pw.sensitivePoints;
      html += `
        <div class="bhava-lord-card" style="border-color: rgba(245, 158, 11, 0.4); background: linear-gradient(135deg, rgba(25, 20, 10, 0.85) 0%, rgba(15, 12, 10, 0.95) 100%);">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">👶</span>
              <h4 style="color: var(--gold-light);">K.N. Rao's Double Transit Childbirth Windows Timeline (Ages 18 to 50)</h4>
            </div>
            <span class="bhava-badge badge-gold">
              <span>${pw.totalWindowsFound} Windows Found</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Ground Truth (Mehta Ch. 5, pp. 97–99)</strong>: Within 9 months of childbirth, <strong>Saturn</strong> and <strong>Jupiter</strong> must simultaneously transit or aspect at least one of the 4 Sensitive Points. Mars triggers within 75 days, and the Moon triggers the delivery.
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
            ${pts.map(p => `
              <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 4px; padding: 4px 10px; font-size: 0.78rem;">
                <span style="color: var(--text-dim);">${p.type}:</span> <strong style="color: var(--gold-light);">${p.signName}</strong>
              </div>
            `).join('')}
          </div>

          ${pw.activeWindow ? `
            <div class="bhava-progeny-active-callout">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #FCD34D; font-size: 0.9rem;">✨ ACTIVE HIGH-PROBABILITY CHILDBIRTH WINDOW RIGHT NOW</strong>
                <span class="badge-active-now">Current Phase</span>
              </div>
              <div style="font-size: 0.84rem; color: #FFF; margin-bottom: 4px;">
                <strong>${pw.activeWindow.dateRange}</strong> (${pw.activeWindow.ageRange}) • Duration: <strong>${pw.activeWindow.duration}</strong> • Strength: <strong>${pw.activeWindow.rating}</strong> <span style="font-size: 0.76rem; color: var(--gold-light);">[${pw.activeWindow.tierName}]</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: ${pw.nextUpcomingWindow ? '6px' : '0'};">
                🪐 Saturn in <strong>${pw.activeWindow.saturnPlacement}</strong> (Aspecting: ${pw.activeWindow.saturnActivations.join(', ')})<br>
                ♃ Jupiter in <strong>${pw.activeWindow.jupiterPlacement}</strong> (Aspecting: ${pw.activeWindow.jupiterActivations.join(', ')})
              </div>
              ${pw.nextUpcomingWindow ? `
                <div style="padding-top: 6px; border-top: 1px dashed rgba(245, 158, 11, 0.2); font-size: 0.76rem; color: #94A3B8;">
                  <span style="color: var(--gold-light); font-weight: 600;">Next Peak Window:</span> ${pw.nextUpcomingWindow.dateRange} (${pw.nextUpcomingWindow.ageRange}) • ${pw.nextUpcomingWindow.duration} • ${pw.nextUpcomingWindow.rating}
                </div>
              ` : ''}
            </div>
          ` : (pw.nextUpcomingWindow ? `
            <div class="bhava-progeny-active-callout" style="border-color: rgba(56, 189, 248, 0.4); background: linear-gradient(135deg, rgba(14, 28, 48, 0.85) 0%, rgba(10, 18, 32, 0.95) 100%);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #38BDF8; font-size: 0.9rem;">🌟 UPCOMING PROBABLE CONCEPTION / CHILDBIRTH WINDOW</strong>
                <span class="badge-upcoming">Upcoming Phase</span>
              </div>
              <div style="font-size: 0.84rem; color: #FFF; margin-bottom: 4px;">
                <strong>${pw.nextUpcomingWindow.dateRange}</strong> (${pw.nextUpcomingWindow.ageRange}) • Duration: <strong>${pw.nextUpcomingWindow.duration}</strong> • Strength: <strong>${pw.nextUpcomingWindow.rating}</strong>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                🪐 Saturn in <strong>${pw.nextUpcomingWindow.saturnPlacement}</strong> (Aspecting: ${pw.nextUpcomingWindow.saturnActivations.join(', ')})<br>
                ♃ Jupiter in <strong>${pw.nextUpcomingWindow.jupiterPlacement}</strong> (Aspecting: ${pw.nextUpcomingWindow.jupiterActivations.join(', ')})
              </div>
            </div>
          ` : '')}

          <div class="bhava-progeny-table-wrapper">
            <table class="bhava-progeny-table">
              <thead>
                <tr>
                  <th>Age Range</th>
                  <th>Timeline Window</th>
                  <th>Duration</th>
                  <th>Saturn Transit & Activations</th>
                  <th>Jupiter Transit & Activations</th>
                  <th>Strength</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${pw.windows.map(w => {
                  const isActive = w.status.includes('Active Right Now');
                  return `
                    <tr class="${isActive ? 'row-active-now' : ''}">
                      <td><strong>${w.ageRange}</strong></td>
                      <td style="color: var(--gold-light); font-weight: 600;">${w.dateRange}</td>
                      <td>${w.duration}</td>
                      <td style="font-size: 0.76rem;">
                        <span style="color: #94A3B8;">${w.saturnPlacement}</span><br>
                        <span style="color: #38BDF8;">${w.saturnActivations.join(', ')}</span>
                      </td>
                      <td style="font-size: 0.76rem;">
                        <span style="color: #FCD34D;">${w.jupiterPlacement}</span><br>
                        <span style="color: #34D399;">${w.jupiterActivations.join(', ')}</span>
                      </td>
                      <td style="color: var(--gold-primary); font-size: 0.85rem;">${w.rating}</td>
                      <td>
                        <span class="${isActive ? 'badge-active-now' : (w.status.includes('Upcoming') ? 'badge-upcoming' : 'badge-historical')}">
                          ${isActive ? 'Active Now ⭐' : (w.status.includes('Upcoming') ? 'Upcoming' : 'Passed')}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // 2.7 Ayur-Jyotish Medical Vulnerability Profile & Shatru Diagnostics (when viewing House 6)
  if (currentHouse === 6 && report.medicalProfile) {
    const med = report.medicalProfile;
    html += `
      <div class="bhava-medical-card">
        <div class="bhava-lord-header">
          <div class="bhava-lord-title">
            <span style="font-size: 1.4rem;">🩺</span>
            <h4 style="color: #F43F5E;">Ayur-Jyotish Medical Vulnerability & Shatru Diagnostics</h4>
          </div>
          <span class="bhava-badge badge-red">
            <span>Roga Bhava Clinical Analysis</span>
          </span>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
          <strong>Classical Medical Foundation (Mehta Ch. 6, pp. 118–120 & Charaka Samhita)</strong>: 
          The 6th House (Shatru-Roga Bhava) determines bodily constitutional immunity, humoral imbalances (Tridoshas: Vata, Pitta, Kapha), and susceptibility to acute or lingering ailments during sub-dasha and transit triggers.
        </p>

        <!-- Base Anatomical Organs of House 6 -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; align-items: center;">
          <span style="font-size: 0.78rem; color: var(--text-dim);">Primary House Organs:</span>
          ${med.primaryHouseOrgans.map(org => `
            <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 4px; padding: 4px 10px; font-size: 0.78rem;">
              <strong style="color: #F43F5E;">${org}</strong>
            </div>
          `).join('')}
        </div>

        <!-- Vulnerabilities List -->
        <div class="bhava-medical-grid">
          ${med.vulnerabilities.map(v => {
            let doshaClass = 'dosha-vata';
            if (v.dosha.toLowerCase().includes('pitta')) doshaClass = 'dosha-pitta';
            else if (v.dosha.toLowerCase().includes('kapha')) doshaClass = 'dosha-kapha';

            return `
              <div class="bhava-medical-item">
                <div class="bhava-medical-item-header">
                  <span class="bhava-medical-source">${v.source}</span>
                  <span class="bhava-dosha-pill ${doshaClass}">${v.dosha}</span>
                </div>
                <div class="bhava-medical-organs">
                  🎯 Organs: ${v.organs.join(', ')}
                </div>
                <div class="bhava-medical-notes">
                  ${v.clinicalNotes}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 2.8 Marriage Double Transit Timeline, Kuja Dosha & Marital Harmony (when viewing House 7)
  if (currentHouse === 7) {
    // 2.8.1 K.N. Rao's Double Transit Marriage Windows Timeline
    if (report.marriageWindows && report.marriageWindows.windows) {
      const mw = report.marriageWindows;
      const pts = mw.sensitivePoints;
      html += `
        <div class="bhava-marriage-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">💍</span>
              <h4 style="color: #F43F5E;">K.N. Rao's Double Transit Marriage Windows Timeline (Ages 18 to 45)</h4>
            </div>
            <span class="bhava-badge badge-red">
              <span>${mw.totalWindowsFound} Windows Found</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Ground Truth (K.N. Rao & Mehta Ch. 7, p. 147)</strong>: 
            For marriage to materialize, <strong>Saturn</strong> and <strong>Jupiter</strong> must simultaneously transit or aspect at least one of the 4 Marriage Sensitive Points: <strong>Lagna / Lagna Lord</strong> (self entering matrimonial bond), <strong>7th House / 7th Lord</strong> (spouse & partnership), <strong>Kalatra Karaka Venus</strong>, or <strong>Upapada Lagna (UL)</strong>.
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
            ${pts.map(p => `
              <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 4px; padding: 4px 10px; font-size: 0.78rem;">
                <span style="color: var(--text-dim);">${p.type}:</span> <strong style="color: #F43F5E;">${p.signName}</strong>
              </div>
            `).join('')}
          </div>

          ${mw.activeWindow ? `
            <div class="bhava-progeny-active-callout" style="border-color: #F43F5E; background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(225, 29, 72, 0.05) 100%);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #FDA4AF; font-size: 0.9rem;">✨ ACTIVE HIGH-PROBABILITY MARRIAGE WINDOW RIGHT NOW</strong>
                <span class="badge-active-now" style="background: rgba(244, 63, 94, 0.25); color: #FDA4AF; border-color: #F43F5E;">Current Phase</span>
              </div>
              <div style="font-size: 0.84rem; color: #FFF; margin-bottom: 4px;">
                <strong>${mw.activeWindow.dateRange}</strong> (${mw.activeWindow.ageRange}) • Duration: <strong>${mw.activeWindow.duration}</strong> • Strength: <strong>${mw.activeWindow.rating}</strong> <span style="font-size: 0.76rem; color: #FDA4AF;">[${mw.activeWindow.tierName}]</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: ${mw.nextUpcomingWindow ? '6px' : '0'};">
                🪐 Saturn in <strong>${mw.activeWindow.saturnPlacement}</strong> (Aspecting: ${mw.activeWindow.saturnActivations.join(', ')})<br>
                ♃ Jupiter in <strong>${mw.activeWindow.jupiterPlacement}</strong> (Aspecting: ${mw.activeWindow.jupiterActivations.join(', ')})
              </div>
              ${mw.nextUpcomingWindow ? `
                <div style="padding-top: 6px; border-top: 1px dashed rgba(244, 63, 94, 0.2); font-size: 0.76rem; color: #94A3B8;">
                  <span style="color: #FDA4AF; font-weight: 600;">Next Peak Window:</span> ${mw.nextUpcomingWindow.dateRange} (${mw.nextUpcomingWindow.ageRange}) • ${mw.nextUpcomingWindow.duration} • ${mw.nextUpcomingWindow.rating}
                </div>
              ` : ''}
            </div>
          ` : (mw.nextUpcomingWindow ? `
            <div class="bhava-progeny-active-callout" style="border-color: rgba(56, 189, 248, 0.4); background: linear-gradient(135deg, rgba(14, 28, 48, 0.85) 0%, rgba(10, 18, 32, 0.95) 100%);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #38BDF8; font-size: 0.9rem;">🌟 UPCOMING PROBABLE MARRIAGE WINDOW</strong>
                <span class="badge-upcoming">Upcoming Phase</span>
              </div>
              <div style="font-size: 0.84rem; color: #FFF; margin-bottom: 4px;">
                <strong>${mw.nextUpcomingWindow.dateRange}</strong> (${mw.nextUpcomingWindow.ageRange}) • Duration: <strong>${mw.nextUpcomingWindow.duration}</strong> • Strength: <strong>${mw.nextUpcomingWindow.rating}</strong>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                🪐 Saturn in <strong>${mw.nextUpcomingWindow.saturnPlacement}</strong> (Aspecting: ${mw.nextUpcomingWindow.saturnActivations.join(', ')})<br>
                ♃ Jupiter in <strong>${mw.nextUpcomingWindow.jupiterPlacement}</strong> (Aspecting: ${mw.nextUpcomingWindow.jupiterActivations.join(', ')})
              </div>
            </div>
          ` : '')}

          <div class="bhava-progeny-table-wrapper">
            <table class="bhava-progeny-table">
              <thead>
                <tr>
                  <th>Age Range</th>
                  <th>Timeline Window</th>
                  <th>Duration</th>
                  <th>Saturn Transit & Activations</th>
                  <th>Jupiter Transit & Activations</th>
                  <th>Strength</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${mw.windows.map(w => {
                  const isActive = w.status.includes('Active Right Now');
                  return `
                    <tr class="${isActive ? 'row-active-now' : ''}">
                      <td><strong>${w.ageRange}</strong></td>
                      <td style="color: #FDA4AF; font-weight: 600;">${w.dateRange}</td>
                      <td>${w.duration}</td>
                      <td style="font-size: 0.76rem;">
                        <span style="color: #94A3B8;">${w.saturnPlacement}</span><br>
                        <span style="color: #38BDF8;">${w.saturnActivations.join(', ')}</span>
                      </td>
                      <td style="font-size: 0.76rem;">
                        <span style="color: #FCD34D;">${w.jupiterPlacement}</span><br>
                        <span style="color: #34D399;">${w.jupiterActivations.join(', ')}</span>
                      </td>
                      <td style="color: #F43F5E; font-size: 0.85rem;">${w.rating}</td>
                      <td>
                        <span class="${isActive ? 'badge-active-now' : (w.status.includes('Upcoming') ? 'badge-upcoming' : 'badge-historical')}">
                          ${isActive ? 'Active Now ⭐' : (w.status.includes('Upcoming') ? 'Upcoming' : 'Passed')}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 2.8.2 Classical Kuja Dosha (Manglik) Diagnostic Card
    if (report.kujaDosha) {
      const kd = report.kujaDosha;
      const isCancelled = kd.isCancelled;
      const hasDosha = kd.hasKujaDosha;
      const badgeClass = !hasDosha ? 'badge-green' : (isCancelled ? 'badge-blue' : 'badge-red');

      html += `
        <div class="bhava-kuja-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">⚔️</span>
              <h4 style="color: #EF4444;">Classical Kuja Dosha (Manglik) Diagnostic Engine</h4>
            </div>
            <span class="bhava-badge ${badgeClass}">
              <span>${kd.verdict}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Foundational Shloka (Brihat Parashara & Mehta Ch. 7, pp. 148–155)</strong>: 
            <em>"Dhane vyaye cha patale jamitre chashtame kuja..."</em> Evaluates Mars in houses 1, 2, 4, 7, 8, 12 from Lagna, Moon, and Venus, checked against Dr. B.V. Raman's 9 classical exceptions.
          </p>

          <div class="bhava-kuja-grid">
            <div class="bhava-kuja-box">
              <span style="font-size: 0.76rem; color: var(--text-dim);">From Lagna (Ascendant)</span>
              <strong style="color: ${kd.fromLagna.isManglik ? '#F87171' : '#34D399'}; font-size: 0.95rem;">
                House ${kd.fromLagna.house} ${kd.fromLagna.isManglik ? '⚠️ (Manglik)' : '✓ (Safe)'}
              </strong>
            </div>

            <div class="bhava-kuja-box">
              <span style="font-size: 0.76rem; color: var(--text-dim);">From Chandra (Moon)</span>
              <strong style="color: ${kd.fromMoon?.isManglik ? '#F87171' : '#34D399'}; font-size: 0.95rem;">
                House ${kd.fromMoon ? kd.fromMoon.house : 'N/A'} ${kd.fromMoon?.isManglik ? '⚠️ (Chandra Manglik)' : '✓ (Safe)'}
              </strong>
            </div>

            <div class="bhava-kuja-box">
              <span style="font-size: 0.76rem; color: var(--text-dim);">From Shukra (Venus)</span>
              <strong style="color: ${kd.fromVenus?.isManglik ? '#F87171' : '#34D399'}; font-size: 0.95rem;">
                House ${kd.fromVenus ? kd.fromVenus.house : 'N/A'} ${kd.fromVenus?.isManglik ? '⚠️ (Shukra Manglik)' : '✓ (Safe)'}
              </strong>
            </div>
          </div>

          ${kd.cancellationReasons.length > 0 ? `
            <div style="margin-top: 14px; padding: 12px 14px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md);">
              <div style="font-size: 0.82rem; font-weight: 700; color: #38BDF8; margin-bottom: 6px;">
                🛡️ Classical Exceptions & Cancellations (Dr. B.V. Raman Rules Applied):
              </div>
              <ul style="font-size: 0.78rem; color: #E2E8F0; margin: 0; padding-left: 18px; line-height: 1.5;">
                ${kd.cancellationReasons.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }

    // 2.8.3 Marital Harmony & Upapada Lagna (UL) Card
    if (report.maritalHarmony) {
      const mh = report.maritalHarmony;
      const ul = mh.jaiminiPadas?.UL;
      const a7 = mh.jaiminiPadas?.A7;

      html += `
        <div class="bhava-harmony-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">💑</span>
              <h4 style="color: #C084FC;">Marital Harmony & Upapada Lagna (UL) Architecture</h4>
            </div>
            <span class="bhava-badge ${mh.mutualDisposition.includes('6/8') ? 'badge-red' : (mh.mutualDisposition.includes('5/9') || mh.mutualDisposition.includes('1/7') ? 'badge-green' : 'badge-gold')}">
              <span>${mh.mutualDisposition}</span>
            </span>
          </div>

          <!-- Lagna Lord vs 7th Lord Relationship -->
          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 14px;">
            <div style="font-size: 0.88rem; font-weight: 700; color: #E2E8F0; margin-bottom: 4px;">
              Lagna Lord vs. 7th Lord Relationship: <span style="color: var(--gold-light);">${mh.dispositionType}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.5;">
              ${mh.dispositionNote}
            </p>
          </div>

          <!-- Upapada Lagna & Darapada Grid -->
          <div class="bhava-kuja-grid">
            ${ul ? `
              <div class="bhava-kuja-box" style="border-left: 3px solid #C084FC;">
                <span style="font-size: 0.74rem; color: var(--text-dim);">Upapada Lagna (UL - 12th Pada)</span>
                <strong style="color: #C084FC; font-size: 0.92rem;">
                  ${ul.signName} (House ${ul.houseNumber} from Lagna)
                </strong>
                <p style="font-size: 0.76rem; color: var(--text-muted); margin: 2px 0 0 0; line-height: 1.4;">
                  ${mh.ulSustenanceNote}
                </p>
              </div>
            ` : ''}

            ${a7 ? `
              <div class="bhava-kuja-box" style="border-left: 3px solid #F43F5E;">
                <span style="font-size: 0.74rem; color: var(--text-dim);">Darapada (A7 - 7th Pada)</span>
                <strong style="color: #FDA4AF; font-size: 0.92rem;">
                  ${a7.signName} (House ${a7.houseNumber} from Lagna)
                </strong>
                <p style="font-size: 0.76rem; color: var(--text-muted); margin: 2px 0 0 0; line-height: 1.4;">
                  Governs physical attraction, partner's business manifestations, and sexual harmony.
                </p>
              </div>
            ` : ''}
          </div>

          ${mh.venusHealth.length > 0 ? `
            <div style="margin-top: 14px; padding: 10px 14px; background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-sm); border-left: 3px solid #FCD34D;">
              ${mh.venusHealth.map(vh => `
                <div style="font-size: 0.78rem; color: #E2E8F0; line-height: 1.45;">
                  <strong style="color: #FCD34D;">Kalatra Karaka Venus:</strong> ${vh.status} — ${vh.note}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  // 2.9 Longevity Determination, 7 Chhidra Grahas & Virasat Engine (when viewing House 8)
  if (currentHouse === 8) {
    // 2.9.1 Jaimini 3-Pairs Longevity Kakshya & Transition Tatva
    if (report.longevityProfile) {
      const lp = report.longevityProfile;
      const kk = report.khareshKharaNavamsa;
      const kakshyaBadge = lp.finalKakshya === 'Purnayu' ? 'badge-green' : (lp.finalKakshya === 'Madhyayu' ? 'badge-blue' : 'badge-gold');

      html += `
        <div class="bhava-longevity-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">⌛</span>
              <h4 style="color: #C084FC;">Longevity Determination Engine (Ayu Kakshya &amp; Ayur Tatva)</h4>
            </div>
            <span class="bhava-badge ${kakshyaBadge}">
              <span>${lp.finalKakshya}: ${lp.estimatedSpan}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Authority (Jaimini Upadesha Sutras 2.1; BPHS Ayurdaya; Mehta Ch. 8, pp. 165–172)</strong>: 
            Lifespan is evaluated by synthesizing the three fundamental mobility pairs (Chara/Sthira/Dwisvabhava), modified by Ayushkaraka Saturn and Chandra Raksha protection.
          </p>

          <!-- Consensus Banner -->
          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 0.74rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;">Consensus Verdict</span>
              <div style="font-size: 0.92rem; font-weight: 700; color: #E9D5FF;">${lp.consensusRule}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.74rem; color: var(--text-dim);">Transition Tatva</span>
              <div style="font-size: 0.88rem; font-weight: 600; color: #FCD34D;">${lp.tatva.tatva}</div>
            </div>
          </div>

          <!-- 3 Pairs Grid -->
          <div class="bhava-kuja-grid">
            ${lp.pairs.map(p => `
              <div class="bhava-pair-box" style="border-left: 3px solid ${p.kakshya === 'Purnayu' ? '#34D399' : (p.kakshya === 'Madhyayu' ? '#38BDF8' : '#FCD34D')};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.76rem; color: var(--text-dim); font-weight: 600;">${p.name}</span>
                  <span class="bhava-badge ${p.kakshya === 'Purnayu' ? 'badge-green' : (p.kakshya === 'Madhyayu' ? 'badge-blue' : 'badge-gold')}" style="font-size: 0.68rem; padding: 1px 6px;">
                    ${p.kakshya}
                  </span>
                </div>
                <div style="font-size: 0.84rem; color: #F1F5F9; font-weight: 600; margin-top: 2px;">
                  ${p.p1Name} &amp; ${p.p2Name}
                </div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">
                  Mobility: <span style="color: #CBD5E1;">${p.mobilities.join(' + ')}</span> &bull; Span: <span style="color: var(--gold-light);">${p.spanYears}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Modifiers & Chandra Raksha -->
          ${lp.modifiers.length > 0 ? `
            <div style="margin-top: 14px; padding: 12px 14px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md);">
              <div style="font-size: 0.82rem; font-weight: 700; color: #C084FC; margin-bottom: 6px;">
                🛡️ Classical Longevity Protections &amp; Modifiers:
              </div>
              <ul style="font-size: 0.78rem; color: #E2E8F0; margin: 0; padding-left: 18px; line-height: 1.5;">
                ${lp.modifiers.map(m => `<li><strong>${m.factor}:</strong> ${m.effect}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Tatva Mode of Transition -->
          <div style="margin-top: 12px; font-size: 0.78rem; color: var(--text-dim); line-height: 1.45; font-style: italic;">
            * Mode of Transition (${lp.tatva.tatva}): ${lp.tatva.description}
          </div>
        </div>
      `;
    }

    // 2.9.2 Parashari 7 Chhidra Grahas & Critical Transition Points
    if (report.chhidraGrahas && report.chhidraGrahas.length > 0) {
      const cgList = report.chhidraGrahas;
      const kk = report.khareshKharaNavamsa;

      html += `
        <div class="bhava-chhidra-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">⚔️</span>
              <h4 style="color: #F59E0B;">Parashara's 7 Chhidra Grahas (छिद्र ग्रह — Vulnerability &amp; Critical Dashas)</h4>
            </div>
            <span class="bhava-badge badge-gold">
              <span>BPHS Ch. 44 &amp; Mehta Ch. 8</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Maharishi Parashara's Canon</strong>: 
            The 7 Chhidra Grahas are the specific planets having sovereignty over bodily vulnerability, physical crises, or transition. Their main dasha or sub-periods (especially when transited by Saturn or Rahu) require astrological awareness and health vigilance.
          </p>

          <!-- 22nd Drekkana & 64th Navamsa Highlight Bar -->
          ${kk ? `
            <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
              <div style="border-left: 3px solid #F59E0B; padding-left: 10px;">
                <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">22nd Drekkana Lord (Kharesh)</div>
                <div style="font-size: 0.95rem; font-weight: 700; color: #FCD34D;">${kk.kharesh.lordName} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">(${kk.kharesh.signName} in D3)</span></div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">${kk.kharesh.partitionRange}</div>
              </div>
              <div style="border-left: 3px solid #EF4444; padding-left: 10px;">
                <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">64th Navamsa Lord (from Moon)</div>
                <div style="font-size: 0.95rem; font-weight: 700; color: #F87171;">${kk.kharaNavamsa.lordName} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">(${kk.kharaNavamsa.signName} in D9)</span></div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">Khara Navamsa from Moon (${kk.kharaNavamsa.moonDegInSign})</div>
              </div>
            </div>
          ` : ''}

          <!-- 7 Chhidra Grahas Grid -->
          <div class="bhava-chhidra-grid">
            ${cgList.map(cg => `
              <div class="bhava-chhidra-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.72rem; color: #F59E0B; font-weight: 700; text-transform: uppercase;">#${cg.roleNumber} ${cg.roleTitle}</span>
                  <span style="font-size: 0.76rem; font-weight: 700; color: ${cg.planets[0] === 'None' ? 'var(--text-dim)' : '#FCD34D'};">
                    ${cg.planets.join(', ')}
                  </span>
                </div>
                <p style="font-size: 0.77rem; color: var(--text-muted); margin: 0; line-height: 1.45;">
                  ${cg.details}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2.9.3 Virasat & Daiva Labha (Unearned Wealth & Legacies)
    if (report.virasatAnalysis) {
      const va = report.virasatAnalysis;

      html += `
        <div class="bhava-virasat-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🏛️</span>
              <h4 style="color: #34D399;">Virasat &amp; Daiva Labha (Inheritances, Legacies &amp; Sudden Wealth)</h4>
            </div>
            <span class="bhava-badge ${va.score >= 4 ? 'badge-green' : (va.score >= 2 ? 'badge-blue' : 'badge-gold')}">
              <span>${va.potential}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Mehta Ch. 8 Principles (pp. 165–172)</strong>: 
            The 8th house governs unearned fortunes, partner's accumulated treasury (2nd from 7th), family wills, insurance settlements, and unexpected windfalls.
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${va.indications.map(ind => `
              <div style="background: rgba(0, 0, 0, 0.35); border-left: 3px solid #34D399; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.8rem; color: #E2E8F0; line-height: 1.45;">
                ${ind}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // 2.10 House 9: Dharma-Karmadhipati Raja Yoga, Bhagya Karta, Pitri & Foreign Travel Engine
  if (currentHouse === 9) {
    // 2.10.1 Dharma-Karmadhipati Raja Yoga Card
    if (report.dharmaKarmaYoga) {
      const dky = report.dharmaKarmaYoga;
      html += `
        <div class="bhava-dharmakarma-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">👑</span>
              <h4 style="color: #F59E0B;">Dharma-Karmadhipati Raja Yoga Engine (धर्म-कर्माधिपति राजयोग)</h4>
            </div>
            <span class="bhava-badge ${dky.isFormed ? 'badge-green' : 'badge-gold'}">
              <span>${dky.isFormed ? dky.rating : 'Independent Operation'}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Ground Truth (BPHS Ch. 34, Phala Deepika Ch. 6, Mehta Ch. 9 p. 176)</strong>: 
            The alliance between the lord of the 9th house (Supreme Trikona / Fortune) and the lord of the 10th house (Supreme Kendra / Profession) forms the highest king-making Raja Yoga in Parashari Jyotish, conferring sovereign rank, administrative power, unblemished integrity, and lasting renown.
          </p>

          <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 0.95rem; font-weight: 700; color: #FCD34D;">${dky.title}</span>
              <span style="font-size: 0.76rem; color: #34D399; font-weight: 600;">Sambandha: ${dky.sambandhaType}</span>
            </div>
            <p style="font-size: 0.82rem; color: #E2E8F0; margin: 0 0 6px 0; line-height: 1.5;">
              ${dky.description}
            </p>
            <div style="font-size: 0.78rem; color: var(--gold-light); font-style: italic;">
              ${dky.effects}
            </div>
          </div>
        </div>
      `;
    }

    // 2.10.2 Bhagya & Lakshmi Yoga Matrix (Dispositor Bhagya Karta)
    if (report.bhagyaProfile) {
      const bp = report.bhagyaProfile;
      const bk = bp.bhagyaKarta;

      html += `
        <div class="bhava-bhagya-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">☸️</span>
              <h4 style="color: #38BDF8;">Bhagya Matrix &amp; Dispositor Bhagya Karta Architecture</h4>
            </div>
            <span class="bhava-badge ${bp.badgeColor}">
              <span>${bp.verdict}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Haveli Ram Mehta's Cardinal Dictum (Ch. 9, p. 180)</strong>: 
            <em>"Importance of Bhagya Karta. Dispositor of Lord of 9th. If it is well disposed also takes the individual to great heights. A favourable Bhagyapati in Kendra or Kona lifts a person from ordinary to great success."</em>
          </p>

          <div class="bhava-kuja-grid">
            <!-- Box 1: Bhagya Karta -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #38BDF8;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.74rem; color: var(--text-dim); text-transform: uppercase;">Bhagya Karta (Dispositor)</span>
                <span class="bhava-badge ${bk.isKendraKona ? 'badge-green' : 'badge-gold'}" style="font-size: 0.68rem; padding: 1px 6px;">
                  ${bk.isKendraKona ? 'Kendra / Kona' : 'Upachaya / Dusthana'}
                </span>
              </div>
              <strong style="color: #38BDF8; font-size: 0.95rem;">
                ${bk.lordName} in House ${bk.house} (${bk.dignity})
              </strong>
              <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0; line-height: 1.45;">
                ${bk.note}
              </p>
            </div>

            <!-- Box 2: Lakshmi Yoga Status -->
            <div class="bhava-kuja-box" style="border-left: 3px solid ${bp.hasLakshmiYoga ? '#34D399' : 'rgba(255,255,255,0.2)'};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.74rem; color: var(--text-dim); text-transform: uppercase;">Lakshmi Yoga Status</span>
                <span class="bhava-badge ${bp.hasLakshmiYoga ? 'badge-green' : 'badge-gold'}" style="font-size: 0.68rem; padding: 1px 6px;">
                  ${bp.hasLakshmiYoga ? 'Active ⭐' : 'Inactive'}
                </span>
              </div>
              <strong style="color: ${bp.hasLakshmiYoga ? '#34D399' : 'var(--text-muted)'}; font-size: 0.92rem;">
                ${bp.hasLakshmiYoga ? 'Lakshmi Yoga Fully Formed' : 'Standard Venusian Support'}
              </strong>
              <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0; line-height: 1.45;">
                ${bp.hasLakshmiYoga ? '9th Lord and Venus both fortified in own/exalted dignity in Kendras/Trikonas, granting unshakeable prosperity.' : 'Requires 9th Lord and Venus in own/exaltation sign in Kendra or Trikona.'}
              </p>
            </div>

            <!-- Box 3: 2nd & 9th Maha Dhana Nexus -->
            <div class="bhava-kuja-box" style="border-left: 3px solid ${bp.mahaDhanaYoga ? '#FCD34D' : 'rgba(255,255,255,0.2)'};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.74rem; color: var(--text-dim); text-transform: uppercase;">2nd &amp; 9th Dhana Link</span>
                <span class="bhava-badge ${bp.mahaDhanaYoga ? 'badge-gold' : 'badge-green'}" style="font-size: 0.68rem; padding: 1px 6px;">
                  ${bp.mahaDhanaYoga ? 'Formed' : 'Independent'}
                </span>
              </div>
              <strong style="color: #FCD34D; font-size: 0.92rem;">
                ${bp.mahaDhanaYoga ? 'Maha Dhana Yoga Active' : 'Standard Dhana Alignment'}
              </strong>
              <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0; line-height: 1.45;">
                ${bp.mahaDhanaYoga ? bp.dhanaDetails : '2nd and 9th lords operate independently through their natural houses.'}
              </p>
            </div>
          </div>
        </div>
      `;
    }

    // 2.10.3 Pitri Bhava & Paternal Well-being Diagnostic
    if (report.pitriProfile) {
      const pp = report.pitriProfile;
      html += `
        <div class="bhava-pitru-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">☀️</span>
              <h4 style="color: #FB923C;">Pitri Bhava &amp; Paternal Well-being Engine (पितृ विचार)</h4>
            </div>
            <span class="bhava-badge badge-gold">
              <span>${pp.birthType}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Parashari &amp; Mehta Dictum (Ch. 9, pp. 180–181)</strong>: 
            The father's longevity and fortune are evaluated from the 9th house, 10th house (2nd/Maraka from 9th), and the primary Pitru Karaka (Sun for day births; Saturn for night births).
          </p>

          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(251, 146, 60, 0.3); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 12px;">
            <div style="font-size: 0.86rem; font-weight: 700; color: #FB923C; margin-bottom: 4px;">
              Primary Pitru Karaka: ${pp.karakaName} in House ${pp.karakaHouse} (${pp.karakaDignity})
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Paternal Disposition: <strong style="color: #FCD34D;">${pp.paternalBond}</strong>
            </div>
          </div>

          <div class="bhava-kuja-grid">
            <!-- Protections -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #34D399;">
              <span style="font-size: 0.74rem; color: #34D399; font-weight: 700; text-transform: uppercase;">🛡️ Paternal Protections &amp; Fortifications</span>
              <ul style="font-size: 0.76rem; color: #E2E8F0; margin: 0; padding-left: 16px; line-height: 1.45;">
                ${pp.protections.map(pr => `<li>${pr}</li>`).join('')}
              </ul>
            </div>

            <!-- Vulnerabilities -->
            <div class="bhava-kuja-box" style="border-left: 3px solid ${pp.vulnerabilities[0]?.includes('No acute') ? '#34D399' : '#F87171'};">
              <span style="font-size: 0.74rem; color: ${pp.vulnerabilities[0]?.includes('No acute') ? '#34D399' : '#F87171'}; font-weight: 700; text-transform: uppercase;">⚠️ Paternal Vulnerability Scrutiny</span>
              <ul style="font-size: 0.76rem; color: #E2E8F0; margin: 0; padding-left: 16px; line-height: 1.45;">
                ${pp.vulnerabilities.map(vl => `<li>${vl}</li>`).join('')}
              </ul>
            </div>
          </div>

          ${pp.parasharaRichFather.length > 0 && !pp.parasharaRichFather[0].includes('operates through general') ? `
            <div style="margin-top: 12px; padding: 10px 12px; background: rgba(251, 146, 60, 0.08); border-radius: var(--radius-sm); border-left: 3px solid #FCD34D;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #FCD34D; margin-bottom: 4px;">👑 Parashari Affluent Father Indicators:</div>
              <ul style="font-size: 0.76rem; color: #E2E8F0; margin: 0; padding-left: 16px; line-height: 1.45;">
                ${pp.parasharaRichFather.map(rf => `<li>${rf}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }

    // 2.10.4 Teertha Yatra, Foreign Travel & Higher Education Card
    if (report.travelProfile) {
      const tp = report.travelProfile;
      html += `
        <div class="bhava-travel-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">✈️</span>
              <h4 style="color: #2DD4BF;">Teertha Yatra, Foreign Travel &amp; Higher Education Engine</h4>
            </div>
            <span class="bhava-badge badge-blue">
              <span>9th &amp; 12th House Nexus</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Uttara Kalamrita &amp; Mehta Ch. 9 Principles</strong>: 
            The 9th house governs long voyages across oceans, spiritual pilgrimages (Teertha Yatra), higher doctoral research, and foreign language mastery.
          </p>

          <div class="bhava-kuja-grid">
            <!-- Teertha Yatra -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #38BDF8;">
              <span style="font-size: 0.74rem; color: #38BDF8; font-weight: 700; text-transform: uppercase;">🕉️ Pilgrimages &amp; Holy Shrines (Teertha Yatra)</span>
              <strong style="color: #E2E8F0; font-size: 0.86rem;">Potential: ${tp.teerthaYatra.potential}</strong>
              <ul style="font-size: 0.76rem; color: var(--text-muted); margin: 0; padding-left: 16px; line-height: 1.45;">
                ${tp.teerthaYatra.indicators.map(ind => `<li>${ind}</li>`).join('')}
              </ul>
            </div>

            <!-- Foreign Travel -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #2DD4BF;">
              <span style="font-size: 0.74rem; color: #2DD4BF; font-weight: 700; text-transform: uppercase;">🌍 Foreign Voyages &amp; Overseas Residence</span>
              <strong style="color: #E2E8F0; font-size: 0.86rem;">Potential: ${tp.foreignTravel.potential}</strong>
              <ul style="font-size: 0.76rem; color: var(--text-muted); margin: 0; padding-left: 16px; line-height: 1.45;">
                ${tp.foreignTravel.indicators.map(ind => `<li>${ind}</li>`).join('')}
              </ul>
            </div>

            <!-- Higher Education -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #A78BFA;">
              <span style="font-size: 0.74rem; color: #A78BFA; font-weight: 700; text-transform: uppercase;">🎓 Higher Education &amp; Authorship</span>
              <strong style="color: #E2E8F0; font-size: 0.86rem;">Potential: ${tp.higherEducation.potential}</strong>
              <ul style="font-size: 0.76rem; color: var(--text-muted); margin: 0; padding-left: 16px; line-height: 1.45;">
                ${tp.higherEducation.indicators.map(ind => `<li>${ind}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 2.11 House 10: Karma Bhava Engines (Amala Yoga, Digbala & Vocation, Simhasana & Stability)
  if (currentHouse === 10) {
    // 2.11.1 Amala Yoga Card
    if (report.amalaYoga) {
      const ay = report.amalaYoga;
      const badgeClass = ay.isFormed ? 'badge-green' : (ay.isConditional ? 'badge-gold' : 'badge-gold');
      html += `
        <div class="bhava-amala-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🌟</span>
              <h4 style="color: #38BDF8;">Amala Yoga Engine (अमल योग — Spotless Reputation &amp; Eminence)</h4>
            </div>
            <span class="bhava-badge ${badgeClass}">
              <span>${ay.isFormed ? ay.rating : (ay.isConditional ? 'Conditional / Blemished' : 'Independent')}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Ground Truth (Phala Deepika 6.64; Mehta Ch. 10, p. 186)</strong>: 
            <em>"When a natural benefic planet (Jupiter, Venus, Mercury) is placed in the 10th house from Lagna or Moon (free from malefic affliction), it gives rise to Amala Yoga — conferring an unblemished reputation, lasting prosperity, sovereign honor, and engagement in virtuous deeds throughout life."</em>
          </p>

          <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 0.95rem; font-weight: 700; color: #7DD3FC;">${ay.title}</span>
              <span style="font-size: 0.76rem; color: #34D399; font-weight: 600;">Status: ${ay.type}</span>
            </div>
            <p style="font-size: 0.82rem; color: #E2E8F0; margin: 0 0 6px 0; line-height: 1.5;">
              ${ay.description}
            </p>
            <div style="font-size: 0.78rem; color: var(--gold-light); font-style: italic;">
              ${ay.effects}
            </div>
          </div>
        </div>
      `;
    }

    // 2.11.2 Directional Strength (Digbala) & Vocational Profile Card
    if (report.careerProfile) {
      const cp = report.careerProfile;
      html += `
        <div class="bhava-vocation-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🎯</span>
              <h4 style="color: #F59E0B;">Digbala &amp; Vocational Stream Matrix (दशम भाव व्यवसाय निर्धारण)</h4>
            </div>
            <span class="bhava-badge ${cp.digbala.status !== 'None' ? 'badge-green' : 'badge-gold'}">
              <span>${cp.digbala.status !== 'None' ? '⚡ ' + cp.digbala.status : cp.cuspSign.element + ' Cusp Stream'}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Haveli Ram Mehta's Vocational Methodology (Ch. 10, pp. 186–205)</strong>: 
            Vocational trajectory is derived through directional strength (Sun &amp; Mars attain 100% Digbala in 10th Kendra), the elemental temperament of the 10th cusp (${cp.cuspSign.name} - ${cp.cuspSign.element}), 10th house occupants, and classical yogas like Satyacharya's performing arts rule.
          </p>

          ${cp.digbala.status !== 'None' ? `
            <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #F59E0B; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #FCD34D; margin-bottom: 2px;">
                ⚡ ${cp.digbala.title}
              </div>
              <div style="font-size: 0.78rem; color: #E2E8F0; line-height: 1.45;">
                ${cp.digbala.note}
              </div>
            </div>
          ` : ''}

          ${cp.satyacharyaArtistYoga ? `
            <div style="background: rgba(168, 85, 247, 0.12); border-left: 3px solid #C084FC; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: #E9D5FF;">🎭 ${cp.satyacharyaArtistYoga.title}</span>
                <span class="bhava-badge badge-purple" style="font-size: 0.7rem; padding: 1px 6px;">${cp.satyacharyaArtistYoga.rating}</span>
              </div>
              <p style="font-size: 0.78rem; color: #E2E8F0; margin: 0 0 4px 0; line-height: 1.45;">
                ${cp.satyacharyaArtistYoga.description}
              </p>
              <div style="font-size: 0.74rem; color: #FCD34D; font-weight: 600;">
                Domain Specialization: ${cp.satyacharyaArtistYoga.specialization}
              </div>
            </div>
          ` : ''}

          <!-- Vocational Streams Grid -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.5px;">
              Synthesized Professional Avenues &amp; Affinity Channels:
            </div>
            ${cp.vocationalStreams.map((vs, idx) => `
              <div style="background: rgba(0, 0, 0, 0.35); border-left: 3px solid ${idx === 0 ? '#34D399' : '#38BDF8'}; border-radius: var(--radius-sm); padding: 10px 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                  <strong style="color: #F8FAFC; font-size: 0.88rem;">${vs.category}</strong>
                  <span class="bhava-badge ${idx === 0 ? 'badge-green' : 'badge-gold'}" style="font-size: 0.7rem; padding: 1px 6px;">${vs.affinity}</span>
                </div>
                <div style="font-size: 0.78rem; color: #94A3B8; margin-bottom: 6px; line-height: 1.4;">
                  ${vs.rationale}
                </div>
                <div style="font-size: 0.75rem; color: #E2E8F0;">
                  <strong style="color: #CBD5E1;">Core Career Roles:</strong> ${vs.roles.join(' • ')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2.11.3 Simhasana & Sovereign High Office Raja Yoga Matrix
    if (report.statusProfile) {
      const sp = report.statusProfile;
      html += `
        <div class="bhava-simhasana-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🏛️</span>
              <h4 style="color: #A855F7;">Simhasana &amp; Sovereign High Office Matrix (क्षेत्र सिंहासन योग)</h4>
            </div>
            <span class="bhava-badge ${sp.score >= 70 ? 'badge-green' : 'badge-gold'}">
              <span>Authority Index: ${sp.score}/100</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Regal Status Architecture (Mehta Ch. 10, pp. 182–188, 214)</strong>: 
            Assesses sovereign command, gazetted executive authority with official seals (Mudradhikara), Parashara's boundless fame combinations, and royal throne aspects (Kshetra Simhasana Yoga).
          </p>

          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 12px;">
            <div style="font-size: 0.92rem; font-weight: 700; color: #E9D5FF; margin-bottom: 4px;">
              Evaluated Status Stature: <span style="color: #FCD34D;">${sp.rating}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              ${sp.hasKshetraSimhasana ? '👑 Kshetra Simhasana Yoga is actively energizing royal/governmental patronage.' : 'Executive stature develops steadily through institutional merit and strategic focus.'}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${sp.indicators.map(ind => `
              <div style="background: rgba(0, 0, 0, 0.25); border-left: 3px solid #C084FC; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.78rem; color: #E2E8F0; line-height: 1.45;">
                ${ind}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2.11.4 Career Stability vs. Volatility Diagnostics
    if (report.stabilityProfile) {
      const stp = report.stabilityProfile;
      html += `
        <div class="bhava-stability-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">⚓</span>
              <h4 style="color: #34D399;">Career Stability vs. Volatility Diagnostics (व्यवसाय स्थिरता विचार)</h4>
            </div>
            <span class="bhava-badge ${stp.score >= 65 ? 'badge-green' : (stp.score >= 45 ? 'badge-gold' : 'badge-red')}">
              <span>${stp.rating}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Parashari &amp; Mehta Dictum (Ch. 10, pp. 183–186)</strong>: 
            Evaluates occupational resilience versus breaks in career, sudden institutional reversals (8th/10th nexus), workplace disciplinary litigation (6th/10th), and foreign dissipation (12th/10th).
          </p>

          <div class="bhava-kuja-grid">
            <!-- Protective Fortifications -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #34D399;">
              <span style="font-size: 0.74rem; color: #34D399; font-weight: 700; text-transform: uppercase;">🛡️ Professional Anchor &amp; Resilience</span>
              <ul style="font-size: 0.76rem; color: #E2E8F0; margin: 0; padding-left: 16px; line-height: 1.45;">
                ${stp.protectiveFactors.map(pf => `<li>${pf}</li>`).join('')}
              </ul>
            </div>

            <!-- Vulnerability Scrutiny -->
            <div class="bhava-kuja-box" style="border-left: 3px solid ${stp.riskFactors[0]?.includes('No major') ? '#34D399' : '#F87171'};">
              <span style="font-size: 0.74rem; color: ${stp.riskFactors[0]?.includes('No major') ? '#34D399' : '#F87171'}; font-weight: 700; text-transform: uppercase;">⚠️ Volatility &amp; Hiatus Scrutiny</span>
              <ul style="font-size: 0.76rem; color: #E2E8F0; margin: 0; padding-left: 16px; line-height: 1.45;">
                ${stp.riskFactors.map(rf => `<li>${rf}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="margin-top: 12px; padding: 10px 14px; background: rgba(0, 0, 0, 0.3); border-radius: var(--radius-sm); border-left: 3px solid var(--gold-light); font-size: 0.78rem; color: #CBD5E1; line-height: 1.45;">
            <strong>Classical Directive:</strong> ${stp.classicalRemedy}
          </div>
        </div>
      `;
    }
  }

  // 2.12 House 11: Labha Bhava Engines (Maha Labha, Ashtakavarga Lift, Siblings & Honors)
  if (currentHouse === 11) {
    // 2.12.1 Maha Labha & Dhana Yoga Card
    if (report.mahaLabhaYoga) {
      const my = report.mahaLabhaYoga;
      html += `
        <div class="bhava-mahadhana-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">💰</span>
              <h4 style="color: #34D399;">Maha Labha &amp; Dhana Yoga Architecture (महालक्ष्मी लाभ योग)</h4>
            </div>
            <span class="bhava-badge ${my.score >= 70 ? 'badge-green' : 'badge-gold'}">
              <span>Dhana Score: ${my.score}/100</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Parashari Ground Truth (BPHS Ch. 41 &amp; Mehta Ch. 11, pp. 274–279)</strong>: 
            The 11th house is the house of <em>Siddhis &amp; Prapti</em> (attainment of all desires and freedom from miseries). Natural malefics here produce aggressive material expansion, while benefics deliver effortless, honest revenues.
          </p>

          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
              <span style="font-size: 0.92rem; font-weight: 700; color: #A7F3D0;">${my.rating}</span>
              <span style="font-size: 0.76rem; color: #FCD34D; font-weight: 600;">Channel: ${my.wealthType}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Wealth multiplication flourishes through the interplay of the 11th lord with 1st, 2nd, 5th, and 9th houses.
            </div>
          </div>

          <!-- Combinations Grid -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${my.combinations.map(combo => `
              <div style="background: rgba(0, 0, 0, 0.3); border-left: 3px solid #34D399; border-radius: var(--radius-sm); padding: 10px 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                  <strong style="color: #F8FAFC; font-size: 0.88rem;">${combo.title}</strong>
                  <span class="bhava-badge badge-green" style="font-size: 0.7rem; padding: 1px 6px;">${combo.potency}</span>
                </div>
                <div style="font-size: 0.78rem; color: #CBD5E1; line-height: 1.45;">
                  ${combo.description}
                </div>
              </div>
            `).join('')}
          </div>

          ${my.spiritualThirst ? `
            <div style="margin-top: 12px; padding: 10px 14px; background: rgba(168, 85, 247, 0.12); border-radius: var(--radius-sm); border-left: 3px solid #C084FC; font-size: 0.78rem; color: #E9D5FF; line-height: 1.45;">
              <strong>🧘 ${my.spiritualThirst.title}:</strong> ${my.spiritualThirst.note}
            </div>
          ` : ''}
        </div>
      `;
    }

    // 2.12.2 K.N. Rao / Mehta Ashtakavarga 11th vs 10th Lift Card
    if (report.ashtakavargaLift && report.ashtakavargaLift.isAvailable) {
      const lift = report.ashtakavargaLift;
      html += `
        <div class="bhava-lift-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">📈</span>
              <h4 style="color: #38BDF8;">K.N. Rao / Mehta Ashtakavarga Career Lift Engine</h4>
            </div>
            <span class="bhava-badge ${lift.badgeClass}">
              <span>${lift.delta >= 0 ? '+' + lift.delta : lift.delta} Bindus Delta</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Haveli Ram Mehta's Cardinal Metric (Ch. 11, p. 280)</strong>: 
            <em>"If 11th has more benefic points than 10, rise in life is great. If the difference is 4 or 5 Bindus or more, the person is extremely lucky in life (e.g. Jawaharlal Nehru: 10th has 26 pts, 11th has 35 pts, a surplus of +9 Bindus)."</em>
          </p>

          <div class="bhava-kuja-grid">
            <!-- Box 1: 10th Karma SAV -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #F59E0B;">
              <span style="font-size: 0.74rem; color: var(--text-dim); text-transform: uppercase;">10th House Karma SAV</span>
              <strong style="color: #FCD34D; font-size: 1.1rem;">${lift.sav10} Bindus</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${lift.sav10 >= 28 ? 'Fortified Output (≥28)' : 'Modest Foundation (<28)'}</span>
            </div>

            <!-- Box 2: 11th Labha SAV -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #34D399;">
              <span style="font-size: 0.74rem; color: var(--text-dim); text-transform: uppercase;">11th House Labha SAV</span>
              <strong style="color: #34D399; font-size: 1.1rem;">${lift.sav11} Bindus</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${lift.sav11 >= 28 ? 'Abundant Fruition (≥28)' : 'Sensitive Inflow (<28)'}</span>
            </div>

            <!-- Box 3: Net Vector Delta -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #38BDF8;">
              <span style="font-size: 0.74rem; color: var(--text-dim); text-transform: uppercase;">Net Lift Surplus</span>
              <strong style="color: #38BDF8; font-size: 1.1rem;">${lift.delta >= 0 ? '+' + lift.delta : lift.delta} Bindus</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${lift.delta >= 4 ? 'Lifelong Providential Lift' : 'Standard Growth Dynamic'}</span>
            </div>
          </div>

          <div style="margin-top: 12px; padding: 12px 14px; background: rgba(0, 0, 0, 0.3); border-radius: var(--radius-sm); border-left: 3px solid #38BDF8; font-size: 0.8rem; color: #E2E8F0; line-height: 1.45;">
            <strong>Synthesis &amp; Trajectory:</strong> ${lift.description}
            ${lift.compensatoryLift ? `<div style="margin-top: 6px; color: #34D399; font-weight: 600;">${lift.compensatoryLift}</div>` : ''}
          </div>
        </div>
      `;
    }

    // 2.12.3 Jyeshtha Bhrata (Elder Siblings) Diagnostic Card
    if (report.elderSiblingProfile) {
      const esp = report.elderSiblingProfile;
      html += `
        <div class="bhava-jyeshtha-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">👥</span>
              <h4 style="color: #FB923C;">Jyeshtha Bhrata &amp; Fraternal Well-being (ज्येष्ठ भ्रातृ विचार)</h4>
            </div>
            <span class="bhava-badge badge-gold">
              <span>${esp.relationshipStatus}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Treatises (Mehta Ch. 11, pp. 274–278; Sarvarth Chintamani)</strong>: 
            Elder siblings are governed by the 11th house and Jupiter. Malefics in the 11th or aspecting it cause friction or denial, while the 11th lord in the 3rd establishes the native as eldest or youngest among co-borns.
          </p>

          <div class="bhava-kuja-grid">
            <!-- Protections -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #34D399;">
              <span style="font-size: 0.74rem; color: #34D399; font-weight: 700; text-transform: uppercase;">🛡️ Fraternal Protections &amp; Blessings</span>
              <ul style="font-size: 0.76rem; color: #E2E8F0; margin: 0; padding-left: 16px; line-height: 1.45;">
                ${esp.protections.map(pr => `<li>${pr}</li>`).join('')}
              </ul>
            </div>

            <!-- Vulnerabilities -->
            <div class="bhava-kuja-box" style="border-left: 3px solid ${esp.vulnerabilities[0]?.includes('No acute') ? '#34D399' : '#F87171'};">
              <span style="font-size: 0.74rem; color: ${esp.vulnerabilities[0]?.includes('No acute') ? '#34D399' : '#F87171'}; font-weight: 700; text-transform: uppercase;">⚠️ Fraternal Scrutiny</span>
              <ul style="font-size: 0.76rem; color: #E2E8F0; margin: 0; padding-left: 16px; line-height: 1.45;">
                ${esp.vulnerabilities.map(vl => `<li>${vl}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // 2.12.4 K.N. Rao Apex Honors & Medals Matrix Card
    if (report.honorsProfile) {
      const hp = report.honorsProfile;
      html += `
        <div class="bhava-honors-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🎖️</span>
              <h4 style="color: #A855F7;">K.N. Rao Apex Honors &amp; Medals Matrix (सम्मान एवं पदक विचार)</h4>
            </div>
            <span class="bhava-badge ${hp.score >= 70 ? 'badge-green' : 'badge-gold'}">
              <span>Laurel Index: ${hp.score}/100</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>K.N. Rao Master Dictum (Mehta Ch. 11, p. 274)</strong>: 
            <em>"According to K.N. Rao, 11th lord confers honours — 11th lord has to be strong to be able to get Nobel Prize, national awards, or sovereign decorations."</em>
          </p>

          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 12px;">
            <div style="font-size: 0.92rem; font-weight: 700; color: #E9D5FF; margin-bottom: 4px;">
              Honors Tier: <span style="color: #FCD34D;">${hp.tier}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Assesses the fortitude of the 11th lord in Kendras/Trikonas and its mutual links with the 10th lord and Jupiter.
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${hp.indicators.map(ind => `
              <div style="background: rgba(0, 0, 0, 0.25); border-left: 3px solid #C084FC; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.78rem; color: #E2E8F0; line-height: 1.45;">
                ${ind}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // 2.13 House 12: Vyaya Bhava Engines (Moksha, Foreign Residence, Vyaya & Bandhana)
  if (currentHouse === 12) {
    // 2.13.1 Moksha & Spiritual Renunciation Card
    if (report.mokshaProfile) {
      const mp = report.mokshaProfile;
      html += `
        <div class="bhava-moksha-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🧘</span>
              <h4 style="color: #A5B4FC;">Moksha &amp; Spiritual Renunciation Matrix (मोक्ष एवं सन्यास विचार)</h4>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              ${mp.sadgati ? `
                <span class="bhava-badge badge-gold" title="Sadgati post-mortem per Jataka Parijata">
                  <span>✨ Sadgati Blessed</span>
                </span>
              ` : ''}
              <span class="bhava-badge ${mp.score >= 60 ? 'badge-purple' : 'badge-gold'}">
                <span>Moksha Potential: ${mp.score}/100</span>
              </span>
            </div>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Parashari &amp; Mehta Ground Truth (Mehta Ch. 12, pp. 281–288; Jataka Parijata Ch. 14)</strong>: 
            The 12th house represents Meena Rasi (Pisces), final emancipation (Moksha), and the dissolution of ego. Jupiter or Ketu residing here, or the 12th lord in Swakshetra/5th/8th, produces transcendent meditative bliss and freedom from rebirth (as documented in Swami Moorkhanandji and Dr. K.B. Hedgewar).
          </p>

          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(129, 140, 248, 0.3); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
              <span style="font-size: 0.92rem; font-weight: 700; color: #C7D2FE;">Spiritual Stature: ${mp.tier}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              ${mp.mokshaTrikonaStatus}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${mp.keyFindings.map(kf => `
              <div style="background: rgba(0, 0, 0, 0.25); border-left: 3px solid #818CF8; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.78rem; color: #E0E7FF; line-height: 1.45;">
                ${kf}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2.13.2 K.N. Rao / Mehta Foreign Residence & Settlement Card
    if (report.foreignSettlementProfile) {
      const fsp = report.foreignSettlementProfile;
      html += `
        <div class="bhava-foreign-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">✈️</span>
              <h4 style="color: #38BDF8;">K.N. Rao / Mehta Foreign Settlement Engine (विदेश वास एवं यात्रा विचार)</h4>
            </div>
            <span class="bhava-badge ${fsp.badgeClass}">
              <span>Settlement Likelihood: ${fsp.score}%</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Haveli Ram Mehta's 4-Point Snapshot Rule (Ch. 12, pp. 290–292)</strong>: 
            <em>"Whenever fourth house/lord is afflicted or ill placed (6, 8, 12) in a horoscope, person leaves his native place to settle abroad. If somehow Rahu/Ketu are also involved, then residence abroad becomes almost a certainty (verified in Case Study 1, 19-11-1947 Jullundhar)."</em>
          </p>

          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 12px;">
            <div style="font-size: 0.92rem; font-weight: 700; color: #BAE6FD; margin-bottom: 4px;">
              Verdict: <span style="color: #FCD34D;">${fsp.likelihood}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Synthesizes 4th house anchorage, Rahu/Ketu foreign catalysts, 12th/9th oceanic houses, and Jataka Parijata 12th from Lagna Lord dictum.
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${fsp.indicators.map(ind => `
              <div style="background: rgba(0, 0, 0, 0.25); border-left: 3px solid #38BDF8; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.78rem; color: #E0F2FE; line-height: 1.45;">
                ${ind}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2.13.3 Vyaya (Expenditure) & Financial Leakage Card
    if (report.vyayaProfile) {
      const vp = report.vyayaProfile;
      html += `
        <div class="bhava-vyaya-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">💸</span>
              <h4 style="color: #FCD34D;">Vyaya &amp; Financial Outflow Diagnostics (शुभ व्यय बनाम पाप व्यय)</h4>
            </div>
            <span class="bhava-badge ${vp.badgeClass}">
              <span>${vp.nature}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Treatises (Mehta Ch. 12, pp. 281–282; Phala Deepika)</strong>: 
            Since the 12th house is primarily a house of expenditure, if benefics occupy it, money is spent in an honorable, charitable way (Shubh Vyaya). With unmitigated malefics, expenditure is dissipated on litigation, fines, vices, or unexpected drains (Pap Vyaya).
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${vp.avenues.map(av => `
              <div style="background: rgba(0, 0, 0, 0.25); border-left: 3px solid #F59E0B; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 0.78rem; color: #FEF3C7; line-height: 1.45;">
                ${av}
              </div>
            `).join('')}
          </div>

          ${vp.litigationRisk ? `
            <div style="margin-top: 10px; padding: 10px 14px; background: rgba(239, 68, 68, 0.12); border-radius: var(--radius-sm); border-left: 3px solid #EF4444; font-size: 0.78rem; color: #FCA5A5; line-height: 1.45;">
              <strong>⚠️ Legal / Financial Vulnerability Alert:</strong> 6th and 12th lords association warns of money spent on litigation relating to property, contractual disputes, or debts (Mehta p. 282).
            </div>
          ` : ''}
        </div>
      `;
    }

    // 2.13.4 Bandhana (Confinement) & Sayana Sukha Diagnostic Card
    if (report.bandhanaSayanaProfile) {
      const bsp = report.bandhanaSayanaProfile;
      html += `
        <div class="bhava-bandhana-card">
          <div class="bhava-lord-header">
            <div class="bhava-lord-title">
              <span style="font-size: 1.4rem;">🛏️</span>
              <h4 style="color: #FDA4AF;">Sayana Sukha &amp; Bandhana Incarceration Scrutiny (शयन सुख एवं बन्धन योग)</h4>
            </div>
            <span class="bhava-badge ${bsp.confinementBadge}">
              <span>${bsp.confinementRisk}</span>
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <strong>Classical Authorities (Mehta Ch. 12, pp. 282–286; Bhavartha Ratnakara)</strong>: 
            The 12th bhava governs bed pleasures (Sayana Sukha), restful sleep, left eye, feet, and institutional confinement. Venus here confers wealth and exquisite intimacy, while harsh malefic afflictions warrant caution regarding legal isolation or sleeplessness.
          </p>

          <div class="bhava-kuja-grid">
            <!-- Box 1: Sayana Sukha -->
            <div class="bhava-kuja-box" style="border-left: 3px solid #F472B6;">
              <span style="font-size: 0.74rem; color: #F472B6; font-weight: 700; text-transform: uppercase;">🛏️ Sayana Sukha (Bed Pleasures &amp; Sleep)</span>
              <strong style="color: #FDF2F8; font-size: 0.85rem; display: block; margin: 4px 0;">${bsp.sayanaSukhaRating}</strong>
              <span style="font-size: 0.76rem; color: #E2E8F0; line-height: 1.4; display: block;">${bsp.sayanaSukhaNote}</span>
            </div>

            <!-- Box 2: Bandhana & Confinement Scrutiny -->
            <div class="bhava-kuja-box" style="border-left: 3px solid ${bsp.confinementRisk.includes('Clear') ? '#34D399' : '#F87171'};">
              <span style="font-size: 0.74rem; color: ${bsp.confinementRisk.includes('Clear') ? '#34D399' : '#F87171'}; font-weight: 700; text-transform: uppercase;">🔒 Institutional Confinement Scrutiny</span>
              <strong style="color: #F8FAFC; font-size: 0.85rem; display: block; margin: 4px 0;">${bsp.confinementRisk}</strong>
              <span style="font-size: 0.76rem; color: #E2E8F0; line-height: 1.4; display: block;">${bsp.confinementNote}</span>
            </div>
          </div>

          <div style="margin-top: 12px; padding: 10px 14px; background: rgba(0, 0, 0, 0.3); border-radius: var(--radius-sm); border-left: 3px solid #FB7185; font-size: 0.78rem; color: #FFE4E6; line-height: 1.45;">
            <strong>👁️ Ophthalmic &amp; Lower Extremity Health:</strong> ${bsp.ophthalmicFootNote}
          </div>
        </div>
      `;
    }
  }

  // 3. Occupants and Aspects 2-Column Grid
  html += `
    <div class="bhava-two-col-grid">
      <!-- Col 1: Occupants -->
      <div class="bhava-section-card">
        <h4>
          <span>🪐</span>
          <span>Resident Grahas (Occupants) [${report.occupants.length}]</span>
        </h4>
        ${report.occupants.length === 0 ? `
          <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
            No planets reside directly in this house. Its significations are primarily delivered by the dispositor lord <strong>${report.lord.name}</strong> in House ${report.lord.currentHouse} and aspecting grahas.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${report.occupants.map(occ => `
              <div class="bhava-occupant-item">
                <div class="bhava-occupant-header">
                  <div class="bhava-occupant-name">
                    <span>${occ.name}</span>
                    <span class="bhava-badge ${occ.dignity.includes('Exalted') || occ.dignity.includes('Own') ? 'badge-gold' : occ.dignity.includes('Debilitated') ? 'badge-red' : ''}" style="font-size: 0.72rem; padding: 2px 8px;">
                      ${occ.dignity}${occ.isRetrograde ? ' [R]' : ''}
                    </span>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--text-dim);">${occ.signName}</span>
                </div>
                <div class="bhava-occupant-text">
                  ${occ.classicalText}
                </div>
                ${occ.mehtaNotes ? `
                  <div style="font-size: 0.75rem; color: var(--gold-light); font-style: italic;">
                    Note: ${occ.mehtaNotes}
                  </div>
                ` : ''}

                ${occ.lordshipsReport && occ.lordshipsReport.length > 0 ? `
                  <div class="bhava-occupant-lordships-box">
                    <div class="bhava-lordships-title">
                      <span>👑</span>
                      <span>Functional Lordship in this Chart (${occ.lordshipsReport.map(lr => `H${lr.houseNumber}`).join(' & ')}):</span>
                    </div>
                    <div class="bhava-lordships-list">
                      ${occ.lordshipsReport.map(lr => `
                        <div class="bhava-occupant-lord-item">
                          <div class="bhava-occupant-lord-header">
                            <strong>${lr.placementInfo ? lr.placementInfo.title : `Lord of House ${lr.houseNumber} (${lr.houseName}) in House ${report.houseNumber}`}</strong>
                            ${lr.placementInfo ? `<span class="bhava-badge badge-gold" style="font-size: 0.65rem;">${lr.placementInfo.sourceChapter}</span>` : ''}
                          </div>
                          ${lr.placementInfo ? `
                            <div class="bhava-occupant-lord-text">${lr.placementInfo.text}</div>
                            ${lr.placementInfo.mehtaNotes ? `<div class="bhava-occupant-lord-subnote">💡 ${lr.placementInfo.mehtaNotes}</div>` : ''}
                          ` : `
                            <div class="bhava-occupant-lord-pending">
                              Classical chapter for House ${lr.houseNumber} Lord in House ${report.houseNumber} will be integrated when Chapter ${lr.houseNumber} is added.
                            </div>
                          `}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Col 2: Parashari Drishti (Aspects Received) -->
      <div class="bhava-section-card">
        <h4>
          <span>👁️</span>
          <span>Parashari Drishti (Aspects Received) [${report.aspects.length}]</span>
        </h4>
        ${report.aspects.length === 0 ? `
          <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
            No direct full Parashari aspects are cast upon this house cusp.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${report.aspects.map(asp => `
              <div class="bhava-aspect-item">
                <div class="bhava-aspect-left">
                  <span style="font-size: 1.1rem;">${asp.isBenefic ? '🌟' : '⚡'}</span>
                  <div>
                    <div class="bhava-aspect-name">${asp.name} (from House ${asp.fromHouse})</div>
                    <div class="bhava-aspect-sub">${asp.aspectType}</div>
                  </div>
                </div>
                <span class="bhava-badge ${asp.isBenefic ? 'badge-green' : 'badge-red'}" style="font-size: 0.72rem;">
                  ${asp.isBenefic ? 'Benefic Aspect' : 'Malefic Aspect'}
                </span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // 4. Special Classical Yogas
  if (report.specialYogas && report.specialYogas.length > 0) {
    html += `
      <div class="bhava-section-card">
        <h4>
          <span>🧘</span>
          <span>Special Classical Yogas Active for this House [${report.specialYogas.length}]</span>
        </h4>
        <div class="bhava-yogas-grid">
          ${report.specialYogas.map(yoga => `
            <div class="bhava-yoga-item">
              <div class="bhava-yoga-name">
                <span>✨</span>
                <span>${yoga.name}</span>
              </div>
              <div class="bhava-yoga-condition">Condition: ${yoga.condition || yoga.description}</div>
              <div class="bhava-yoga-effects">${yoga.effects || yoga.description}</div>
              <div style="font-size: 0.72rem; color: var(--gold-light); margin-top: 6px; text-align: right;">
                Ref: ${yoga.source}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 4.5 All 12 House Lords Overview (Lord of X in House Y)
  if (report.allHouseLords && report.allHouseLords.length > 0) {
    html += `
      <div class="bhava-reference-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <h4 style="margin: 0;">
            <span>👑</span>
            <span>All 12 House Lords Placements (Bhavadhipati Overview)</span>
          </h4>
          <span style="font-size: 0.76rem; color: var(--gold-light);">
            Click any card to switch to that House sub-tab
          </span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px;">
          Comprehensive mapping of which house each Bhava Lord occupies in this chart, their dignity, and Haveli Ram Mehta's classical predictive dicta:
        </p>
        <div class="bhava-all-lords-grid">
          ${report.allHouseLords.map(hl => {
            const isCurrent = hl.houseNumber === currentHouse;
            return `
              <div class="bhava-all-lord-card ${isCurrent ? 'active-target' : ''}" data-nav-house="${hl.houseNumber}">
                <div class="bhava-all-lord-top">
                  <span class="bhava-all-lord-badge ${isCurrent ? 'badge-active' : ''}">
                    H${hl.houseNumber} (${hl.name.split(' ')[0]})
                  </span>
                  <span class="bhava-all-lord-target">
                    ➔ <strong>House ${hl.targetHouse}</strong>
                  </span>
                </div>
                <div class="bhava-all-lord-details">
                  <div class="bhava-all-lord-lord">
                    <span>${hl.lordName} in ${hl.targetSignName}</span>
                    <span class="bhava-badge ${hl.lordDignity.includes('Exalted') || hl.lordDignity.includes('Own') ? 'badge-gold' : hl.lordDignity.includes('Debilitated') ? 'badge-red' : ''}" style="font-size: 0.65rem; padding: 1px 6px;">
                      ${hl.lordDignity}${hl.isRetrograde ? ' [R]' : ''}
                    </span>
                  </div>
                  ${hl.dictum ? `
                    <div class="bhava-all-lord-dictum">
                      <strong>${hl.dictum.title}:</strong> ${hl.dictum.text}
                    </div>
                  ` : `
                    <div class="bhava-all-lord-dictum-pending">
                      Lord of House ${hl.houseNumber} situated in House ${hl.targetHouse} (Chapter ${hl.houseNumber} pending)
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 5. Significations & Classical Treatises Reference Box
  if (report.significations && report.significations.length > 0) {
    html += `
      <div class="bhava-reference-box">
        <h4>
          <span>📜</span>
          <span>Classical Authorities & Core Principles (BPHS, Phala Deepika, Jataka Parijata)</span>
        </h4>

        <div style="margin-bottom: 16px;">
          <strong style="font-size: 0.82rem; color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
            Core Significations of ${report.name}:
          </strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${report.significations.map(sig => `
              <span class="bhava-badge" style="font-size: 0.8rem; background: rgba(255,255,255,0.03);">
                • ${sig}
              </span>
            `).join('')}
          </div>
        </div>

        ${report.authoritiesSummary ? `
          <div class="bhava-authorities-list">
            ${report.authoritiesSummary.satyacharya ? `
              <div class="bhava-authority-card">
                <div class="bhava-authority-name">Sage Satyacharya</div>
                <div class="bhava-authority-quote">"${report.authoritiesSummary.satyacharya}"</div>
              </div>
            ` : ''}
            ${report.authoritiesSummary.uttaraKalamrita ? `
              <div class="bhava-authority-card">
                <div class="bhava-authority-name">Kalidasa (Uttara Kalamrita)</div>
                <div class="bhava-authority-quote">"${report.authoritiesSummary.uttaraKalamrita}"</div>
              </div>
            ` : ''}
            ${report.authoritiesSummary.jatakaParijata ? `
              <div class="bhava-authority-card">
                <div class="bhava-authority-name">Jataka Parijata</div>
                <div class="bhava-authority-quote">"${report.authoritiesSummary.jatakaParijata}"</div>
              </div>
            ` : ''}
            ${report.authoritiesSummary.parashara ? `
              <div class="bhava-authority-card">
                <div class="bhava-authority-name">Sage Parashara (BPHS)</div>
                <div class="bhava-authority-quote">"${report.authoritiesSummary.parashara}"</div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 6. Case Studies from Mehta's Book (for House 1)
  if (currentHouse === 1) {
    html += `
      <div class="bhava-reference-box">
        <h4>
          <span>🏛️</span>
          <span>MS Mehta's Landmark Historical Chart Verifications</span>
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
          Case studies delineated in Chapter 1 demonstrating the practical predictive power of Lagna and Lagna Lord strength:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Pt. Jawaharlal Nehru (First PM of India)</div>
            <div class="bhava-case-desc"><strong>Cancer Lagna + Moon in Lagna</strong>: Benefic Moon in own sign with no malefic aspects conferred handsome personality, spotless public appeal, and enduring political leadership.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Smt. Indira Gandhi (Late PM of India)</div>
            <div class="bhava-case-desc"><strong>Cancer Lagna + Moon in 7th</strong>: Cancer rising aspected by its own lord Moon from 7th house with a major 1st–7th Rashi Parivartana Yoga with Saturn created an iron-willed, world-famous leader.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Dr. Rabindranath Tagore (Nobel Laureate)</div>
            <div class="bhava-case-desc"><strong>Pisces Lagna + Jupiter Exalted in 5th</strong>: 1st lord Jupiter exalted in the 5th house of intellect and poetry granted supreme literary genius and immortal international renown.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Sri Ramakrishna Paramhansa (Great Mystic)</div>
            <div class="bhava-case-desc"><strong>Aquarius Lagna + Saturn Exalted in 9th</strong>: Lagna lord Saturn exalted in 9th house (Bhagyasthana/Dharma) created a supreme saint whose spiritual realization guided Swami Vivekananda.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">A.C. Bhaktivedanta Swami Prabhupada (Founder ISKCON)</div>
            <div class="bhava-case-desc"><strong>Sagittarius Lagna + 10th House Karma</strong>: Lagna connections with Kendra and Karma bhava drove him to establish a worldwide spiritual movement in all corners of the globe.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Mahatma Gandhi (Father of the Nation)</div>
            <div class="bhava-case-desc"><strong>Libra Lagna + Venus & Mars in Lagna</strong>: Lagna lord Venus conjoined with Mars in Libra gave tireless physical stamina, fearless energy, and an unshakeable moral willpower.</div>
          </div>
        </div>
      </div>
    `;
  }

  // 6.2 Case Studies from Mehta's Book (for House 2)
  if (currentHouse === 2) {
    html += `
      <div class="bhava-reference-box">
        <h4>
          <span>🏛️</span>
          <span>Haveli Ram Mehta's Landmark Wealth Case Studies (Chapter 2)</span>
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
          Empirical verifications delineated in Chapter 2 demonstrating Dhana Yogas, Indu Lagna, and Sarvashtakavarga metrics:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Queen Elizabeth II (Sovereign Wealth)</div>
            <div class="bhava-case-desc"><strong>Indu Lagna in Sagittarius / Aquarius</strong>: Evaluated via Parashari (Sagittarius) and Jaimini (Aquarius) systems. Powerful luminary aspects conferred extraordinary crown estates and lifelong royalty.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Bill Gates (Founder of Microsoft)</div>
            <div class="bhava-case-desc"><strong>Indu Lagna in Virgo + Exalted Mercury & Mars</strong>: Flanked by 5th lord in 5th and exalted Saturn. 10th house Moon aspects Indu Lagna. Result: World's wealthiest individual across decades.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">K.K. Birla (Indian Industrial Titan)</div>
            <div class="bhava-case-desc"><strong>Indu Lagna in Aries + Venus Moolatrikona</strong>: Key SAV wealth houses hold 30, 29, 30, 38, 27, and 35 bindus. Result: Multi-industry conglomerate empire.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Mukesh Ambani (Asia's Foremost Business Leader)</div>
            <div class="bhava-case-desc"><strong>Indu Lagna in Pisces + 2nd House Powerhouse</strong>: Exalted Sun, Venus, Mercury in 2nd house; 10th and 11th SAV houses command 34 and 44 bindus (income overwhelmingly exceeding expenses).</div>
          </div>
        </div>
      </div>
    `;
  }

  // 6.3 Case Studies from Mehta's Book (for House 3)
  if (currentHouse === 3) {
    html += `
      <div class="bhava-reference-box">
        <h4>
          <span>🏛️</span>
          <span>Haveli Ram Mehta's Landmark Valour & Artistic Case Studies (Chapter 3)</span>
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
          Classical charts analyzed in Chapter 3 demonstrating Parakrama, athletic heroism, musical mastery, and sibling rules:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Pt. Jawaharlal Nehru (First PM of India)</div>
            <div class="bhava-case-desc"><strong>Mars in 3rd House (Virgo) with 6 SAV Bindus</strong>: Produced indomitable courage and leadership to battle foreign rule. However, exactly following Mehta's rule, Mars in 3rd with >5 bindus denied him any younger brother.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Lata Mangeshkar (Nightingale of India)</div>
            <div class="bhava-case-desc"><strong>3rd Lord Moon in 3rd House + Saraswati Yoga</strong>: Moon strong with 5 SAV bindus in Cancer, Venus in 4th Kendra, and exalted Mercury in 5th aspected by Jupiter produced immortal vocal sweet melodiousness.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Shiraz Shaheed (Youngest Indian Golf Champion)</div>
            <div class="bhava-case-desc"><strong>Malefics in 3rd & 6th (Nerves of Steel)</strong>: K.N. Rao & Mehta cite this chart to demonstrate how natural malefics in Upachaya houses grant fierce competitive killer instinct to capture national championships abroad.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Swami Prabhupada (Founder of ISKCON)</div>
            <div class="bhava-case-desc"><strong>Exalted 9th Lord Mercury & Venus aspecting 3rd House</strong>: Produced divine devotional singing (Hare Krishna Kirtans), while 3rd lord Jupiter with Sun-Ketu fulfilled the dictum of building global temples.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">N.T. Rama Rao (Legendary Actor & Chief Minister)</div>
            <div class="bhava-case-desc"><strong>3rd Lord Jupiter in Lagna with Moon aspected by Venus</strong>: Angular disposition of the 3rd lord in Lagna conjoined with royal planets propelled him into cinematic stardom and political leadership.</div>
          </div>
        </div>
      </div>
    `;
  }

  // 6.4 Case Studies from Mehta's Book (for House 4)
  if (currentHouse === 4) {
    html += `
      <div class="bhava-reference-box">
        <h4>
          <span>🏛️</span>
          <span>Haveli Ram Mehta's Landmark Real Estate & Palatial Mansions Case Studies (Chapter 4)</span>
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
          Classical charts analyzed in Chapter 4 demonstrating palatial mansions, real estate empires, and timing of property acquisitions:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Pt. Jawaharlal Nehru (Anand Bhawan Mansion)</div>
            <div class="bhava-case-desc"><strong>Venus & Mercury in Libra in 4th with 30 SAV points</strong>: Venus in Moolatrikona with 6 points; Mars with 6 points. Destined to live in palatial mansions with private swimming pools and gardens. Shifted into famous Anand Bhawan in Mercury-Rahu Dasha (Rahu in 12th is 4th from 9th father!).</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">The Plain-Looking Girl Married to a Landlord (K.N. Rao)</div>
            <div class="bhava-case-desc"><strong>Vargottama Moon, Gajakesari Yoga & Fortified 4th Lord</strong>: When parents lost hope of marriage, K.N. Rao predicted immediate marriage to a wealthy landlord. In Moon MD / Mars AD, she married an aristocratic landlord with vast landed estates.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Real Estate Titan with Hundreds of Workers (Case Study I)</div>
            <div class="bhava-case-desc"><strong>Exalted 4th Lord Moon in 2nd Aspected by Jupiter from 10th</strong>: Jupiter has Neechabhanga Raj Yoga with 2nd lord Venus. Property Karaka Mars aspects 4th house from 9th. Produced a multi-crore construction empire with hundreds of employees.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Corporate Magnate & Temple Creator (Case Study II)</div>
            <div class="bhava-case-desc"><strong>Exalted Digbali Mars Aspecting 4th House + Gajakesari</strong>: 4th lord Moon in Gajakesari Yoga, dispositor Mercury with 2nd lord Venus in 11th, exalted Rahu in 2nd. Generated immense industrial property and constructed magnificent stone temples.</div>
          </div>
        </div>
      </div>
    `;
  }

  // 6.5 Case Studies from Mehta's Book (for House 5)
  if (currentHouse === 5) {
    html += `
      <div class="bhava-reference-box">
        <h4>
          <span>🏛️</span>
          <span>Haveli Ram Mehta's Landmark Progeny & Intellect Case Studies (Chapter 5)</span>
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
          Empirical verifications delineated in Chapter 5 demonstrating K.N. Rao's Double Transit Technique, maternal/paternal timing, and birth of distinguished children:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Pt. Jawaharlal Nehru (Birth of Indira Gandhi - 19 Nov 1917)</div>
            <div class="bhava-case-desc"><strong>Saturn in Cancer aspecting 5th lord Mars & Jupiter in Taurus aspecting 5th house</strong>: Textbook proof of K.N. Rao's rule. Saturn aspected 5th lord Mars in Virgo, while Jupiter in Taurus aspected the 5th house (Scorpio), producing India's first female Prime Minister.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Indira Gandhi (Birth of Rajiv Gandhi - 20 Aug 1944)</div>
            <div class="bhava-case-desc"><strong>Saturn in Gemini aspecting 5th lord Mars & Jupiter conjoining 5th lord in Leo</strong>: Saturn aspected natal 5th lord Mars in Leo, while transiting Jupiter was conjoined with Mars. Mars in Virgo aspected 9th house Pisces.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Indira Gandhi (Birth of Sanjay Gandhi - Dec 1946)</div>
            <div class="bhava-case-desc"><strong>Saturn in Gemini & Jupiter in Virgo aspecting 9th house & lord</strong>: Saturn aspected 5th lord Mars in Leo; Jupiter in Virgo aspected both 9th house Pisces and natal 9th lord Jupiter, fulfilling the classical double transit.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Lal Bahadur Shastri (Birth of Son - 9 Apr 1936)</div>
            <div class="bhava-case-desc"><strong>Saturn aspecting 5th lord & Jupiter aspecting 5th house (Aries)</strong>: Transiting Mars was in Aries (the 5th house) itself within the 75-day trigger window.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">Choudhary Charan Singh (Birth of Son - 14 Sep 1927)</div>
            <div class="bhava-case-desc"><strong>Jupiter aspecting 5th lord & Saturn aspecting 5th house</strong>: Mars in Virgo aspected the 5th house, timing the exact month of delivery.</div>
          </div>
          <div class="bhava-case-study-item">
            <div class="bhava-case-title">The Illustrious Couple ('Karma and Rebirth' Case Study)</div>
            <div class="bhava-case-desc"><strong>5th Lord Jupiter in 10th Kendra with Exalted Luminaries</strong>: 5th lord Jupiter placed in the 10th Kendra forming Gajakesari Yoga unafflicted by malefics. Produced noble, devoted children who attained international prominence and spiritual elevation.</div>
          </div>
        </div>
      </div>
    `;
  }

  return html;
}

// Kick off
init();



