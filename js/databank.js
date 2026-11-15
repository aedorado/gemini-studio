import { getProfiles, saveProfile, deleteProfile, clearAllProfiles, resetToDefaultProfiles, exportProfilesJSON, importProfilesJSON, getProfileById } from './storage.js';
import { searchCities, getTimezoneOffsetHours, loadAtlas } from './atlas.js';
import { initTheme } from './theme.js';

// DOM Elements
const heroProfileCount = document.getElementById('hero-profile-count');
const databankSearchInput = document.getElementById('databank-search-input');
const databankFilterMode = document.getElementById('databank-filter-mode');
const databankSortSelect = document.getElementById('databank-sort-select');
const databankCardsContainer = document.getElementById('databank-cards-container');

const btnCreateProfile = document.getElementById('btn-create-profile');
const btnExportDatabank = document.getElementById('btn-export-databank');
const importDatabankFile = document.getElementById('import-databank-file');
const btnResetDatabank = document.getElementById('btn-reset-databank');
const btnClearAll = document.getElementById('btn-clear-all');

// Delete Confirm Modal Elements
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteConfirmText = document.getElementById('delete-confirm-text');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');
let pendingDeleteId = null;

// Modal Elements
const profileEditModal = document.getElementById('profile-edit-modal');
const modalHeadingTitle = document.getElementById('modal-heading-title');
const modalTitleIcon = document.getElementById('modal-title-icon');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const btnSaveProfile = document.getElementById('btn-save-profile');

const editProfileId = document.getElementById('edit-profile-id');
const modalTabBirth = document.getElementById('modal-tab-birth');
const modalTabPaste = document.getElementById('modal-tab-paste');
const modalSectionBirth = document.getElementById('modal-section-birth');
const modalSectionPaste = document.getElementById('modal-section-paste');

const formClientName = document.getElementById('form-client-name');
const formClientNotes = document.getElementById('form-client-notes');
const formClientGender = document.getElementById('form-client-gender');
const formBirthDate = document.getElementById('form-birth-date');
const formBirthTime = document.getElementById('form-birth-time');
const formCityInput = document.getElementById('form-city-input');
const formCitySuggestions = document.getElementById('form-city-suggestions');
const formLat = document.getElementById('form-lat');
const formLon = document.getElementById('form-lon');
const formTz = document.getElementById('form-tz');
const formRawCoords = document.getElementById('form-raw-coords');

// Toast
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');

let currentFormMode = 'birth';

function init() {
  initTheme();
  loadAtlas();
  setupEventListeners();
  renderProfiles();

  // Instant autofocus on search box when entering Databank
  if (databankSearchInput) {
    requestAnimationFrame(() => {
      databankSearchInput.focus();
    });
  }
}

function setupEventListeners() {
  // Search & Filter & Sort
  databankSearchInput.addEventListener('input', renderProfiles);
  databankFilterMode.addEventListener('change', renderProfiles);
  databankSortSelect.addEventListener('change', renderProfiles);

  // Keyboard shortcut: Press '/' or Cmd+K / Ctrl+K to focus search; Escape to clear
  databankSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && databankSearchInput.value) {
      e.stopPropagation();
      databankSearchInput.value = '';
      renderProfiles();
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      databankSearchInput?.focus();
      databankSearchInput?.select();
    } else if (e.key === '/' && document.activeElement !== databankSearchInput && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      databankSearchInput?.focus();
    }
  });

  // Buttons
  btnCreateProfile.addEventListener('click', () => openModal(null));
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);
  profileEditModal.addEventListener('click', (e) => {
    if (e.target === profileEditModal) closeModal();
  });

  // Modal Mode Switcher
  modalTabBirth.addEventListener('click', () => setModalMode('birth'));
  modalTabPaste.addEventListener('click', () => setModalMode('paste'));

  // Save submit
  btnSaveProfile.addEventListener('click', handleSaveSubmit);

  // Export & Import
  btnExportDatabank.addEventListener('click', handleExport);
  importDatabankFile.addEventListener('change', handleImport);

  // Reload Databank & Clear All
  if (btnResetDatabank) {
    btnResetDatabank.addEventListener('click', () => {
      const defs = resetToDefaultProfiles();
      renderProfiles();
      showToast(`Reloaded all ${defs.length} verified client charts!`);
    });
  }
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      openDeleteConfirm('__ALL__');
    });
  }

  // Delete Confirm Modal Listeners
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', closeDeleteConfirm);
  }
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', executeDelete);
  }
  if (deleteConfirmModal) {
    deleteConfirmModal.addEventListener('click', (e) => {
      if (e.target === deleteConfirmModal) closeDeleteConfirm();
    });
  }

  // Atlas live search in modal
  let searchDebounce = null;
  formCityInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    clearTimeout(searchDebounce);
    if (val.length < 2) {
      formCitySuggestions.style.display = 'none';
      return;
    }
    searchDebounce = setTimeout(async () => {
      const results = await searchCities(val);
      renderCitySuggestions(results);
    }, 150);
  });

  document.addEventListener('click', (e) => {
    if (!formCityInput.contains(e.target) && !formCitySuggestions.contains(e.target)) {
      formCitySuggestions.style.display = 'none';
    }
  });
}

function setModalMode(mode) {
  currentFormMode = mode;
  if (mode === 'birth') {
    modalTabBirth.className = 'btn btn-sm btn-primary';
    modalTabPaste.className = 'btn btn-sm btn-secondary';
    modalSectionBirth.style.display = 'block';
    modalSectionPaste.style.display = 'none';
  } else {
    modalTabPaste.className = 'btn btn-sm btn-primary';
    modalTabBirth.className = 'btn btn-sm btn-secondary';
    modalSectionPaste.style.display = 'block';
    modalSectionBirth.style.display = 'none';
  }
}

function renderCitySuggestions(results) {
  if (!results || results.length === 0) {
    formCitySuggestions.style.display = 'none';
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

  formCitySuggestions.innerHTML = html;
  formCitySuggestions.style.display = 'block';

  formCitySuggestions.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-idx'), 10);
      const c = results[idx];
      formCityInput.value = c.displayLabel;
      formLat.value = c.lat;
      formLon.value = c.lon;
      const bDateVal = formBirthDate.value ? new Date(formBirthDate.value) : new Date();
      formTz.value = getTimezoneOffsetHours(c.timezone, bDateVal);
      formCitySuggestions.style.display = 'none';
    });
  });
}

function renderProfiles() {
  const allProfiles = getProfiles();
  heroProfileCount.textContent = allProfiles.length;
  document.querySelectorAll('.footer-databank-count').forEach(el => {
    el.textContent = allProfiles.length;
  });

  const searchQuery = databankSearchInput.value.toLowerCase().trim();
  const filterMode = databankFilterMode.value;
  const sortOption = databankSortSelect.value;

  // 1. Filter
  let filtered = allProfiles.filter(p => {
    if (filterMode !== 'all' && p.mode !== filterMode) return false;
    if (!searchQuery) return true;
    const matchName = p.name && p.name.toLowerCase().includes(searchQuery);
    const matchNotes = p.notes && p.notes.toLowerCase().includes(searchQuery);
    const matchCity = p.city && p.city.toLowerCase().includes(searchQuery);
    return matchName || matchNotes || matchCity;
  });

  // 2. Sort
  filtered.sort((a, b) => {
    if (sortOption === 'updated-desc') {
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    } else if (sortOption === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortOption === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    }
    return 0;
  });

  // 3. Render
  if (filtered.length === 0) {
    if (allProfiles.length === 0) {
      databankCardsContainer.innerHTML = `
        <div class="empty-databank-box" style="grid-column: 1 / -1;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🪐</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">No Client Profiles Saved Yet</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
            Create client profiles to keep your charts organized offline. Each profile can be opened in the Kundali Studio instantly.
          </p>
          <button id="btn-empty-add" class="btn btn-primary">✨ + Add First Client Profile</button>
        </div>
      `;
      const btnEmpty = document.getElementById('btn-empty-add');
      if (btnEmpty) btnEmpty.addEventListener('click', () => openModal(null));
    } else {
      databankCardsContainer.innerHTML = `
        <div class="empty-databank-box" style="grid-column: 1 / -1;">
          <h3 style="font-size: 1.15rem; color: var(--text-main);">No matching clients found</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">Try adjusting your search query or type filters.</p>
        </div>
      `;
    }
    return;
  }

  let html = '';
  filtered.forEach(p => {
    const isBirth = p.mode === 'birth';
    const initials = (p.name || 'C').substring(0, 2).toUpperCase();
    const updatedDateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Saved';

    html += `
      <div class="client-card">
        <div>
          <div class="client-card-header">
            <div class="client-avatar">${initials}</div>
            <div class="client-card-title">
              <h3>${p.name || 'Unnamed Client'}</h3>
              <p>${isBirth ? '🗓️ Birth Details Chart' : '📜 Raw Coordinates Entry'} • ${p.gender === 'female' ? '♀ Female' : '♂ Male'} • Updated ${updatedDateStr}</p>
            </div>
          </div>

          <div style="margin-top: 14px;">
            ${isBirth ? `
              <div class="client-details-grid">
                <div class="client-detail-item">
                  <span class="label">Date & Time</span>
                  <span class="val">${p.birthDate || '—'} ${p.birthTime || ''}</span>
                </div>
                <div class="client-detail-item">
                  <span class="label">Location</span>
                  <span class="val" title="${p.city || ''}">${p.city || 'Custom Coords'}</span>
                </div>
                <div class="client-detail-item">
                  <span class="label">Coordinates</span>
                  <span class="val">${p.lat ? p.lat + '°, ' + p.lon + '°' : '—'}</span>
                </div>
                <div class="client-detail-item">
                  <span class="label">Timezone</span>
                  <span class="val">UTC${p.tz >= 0 ? '+' : ''}${p.tz || 0}</span>
                </div>
              </div>
            ` : `
              <div style="background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; font-family: monospace; color: var(--gold-light);">
                ${p.rawInput ? p.rawInput.split('\n').slice(0, 2).join(' ') + '...' : 'Pasted coordinates'}
              </div>
            `}
          </div>

          ${p.notes ? `
            <div style="margin-top: 12px;">
              <div class="client-notes-box">📝 ${p.notes}</div>
            </div>
          ` : ''}

          ${p.lifeEvents && p.lifeEvents.length > 0 ? `
            <div style="margin-top: 10px;">
              <span class="badge" style="background: rgba(96, 165, 250, 0.15); color: #93C5FD; border: 1px solid rgba(96, 165, 250, 0.3); font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                📅 ${p.lifeEvents.length} Life Event${p.lifeEvents.length > 1 ? 's' : ''} Logged
              </span>
            </div>
          ` : ''}
        </div>

        <div class="client-card-actions">
          <div style="display: flex; gap: 6px;">
            <a href="studio.html?profileId=${p.id}" class="btn btn-primary btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
              🚀 Kundali
            </a>
            <a href="studio.html?profileId=${p.id}&tab=timeline" class="btn btn-secondary btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="Open Life Events & Rectification Timeline">
              📅 Timeline
            </a>
          </div>

          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm btn-edit-profile" data-id="${p.id}" title="Edit profile details">✏️</button>
            <button class="btn btn-secondary btn-sm btn-delete-profile" data-id="${p.id}" style="color: #EF4444;" title="Delete profile">🗑️</button>
          </div>
        </div>
      </div>
    `;
  });

  databankCardsContainer.innerHTML = html;

  // Attach button events
  databankCardsContainer.querySelectorAll('.btn-edit-profile').forEach(b => {
    b.addEventListener('click', () => openModal(b.getAttribute('data-id')));
  });
  databankCardsContainer.querySelectorAll('.btn-delete-profile').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      openDeleteConfirm(b.getAttribute('data-id'));
    });
  });
}

function openModal(profileId = null) {
  editProfileId.value = profileId || '';

  if (profileId) {
    const prof = getProfileById(profileId);
    if (!prof) return;

    modalHeadingTitle.textContent = `Edit Profile: ${prof.name}`;
    modalTitleIcon.textContent = '✏️';
    formClientName.value = prof.name || '';
    formClientNotes.value = prof.notes || '';
    if (formClientGender) formClientGender.value = prof.gender || 'male';

    if (prof.mode === 'paste') {
      setModalMode('paste');
      formRawCoords.value = prof.rawInput || '';
    } else {
      setModalMode('birth');
      formBirthDate.value = prof.birthDate || '1994-03-15';
      formBirthTime.value = prof.birthTime || '12:00:00';
      formCityInput.value = prof.city || 'New Delhi, India';
      formLat.value = prof.lat || 28.6139;
      formLon.value = prof.lon || 77.2090;
      formTz.value = prof.tz || 5.5;
    }
  } else {
    modalHeadingTitle.textContent = 'Create New Client Profile';
    modalTitleIcon.textContent = '✨';
    formClientName.value = '';
    formClientNotes.value = '';
    if (formClientGender) formClientGender.value = 'male';
    setModalMode('birth');
    formBirthDate.value = '1994-03-15';
    formBirthTime.value = '12:00:00';
    formCityInput.value = 'New Delhi, India';
    formLat.value = '28.6139';
    formLon.value = '77.2090';
    formTz.value = '5.5';
    formRawCoords.value = '';
  }

  profileEditModal.style.display = 'flex';
  formClientName.focus();
}

function closeModal() {
  profileEditModal.style.display = 'none';
}

function handleSaveSubmit() {
  const name = formClientName.value.trim();
  if (!name) {
    showToast('Please enter a client name.');
    formClientName.focus();
    return;
  }

  const existingId = editProfileId.value || undefined;
  const profileData = {
    id: existingId,
    name,
    notes: formClientNotes.value.trim(),
    gender: formClientGender ? formClientGender.value : 'male',
    mode: currentFormMode
  };

  if (currentFormMode === 'birth') {
    profileData.birthDate = formBirthDate.value;
    profileData.birthTime = formBirthTime.value;
    profileData.city = formCityInput.value;
    profileData.lat = parseFloat(formLat.value) || 28.6139;
    profileData.lon = parseFloat(formLon.value) || 77.2090;
    profileData.tz = parseFloat(formTz.value) || 5.5;
  } else {
    profileData.rawInput = formRawCoords.value;
  }

  saveProfile(profileData);
  closeModal();
  renderProfiles();
  showToast(`Profile "${name}" saved to Databank!`);
}

function openDeleteConfirm(id) {
  pendingDeleteId = id;
  if (id === '__ALL__') {
    deleteConfirmText.textContent = 'Are you sure you want to permanently clear ALL saved profiles from your Databank?';
  } else {
    const prof = getProfileById(id);
    const name = prof ? prof.name : 'this client';
    deleteConfirmText.textContent = `Are you sure you want to permanently delete profile "${name}"?`;
  }
  deleteConfirmModal.style.display = 'flex';
}

function closeDeleteConfirm() {
  pendingDeleteId = null;
  deleteConfirmModal.style.display = 'none';
}

function executeDelete() {
  if (!pendingDeleteId) return;
  if (pendingDeleteId === '__ALL__') {
    clearAllProfiles();
    closeDeleteConfirm();
    renderProfiles();
    showToast('All profiles cleared.');
    return;
  }
  const prof = getProfileById(pendingDeleteId);
  const name = prof ? prof.name : 'Client';
  deleteProfile(pendingDeleteId);
  closeDeleteConfirm();
  renderProfiles();
  showToast(`Profile "${name}" deleted.`);
}

function handleExport() {
  const jsonStr = exportProfilesJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jyotish_client_databank_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded Client Databank JSON backup!');
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      importProfilesJSON(event.target.result);
      renderProfiles();
      showToast('Profiles imported successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to parse JSON file.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function showToast(msg) {
  if (!toastEl) return;
  toastMessageEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2600);
}

// Start
init();
