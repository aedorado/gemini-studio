// Client Databank & Local Storage Profile Manager
import { DEFAULT_PROFILES } from './defaultProfiles.js';

const STORAGE_KEY = 'jyotish_gemini_profiles_v5';
const OLD_STORAGE_KEY = 'jyotish_gemini_profiles_v4';

export function getProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First load or upgrade from v4 / v3
      const oldRaw = localStorage.getItem(OLD_STORAGE_KEY) || localStorage.getItem('jyotish_gemini_profiles_v3');
      let profiles = [...DEFAULT_PROFILES];
      if (oldRaw) {
        try {
          const oldProfiles = JSON.parse(oldRaw);
          const defaultMap = new Map(DEFAULT_PROFILES.map(p => [p.id, p]));

          // Start from DEFAULT_PROFILES to ensure updated profiles, coordinates, and default lifeEvents
          profiles = [...DEFAULT_PROFILES];

          // Preserve any custom user-added profiles and any custom lifeEvents / notes
          for (let p of oldProfiles) {
            if (defaultMap.has(p.id)) {
              const def = defaultMap.get(p.id);
              const target = profiles.find(pr => pr.id === p.id);
              if (target) {
                // If the user in an earlier session logged additional lifeEvents not in default, merge them
                if (Array.isArray(p.lifeEvents) && p.lifeEvents.length > 0) {
                  const defEventIds = new Set((def.lifeEvents || []).map(e => e.id));
                  const mergedEvents = [...(def.lifeEvents || [])];
                  for (let ev of p.lifeEvents) {
                    if (!defEventIds.has(ev.id)) {
                      mergedEvents.push(ev);
                    }
                  }
                  target.lifeEvents = mergedEvents;
                }
                // Preserve custom notes if user had edited them
                if (p.notes && p.notes !== def.notes && !def.notes) {
                  target.notes = p.notes;
                }
              }
            } else {
              // Custom user-created profile: preserve!
              profiles.push(p);
            }
          }
        } catch (e) {
          console.error('Failed to migrate profiles from previous version:', e);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      return profiles;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read profiles from localStorage:', err);
    return [...DEFAULT_PROFILES];
  }
}

export function getProfileById(id) {
  try {
    const profiles = getProfiles();
    return profiles.find(p => p.id === id) || null;
  } catch (err) {
    console.error('Failed to get profile by id:', err);
    return null;
  }
}

export function saveProfile(profile) {
  try {
    const profiles = getProfiles();
    const id = profile.id || `profile_${Date.now()}`;
    const updated = {
      ...profile,
      id,
      updatedAt: new Date().toISOString()
    };

    const existingIdx = profiles.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
      profiles[existingIdx] = updated;
    } else {
      profiles.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return updated;
  } catch (err) {
    console.error('Failed to save profile:', err);
    return null;
  }
}

export function deleteProfile(id) {
  try {
    const profiles = getProfiles().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return true;
  } catch (err) {
    console.error('Failed to delete profile:', err);
    return false;
  }
}

export function clearAllProfiles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (err) {
    console.error('Failed to clear profiles:', err);
    return [];
  }
}

export function resetToDefaultProfiles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
    return [...DEFAULT_PROFILES];
  } catch (err) {
    console.error('Failed to reset default profiles:', err);
    return [];
  }
}

export function exportProfilesJSON() {
  const profiles = getProfiles();
  return JSON.stringify(profiles, null, 2);
}

export function importProfilesJSON(jsonStr) {
  try {
    const imported = JSON.parse(jsonStr);
    if (!Array.isArray(imported)) throw new Error('Expected JSON array');
    const existing = getProfiles();
    const existingIds = new Set(existing.map(p => p.id));

    for (let p of imported) {
      if (!existingIds.has(p.id)) {
        existing.push(p);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return existing;
  } catch (err) {
    console.error('Failed to import profiles:', err);
    throw err;
  }
}
