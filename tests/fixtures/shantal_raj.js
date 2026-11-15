/**
 * Benchmark Truth Data for Profile 6: Shantal Raj (Female)
 * Source: Official Classical AstroSage Kundli & Parashara Calculations
 * Birth Details: 26 September 1996, 13:49:00 IST (+05:30), Patna, India
 * Coordinates: 25.5941° N, 85.1376° E
 */

export const SHANTAL_RAJ_PROFILE = {
  name: 'Shantal Raj',
  gender: 'Female',
  dob: '1996-09-26',
  tob: '13:49:00',
  pob: 'Patna, India',
  lat: 25.5941,
  lon: 85.1376,
  tz: 5.5,
  rawInput: `Planets Sign Latitude Nakshatra Pada
ASC Sagittarius 28-45-29 Uttarashadha 1
Sun Virgo 09-43-16 Uttaraphal 4
Moon Aquarius 29-13-53 Purvabhadra 3
Mars Cancer 16-23-13 Pashyami 4
Merc [R] Leo 25-12-13 Purvaphalgini 4
Jupt Sagittarius 14-52-00 Purvashadha 1
Venu Cancer 27-16-34 Ashlesha 4
Satn [R] Pisces 10-10-41 Uttarabhadra 3
Rahu [R] Virgo 14-21-29 Hasta 2
Ketu [R] Pisces 14-21-29 Uttarabhadra 4
Uran [R] Capricorn 07-00-06 Uttarashadha 4
Nept [R] Capricorn 01-08-03 Uttarashadha 2
Plut Scorpion 07-03-45 Anuradha 2`
};

export const SHANTAL_PLANETARY_BENCHMARK = [
  { key: 'ASC', sign: 'Sagittarius', deg: 28, min: 45, sec: 29, nakshatra: 'Uttara Ashadha', altNakshatra: 'Uttarashadha', pada: 1, isRetro: false },
  { key: 'Sun', sign: 'Virgo', deg: 9, min: 43, sec: 16, nakshatra: 'Uttara Phalguni', altNakshatra: 'Uttaraphal', pada: 4, isRetro: false },
  { key: 'Moon', sign: 'Aquarius', deg: 29, min: 13, sec: 53, nakshatra: 'Purva Bhadrapada', altNakshatra: 'Purvabhadra', pada: 3, isRetro: false },
  { key: 'Mars', sign: 'Cancer', deg: 16, min: 23, sec: 13, nakshatra: 'Pushya', altNakshatra: 'Pashyami', pada: 4, isRetro: false },
  { key: 'Merc', sign: 'Leo', deg: 25, min: 12, sec: 13, nakshatra: 'Purva Phalguni', altNakshatra: 'Purvaphalgini', pada: 4, isRetro: true },
  { key: 'Jupt', sign: 'Sagittarius', deg: 14, min: 52, sec: 0, nakshatra: 'Purva Ashadha', altNakshatra: 'Purvashadha', pada: 1, isRetro: false },
  { key: 'Venu', sign: 'Cancer', deg: 27, min: 16, sec: 34, nakshatra: 'Ashlesha', pada: 4, isRetro: false },
  { key: 'Satn', sign: 'Pisces', deg: 10, min: 10, sec: 41, nakshatra: 'Uttara Bhadrapada', altNakshatra: 'Uttarabhadra', pada: 3, isRetro: true },
  { key: 'Rahu', sign: 'Virgo', deg: 14, min: 21, sec: 29, nakshatra: 'Hasta', pada: 2, isRetro: true },
  { key: 'Ketu', sign: 'Pisces', deg: 14, min: 21, sec: 29, nakshatra: 'Uttara Bhadrapada', altNakshatra: 'Uttarabhadra', pada: 4, isRetro: true }
];

export const SHANTAL_SHODASHVARGA_BENCHMARK = {
  // Signs (1=Aries .. 12=Pisces) for [ASC, Sun, Moon, Mars, Mer, Jup, Ven, Sat, Rah, Ket]
  D1:  [9, 6, 11, 4, 5, 9, 4, 12, 6, 12],
  D2:  [4, 4, 4, 5, 4, 5, 5, 4, 4, 4],
  D3:  [5, 6, 7, 8, 1, 1, 12, 4, 10, 4],
  D4:  [6, 9, 8, 10, 2, 12, 1, 3, 9, 3],
  D7:  [3, 2, 5, 1, 10, 12, 4, 8, 3, 9],
  D9:  [9, 12, 3, 8, 8, 5, 12, 7, 2, 8],
  D10: [6, 5, 8, 5, 1, 1, 9, 11, 6, 12],
  D12: [8, 9, 10, 10, 3, 2, 2, 4, 11, 5],
  D16: [12, 2, 8, 9, 6, 4, 3, 2, 4, 4],
  D20: [12, 11, 4, 11, 1, 2, 7, 11, 2, 2],
  D24: [4, 11, 4, 5, 1, 4, 1, 12, 3, 3],
  D27: [2, 12, 9, 12, 11, 2, 10, 7, 4, 10],
  D30: [7, 6, 7, 12, 7, 9, 8, 6, 12, 12],
  D40: [3, 7, 3, 4, 10, 8, 7, 8, 2, 2],
  D45: [4, 11, 12, 1, 6, 7, 5, 12, 6, 6],
  D60: [6, 1, 9, 12, 7, 2, 10, 8, 10, 4]
};

export const SHANTAL_SHADBALA_BENCHMARK = {
  Sun: {
    ochcha: 10.09, saptavarga: 105.00, ojayugma: 0, kendra: 60, drekkana: 15, sthanaBala: 190.09,
    digBala: 48.63,
    nathonnatha: 49.32, paksha: 3.50, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 56.45, yuddha: 0, kalaBala: 109.26,
    chestaBala: 28.82, naisargikaBala: 60, drikBala: 9.45,
    totalVirupas: 446.26, totalRupas: 7.44, requiredRupas: 5, strengthRatio: 1.49, rank: 2
  },
  Moon: {
    ochcha: 38.74, saptavarga: 82.50, ojayugma: 0, kendra: 15, drekkana: 15, sthanaBala: 151.24,
    digBala: 45.14,
    nathonnatha: 10.68, paksha: 56.50, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 33.50, yuddha: 0, kalaBala: 100.68,
    chestaBala: 56.50, naisargikaBala: 51.42, drikBala: 9.69,
    totalVirupas: 414.68, totalRupas: 6.91, requiredRupas: 6, strengthRatio: 1.15, rank: 5
  },
  Mars: {
    ochcha: 3.87, saptavarga: 131.25, ojayugma: 0, kendra: 30, drekkana: 0, sthanaBala: 165.12,
    digBala: 30.85,
    nathonnatha: 10.68, paksha: 3.50, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 52.45, yuddha: 0, kalaBala: 66.63,
    chestaBala: 24.44, naisargikaBala: 17.16, drikBala: 8.32,
    totalVirupas: 312.52, totalRupas: 5.21, requiredRupas: 5, strengthRatio: 1.04, rank: 7
  },
  Merc: {
    ochcha: 53.40, saptavarga: 110.62, ojayugma: 15, kendra: 15, drekkana: 0, sthanaBala: 194.03,
    digBala: 18.82,
    nathonnatha: 60.00, paksha: 56.50, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 35.52, yuddha: 0, kalaBala: 152.03,
    chestaBala: 40.71, naisargikaBala: 25.74, drikBala: 18.08,
    totalVirupas: 449.40, totalRupas: 7.49, requiredRupas: 7, strengthRatio: 1.07, rank: 6
  },
  Jupt: {
    ochcha: 6.71, saptavarga: 144.38, ojayugma: 30, kendra: 60, drekkana: 0, sthanaBala: 241.09,
    digBala: 55.37,
    nathonnatha: 49.32, paksha: 56.50, thribhaga: 60, abda: 0, masa: 30, vara: 45, hora: 60, ayana: 0.63, yuddha: 0, kalaBala: 301.45,
    chestaBala: 35.05, naisargikaBala: 34.26, drikBala: -11.71,
    totalVirupas: 655.51, totalRupas: 10.93, requiredRupas: 6.5, strengthRatio: 1.68, rank: 1
  },
  Venu: {
    ochcha: 19.91, saptavarga: 52.50, ojayugma: 30, kendra: 30, drekkana: 15, sthanaBala: 147.41,
    digBala: 25.52,
    nathonnatha: 49.32, paksha: 56.50, thribhaga: 0, abda: 15, masa: 0, vara: 0, hora: 0, ayana: 48.35, yuddha: 0, kalaBala: 169.17,
    chestaBala: 29.53, naisargikaBala: 42.84, drikBala: 6.96,
    totalVirupas: 421.42, totalRupas: 7.02, requiredRupas: 5.5, strengthRatio: 1.28, rank: 3
  },
  Satn: {
    ochcha: 13.27, saptavarga: 54.38, ojayugma: 15, kendra: 60, drekkana: 15, sthanaBala: 157.65,
    digBala: 23.81,
    nathonnatha: 10.68, paksha: 3.50, thribhaga: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 27.99, yuddha: 0, kalaBala: 102.17,
    chestaBala: 58.85, naisargikaBala: 8.58, drikBala: 5.87,
    totalVirupas: 356.93, totalRupas: 5.95, requiredRupas: 5, strengthRatio: 1.19, rank: 4
  }
};

export const SHANTAL_BHAVABALA_BENCHMARK = [
  { house: 1, adhipati: 655.51, digBala: 30, drishtiBala: -0.49, totalVirupas: 685.02, rupas: 11.42, rank: 2 },
  { house: 2, adhipati: 356.93, digBala: 50, drishtiBala: 26.49, totalVirupas: 433.42, rupas: 7.22, rank: 10 },
  { house: 3, adhipati: 356.93, digBala: 50, drishtiBala: 75.21, totalVirupas: 482.14, rupas: 8.04, rank: 7 },
  { house: 4, adhipati: 655.51, digBala: 0, drishtiBala: 58.20, totalVirupas: 713.71, rupas: 11.90, rank: 1 },
  { house: 5, adhipati: 312.52, digBala: 10, drishtiBala: 55.58, totalVirupas: 378.10, rupas: 6.30, rank: 12 },
  { house: 6, adhipati: 421.42, digBala: 10, drishtiBala: 33.83, totalVirupas: 465.25, rupas: 7.75, rank: 8 },
  { house: 7, adhipati: 449.40, digBala: 0, drishtiBala: 50.32, totalVirupas: 499.71, rupas: 8.33, rank: 4 },
  { house: 8, adhipati: 414.68, digBala: 40, drishtiBala: 36.22, totalVirupas: 490.90, rupas: 8.18, rank: 5 },
  { house: 9, adhipati: 446.26, digBala: 20, drishtiBala: 46.16, totalVirupas: 512.42, rupas: 8.54, rank: 3 },
  { house: 10, adhipati: 449.40, digBala: 30, drishtiBala: 5.23, totalVirupas: 484.62, rupas: 8.08, rank: 6 },
  { house: 11, adhipati: 421.42, digBala: 20, drishtiBala: 21.21, totalVirupas: 462.63, rupas: 7.71, rank: 9 },
  { house: 12, adhipati: 312.52, digBala: 50, drishtiBala: 32.30, totalVirupas: 394.82, rupas: 6.58, rank: 11 }
];

export const SHANTAL_ASHTAKAVARGA_BENCHMARK = {
  bav: {
    Sun:   [6, 5, 4, 4, 2, 3, 6, 3, 5, 4, 2, 4],
    Moon:  [4, 5, 3, 4, 4, 4, 4, 6, 4, 2, 4, 5],
    Mars:  [2, 4, 4, 3, 1, 3, 5, 3, 5, 4, 4, 1],
    Merc:  [3, 7, 2, 7, 4, 4, 6, 4, 4, 5, 3, 5],
    Jupt:  [5, 6, 5, 4, 6, 4, 5, 3, 6, 4, 3, 5],
    Venu:  [6, 4, 4, 5, 4, 4, 6, 3, 5, 4, 3, 4],
    Satn:  [5, 6, 4, 4, 1, 3, 3, 2, 5, 2, 1, 3]
  },
  sav: [31, 37, 26, 31, 22, 25, 35, 24, 34, 25, 20, 27],
  totalBindus: 337
};

export const SHANTAL_DASHA_BENCHMARK = {
  startingLord: 'Jupt',
  startingSpanYears: 16,
  birthDate: '1996-09-26',
  mahadashas: [
    { lord: 'Jupt', years: 16, startApprox: '1996-09-26', endApprox: '2001-08-29' },
    { lord: 'Satn', years: 19, startApprox: '2001-08-29', endApprox: '2020-08-28' },
    { lord: 'Merc', years: 17, startApprox: '2020-08-28', endApprox: '2037-08-29' },
    { lord: 'Ketu', years: 7,  startApprox: '2037-08-29', endApprox: '2044-08-28' },
    { lord: 'Venu', years: 20, startApprox: '2044-08-28', endApprox: '2064-08-28' },
    { lord: 'Sun',  years: 6,  startApprox: '2064-08-28', endApprox: '2070-08-29' },
    { lord: 'Moon', years: 10, startApprox: '2070-08-29', endApprox: '2080-08-28' },
    { lord: 'Mars', years: 7,  startApprox: '2080-08-28', endApprox: '2087-08-29' },
    { lord: 'Rahu', years: 18, startApprox: '2087-08-29', endApprox: '2105-08-30' }
  ]
};

export const SHANTAL_CHALIT_BENCHMARK = [
  { house: 1,  beginSign: 'Sagittarius', beginDms: '16.16.09', midSign: 'Sagittarius', midDms: '28.45.29' },
  { house: 2,  beginSign: 'Capricorn',   beginDms: '16.16.09', midSign: 'Aquarius',    midDms: '03.46.49' },
  { house: 3,  beginSign: 'Aquarius',    beginDms: '21.17.29', midSign: 'Pisces',      midDms: '08.48.09' },
  { house: 4,  beginSign: 'Pisces',      beginDms: '26.18.49', midSign: 'Aries',       midDms: '13.49.29' },
  { house: 5,  beginSign: 'Aries',       beginDms: '26.18.49', midSign: 'Taurus',      midDms: '08.48.09' },
  { house: 6,  beginSign: 'Taurus',      beginDms: '21.17.29', midSign: 'Gemini',      midDms: '03.46.49' },
  { house: 7,  beginSign: 'Gemini',      beginDms: '16.16.09', midSign: 'Gemini',      midDms: '28.45.29' },
  { house: 8,  beginSign: 'Cancer',      beginDms: '16.16.09', midSign: 'Leo',         midDms: '03.46.49' },
  { house: 9,  beginSign: 'Leo',         beginDms: '21.17.29', midSign: 'Virgo',       midDms: '08.48.09' },
  { house: 10, beginSign: 'Virgo',       beginDms: '26.18.49', midSign: 'Libra',       midDms: '13.49.29' },
  { house: 11, beginSign: 'Libra',       beginDms: '26.18.49', midSign: 'Scorpio',     altMidSign: 'Scorpion', midDms: '08.48.09' },
  { house: 12, beginSign: 'Scorpio',     altBeginSign: 'Scorpion', beginDms: '21.17.29', midSign: 'Sagittarius', midDms: '03.46.49' }
];

export const SHANTAL_CHALIT_SHIFTS_BENCHMARK = [
  { planet: 'Sun',  rashiHouse: 10, chalitHouse: 9,  shiftDescription: 'Sun shifted: H10 (Virgo 09° 43\') -> H9 (before Bhav 10 Sandhi 26° 18\')' },
  { planet: 'Jupt', rashiHouse: 1,  chalitHouse: 12, shiftDescription: 'Jupt shifted: H1 (Sagittarius 14° 52\') -> H12 (before Bhav 1 Sandhi 16° 16\')' },
  { planet: 'Satn', rashiHouse: 4,  chalitHouse: 3,  shiftDescription: 'Satn shifted: H4 (Pisces 10° 10\') -> H3 (before Bhav 4 Sandhi 26° 18\')' },
  { planet: 'Rahu', rashiHouse: 10, chalitHouse: 9,  shiftDescription: 'Rahu shifted: H10 (Virgo 14° 21\') -> H9 (before Bhav 10 Sandhi 26° 18\')' },
  { planet: 'Ketu', rashiHouse: 4,  chalitHouse: 3,  shiftDescription: 'Ketu shifted: H4 (Pisces 14° 21\') -> H3 (before Bhav 4 Sandhi 26° 18\')' }
];

export const SHANTAL_CHARA_KARAKAS_BENCHMARK = [
  { karakaKey: 'AK',  planet: 'Moon',    signName: 'Aquarius' },
  { karakaKey: 'AmK', planet: 'Venus',   signName: 'Cancer' },
  { karakaKey: 'BK',  planet: 'Mercury', signName: 'Leo' },
  { karakaKey: 'MK',  planet: 'Mars',    signName: 'Cancer' },
  { karakaKey: 'PK',  planet: 'Jupiter', signName: 'Sagittarius' },
  { karakaKey: 'GK',  planet: 'Saturn',  signName: 'Pisces' },
  { karakaKey: 'DK',  planet: 'Sun',     signName: 'Virgo' }
];

export const SHANTAL_JAIMINI_PADAS_BENCHMARK = {
  AL: { signName: 'Virgo',  houseNumber: 10, signIndex: 5 },
  UL: { signName: 'Pisces', houseNumber: 4,  signIndex: 11 },
  A7: { signName: 'Libra',  houseNumber: 11, signIndex: 6 }
};

export const SHANTAL_FRIENDSHIP_BENCHMARK = {
  temporal: {
    Sun:  { Moon: 'Enemy',  Mars: 'Friend', Merc: 'Friend', Jupt: 'Friend', Venu: 'Friend', Satn: 'Enemy' },
    Moon: { Sun: 'Enemy',   Mars: 'Enemy',  Merc: 'Enemy',  Jupt: 'Friend', Venu: 'Enemy',  Satn: 'Friend' },
    Mars: { Sun: 'Friend',  Moon: 'Enemy',  Merc: 'Friend', Jupt: 'Enemy',  Venu: 'Enemy',  Satn: 'Enemy' },
    Merc: { Sun: 'Friend',  Moon: 'Enemy',  Mars: 'Friend', Jupt: 'Enemy',  Venu: 'Friend', Satn: 'Enemy' },
    Jupt: { Sun: 'Friend',  Moon: 'Friend', Mars: 'Enemy',  Merc: 'Enemy',  Venu: 'Enemy',  Satn: 'Friend' },
    Venu: { Sun: 'Friend',  Moon: 'Enemy',  Mars: 'Enemy',  Merc: 'Friend', Jupt: 'Enemy',  Satn: 'Enemy' },
    Satn: { Sun: 'Enemy',   Moon: 'Friend', Mars: 'Enemy',  Merc: 'Enemy',  Jupt: 'Friend', Venu: 'Enemy' }
  },
  fiveFold: {
    Sun:  { Moon: 'Neutral', Mars: 'Intimat', Merc: 'Friend',  Jupt: 'Intimat', Venu: 'Neutral', Satn: 'Bitter' },
    Moon: { Sun: 'Neutral',  Mars: 'Enemy',   Merc: 'Neutral', Jupt: 'Friend',  Venu: 'Enemy',   Satn: 'Friend' },
    Mars: { Sun: 'Intimat',  Moon: 'Neutral', Merc: 'Neutral', Jupt: 'Neutral', Venu: 'Enemy',   Satn: 'Enemy' },
    Merc: { Sun: 'Intimat',  Moon: 'Bitter',  Mars: 'Friend',  Jupt: 'Enemy',   Venu: 'Intimat', Satn: 'Enemy' },
    Jupt: { Sun: 'Intimat',  Moon: 'Intimat', Mars: 'Neutral', Merc: 'Bitter',  Venu: 'Bitter',  Satn: 'Friend' },
    Venu: { Sun: 'Neutral',  Moon: 'Bitter',  Mars: 'Enemy',   Merc: 'Intimat', Jupt: 'Enemy',   Satn: 'Neutral' },
    Satn: { Sun: 'Bitter',   Moon: 'Neutral', Mars: 'Bitter',  Merc: 'Neutral', Jupt: 'Friend',  Venu: 'Neutral' }
  }
};

