import * as Astronomy from './lib/astronomy.esm.js';
import { SIGNS, PLANETS } from './constants.js';
import { calculateNakshatraPada, formatDMS } from './parser.js';

export const POPULAR_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { name: 'Chennai, India', lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: 'Hyderabad, India', lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { name: 'Varanasi, India', lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060, tz: -5 },
  { name: 'San Francisco, USA', lat: 37.7749, lon: -122.4194, tz: -8 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 8 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, tz: 4 }
];

/**
 * Calculates high-precision IAU Lahiri (Chitra Paksha) Ayanamsha.
 */
export function getLahiriAyanamsha(utcDate) {
  const astroTime = Astronomy.MakeTime(utcDate);
  const T = astroTime.tt / 36525.0; // centuries since J2000.0
  // Canonical Chitra Paksha polynomial: Base 23° 51' 25.53" at J2000.0
  const ayanamshaSec = 85885.53 + (5029.0966 * T) + (1.11161 * T * T);
  return ayanamshaSec / 3600.0;
}

/**
 * Calculates full birth chart or transit chart from Date, Time, and Location.
 */
export function calculateChartFromBirthDetails({
  year,
  month,
  day,
  hour,
  minute,
  second = 0,
  lat = 28.6139,
  lon = 77.2090,
  tz = 5.5
}) {
  // 1. Calculate exact UTC Date
  const localMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const utcMs = localMs - (tz * 3600 * 1000);
  const utcDate = new Date(utcMs);
  const astroTime = Astronomy.MakeTime(utcDate);

  // 2. Lahiri Ayanamsha
  const ayanamsha = getLahiriAyanamsha(utcDate);

  // 3. Ascendant (Lagna) via Local Sidereal Time (RAMC)
  const gmstHours = Astronomy.SiderealTime(utcDate);
  let ramcDeg = (gmstHours * 15.0 + lon) % 360.0;
  if (ramcDeg < 0) ramcDeg += 360.0;

  const tilt = Astronomy.e_tilt(astroTime);
  const epsRad = tilt.tobl * (Math.PI / 180.0);
  const ramcRad = ramcDeg * (Math.PI / 180.0);
  const latRad = lat * (Math.PI / 180.0);

  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  let ascTropical = Math.atan2(y, x) * (180.0 / Math.PI);
  if (ascTropical < 0) ascTropical += 360.0;

  let ascSidereal = (ascTropical - ayanamsha) % 360.0;
  if (ascSidereal < 0) ascSidereal += 360.0;

  // 3b. Midheaven (MC / Madhya Lagna)
  let mcTropical = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)) * (180.0 / Math.PI);
  if (mcTropical < 0) mcTropical += 360.0;
  let mcSidereal = (mcTropical - ayanamsha) % 360.0;
  if (mcSidereal < 0) mcSidereal += 360.0;

  // 4. Calculate 7 Classical Planets
  const bodies = [
    { key: 'Sun', name: 'Sun', astroName: 'Sun' },
    { key: 'Moon', name: 'Moon', astroName: 'Moon' },
    { key: 'Mars', name: 'Mars', astroName: 'Mars' },
    { key: 'Merc', name: 'Mercury', astroName: 'Mercury' },
    { key: 'Jupt', name: 'Jupiter', astroName: 'Jupiter' },
    { key: 'Venu', name: 'Venus', astroName: 'Venus' },
    { key: 'Satn', name: 'Saturn', astroName: 'Saturn' }
  ];

  const results = [];

  // Add Ascendant record
  results.push(formatPlanetRecord('ASC', ascSidereal, false));

  // Velocity test time (+/- 1 hr) for retrograde detection
  const tPlus = new Date(utcMs + 3600 * 1000);
  const tMinus = new Date(utcMs - 3600 * 1000);

  for (let b of bodies) {
    const v = Astronomy.GeoVector(b.astroName, utcDate, true);
    const ecl = Astronomy.Ecliptic(v);
    const sid = ((ecl.elon - ayanamsha) % 360.0 + 360.0) % 360.0;

    // Retrograde check
    const vPlus = Astronomy.GeoVector(b.astroName, tPlus, true);
    const eclPlus = Astronomy.Ecliptic(vPlus);
    const vMinus = Astronomy.GeoVector(b.astroName, tMinus, true);
    const eclMinus = Astronomy.Ecliptic(vMinus);

    let dLon = eclPlus.elon - eclMinus.elon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const isRetro = dLon < 0;

    results.push(formatPlanetRecord(b.key, sid, isRetro));
  }

  // 5. Lunar Nodes (Rahu & Ketu - Mean Node)
  const T = astroTime.tt / 36525.0;
  let omega = 125.04452 - (1934.136261 * T) + (0.0020708 * T * T) + (T * T * T / 450000);
  omega = ((omega % 360.0) + 360.0) % 360.0;
  const rahuSid = ((omega - ayanamsha) % 360.0 + 360.0) % 360.0;
  const ketuSid = (rahuSid + 180.0) % 360.0;

  results.push(formatPlanetRecord('Rahu', rahuSid, true));
  results.push(formatPlanetRecord('Ketu', ketuSid, true));

  return {
    ayanamsha,
    utcDate,
    ascSidereal,
    mcSidereal,
    planets: results
  };
}

/**
 * Calculates current real-time planetary transits (Gochar).
 */
export function calculateTransits(targetDate = new Date()) {
  const utcDate = new Date(targetDate);
  const ayanamsha = getLahiriAyanamsha(utcDate);
  const astroTime = Astronomy.MakeTime(utcDate);

  const bodies = [
    { key: 'Sun', name: 'Sun', astroName: 'Sun' },
    { key: 'Moon', name: 'Moon', astroName: 'Moon' },
    { key: 'Mars', name: 'Mars', astroName: 'Mars' },
    { key: 'Merc', name: 'Mercury', astroName: 'Mercury' },
    { key: 'Jupt', name: 'Jupiter', astroName: 'Jupiter' },
    { key: 'Venu', name: 'Venus', astroName: 'Venus' },
    { key: 'Satn', name: 'Saturn', astroName: 'Saturn' }
  ];

  const results = [];
  const tPlus = new Date(utcDate.getTime() + 3600 * 1000);
  const tMinus = new Date(utcDate.getTime() - 3600 * 1000);

  for (let b of bodies) {
    const v = Astronomy.GeoVector(b.astroName, utcDate, true);
    const ecl = Astronomy.Ecliptic(v);
    const sid = ((ecl.elon - ayanamsha) % 360.0 + 360.0) % 360.0;

    const vPlus = Astronomy.GeoVector(b.astroName, tPlus, true);
    const eclPlus = Astronomy.Ecliptic(vPlus);
    const vMinus = Astronomy.GeoVector(b.astroName, tMinus, true);
    const eclMinus = Astronomy.Ecliptic(vMinus);

    let dLon = eclPlus.elon - eclMinus.elon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const isRetro = dLon < 0;

    results.push(formatPlanetRecord(b.key, sid, isRetro));
  }

  const T = astroTime.tt / 36525.0;
  let omega = 125.04452 - (1934.136261 * T) + (0.0020708 * T * T) + (T * T * T / 450000);
  omega = ((omega % 360.0) + 360.0) % 360.0;
  const rahuSid = ((omega - ayanamsha) % 360.0 + 360.0) % 360.0;
  const ketuSid = (rahuSid + 180.0) % 360.0;

  results.push(formatPlanetRecord('Rahu', rahuSid, true));
  results.push(formatPlanetRecord('Ketu', ketuSid, true));

  return {
    ayanamsha,
    date: utcDate,
    planets: results
  };
}

function formatPlanetRecord(key, absLongitude, isRetro) {
  const normDeg = ((absLongitude % 360) + 360) % 360;
  const signId = Math.floor(normDeg / 30) + 1;
  const degInSign = normDeg % 30;
  const signObj = SIGNS[signId - 1];
  const planetMeta = PLANETS.find(p => p.key === key);
  const nakInfo = calculateNakshatraPada(normDeg);

  const d = Math.floor(degInSign);
  const mFloat = (degInSign - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);

  return {
    key,
    name: planetMeta ? planetMeta.name : key,
    sanskrit: planetMeta ? planetMeta.sanskrit : key,
    symbol: planetMeta ? planetMeta.symbol : key,
    color: planetMeta ? planetMeta.color : '#A855F7',
    isRetro,
    signId,
    signIndex: signId - 1,
    longitude: Number(normDeg.toFixed(6)),
    absLongitude: Number(normDeg.toFixed(6)),
    signName: signObj.name,
    signSanskrit: signObj.sanskrit,
    signLord: signObj.lord,
    degInSign,
    degDms: { deg: d, min: m, sec: s, decimal: degInSign },
    dmsFormatted: formatDMS(degInSign),
    nakshatraName: nakInfo.nakshatraName,
    pada: nakInfo.pada,
    nakshatraLord: nakInfo.nakshatraLord,
    fractionInNakshatra: nakInfo.fractionInNakshatra
  };
}
