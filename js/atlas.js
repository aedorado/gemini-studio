// Client-side Astrological Atlas (Zero API Calls, Infinite Scale, 100% Offline)

let cityDatabase = null;
let isLoading = false;
let loadPromise = null;

/**
 * Lazy loads the 7,300+ city database on-demand.
 * Zero initial load overhead; fast client-side searching.
 */
export async function loadAtlas() {
  if (cityDatabase) return cityDatabase;
  if (loadPromise) return loadPromise;

  isLoading = true;

  if (typeof window === 'undefined') {
    // Node.js environment
    loadPromise = import('fs/promises')
      .then(fs => import('url').then(url => {
        const filePath = url.fileURLToPath(new URL('./data/cityMap.json', import.meta.url));
        return fs.readFile(filePath, 'utf-8');
      }))
      .then(raw => {
        const data = JSON.parse(raw);
        cityDatabase = data.sort((a, b) => (b.pop || 0) - (a.pop || 0));
        isLoading = false;
        return cityDatabase;
      });
  } else {
    // Browser environment
    loadPromise = fetch('./js/data/cityMap.json')
      .then(res => res.json())
      .then(data => {
        cityDatabase = data.sort((a, b) => (b.pop || 0) - (a.pop || 0));
        isLoading = false;
        return cityDatabase;
      })
      .catch(err => {
        console.error('Failed to load city database:', err);
        isLoading = false;
        return [];
      });
  }

  return loadPromise;
}


/**
 * Performs fast, prefix-priority search on the local city database.
 * Matches city name, province/state, and country.
 */
export async function searchCities(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];

  const db = await loadAtlas();
  const qClean = query.trim().toLowerCase();

  const exactMatches = [];
  const startsWithMatches = [];
  const containsMatches = [];

  for (let c of db) {
    const cityName = (c.city || '').toLowerCase();
    const cityAscii = (c.city_ascii || '').toLowerCase();
    const province = (c.province || '').toLowerCase();
    const country = (c.country || '').toLowerCase();

    if (cityName === qClean || cityAscii === qClean) {
      exactMatches.push(c);
    } else if (cityName.startsWith(qClean) || cityAscii.startsWith(qClean)) {
      startsWithMatches.push(c);
    } else if (cityName.includes(qClean) || province.includes(qClean) || country.includes(qClean)) {
      containsMatches.push(c);
    }

    if (exactMatches.length + startsWithMatches.length >= limit * 2) {
      break;
    }
  }

  const combined = [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, limit);

  return combined.map(c => {
    return {
      city: c.city,
      cityName: c.city,
      province: c.province || '',
      country: c.country,
      lat: Number(c.lat.toFixed(4)),
      lon: Number(c.lng.toFixed(4)),
      timezone: c.timezone,
      displayLabel: `${c.city}${c.province ? ', ' + c.province : ''}, ${c.country}`
    };
  });
}

/**
 * Calculates historical timezone offset in decimal hours using browser's built-in Intl API.
 * e.g. "Asia/Kolkata" -> 5.5, "America/New_York" in winter -> -5, in summer (DST) -> -4.
 */
export function getTimezoneOffsetHours(tzString, dateObj = new Date()) {
  if (!tzString) return 5.5; // default IST

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzString,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(dateObj);
    const getVal = type => parseInt(parts.find(p => p.type === type).value, 10);

    const year = getVal('year');
    const month = getVal('month');
    const day = getVal('day');
    const hour = getVal('hour') % 24;
    const minute = getVal('minute');
    const second = getVal('second');

    // Local timestamp in target timezone
    const targetLocalMs = Date.UTC(year, month - 1, day, hour, minute, second);
    const utcMs = dateObj.getTime();

    // Offset in hours
    const offsetHours = (targetLocalMs - utcMs) / (3600 * 1000);
    return Math.round(offsetHours * 100) / 100;
  } catch (err) {
    console.warn(`Timezone calculation fallback for ${tzString}:`, err);
    // Indian cities default
    if (tzString.includes('Kolkata') || tzString.includes('Calcutta')) return 5.5;
    return 0;
  }
}
