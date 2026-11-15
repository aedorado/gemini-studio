/**
 * Benchmark Truth Data for Profile 63: Shalini Sharma (Female)
 * Source: Official Classical AstroSage Kundli & Parashara Calculations
 * Birth Details: 04 June 1992, 04:34:00 IST (+05:30), Ghaziabad, UP, India
 * Coordinates: 28.67° N, 77.45° E
 */

export const SHALINI_SHARMA_PROFILE = {
  name: 'Shalini Sharma',
  gender: 'Female',
  dob: '1992-06-04',
  tob: '04:34:00',
  pob: 'Ghaziabad, UP, India',
  lat: 28.67,
  lon: 77.45,
  tz: 5.5,
  rawInput: `Planets Sign Latitude Nakshatra Pada
ASC Taurus 06-02-18 Krittika 3
Sun Taurus 19-50-42 Rohini 3
Moon Gemini 27-26-54 Punarvasu 3
Mars Pisces 28-17-42 Revati 4
Merc Taurus 23-54-53 Mrigasira 1
Jupt Leo 12-32-36 Magha 4
Venu Taurus 17-12-07 Rohini 3
Satn [R] Capricorn 24-41-09 Dhanishta 1
Rahu [R] Sagittarius 07-50-28 Mula 3
Ketu [R] Gemini 07-50-28 Ardra 1
Uran [R] Sagittarius 23-38-06 Purvashadha 4
Nept [R] Sagittarius 24-39-01 Purvashadha 4
Plut [R] Libra 27-09-28 Vishakha 3`
};

export const SHALINI_PLANETARY_BENCHMARK = [
  { key: 'ASC', sign: 'Taurus', deg: 6, min: 2, sec: 18, nakshatra: 'Krittika', pada: 3, isRetro: false },
  { key: 'Sun', sign: 'Taurus', deg: 19, min: 50, sec: 42, nakshatra: 'Rohini', pada: 3, isRetro: false },
  { key: 'Moon', sign: 'Gemini', deg: 27, min: 26, sec: 54, nakshatra: 'Punarvasu', pada: 3, isRetro: false },
  { key: 'Mars', sign: 'Pisces', deg: 28, min: 17, sec: 42, nakshatra: 'Revati', pada: 4, isRetro: false },
  { key: 'Merc', sign: 'Taurus', deg: 23, min: 54, sec: 53, nakshatra: 'Mrigashira', altNakshatra: 'Mrigasira', pada: 1, isRetro: false },
  { key: 'Jupt', sign: 'Leo', deg: 12, min: 32, sec: 36, nakshatra: 'Magha', pada: 4, isRetro: false },
  { key: 'Venu', sign: 'Taurus', deg: 17, min: 12, sec: 7, nakshatra: 'Rohini', pada: 3, isRetro: false },
  { key: 'Satn', sign: 'Capricorn', deg: 24, min: 41, sec: 9, nakshatra: 'Dhanishta', pada: 1, isRetro: true },
  { key: 'Rahu', sign: 'Sagittarius', deg: 7, min: 50, sec: 28, nakshatra: 'Mula', pada: 3, isRetro: true },
  { key: 'Ketu', sign: 'Gemini', deg: 7, min: 50, sec: 28, nakshatra: 'Ardra', pada: 1, isRetro: true }
];

export const SHALINI_SHODASHVARGA_BENCHMARK = {
  // Signs (1=Aries .. 12=Pisces) for [ASC, Sun, Moon, Mars, Mer, Jup, Ven, Sat, Rah, Ket]
  D1:  [2, 2, 3, 12, 2, 5, 2, 10, 9, 3],
  D2:  [4, 5, 4, 5, 5, 5, 5, 5, 5, 5],
  D3:  [2, 6, 11, 8, 10, 9, 6, 6, 9, 3],
  D4:  [2, 8, 12, 9, 11, 8, 8, 7, 12, 6],
  D7:  [9, 12, 9, 12, 1, 7, 12, 9, 10, 4],
  D9:  [11, 3, 3, 12, 5, 4, 3, 5, 3, 9],
  D10: [12, 4, 12, 5, 5, 9, 3, 2, 11, 5],
  D12: [4, 9, 1, 11, 11, 10, 8, 7, 12, 6],
  D16: [8, 3, 11, 12, 5, 11, 2, 2, 1, 1],
  D20: [1, 10, 11, 11, 12, 5, 8, 5, 10, 10],
  D24: [8, 7, 2, 2, 11, 3, 5, 11, 11, 11],
  D27: [9, 9, 7, 11, 1, 12, 7, 2, 8, 2],
  D30: [6, 12, 7, 8, 10, 9, 12, 10, 11, 11],
  D40: [3, 9, 1, 8, 2, 5, 5, 3, 11, 11],
  D45: [2, 10, 2, 3, 4, 11, 6, 2, 8, 8],
  D60: [2, 5, 9, 8, 1, 6, 12, 11, 12, 6]
};

export const SHALINI_SHADBALA_BENCHMARK = {
  Sun: {
    ochcha: 46.72, saptavarga: 91.88, ojayugma: 15, kendra: 60, drekkana: 0, sthanaBala: 213.59,
    digBala: 20.00,
    nathonnatha: 21.28, paksha: 47.47, thribhaga: 0, abda: 15, masa: 0, vara: 0, hora: 0, ayana: 117.25, yuddha: 0, kalaBala: 201.00,
    chestaBala: 54.53, naisargikaBala: 60, drikBala: -7.96,
    totalVirupas: 541.16, totalRupas: 9.02, requiredRupas: 5, strengthRatio: 1.80, rank: 1
  },
  Moon: {
    ochcha: 41.85, saptavarga: 123.75, ojayugma: 0, kendra: 30, drekkana: 15, sthanaBala: 210.60,
    digBala: 52.54,
    nathonnatha: 38.72, paksha: 47.47, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 2.37, yuddha: 0, kalaBala: 88.56,
    chestaBala: 12.53, naisargikaBala: 51.42, drikBala: -11.65,
    totalVirupas: 404.00, totalRupas: 6.73, requiredRupas: 6, strengthRatio: 1.12, rank: 6
  },
  Mars: {
    ochcha: 39.90, saptavarga: 127.50, ojayugma: 0, kendra: 30, drekkana: 0, sthanaBala: 197.40,
    digBala: 37.18,
    nathonnatha: 38.72, paksha: 47.47, thribhaga: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 40.88, yuddha: 0, kalaBala: 187.06,
    chestaBala: 22.96, naisargikaBala: 17.16, drikBala: -10.27,
    totalVirupas: 451.50, totalRupas: 7.52, requiredRupas: 5, strengthRatio: 1.50, rank: 2
  },
  Merc: {
    ochcha: 22.97, saptavarga: 48.75, ojayugma: 15, kendra: 60, drekkana: 0, sthanaBala: 146.72,
    digBala: 54.04,
    nathonnatha: 60.00, paksha: 12.53, thribhaga: 0, abda: 0, masa: 0, vara: 45, hora: 0, ayana: 59.11, yuddha: 0, kalaBala: 176.64,
    chestaBala: 6.71, naisargikaBala: 25.74, drikBala: -8.47,
    totalVirupas: 401.38, totalRupas: 6.69, requiredRupas: 7, strengthRatio: 0.96, rank: 7
  },
  Jupt: {
    ochcha: 47.49, saptavarga: 138.75, ojayugma: 15, kendra: 60, drekkana: 0, sthanaBala: 261.24,
    digBala: 27.83,
    nathonnatha: 21.28, paksha: 12.53, thribhaga: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 41.66, yuddha: 0, kalaBala: 135.48,
    chestaBala: 29.79, naisargikaBala: 34.26, drikBala: -9.52,
    totalVirupas: 479.07, totalRupas: 7.98, requiredRupas: 6.5, strengthRatio: 1.23, rank: 5
  },
  Venu: {
    ochcha: 43.27, saptavarga: 99.38, ojayugma: 15, kendra: 60, drekkana: 0, sthanaBala: 217.64,
    digBala: 39.12,
    nathonnatha: 21.28, paksha: 12.53, thribhaga: 0, abda: 0, masa: 30, vara: 0, hora: 0, ayana: 58.07, yuddha: 0, kalaBala: 121.89,
    chestaBala: 0.30, naisargikaBala: 42.84, drikBala: -7.63,
    totalVirupas: 414.16, totalRupas: 6.90, requiredRupas: 5.5, strengthRatio: 1.25, rank: 4
  },
  Satn: {
    ochcha: 28.44, saptavarga: 97.50, ojayugma: 15, kendra: 15, drekkana: 0, sthanaBala: 155.94,
    digBala: 33.78,
    nathonnatha: 38.72, paksha: 47.47, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 60, ayana: 49.45, yuddha: 0, kalaBala: 195.63,
    chestaBala: 38.29, naisargikaBala: 8.58, drikBala: 1.10,
    totalVirupas: 433.32, totalRupas: 7.22, requiredRupas: 5, strengthRatio: 1.44, rank: 3
  }
};

export const SHALINI_BHAVABALA_BENCHMARK = [
  { house: 1, adhipati: 414.16, digBala: 30, drishtiBala: 37.45, totalVirupas: 481.62, rupas: 8.03, rank: 7 },
  { house: 2, adhipati: 401.38, digBala: 50, drishtiBala: -4.39, totalVirupas: 446.99, rupas: 7.45, rank: 9 },
  { house: 3, adhipati: 404.00, digBala: 40, drishtiBala: -9.77, totalVirupas: 434.23, rupas: 7.24, rank: 11 },
  { house: 4, adhipati: 541.16, digBala: 60, drishtiBala: -11.26, totalVirupas: 589.89, rupas: 9.83, rank: 1 },
  { house: 5, adhipati: 401.38, digBala: 10, drishtiBala: 28.59, totalVirupas: 439.97, rupas: 7.33, rank: 10 },
  { house: 6, adhipati: 414.16, digBala: 10, drishtiBala: -0.65, totalVirupas: 423.51, rupas: 7.06, rank: 12 },
  { house: 7, adhipati: 451.50, digBala: 60, drishtiBala: 31.10, totalVirupas: 542.59, rupas: 9.04, rank: 5 },
  { house: 8, adhipati: 479.07, digBala: 10, drishtiBala: 83.46, totalVirupas: 572.53, rupas: 9.54, rank: 3 },
  { house: 9, adhipati: 433.32, digBala: 50, drishtiBala: 73.29, totalVirupas: 556.61, rupas: 9.28, rank: 4 },
  { house: 10, adhipati: 433.32, digBala: 0, drishtiBala: 33.04, totalVirupas: 466.36, rupas: 7.77, rank: 8 },
  { house: 11, adhipati: 479.07, digBala: 40, drishtiBala: 59.82, totalVirupas: 578.89, rupas: 9.65, rank: 2 },
  { house: 12, adhipati: 451.50, digBala: 40, drishtiBala: 16.11, totalVirupas: 507.61, rupas: 8.46, rank: 6 }
];

export const SHALINI_ASHTAKAVARGA_BENCHMARK = {
  bav: {
    Sun:   [7, 1, 3, 3, 4, 3, 5, 5, 3, 5, 4, 5],
    Moon:  [2, 4, 3, 6, 5, 2, 2, 7, 4, 2, 5, 7],
    Mars:  [4, 2, 2, 5, 2, 4, 6, 2, 2, 3, 2, 5],
    Merc:  [5, 3, 4, 5, 3, 6, 5, 3, 3, 7, 3, 7],
    Jupt:  [2, 5, 7, 2, 4, 5, 6, 3, 4, 5, 6, 7],
    Venu:  [4, 6, 4, 5, 5, 5, 3, 2, 4, 5, 3, 6],
    Satn:  [3, 4, 3, 3, 4, 0, 3, 3, 4, 3, 4, 5]
  },
  sav: [27, 25, 26, 29, 27, 25, 30, 25, 24, 30, 27, 42],
  totalBindus: 337
};

export const SHALINI_DASHA_BENCHMARK = {
  startingLord: 'Jupt',
  startingSpanYears: 16,
  birthDate: '1992-06-04',
  mahadashas: [
    { lord: 'Jupt', years: 16, startApprox: '1992-06-04', endApprox: '1999-06-27' },
    { lord: 'Satn', years: 19, startApprox: '1999-06-27', endApprox: '2018-06-27' },
    { lord: 'Merc', years: 17, startApprox: '2018-06-27', endApprox: '2035-06-27' },
    { lord: 'Ketu', years: 7,  startApprox: '2035-06-27', endApprox: '2042-06-27' },
    { lord: 'Venu', years: 20, startApprox: '2042-06-27', endApprox: '2062-06-27' },
    { lord: 'Sun',  years: 6,  startApprox: '2062-06-27', endApprox: '2068-06-26' },
    { lord: 'Moon', years: 10, startApprox: '2068-06-26', endApprox: '2078-06-27' },
    { lord: 'Mars', years: 7,  startApprox: '2078-06-27', endApprox: '2085-06-27' },
    { lord: 'Rahu', years: 18, startApprox: '2085-06-27', endApprox: '2103-06-28' }
  ]
};

export const SHALINI_CHALIT_BENCHMARK = [
  { house: 1,  beginSign: 'Aries',       beginDms: '18.20.16', midSign: 'Taurus',      midDms: '06.02.17' },
  { house: 2,  beginSign: 'Taurus',      beginDms: '18.20.16', midSign: 'Gemini',      midDms: '00.38.15' },
  { house: 3,  beginSign: 'Gemini',      beginDms: '12.56.14', midSign: 'Gemini',      midDms: '25.14.13' },
  { house: 4,  beginSign: 'Cancer',      beginDms: '07.32.11', midSign: 'Cancer',      midDms: '19.50.10' },
  { house: 5,  beginSign: 'Leo',         beginDms: '07.32.11', midSign: 'Leo',         midDms: '25.14.13' },
  { house: 6,  beginSign: 'Virgo',       beginDms: '12.56.14', midSign: 'Libra',       midDms: '00.38.15' },
  { house: 7,  beginSign: 'Libra',       beginDms: '18.20.16', midSign: 'Scorpio',     altMidSign: 'Scorpion', midDms: '06.02.17' },
  { house: 8,  beginSign: 'Scorpio',     altBeginSign: 'Scorpion', beginDms: '18.20.16', midSign: 'Sagittarius', midDms: '00.38.15' },
  { house: 9,  beginSign: 'Sagittarius', beginDms: '12.56.14', midSign: 'Sagittarius', midDms: '25.14.13' },
  { house: 10, beginSign: 'Capricorn',   beginDms: '07.32.11', midSign: 'Capricorn',   midDms: '19.50.10' },
  { house: 11, beginSign: 'Aquarius',    beginDms: '07.32.11', midSign: 'Aquarius',    midDms: '25.14.13' },
  { house: 12, beginSign: 'Pisces',      beginDms: '12.56.14', midSign: 'Aries',       midDms: '00.38.15' }
];

export const SHALINI_CHALIT_SHIFTS_BENCHMARK = [
  { planet: 'Sun',  rashiHouse: 1, chalitHouse: 2,  shiftDescription: 'Sun shifted: H1 (Taurus 19° 50\') -> H2 (past Bhav 2 Sandhi 18° 20\')' },
  { planet: 'Moon', rashiHouse: 2, chalitHouse: 3,  shiftDescription: 'Moon shifted: H2 (Gemini 27° 26\') -> H3 (past Bhav 3 Sandhi 12° 56\')' },
  { planet: 'Mars', rashiHouse: 11, chalitHouse: 12, shiftDescription: 'Mars shifted: H11 (Pisces 28° 17\') -> H12 (past Bhav 12 Sandhi 12° 56\')' },
  { planet: 'Merc', rashiHouse: 1, chalitHouse: 2,  shiftDescription: 'Merc shifted: H1 (Taurus 23° 54\') -> H2 (past Bhav 2 Sandhi 18° 20\')' },
  { planet: 'Jupt', rashiHouse: 4, chalitHouse: 5,  shiftDescription: 'Jupt shifted: H4 (Leo 12° 32\') -> H5 (past Bhav 5 Sandhi 07° 32\')' },
  { planet: 'Satn', rashiHouse: 9, chalitHouse: 10, shiftDescription: 'Satn shifted: H9 (Capricorn 24° 41\') -> H10 (past Bhav 10 Sandhi 07° 32\')' }
];

export const SHALINI_CHARA_KARAKAS_BENCHMARK = [
  { karakaKey: 'AK',  planet: 'Mars',    signName: 'Pisces' },
  { karakaKey: 'AmK', planet: 'Moon',    signName: 'Gemini' },
  { karakaKey: 'BK',  planet: 'Saturn',  signName: 'Capricorn' },
  { karakaKey: 'MK',  planet: 'Mercury', signName: 'Taurus' },
  { karakaKey: 'PK',  planet: 'Sun',     signName: 'Taurus' },
  { karakaKey: 'GK',  planet: 'Venus',   signName: 'Taurus' },
  { karakaKey: 'DK',  planet: 'Jupiter', signName: 'Leo' }
];

export const SHALINI_JAIMINI_PADAS_BENCHMARK = {
  AL: { signName: 'Aquarius', houseNumber: 10, signIndex: 10 },
  UL: { signName: 'Aquarius', houseNumber: 10, signIndex: 10 },
  A7: { signName: 'Cancer',   houseNumber: 3,  signIndex: 3 }
};

export const SHALINI_FRIENDSHIP_BENCHMARK = {
  temporal: {
    Sun:  { Moon: 'Friend', Mars: 'Friend', Merc: 'Enemy', Jupt: 'Friend', Venu: 'Enemy', Satn: 'Enemy' },
    Moon: { Sun: 'Friend', Mars: 'Friend', Merc: 'Friend', Jupt: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Mars: { Sun: 'Friend', Moon: 'Friend', Merc: 'Friend', Jupt: 'Enemy', Venu: 'Friend', Satn: 'Friend' },
    Merc: { Sun: 'Enemy', Moon: 'Friend', Mars: 'Friend', Jupt: 'Friend', Venu: 'Enemy', Satn: 'Enemy' },
    Jupt: { Sun: 'Friend', Moon: 'Friend', Mars: 'Enemy', Merc: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Venu: { Sun: 'Enemy', Moon: 'Friend', Mars: 'Friend', Merc: 'Enemy', Jupt: 'Friend', Satn: 'Enemy' },
    Satn: { Sun: 'Enemy', Moon: 'Enemy', Mars: 'Friend', Merc: 'Enemy', Jupt: 'Enemy', Venu: 'Enemy' }
  },
  fiveFold: {
    Sun:  { Moon: 'Intimat', Mars: 'Intimat', Merc: 'Enemy', Jupt: 'Intimat', Venu: 'Bitter', Satn: 'Bitter' },
    Moon: { Sun: 'Intimat', Mars: 'Friend', Merc: 'Intimat', Jupt: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Mars: { Sun: 'Intimat', Moon: 'Intimat', Merc: 'Neutral', Jupt: 'Neutral', Venu: 'Friend', Satn: 'Friend' },
    Merc: { Sun: 'Neutral', Moon: 'Neutral', Mars: 'Friend', Jupt: 'Friend', Venu: 'Neutral', Satn: 'Enemy' },
    Jupt: { Sun: 'Intimat', Moon: 'Intimat', Mars: 'Neutral', Merc: 'Neutral', Venu: 'Neutral', Satn: 'Enemy' },
    Venu: { Sun: 'Bitter', Moon: 'Neutral', Mars: 'Friend', Merc: 'Neutral', Jupt: 'Friend', Satn: 'Neutral' },
    Satn: { Sun: 'Bitter', Moon: 'Bitter', Mars: 'Neutral', Merc: 'Neutral', Jupt: 'Enemy', Venu: 'Neutral' }
  }
};
