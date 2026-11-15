/**
 * Benchmark Truth Data for Profile 3: Prashant Kumar
 * Source: Official Classical AstroSage Kundli & Parashara Calculations
 * Birth Details: 23 August 1996, 04:50:00 IST (+05:30), New Delhi, India
 * Coordinates: 28.6139° N, 77.2090° E
 */

export const PRASHANT_KUMAR_PROFILE = {
  name: 'Prashant Kumar',
  dob: '1996-08-23',
  tob: '04:50:00',
  pob: 'New Delhi, India',
  lat: 28.6139,
  lon: 77.2090,
  tz: 5.5,
  rawInput: `Planets Sign Latitude Nakshatra Pada
ASC Cancer 21-36-35 Ashlesha 2
Sun Leo 06-19-00 Magha 2
Moon Scorpion 16-44-50 Jyeshtha 1
Mars Gemini 24-48-53 Punarvasu 2
Merc Virgo 03-35-08 Uttaraphal 3
Jupt [R] Sagittarius 14-16-14 Purvashadha 1
Venu Gemini 20-35-11 Punarvasu 1
Satn [R] Pisces 12-34-56 Uttarabhadra 3
Rahu [R] Virgo 16-10-47 Hasta 2
Ketu [R] Pisces 16-10-47 Uttarabhadra 4
Uran [R] Capricorn 07-48-21 Uttarashadha 4
Nept [R] Capricorn 01-36-29 Uttarashadha 2
Plut Scorpion 06-30-08 Anuradha 1`
};

export const PRASHANT_PLANETARY_BENCHMARK = [
  { key: 'ASC', sign: 'Cancer', deg: 21, min: 36, sec: 35, nakshatra: 'Ashlesha', pada: 2, isRetro: false },
  { key: 'Sun', sign: 'Leo', deg: 6, min: 19, sec: 0, nakshatra: 'Magha', pada: 2, isRetro: false },
  { key: 'Moon', sign: 'Scorpio', altSign: 'Scorpion', deg: 16, min: 44, sec: 50, nakshatra: 'Jyeshtha', pada: 1, isRetro: false },
  { key: 'Mars', sign: 'Gemini', deg: 24, min: 48, sec: 53, nakshatra: 'Punarvasu', pada: 2, isRetro: false },
  { key: 'Merc', sign: 'Virgo', deg: 3, min: 35, sec: 8, nakshatra: 'Uttara Phalguni', altNakshatra: 'Uttaraphal', pada: 3, isRetro: false },
  { key: 'Jupt', sign: 'Sagittarius', deg: 14, min: 16, sec: 14, nakshatra: 'Purva Ashadha', altNakshatra: 'Purvashadha', pada: 1, isRetro: true },
  { key: 'Venu', sign: 'Gemini', deg: 20, min: 35, sec: 11, nakshatra: 'Punarvasu', pada: 1, isRetro: false },
  { key: 'Satn', sign: 'Pisces', deg: 12, min: 34, sec: 56, nakshatra: 'Uttara Bhadrapada', altNakshatra: 'Uttarabhadra', pada: 3, isRetro: true },
  { key: 'Rahu', sign: 'Virgo', deg: 16, min: 10, sec: 47, nakshatra: 'Hasta', pada: 2, isRetro: true },
  { key: 'Ketu', sign: 'Pisces', deg: 16, min: 10, sec: 47, nakshatra: 'Uttara Bhadrapada', altNakshatra: 'Uttarabhadra', pada: 4, isRetro: true }
];

export const PRASHANT_SHODASHVARGA_BENCHMARK = {
  // Signs (1=Aries .. 12=Pisces) for [ASC, Sun, Moon, Mars, Mer, Jup, Ven, Sat, Rah, Ket]
  D1:  [4, 5, 8, 3, 6, 9, 3, 12, 6, 12],
  D2:  [5, 5, 5, 4, 4, 5, 4, 4, 5, 5],
  D3:  [12, 5, 12, 11, 6, 1, 11, 4, 10, 4],
  D4:  [10, 5, 2, 12, 6, 12, 9, 3, 12, 6],
  D7:  [3, 6, 5, 8, 12, 12, 7, 8, 3, 9],
  D9:  [10, 2, 9, 2, 11, 5, 1, 7, 2, 8],
  D10: [7, 7, 9, 11, 3, 1, 9, 12, 7, 1],
  D12: [12, 7, 2, 12, 7, 2, 11, 5, 12, 6],
  D16: [12, 8, 1, 10, 10, 4, 7, 3, 5, 5],
  D20: [3, 1, 8, 9, 7, 2, 6, 1, 3, 3],
  D24: [9, 10, 5, 12, 6, 4, 9, 2, 4, 4],
  D27: [5, 6, 1, 5, 7, 1, 1, 9, 6, 12],
  D30: [10, 11, 12, 3, 2, 9, 3, 12, 12, 12],
  D40: [11, 9, 5, 10, 11, 8, 4, 11, 4, 4],
  D45: [9, 2, 6, 10, 2, 6, 3, 3, 9, 9],
  D60: [11, 5, 5, 4, 1, 1, 8, 1, 2, 8]
};

export const PRASHANT_SHADBALA_BENCHMARK = {
  Sun: {
    ochcha: 21.23, saptavarga: 136.88, ojayugma: 15, kendra: 30, drekkana: 15, sthanaBala: 218.10,
    digBala: 23.68,
    nathonnatha: 22.19, paksha: 26.52, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 89.17, yuddha: 0, kalaBala: 137.89,
    chestaBala: 39.96, naisargikaBala: 60, drikBala: 12.51,
    totalVirupas: 492.14, totalRupas: 8.20, requiredRupas: 5, strengthRatio: 1.64, rank: 1
  },
  Moon: {
    ochcha: 4.58, saptavarga: 97.50, ojayugma: 15, kendra: 30, drekkana: 0, sthanaBala: 147.08,
    digBala: 50.21,
    nathonnatha: 37.81, paksha: 33.48, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 57.99, yuddha: 0, kalaBala: 129.28,
    chestaBala: 33.48, naisargikaBala: 51.42, drikBala: -10.94,
    totalVirupas: 400.52, totalRupas: 6.68, requiredRupas: 6, strengthRatio: 1.11, rank: 5
  },
  Mars: {
    ochcha: 11.06, saptavarga: 78.75, ojayugma: 15, kendra: 15, drekkana: 0, sthanaBala: 119.81,
    digBala: 37.52,
    nathonnatha: 37.81, paksha: 26.52, thribhaga: 60, abda: 0, masa: 30, vara: 0, hora: 60, ayana: 58.16, yuddha: 0, kalaBala: 272.49,
    chestaBala: 19.98, naisargikaBala: 17.16, drikBala: 15.30,
    totalVirupas: 482.26, totalRupas: 8.04, requiredRupas: 5, strengthRatio: 1.61, rank: 2
  },
  Merc: {
    ochcha: 56.20, saptavarga: 101.25, ojayugma: 15, kendra: 15, drekkana: 0, sthanaBala: 187.45,
    digBala: 46.01,
    nathonnatha: 60.00, paksha: 33.48, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 31.31, yuddha: 0, kalaBala: 124.79,
    chestaBala: 37.85, naisargikaBala: 25.74, drikBala: 4.79,
    totalVirupas: 426.62, totalRupas: 7.11, requiredRupas: 7, strengthRatio: 1.02, rank: 7
  },
  Jupt: {
    ochcha: 6.91, saptavarga: 103.12, ojayugma: 30, kendra: 15, drekkana: 0, sthanaBala: 155.03,
    digBala: 12.45,
    nathonnatha: 22.19, paksha: 33.48, thribhaga: 60, abda: 0, masa: 0, vara: 45, hora: 0, ayana: 0.58, yuddha: 0, kalaBala: 161.25,
    chestaBala: 45.46, naisargikaBala: 34.26, drikBala: -8.27,
    totalVirupas: 400.18, totalRupas: 6.67, requiredRupas: 6.5, strengthRatio: 1.03, rank: 6
  },
  Venu: {
    ochcha: 32.14, saptavarga: 125.62, ojayugma: 0, kendra: 15, drekkana: 15, sthanaBala: 187.76,
    digBala: 21.07,
    nathonnatha: 22.19, paksha: 33.48, thribhaga: 0, abda: 15, masa: 0, vara: 0, hora: 0, ayana: 58.96, yuddha: 0, kalaBala: 129.63,
    chestaBala: 35.75, naisargikaBala: 42.84, drikBala: 16.36,
    totalVirupas: 433.41, totalRupas: 7.22, requiredRupas: 5.5, strengthRatio: 1.31, rank: 3
  },
  Satn: {
    ochcha: 12.47, saptavarga: 65.62, ojayugma: 15, kendra: 15, drekkana: 15, sthanaBala: 123.10,
    digBala: 43.01,
    nathonnatha: 37.81, paksha: 26.52, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 26.79, yuddha: 0, kalaBala: 91.12,
    chestaBala: 47.67, naisargikaBala: 8.58, drikBala: 21.73,
    totalVirupas: 335.20, totalRupas: 5.59, requiredRupas: 5, strengthRatio: 1.12, rank: 4
  }
};

export const PRASHANT_BHAVABALA_BENCHMARK = [
  { house: 1, adhipati: 400.52, digBala: 30, drishtiBala: 43.11, totalVirupas: 473.63, rupas: 7.89, rank: 7 },
  { house: 2, adhipati: 492.14, digBala: 20, drishtiBala: 57.08, totalVirupas: 569.22, rupas: 9.49, rank: 2 },
  { house: 3, adhipati: 426.62, digBala: 40, drishtiBala: -1.98, totalVirupas: 464.64, rupas: 7.74, rank: 8 },
  { house: 4, adhipati: 433.41, digBala: 30, drishtiBala: -14.55, totalVirupas: 448.86, rupas: 7.48, rank: 9 },
  { house: 5, adhipati: 482.26, digBala: 40, drishtiBala: 12.72, totalVirupas: 534.99, rupas: 8.92, rank: 4 },
  { house: 6, adhipati: 400.18, digBala: 20, drishtiBala: 21.16, totalVirupas: 441.34, rupas: 7.36, rank: 10 },
  { house: 7, adhipati: 335.20, digBala: 30, drishtiBala: 12.44, totalVirupas: 377.64, rupas: 6.29, rank: 12 },
  { house: 8, adhipati: 335.20, digBala: 10, drishtiBala: 47.42, totalVirupas: 392.62, rupas: 6.54, rank: 11 },
  { house: 9, adhipati: 400.18, digBala: 10, drishtiBala: 91.92, totalVirupas: 502.10, rupas: 8.37, rank: 6 },
  { house: 10, adhipati: 482.26, digBala: 60, drishtiBala: 88.08, totalVirupas: 630.34, rupas: 10.51, rank: 1 },
  { house: 11, adhipati: 433.41, digBala: 50, drishtiBala: 27.43, totalVirupas: 510.84, rupas: 8.51, rank: 5 },
  { house: 12, adhipati: 426.62, digBala: 50, drishtiBala: 64.25, totalVirupas: 540.87, rupas: 9.01, rank: 3 }
];

export const PRASHANT_ASHTAKAVARGA_BENCHMARK = {
  bav: {
    Sun:   [6, 5, 5, 2, 4, 5, 3, 4, 4, 4, 3, 3],
    Moon:  [5, 4, 3, 4, 4, 5, 4, 4, 4, 4, 3, 5],
    Mars:  [4, 4, 3, 3, 0, 5, 3, 4, 4, 6, 1, 2],
    Merc:  [6, 3, 6, 6, 4, 5, 4, 3, 5, 5, 5, 2],
    Jupt:  [4, 5, 4, 7, 3, 5, 5, 3, 5, 4, 5, 6],
    Venu:  [3, 4, 4, 7, 4, 4, 6, 5, 2, 4, 5, 4],
    Satn:  [6, 7, 2, 3, 4, 3, 3, 4, 1, 2, 2, 2]
  },
  sav: [34, 32, 27, 32, 23, 32, 28, 27, 25, 29, 24, 24],
  totalBindus: 337
};

export const PRASHANT_DASHA_BENCHMARK = {
  startingLord: 'Merc',
  startingSpanYears: 17,
  birthDate: '1996-08-23',
  endDateMerc: '2013-07-17',
  mahadashas: [
    { lord: 'Merc', years: 17, startApprox: '1996-08-23', endApprox: '2013-07-16' },
    { lord: 'Ketu', years: 7,  startApprox: '2013-07-16', endApprox: '2020-07-16' },
    { lord: 'Venu', years: 20, startApprox: '2020-07-16', endApprox: '2040-07-16' },
    { lord: 'Sun',  years: 6,  startApprox: '2040-07-16', endApprox: '2046-07-17' },
    { lord: 'Moon', years: 10, startApprox: '2046-07-17', endApprox: '2056-07-16' },
    { lord: 'Mars', years: 7,  startApprox: '2056-07-16', endApprox: '2063-07-17' },
    { lord: 'Rahu', years: 18, startApprox: '2063-07-17', endApprox: '2081-07-16' },
    { lord: 'Jupt', years: 16, startApprox: '2081-07-16', endApprox: '2097-07-16' },
    { lord: 'Satn', years: 19, startApprox: '2097-07-16', endApprox: '2116-07-17' }
  ]
};

export const PRASHANT_CHALIT_BENCHMARK = [
  { house: 1,  beginSign: 'Cancer',      beginDms: '05.54.08', midSign: 'Cancer',      midDms: '21.36.35' },
  { house: 2,  beginSign: 'Leo',         beginDms: '05.54.08', midSign: 'Leo',         midDms: '20.11.42' },
  { house: 3,  beginSign: 'Virgo',       beginDms: '04.29.16', midSign: 'Virgo',       midDms: '18.46.50' },
  { house: 4,  beginSign: 'Libra',       beginDms: '03.04.24', midSign: 'Libra',       midDms: '17.21.57' },
  { house: 5,  beginSign: 'Scorpio',     altBeginSign: 'Scorpion', beginDms: '03.04.24', midSign: 'Scorpio', altMidSign: 'Scorpion', midDms: '18.46.50' },
  { house: 6,  beginSign: 'Sagittarius', beginDms: '04.29.16', midSign: 'Sagittarius', midDms: '20.11.42' },
  { house: 7,  beginSign: 'Capricorn',   beginDms: '05.54.08', midSign: 'Capricorn',   midDms: '21.36.35' },
  { house: 8,  beginSign: 'Aquarius',    beginDms: '05.54.08', midSign: 'Aquarius',    midDms: '20.11.42' },
  { house: 9,  beginSign: 'Pisces',      beginDms: '04.29.16', midSign: 'Pisces',      midDms: '18.46.50' },
  { house: 10, beginSign: 'Aries',       beginDms: '03.04.24', midSign: 'Aries',       midDms: '17.21.57' },
  { house: 11, beginSign: 'Taurus',      beginDms: '03.04.24', midSign: 'Taurus',      midDms: '18.46.50' },
  { house: 12, beginSign: 'Gemini',      beginDms: '04.29.16', midSign: 'Gemini',      midDms: '20.11.42' }
];

export const PRASHANT_CHALIT_SHIFTS_BENCHMARK = [
  { planet: 'Merc', rashiHouse: 3, chalitHouse: 2, shiftDescription: 'Merc shifted: H3 (Virgo 03° 35\') -> H2 (before Bhav 3 Sandhi 04° 29\')' }
];

export const PRASHANT_CHARA_KARAKAS_BENCHMARK = [
  { karakaKey: 'AK',  planet: 'Mars',    signName: 'Gemini' },
  { karakaKey: 'AmK', planet: 'Venus',   signName: 'Gemini' },
  { karakaKey: 'BK',  planet: 'Moon',    signName: 'Scorpio' },
  { karakaKey: 'MK',  planet: 'Jupiter', signName: 'Sagittarius' },
  { karakaKey: 'PK',  planet: 'Saturn',  signName: 'Pisces' },
  { karakaKey: 'GK',  planet: 'Sun',     signName: 'Leo' },
  { karakaKey: 'DK',  planet: 'Mercury', signName: 'Virgo' }
];

export const PRASHANT_JAIMINI_PADAS_BENCHMARK = {
  AL: { signName: 'Pisces', houseNumber: 9, signIndex: 11 },
  UL: { signName: 'Virgo',  houseNumber: 3, signIndex: 5 },
  A7: { signName: 'Taurus', houseNumber: 11, signIndex: 1 }
};

export const PRASHANT_FRIENDSHIP_BENCHMARK = {
  temporal: {
    Sun:  { Moon: 'Friend', Mars: 'Friend', Merc: 'Friend', Jupt: 'Enemy',  Venu: 'Friend', Satn: 'Enemy' },
    Moon: { Sun: 'Friend',  Mars: 'Enemy',  Merc: 'Friend', Jupt: 'Friend', Venu: 'Enemy',  Satn: 'Enemy' },
    Mars: { Sun: 'Friend',  Moon: 'Enemy',  Merc: 'Friend', Jupt: 'Enemy',  Venu: 'Enemy',  Satn: 'Friend' },
    Merc: { Sun: 'Friend',  Moon: 'Friend', Mars: 'Friend', Jupt: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Jupt: { Sun: 'Enemy',   Moon: 'Friend', Mars: 'Enemy',  Merc: 'Friend', Venu: 'Enemy',  Satn: 'Friend' },
    Venu: { Sun: 'Friend',  Moon: 'Enemy',  Mars: 'Enemy',  Merc: 'Friend', Jupt: 'Enemy',  Satn: 'Friend' },
    Satn: { Sun: 'Enemy',   Moon: 'Enemy',  Mars: 'Friend', Merc: 'Enemy',  Jupt: 'Friend', Venu: 'Friend' }
  },
  fiveFold: {
    Sun:  { Moon: 'Intimat', Mars: 'Intimat', Merc: 'Friend',  Jupt: 'Neutral', Venu: 'Neutral', Satn: 'Bitter' },
    Moon: { Sun: 'Intimat',  Mars: 'Enemy',   Merc: 'Intimat', Jupt: 'Friend',  Venu: 'Enemy',   Satn: 'Enemy' },
    Mars: { Sun: 'Intimat',  Moon: 'Neutral', Merc: 'Neutral', Jupt: 'Neutral', Venu: 'Enemy',   Satn: 'Friend' },
    Merc: { Sun: 'Intimat',  Moon: 'Neutral', Mars: 'Friend',  Jupt: 'Friend',  Venu: 'Intimat', Satn: 'Enemy' },
    Jupt: { Sun: 'Neutral',  Moon: 'Intimat', Mars: 'Neutral', Merc: 'Neutral', Venu: 'Bitter',  Satn: 'Friend' },
    Venu: { Sun: 'Neutral',  Moon: 'Bitter',  Mars: 'Enemy',   Merc: 'Intimat', Jupt: 'Enemy',   Satn: 'Intimat' },
    Satn: { Sun: 'Bitter',   Moon: 'Bitter',  Mars: 'Neutral', Merc: 'Neutral', Jupt: 'Friend',  Venu: 'Intimat' }
  }
};

