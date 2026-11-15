/**
 * Benchmark Truth Data for Profile 102: Vinod Shantal Daughter (Female Newborn)
 * Source: Official Classical AstroSage Kundli & Parashara Calculations (102-vbd.pdf)
 * Birth Details: 14 November 2026, 16:37:00 IST (+05:30), Mumbai, India
 * Coordinates: 19° 04' N, 72° 52' E (Lat: 19.0667° N, Lon: 72.8667° E)
 * Ayanamsha: 24° 13' 54" (Lahiri)
 */

export const VBD_PROFILE = {
  name: 'Vinod Shantal Daughter',
  gender: 'Female',
  dob: '2026-11-14',
  tob: '16:37:00',
  pob: 'Mumbai, India',
  lat: 19.0667,
  lon: 72.8667,
  tz: 5.5,
  sunrise: 6 + 45/60 + 16/3600, // 06:45:16
  sunset: 18 + 0/60 + 34/3600,   // 18:00:34
  rawInput: `Planets Sign Latitude Nakshatra Pada
ASC Aries 04-54-29 Ashvini 2
Sun Libra 27-51-42 Vishakha 3
Moon Sagittarius 24-48-01 Purvashadha 4
Mars Leo 00-50-09 Magha 1
Merc Libra 10-51-34 Swati 2
Jupt Leo 01-27-41 Magha 1
Venu Virgo 28-37-55 Chitra 2
Satn [R] Pisces 14-17-29 Uttarabhadra 4
Rahu [R] Aquarius 01-07-13 Dhanishta 3
Ketu [R] Leo 01-07-13 Magha 1
Uran [R] Taurus 09-56-59 Krittika 4
Nept [R] Pisces 07-32-36 Uttarabhadra 2
Plut Capricorn 08-50-49 Uttarashadha 4`
};

export const VBD_PLANETARY_BENCHMARK = [
  { key: 'ASC', sign: 'Aries', deg: 4, min: 54, sec: 29, nakshatra: 'Ashvini', pada: 2, isRetro: false },
  { key: 'Sun', sign: 'Libra', deg: 27, min: 51, sec: 42, nakshatra: 'Vishakha', pada: 3, isRetro: false },
  { key: 'Moon', sign: 'Sagittarius', deg: 24, min: 48, sec: 1, nakshatra: 'Purva Ashadha', altNakshatra: 'Purvashadha', pada: 4, isRetro: false },
  { key: 'Mars', sign: 'Leo', deg: 0, min: 50, sec: 9, nakshatra: 'Magha', pada: 1, isRetro: false },
  { key: 'Merc', sign: 'Libra', deg: 10, min: 51, sec: 34, nakshatra: 'Svati', altNakshatra: 'Swati', pada: 2, isRetro: false },
  { key: 'Jupt', sign: 'Leo', deg: 1, min: 27, sec: 41, nakshatra: 'Magha', pada: 1, isRetro: false },
  { key: 'Venu', sign: 'Virgo', deg: 28, min: 37, sec: 55, nakshatra: 'Chitra', pada: 2, isRetro: false },
  { key: 'Satn', sign: 'Pisces', deg: 14, min: 17, sec: 29, nakshatra: 'Uttara Bhadrapada', altNakshatra: 'Uttarabhadra', pada: 4, isRetro: true },
  { key: 'Rahu', sign: 'Aquarius', deg: 1, min: 7, sec: 13, nakshatra: 'Dhanishta', pada: 3, isRetro: true },
  { key: 'Ketu', sign: 'Leo', deg: 1, min: 7, sec: 13, nakshatra: 'Magha', pada: 1, isRetro: true }
];

export const VBD_SHODASHVARGA_BENCHMARK = {
  // Signs (1=Aries .. 12=Pisces) for [ASC, Sun, Moon, Mars, Mer, Jup, Ven, Sat, Rah, Ket]
  D1:  [1, 7, 9, 5, 7, 5, 6, 12, 11, 5],
  D2:  [5, 4, 4, 5, 5, 5, 5, 4, 5, 5],
  D3:  [1, 3, 5, 5, 11, 5, 2, 4, 11, 5],
  D4:  [1, 4, 6, 5, 10, 5, 3, 3, 11, 5],
  D7:  [2, 1, 2, 5, 9, 5, 6, 9, 11, 5], // AstroSage PDF has 1 for Lagna at 4° 17' border
  D9:  [2, 3, 8, 1, 10, 1, 6, 8, 7, 1],
  D10: [2, 4, 5, 5, 10, 5, 11, 12, 11, 5],
  D12: [2, 6, 6, 5, 11, 5, 5, 5, 11, 5],
  D16: [3, 3, 10, 5, 6, 5, 12, 4, 5, 5],
  D20: [4, 7, 9, 9, 8, 9, 12, 2, 9, 9],
  D24: [8, 3, 12, 5, 1, 6, 2, 3, 5, 5],
  D27: [5, 8, 11, 1, 4, 2, 5, 10, 8, 2],
  D30: [1, 7, 3, 1, 9, 1, 8, 12, 1, 1],
  D40: [7, 2, 10, 2, 3, 2, 9, 2, 2, 2],
  D45: [8, 6, 10, 6, 5, 7, 3, 6, 6, 6],
  D60: [10, 2, 10, 6, 4, 7, 3, 4, 1, 7]
};

export const VBD_SHADBALA_BENCHMARK = {
  Sun: {
    ochcha: 5.95, saptavarga: 71.25, ojayugma: 30, kendra: 60, drekkana: 0, sthanaBala: 167.20,
    digBala: 40.22,
    nathonnatha: 38.83, paksha: 41.02, thribhaga: 0, abda: 15, masa: 0, vara: 0, hora: 0, ayana: 13.60, yuddha: 0, kalaBala: 108.45,
    chestaBala: 12.64, naisargikaBala: 60, drikBala: -9.71,
    totalVirupas: 378.79, totalRupas: 6.31, requiredRupas: 5, strengthRatio: 1.26, rank: 2
  },
  Moon: {
    ochcha: 17.27, saptavarga: 120.00, ojayugma: 15, kendra: 15, drekkana: 15, sthanaBala: 182.27,
    digBala: 0.80,
    nathonnatha: 21.17, paksha: 41.02, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 58.08, yuddha: 0, kalaBala: 120.27,
    chestaBala: 18.98, naisargikaBala: 51.42, drikBala: -6.34,
    totalVirupas: 367.40, totalRupas: 6.12, requiredRupas: 6, strengthRatio: 1.02, rank: 7
  },
  Mars: {
    ochcha: 0.95, saptavarga: 172.50, ojayugma: 30, kendra: 30, drekkana: 15, sthanaBala: 248.45,
    digBala: 11.21,
    nathonnatha: 21.17, paksha: 41.02, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 60, ayana: 46.69, yuddha: 0, kalaBala: 168.89,
    chestaBala: 36.43, naisargikaBala: 17.16, drikBala: -18.49,
    totalVirupas: 463.64, totalRupas: 7.73, requiredRupas: 5, strengthRatio: 1.55, rank: 1
  },
  Merc: {
    ochcha: 51.38, saptavarga: 71.25, ojayugma: 15, kendra: 60, drekkana: 15, sthanaBala: 212.63,
    digBala: 1.98,
    nathonnatha: 60.00, paksha: 41.02, thribhaga: 0, abda: 0, masa: 30, vara: 0, hora: 0, ayana: 46.76, yuddha: 0, kalaBala: 177.78,
    chestaBala: 44.02, naisargikaBala: 25.74, drikBala: -13.58,
    totalVirupas: 448.58, totalRupas: 7.48, requiredRupas: 7, strengthRatio: 1.07, rank: 5
  },
  Jupt: {
    ochcha: 51.18, saptavarga: 127.50, ojayugma: 30, kendra: 30, drekkana: 15, sthanaBala: 253.68,
    digBala: 21.15,
    nathonnatha: 38.83, paksha: 18.98, thribhaga: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 46.43, yuddha: 0, kalaBala: 164.24,
    chestaBala: 30.34, naisargikaBala: 34.26, drikBala: -18.10,
    totalVirupas: 485.57, totalRupas: 8.09, requiredRupas: 6.5, strengthRatio: 1.25, rank: 3
  },
  Venu: {
    ochcha: 0.54, saptavarga: 127.50, ojayugma: 30, kendra: 15, drekkana: 15, sthanaBala: 188.04,
    digBala: 29.53,
    nathonnatha: 38.83, paksha: 18.98, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 18.73, yuddha: 0, kalaBala: 76.54,
    chestaBala: 49.99, naisargikaBala: 42.84, drikBala: -16.56,
    totalVirupas: 370.38, totalRupas: 6.17, requiredRupas: 5.5, strengthRatio: 1.12, rank: 4
  },
  Satn: {
    ochcha: 11.90, saptavarga: 30.00, ojayugma: 0, kendra: 15, drekkana: 15, sthanaBala: 71.90,
    digBala: 6.87,
    nathonnatha: 21.17, paksha: 41.02, thribhaga: 60, abda: 0, masa: 0, vara: 45, hora: 0, ayana: 25.71, yuddha: 0, kalaBala: 192.91,
    chestaBala: 47.63, naisargikaBala: 8.58, drikBala: -9.57,
    totalVirupas: 318.32, totalRupas: 5.31, requiredRupas: 5, strengthRatio: 1.06, rank: 6
  }
};

export const VBD_BHAVABALA_BENCHMARK = [
  { house: 1,  adhipati: 463.64, digBala: 30, drishtiBala: 3.89,   totalVirupas: 497.54, rupas: 8.29, rank: 4 },
  { house: 2,  adhipati: 370.38, digBala: 20, drishtiBala: -49.78, totalVirupas: 340.60, rupas: 5.68, rank: 11 },
  { house: 3,  adhipati: 448.58, digBala: 10, drishtiBala: -59.85, totalVirupas: 398.74, rupas: 6.65, rank: 7 },
  { house: 4,  adhipati: 367.40, digBala: 30, drishtiBala: -49.81, totalVirupas: 347.59, rupas: 5.79, rank: 10 },
  { house: 5,  adhipati: 378.79, digBala: 50, drishtiBala: -23.31, totalVirupas: 405.49, rupas: 6.76, rank: 6 },
  { house: 6,  adhipati: 448.58, digBala: 10, drishtiBala: -15.33, totalVirupas: 443.25, rupas: 7.39, rank: 5 },
  { house: 7,  adhipati: 370.38, digBala: 0,  drishtiBala: -1.23,  totalVirupas: 369.15, rupas: 6.15, rank: 9 },
  { house: 8,  adhipati: 463.64, digBala: 50, drishtiBala: 21.22,  totalVirupas: 534.86, rupas: 8.91, rank: 1 },
  { house: 9,  adhipati: 485.57, digBala: 40, drishtiBala: 8.23,   totalVirupas: 533.80, rupas: 8.90, rank: 2 },
  { house: 10, adhipati: 318.32, digBala: 60, drishtiBala: -4.17,  totalVirupas: 374.15, rupas: 6.24, rank: 8 },
  { house: 11, adhipati: 318.32, digBala: 10, drishtiBala: 2.20,   totalVirupas: 330.52, rupas: 5.51, rank: 12 },
  { house: 12, adhipati: 485.57, digBala: 20, drishtiBala: 11.07,  totalVirupas: 516.64, rupas: 8.61, rank: 3 }
];

export const VBD_ASHTAKAVARGA_BENCHMARK = {
  bav: {
    Sun:  [4, 3, 6, 3, 4, 5, 3, 3, 3, 4, 5, 5],
    Moon: [3, 7, 5, 5, 4, 3, 3, 2, 5, 5, 4, 3],
    Mars: [2, 3, 4, 3, 4, 3, 2, 2, 3, 3, 6, 4],
    Merc: [4, 4, 5, 5, 3, 7, 4, 4, 3, 5, 4, 6],
    Jupt: [3, 6, 6, 5, 7, 3, 6, 4, 2, 5, 6, 3],
    Venu: [5, 5, 6, 5, 4, 2, 4, 4, 7, 4, 3, 3],
    Satn: [2, 5, 4, 7, 4, 2, 3, 1, 2, 5, 3, 1]
  },
  sav: [23, 33, 36, 33, 30, 25, 25, 20, 25, 31, 31, 25],
  totalBindus: 337
};

export const VBD_DASHA_BENCHMARK = {
  startingLord: 'Venu',
  startingSpanYears: 20,
  birthDate: '2026-11-14',
  mahadashas: [
    { lord: 'Venu', years: 20, startApprox: '2026-11-14', endApprox: '2029-09-02' },
    { lord: 'Sun',  years: 6,  startApprox: '2029-09-02', endApprox: '2035-09-02' },
    { lord: 'Moon', years: 10, startApprox: '2035-09-02', endApprox: '2045-09-02' },
    { lord: 'Mars', years: 7,  startApprox: '2045-09-02', endApprox: '2052-09-02' },
    { lord: 'Rahu', years: 18, startApprox: '2052-09-02', endApprox: '2070-09-02' },
    { lord: 'Jupt', years: 16, startApprox: '2070-09-02', endApprox: '2086-09-02' },
    { lord: 'Satn', years: 19, startApprox: '2086-09-02', endApprox: '2105-09-02' },
    { lord: 'Merc', years: 17, startApprox: '2105-09-02', endApprox: '2122-09-02' },
    { lord: 'Ketu', years: 7,  startApprox: '2122-09-02', endApprox: '2129-09-02' }
  ]
};

export const VBD_CHALIT_BENCHMARK = [
  { house: 1,  beginSign: 'Pisces',      beginDms: '18.37.33', midSign: 'Aries',       midDms: '04.54.29' },
  { house: 2,  beginSign: 'Aries',       beginDms: '18.37.33', midSign: 'Taurus',      midDms: '02.20.36' },
  { house: 3,  beginSign: 'Taurus',      beginDms: '16.03.40', midSign: 'Taurus',      midDms: '29.46.44' },
  { house: 4,  beginSign: 'Gemini',      beginDms: '13.29.48', midSign: 'Gemini',      midDms: '27.12.52' },
  { house: 5,  beginSign: 'Cancer',      beginDms: '13.29.48', midSign: 'Cancer',      midDms: '29.46.44' },
  { house: 6,  beginSign: 'Leo',         beginDms: '16.03.40', midSign: 'Virgo',       midDms: '02.20.36' },
  { house: 7,  beginSign: 'Virgo',       beginDms: '18.37.33', midSign: 'Libra',       midDms: '04.54.29' },
  { house: 8,  beginSign: 'Libra',       beginDms: '18.37.33', midSign: 'Scorpio',     altMidSign: 'Scorpion', midDms: '02.20.36' },
  { house: 9,  beginSign: 'Scorpio',     altBeginSign: 'Scorpion', beginDms: '16.03.40', midSign: 'Scorpio', altMidSign: 'Scorpion', midDms: '29.46.44' },
  { house: 10, beginSign: 'Sagittarius', beginDms: '13.29.48', midSign: 'Sagittarius', midDms: '27.12.52' },
  { house: 11, beginSign: 'Capricorn',   beginDms: '13.29.48', midSign: 'Capricorn',   midDms: '29.46.44' },
  { house: 12, beginSign: 'Aquarius',    beginDms: '16.03.40', midSign: 'Pisces',      midDms: '02.20.36' }
];

export const VBD_CHALIT_SHIFTS_BENCHMARK = [
  { planet: 'Sun',  rashiHouse: 7, chalitHouse: 8,  shiftDescription: 'Sun shifted: H7 (Libra 27° 51\') -> H8 (after Bhav 8 Sandhi Libra 18° 37\')' },
  { planet: 'Moon', rashiHouse: 9, chalitHouse: 10, shiftDescription: 'Moon shifted: H9 (Sagittarius 24° 48\') -> H10 (after Bhav 10 Sandhi Sagittarius 13° 29\')' },
  { planet: 'Venu', rashiHouse: 6, chalitHouse: 7,  shiftDescription: 'Venu shifted: H6 (Virgo 28° 37\') -> H7 (after Bhav 7 Sandhi Virgo 18° 37\')' }
];

export const VBD_CHARA_KARAKAS_BENCHMARK = [
  { karakaKey: 'AK',  planet: 'Venus',   signName: 'Virgo' },
  { karakaKey: 'AmK', planet: 'Sun',     signName: 'Libra' },
  { karakaKey: 'BK',  planet: 'Moon',    signName: 'Sagittarius' },
  { karakaKey: 'MK',  planet: 'Saturn',  signName: 'Pisces' },
  { karakaKey: 'PK',  planet: 'Mercury', signName: 'Libra' },
  { karakaKey: 'GK',  planet: 'Jupiter', signName: 'Leo' },
  { karakaKey: 'DK',  planet: 'Mars',    signName: 'Leo' }
];

export const VBD_JAIMINI_PADAS_BENCHMARK = {
  AL: { signName: 'Sagittarius', houseNumber: 9,  signIndex: 8 },
  UL: { signName: 'Capricorn',   houseNumber: 10, signIndex: 9 },
  A7: { signName: 'Leo',         houseNumber: 5,  signIndex: 4 }
};

export const VBD_FRIENDSHIP_BENCHMARK = {
  temporal: {
    Sun:  { Moon: 'Friend', Mars: 'Friend', Merc: 'Enemy',  Jupt: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Moon: { Sun: 'Friend',  Mars: 'Enemy',  Merc: 'Friend', Jupt: 'Enemy',  Venu: 'Friend', Satn: 'Friend' },
    Mars: { Sun: 'Friend',  Moon: 'Enemy',  Merc: 'Friend', Jupt: 'Enemy',  Venu: 'Friend', Satn: 'Enemy' },
    Merc: { Sun: 'Enemy',   Moon: 'Friend', Mars: 'Friend', Jupt: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Jupt: { Sun: 'Friend',  Moon: 'Enemy',  Mars: 'Enemy',  Merc: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Venu: { Sun: 'Friend',  Moon: 'Friend', Mars: 'Friend', Merc: 'Friend', Jupt: 'Friend', Satn: 'Enemy' },
    Satn: { Sun: 'Enemy',   Moon: 'Friend', Mars: 'Enemy',  Merc: 'Enemy',  Jupt: 'Enemy',  Venu: 'Enemy' }
  },
  fiveFold: {
    Sun:  { Moon: 'Intimat', Mars: 'Intimat', Merc: 'Enemy',  Jupt: 'Intimat', Venu: 'Neutral', Satn: 'Bitter' },
    Moon: { Sun: 'Intimat',  Mars: 'Enemy',   Merc: 'Intimat', Jupt: 'Enemy',  Venu: 'Friend',  Satn: 'Friend' },
    Mars: { Sun: 'Intimat',  Moon: 'Neutral', Merc: 'Neutral', Jupt: 'Neutral', Venu: 'Friend',  Satn: 'Enemy' },
    Merc: { Sun: 'Neutral',  Moon: 'Neutral', Mars: 'Friend',  Jupt: 'Friend',  Venu: 'Intimat', Satn: 'Enemy' },
    Jupt: { Sun: 'Intimat',  Moon: 'Neutral', Mars: 'Neutral', Merc: 'Neutral', Venu: 'Neutral', Satn: 'Enemy' },
    Venu: { Sun: 'Neutral',  Moon: 'Neutral', Mars: 'Friend',  Merc: 'Intimat', Jupt: 'Friend',  Satn: 'Neutral' },
    Satn: { Sun: 'Bitter',   Moon: 'Neutral', Mars: 'Bitter',  Merc: 'Neutral', Jupt: 'Enemy',   Venu: 'Neutral' }
  }
};

