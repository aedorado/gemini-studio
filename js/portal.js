import { loadAtlas, searchCities, getTimezoneOffsetHours } from './atlas.js';
import { getProfiles, saveProfile } from './storage.js';
import { initTheme } from './theme.js';

// DOM Elements
const portalForm = document.getElementById('portal-birth-form');
const btnModeBirth = document.getElementById('btn-portal-mode-birth');
const btnModePaste = document.getElementById('btn-portal-mode-paste');
const sectionBirth = document.getElementById('portal-section-birth');
const sectionPaste = document.getElementById('portal-section-paste');

const inputName = document.getElementById('portal-name');
const inputGender = document.getElementById('portal-gender');
const inputDate = document.getElementById('portal-date');
const inputTime = document.getElementById('portal-time');
const inputCity = document.getElementById('portal-city-input');
const suggestionsBox = document.getElementById('portal-city-suggestions');
const inputLat = document.getElementById('portal-lat');
const inputLon = document.getElementById('portal-lon');
const inputTz = document.getElementById('portal-tz');
const quickCityChips = document.querySelectorAll('.portal-chip-btn');

const rawInput = document.getElementById('portal-raw-input');
const btnLaunchPaste = document.getElementById('btn-portal-launch-paste');
const btnPasteSample = document.getElementById('btn-portal-paste-sample');

const databankCountEl = document.getElementById('portal-databank-count');
const featuredProfilesGrid = document.getElementById('portal-featured-profiles');

let currentMode = 'birth';

const SAMPLE_COORDS = `Planets Sign Latitude Nakshatra Pada
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

function init() {
  initTheme();
  loadAtlas();
  setupDefaults();
  setupEventListeners();
  renderFeaturedProfiles();
}

function setupDefaults() {
  // Set current date and time
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  if (inputDate) inputDate.value = todayStr;
  
  const curH = String(now.getHours()).padStart(2, '0');
  const curM = String(now.getMinutes()).padStart(2, '0');
  if (inputTime) inputTime.value = `${curH}:${curM}:00`;

  const profiles = getProfiles();
  if (databankCountEl) {
    databankCountEl.textContent = profiles.length;
  }
  document.querySelectorAll('.footer-databank-count').forEach(el => {
    el.textContent = profiles.length;
  });
}

function setupEventListeners() {
  // Mode toggles
  if (btnModeBirth) {
    btnModeBirth.addEventListener('click', () => setMode('birth'));
  }
  if (btnModePaste) {
    btnModePaste.addEventListener('click', () => setMode('paste'));
  }

  // City Autocomplete
  if (inputCity && suggestionsBox) {
    let debounceTimer = null;
    inputCity.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimer);
      if (query.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const matches = await searchCities(query, 8);
          if (!matches || matches.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
          }

          suggestionsBox.innerHTML = '';
          matches.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            const name = city.cityName || city.city;
            const prov = city.province ? `, ${city.province}` : '';
            const latStr = city.lat >= 0 ? `${city.lat.toFixed(2)}°N` : `${Math.abs(city.lat).toFixed(2)}°S`;
            const lonStr = city.lon >= 0 ? `${city.lon.toFixed(2)}°E` : `${Math.abs(city.lon).toFixed(2)}°W`;
            const tzName = city.timezone ? (city.timezone.split('/')[1] || city.timezone) : 'IST';

            div.innerHTML = `
              <div>
                <strong>${name}</strong>${prov}
                <div class="suggestion-sub">${city.country} (${latStr}, ${lonStr})</div>
              </div>
              <span style="font-size: 0.72rem; color: var(--gold-light); font-weight: 600;">${tzName}</span>
            `;

            div.addEventListener('click', () => {
              inputCity.value = city.displayLabel || `${name}${prov}, ${city.country}`;
              inputLat.value = city.lat.toFixed(4);
              inputLon.value = city.lon.toFixed(4);
              const bDate = inputDate && inputDate.value ? new Date(inputDate.value) : new Date();
              const tzOffset = getTimezoneOffsetHours(city.timezone, bDate);
              inputTz.value = tzOffset !== null && tzOffset !== undefined ? tzOffset : 5.5;
              suggestionsBox.style.display = 'none';
              quickCityChips.forEach(c => c.classList.remove('active'));
            });

            suggestionsBox.appendChild(div);
          });
          suggestionsBox.style.display = 'block';
        } catch (err) {
          console.error('Error during city search:', err);
          suggestionsBox.style.display = 'none';
        }
      }, 120);
    });

    inputCity.addEventListener('focus', () => {
      loadAtlas();
      if (inputCity.value.trim().length >= 2) {
        searchCities(inputCity.value.trim(), 8).then(matches => {
          if (!matches || matches.length === 0) return;
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!inputCity.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
      }
    });
  }

  // Quick City Chips
  quickCityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      quickCityChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      inputCity.value = chip.dataset.city || chip.textContent;
      inputLat.value = chip.dataset.lat;
      inputLon.value = chip.dataset.lon;
      inputTz.value = chip.dataset.tz;
      if (suggestionsBox) suggestionsBox.style.display = 'none';
    });
  });

  // Submit Birth Form
  if (portalForm) {
    portalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = inputDate.value;
      if (!date) {
        alert('Please enter a valid birth date.');
        return;
      }

      const name = inputName.value.trim() || `Client ${inputDate.value}`;
      const saved = saveProfile({
        name,
        gender: inputGender.value || 'male',
        mode: 'birth',
        birthDate: inputDate.value,
        birthTime: inputTime.value || '12:00:00',
        city: inputCity.value || 'New Delhi, India',
        lat: parseFloat(inputLat.value) || 28.6139,
        lon: parseFloat(inputLon.value) || 77.2090,
        tz: parseFloat(inputTz.value) || 5.5,
        notes: `Created from Home Portal on ${new Date().toLocaleDateString()}`
      });

      if (saved && saved.id) {
        window.location.href = `studio.html?profileId=${saved.id}`;
      } else {
        const params = new URLSearchParams({
          name,
          gender: inputGender.value,
          date: inputDate.value,
          time: inputTime.value || '12:00:00',
          city: inputCity.value || 'New Delhi, India',
          lat: inputLat.value || '28.6139',
          lon: inputLon.value || '77.2090',
          tz: inputTz.value || '5.5'
        });
        window.location.href = `studio.html?${params.toString()}`;
      }
    });
  }

  // Submit Paste Mode
  if (btnLaunchPaste) {
    btnLaunchPaste.addEventListener('click', () => {
      const rawText = rawInput.value.trim();
      if (!rawText) {
        alert('Please paste planetary coordinates first.');
        rawInput.focus();
        return;
      }
      const saved = saveProfile({
        name: `Raw Coordinates Chart ${new Date().toLocaleDateString()}`,
        gender: 'male',
        mode: 'paste',
        rawInput: rawText,
        notes: `Imported via Home Portal on ${new Date().toLocaleDateString()}`
      });
      if (saved && saved.id) {
        window.location.href = `studio.html?profileId=${saved.id}`;
      } else {
        sessionStorage.setItem('jyotish_pending_raw', rawText);
        window.location.href = 'studio.html?mode=paste';
      }
    });
  }

  // Sample paste button
  if (btnPasteSample) {
    btnPasteSample.addEventListener('click', () => {
      rawInput.value = SAMPLE_COORDS;
      rawInput.focus();
    });
  }
}

function setMode(mode) {
  currentMode = mode;
  if (mode === 'birth') {
    sectionBirth.style.display = 'block';
    sectionPaste.style.display = 'none';
    btnModeBirth.className = 'btn btn-sm btn-primary';
    btnModePaste.className = 'btn btn-sm btn-secondary';
  } else {
    sectionBirth.style.display = 'none';
    sectionPaste.style.display = 'block';
    btnModeBirth.className = 'btn btn-sm btn-secondary';
    btnModePaste.className = 'btn btn-sm btn-primary';
  }
}

function renderFeaturedProfiles() {
  if (!featuredProfilesGrid) return;
  const profiles = getProfiles();
  if (profiles.length === 0) return;

  // Pick top 4 benchmark profiles (Anurag Sharma, Pragati Tripathi, Jawaharlal Nehru, Armaan Jain)
  const targetIds = ['profile_1', 'profile_2', 'profile_42', 'profile_4'];
  const featured = targetIds
    .map(id => profiles.find(p => p.id === id))
    .filter(Boolean);

  let html = '';
  featured.forEach(p => {
    const genderIcon = p.gender === 'female' ? '♀' : '♂';
    const genderColor = p.gender === 'female' ? '#F472B6' : '#60A5FA';
    html += `
      <a href="studio.html?profileId=${p.id}" class="portal-profile-card">
        <div class="portal-profile-top">
          <div class="portal-profile-avatar">${(p.name || 'C').substring(0, 2).toUpperCase()}</div>
          <div>
            <div class="portal-profile-name">${p.name}</div>
            <div class="portal-profile-sub">
              <span style="color: ${genderColor}; font-weight: 600;">${genderIcon}</span> • 📍 ${p.city || 'Custom'}
            </div>
          </div>
        </div>
        <div class="portal-profile-meta">
          <span>🗓️ ${p.birthDate || 'Natal Chart'}</span>
          <span class="portal-profile-arrow">Launch ↗</span>
        </div>
      </a>
    `;
  });

  featuredProfilesGrid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', init);
