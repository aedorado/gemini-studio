/**
 * Benchmark Truth Data for Profile 1: Anurag Sharma
 * Source: Official Classical AstroSage Kundli & Parashara Calculations
 * Birth Details: 15 March 1994, 12:01 PM IST (+05:30), Dehradun, India
 * Coordinates: 30.3165° N, 78.0322° E
 */

export const ANURAG_SHARMA_PROFILE = {
  name: 'Anurag Sharma',
  dob: '1994-03-15',
  tob: '12:01',
  pob: 'Dehradun, India',
  lat: 30.3165,
  lon: 78.0322,
  tz: 5.5,
  rawInput: `Planets Sign Latitude Nakshatra Pada
ASC Gemini 09-01-55 Ardra 1
Sun Pisces 00-40-34 Purvabhadra 4
Moon Aries 03-17-28 Ashvini 1
Mars Aquarius 12-23-13 Satabhisa 2
Merc Aquarius 03-20-21 Dhanishta 4
Jupt [R] Libra 20-32-06 Vishakha 1
Venu Pisces 14-31-50 Uttarabhadra 4
Satn Aquarius 11-38-43 Satabhisa 2
Rahu [R] Scorpion 03-25-58 Anuradha 1
Ketu [R] Taurus 03-25-58 Krittika 3
Uran Capricorn 01-46-31 Uttarashadha 2
Nept Sagittarius 29-03-47 Uttarashadha 1
Plut [R] Scorpion 04-11-09 Anuradha 1`
};

export const ANURAG_PLANETARY_BENCHMARK = [
  { key: 'ASC', sign: 'Gemini', deg: 9, min: 1, sec: 55, nakshatra: 'Ardra', pada: 1, isRetro: false },
  { key: 'Sun', sign: 'Pisces', deg: 0, min: 40, sec: 34, nakshatra: 'Purva Bhadrapada', altNakshatra: 'Purvabhadra', pada: 4, isRetro: false },
  { key: 'Moon', sign: 'Aries', deg: 3, min: 17, sec: 28, nakshatra: 'Ashvini', pada: 1, isRetro: false },
  { key: 'Mars', sign: 'Aquarius', deg: 12, min: 23, sec: 13, nakshatra: 'Shatabhisha', altNakshatra: 'Satabhisa', pada: 2, isRetro: false },
  { key: 'Merc', sign: 'Aquarius', deg: 3, min: 20, sec: 21, nakshatra: 'Dhanishta', pada: 4, isRetro: false },
  { key: 'Jupt', sign: 'Libra', deg: 20, min: 32, sec: 6, nakshatra: 'Vishakha', pada: 1, isRetro: true },
  { key: 'Venu', sign: 'Pisces', deg: 14, min: 31, sec: 50, nakshatra: 'Uttara Bhadrapada', altNakshatra: 'Uttarabhadra', pada: 4, isRetro: false },
  { key: 'Satn', sign: 'Aquarius', deg: 11, min: 38, sec: 43, nakshatra: 'Shatabhisha', altNakshatra: 'Satabhisa', pada: 2, isRetro: false },
  { key: 'Rahu', sign: 'Scorpio', altSign: 'Scorpion', deg: 3, min: 25, sec: 58, nakshatra: 'Anuradha', pada: 1, isRetro: true },
  { key: 'Ketu', sign: 'Taurus', deg: 3, min: 25, sec: 58, nakshatra: 'Krittika', pada: 3, isRetro: true }
];

export const ANURAG_SHODASHVARGA_BENCHMARK = {
  // Signs (1=Aries .. 12=Pisces) for [ASC, Sun, Moon, Mars, Mer, Jup, Ven, Sat, Rah, Ket]
  D1:  [3, 12, 1, 11, 11, 7, 12, 11, 8, 2],
  D2:  [5, 4, 5, 5, 5, 4, 4, 5, 4, 4],
  D3:  [3, 12, 1, 3, 11, 3, 4, 3, 8, 2],
  D4:  [6, 12, 1, 2, 11, 1, 3, 2, 8, 2],
  D7:  [5, 6, 1, 1, 11, 11, 9, 1, 2, 8],
  D9:  [9, 4, 1, 10, 8, 1, 8, 10, 5, 11],
  D10: [6, 8, 2, 3, 12, 1, 12, 2, 5, 11],
  D12: [6, 12, 2, 3, 12, 3, 5, 3, 9, 3],
  D16: [1, 9, 2, 11, 6, 11, 4, 11, 6, 6],
  D20: [11, 5, 3, 5, 11, 2, 2, 4, 11, 11],
  D24: [12, 4, 7, 2, 7, 9, 3, 2, 6, 6],
  D27: [3, 10, 3, 6, 10, 1, 11, 5, 1, 7],
  D30: [11, 2, 1, 9, 1, 3, 12, 9, 2, 2],
  D40: [1, 7, 5, 5, 5, 4, 2, 4, 11, 11],
  D45: [10, 10, 5, 11, 10, 7, 6, 10, 10, 10],
  D60: [9, 1, 7, 11, 5, 12, 5, 10, 2, 8]
};

export const ANURAG_SHADBALA_BENCHMARK = {
  Sun: {
    ochcha: 46.89, saptavarga: 84.38, ojayugma: 0, kendra: 60, drekkana: 15, sthanaBala: 206.27,
    digBala: 57.64,
    nathonnatha: 57.83, paksha: 49.13, thribhaga: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 54.42, yuddha: 0, kalaBala: 221.38,
    chestaBala: 28.15, naisargikaBala: 60, drikBala: 12.46,
    totalVirupas: 585.91, totalRupas: 9.77, requiredRupas: 5, strengthRatio: 1.95, rank: 1
  },
  Moon: {
    ochcha: 50.1, saptavarga: 112.5, ojayugma: 0, kendra: 30, drekkana: 0, sthanaBala: 192.6,
    digBala: 13.23,
    nathonnatha: 2.17, paksha: 49.13, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 60, ayana: 16.74, yuddha: 0, kalaBala: 128.04,
    chestaBala: 10.87, naisargikaBala: 51.42, drikBala: -3.01,
    totalVirupas: 393.14, totalRupas: 6.55, requiredRupas: 6, strengthRatio: 1.09, rank: 5
  },
  Mars: {
    ochcha: 55.2, saptavarga: 71.25, ojayugma: 15, kendra: 15, drekkana: 0, sthanaBala: 156.45,
    digBala: 56.26,
    nathonnatha: 2.17, paksha: 49.13, thribhaga: 0, abda: 0, masa: 0, vara: 45, hora: 0, ayana: 18.27, yuddha: 0, kalaBala: 114.57,
    chestaBala: 7.7, naisargikaBala: 17.16, drikBala: 8.52,
    totalVirupas: 360.66, totalRupas: 6.01, requiredRupas: 5, strengthRatio: 1.2, rank: 2
  },
  Merc: {
    ochcha: 13.89, saptavarga: 45, ojayugma: 15, kendra: 15, drekkana: 0, sthanaBala: 88.89,
    digBala: 18.1,
    nathonnatha: 60, paksha: 49.13, thribhaga: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 45.84, yuddha: 0, kalaBala: 154.97,
    chestaBala: 33.4, naisargikaBala: 25.74, drikBala: 9.65,
    totalVirupas: 330.75, totalRupas: 5.51, requiredRupas: 7, strengthRatio: 0.79, rank: 7
  },
  Jupt: {
    ochcha: 24.82, saptavarga: 26.25, ojayugma: 30, kendra: 30, drekkana: 0, sthanaBala: 111.07,
    digBala: 16.17,
    nathonnatha: 57.83, paksha: 10.87, thribhaga: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 9.41, yuddha: 0, kalaBala: 138.12,
    chestaBala: 43.84, naisargikaBala: 34.26, drikBala: -29.33,
    totalVirupas: 314.12, totalRupas: 5.24, requiredRupas: 6.5, strengthRatio: 0.81, rank: 6
  },
  Venu: {
    ochcha: 55.84, saptavarga: 43.12, ojayugma: 30, kendra: 60, drekkana: 0, sthanaBala: 188.97,
    digBala: 6.97,
    nathonnatha: 57.83, paksha: 10.87, thribhaga: 0, abda: 0, masa: 30, vara: 0, hora: 0, ayana: 34.18, yuddha: 0, kalaBala: 132.88,
    chestaBala: 11.61, naisargikaBala: 42.84, drikBala: 6.97,
    totalVirupas: 390.25, totalRupas: 6.5, requiredRupas: 5.5, strengthRatio: 1.18, rank: 3
  },
  Satn: {
    ochcha: 22.78, saptavarga: 103.12, ojayugma: 15, kendra: 15, drekkana: 15, sthanaBala: 170.91,
    digBala: 39.13,
    nathonnatha: 2.17, paksha: 49.13, thribhaga: 0, abda: 15, masa: 0, vara: 0, hora: 0, ayana: 42.08, yuddha: 0, kalaBala: 108.37,
    chestaBala: 5.81, naisargikaBala: 8.58, drikBala: 8.61,
    totalVirupas: 341.41, totalRupas: 5.69, requiredRupas: 5, strengthRatio: 1.14, rank: 4
  }
};

export const ANURAG_BHAVABALA_BENCHMARK = [
  { house: 1, adhipatiBala: 330.75, digBala: 60, drishtiBala: -13.57, totalVirupas: 377.18, totalRupas: 6.29, rank: 7 },
  { house: 2, adhipatiBala: 393.14, digBala: 40, drishtiBala: 39.12, totalVirupas: 472.26, totalRupas: 7.87, rank: 2 },
  { house: 3, adhipatiBala: 585.91, digBala: 50, drishtiBala: -61.26, totalVirupas: 574.65, totalRupas: 9.58, rank: 1 },
  { house: 4, adhipatiBala: 330.75, digBala: 0, drishtiBala: -86.32, totalVirupas: 244.43, totalRupas: 4.07, rank: 12 },
  { house: 5, adhipatiBala: 390.25, digBala: 20, drishtiBala: -65.36, totalVirupas: 344.89, totalRupas: 5.75, rank: 10 },
  { house: 6, adhipatiBala: 360.66, digBala: 50, drishtiBala: -33.7, totalVirupas: 376.96, totalRupas: 6.28, rank: 8 },
  { house: 7, adhipatiBala: 314.12, digBala: 0, drishtiBala: -7.8, totalVirupas: 306.32, totalRupas: 5.11, rank: 11 },
  { house: 8, adhipatiBala: 341.41, digBala: 40, drishtiBala: 26.01, totalVirupas: 407.42, totalRupas: 6.79, rank: 3 },
  { house: 9, adhipatiBala: 341.41, digBala: 10, drishtiBala: 40.33, totalVirupas: 391.74, totalRupas: 6.53, rank: 6 },
  { house: 10, adhipatiBala: 314.12, digBala: 30, drishtiBala: 56.93, totalVirupas: 401.05, totalRupas: 6.68, rank: 5 },
  { house: 11, adhipatiBala: 360.66, digBala: 10, drishtiBala: -0.46, totalVirupas: 370.2, totalRupas: 6.17, rank: 9 },
  { house: 12, adhipatiBala: 390.25, digBala: 40, drishtiBala: -23.3, totalVirupas: 406.95, totalRupas: 6.78, rank: 4 }
];

export const ANURAG_ASHTAKAVARGA_BENCHMARK = {
  bav: {
    Sun:  [3, 3, 4, 1, 5, 6, 4, 5, 4, 3, 5, 5],
    Moon: [6, 4, 5, 4, 4, 5, 4, 4, 5, 4, 2, 2],
    Mars: [2, 3, 3, 3, 6, 4, 2, 3, 4, 2, 4, 3],
    Merc: [3, 5, 3, 5, 4, 5, 4, 7, 3, 5, 5, 5],
    Jupt: [5, 5, 4, 5, 4, 3, 5, 6, 7, 4, 4, 4],
    Venu: [6, 4, 7, 6, 3, 2, 6, 3, 5, 4, 4, 2],
    Satn: [4, 0, 5, 3, 3, 5, 2, 3, 4, 4, 3, 3]
  },
  savBySign: [29, 24, 31, 27, 29, 30, 27, 31, 32, 26, 27, 24],
  totalSAV: 337
};

export const ANURAG_DASHA_BENCHMARK = {
  moonSign: 'Aries',
  nakshatra: 'Ashvini',
  startingLord: 'Ketu',
  startingBalanceYears: 5.27,
  mahadashas: [
    { lord: 'Ketu', years: 7, startApprox: '1994-03-15', endApprox: '1999-06-24' },
    { lord: 'Venus', years: 20, startApprox: '1999-06-24', endApprox: '2019-06-24' },
    { lord: 'Sun', years: 6, startApprox: '2019-06-24', endApprox: '2025-06-24' },
    { lord: 'Moon', years: 10, startApprox: '2025-06-24', endApprox: '2035-06-24' },
    { lord: 'Mars', years: 7, startApprox: '2035-06-24', endApprox: '2042-06-24' },
    { lord: 'Rahu', years: 18, startApprox: '2042-06-24', endApprox: '2060-06-24' },
    { lord: 'Jupiter', years: 16, startApprox: '2060-06-24', endApprox: '2076-06-24' },
    { lord: 'Saturn', years: 19, startApprox: '2076-06-24', endApprox: '2095-06-24' },
    { lord: 'Mercury', years: 17, startApprox: '2095-06-24', endApprox: '2112-06-24' }
  ]
};

export const ANURAG_CHALIT_BENCHMARK = [
  { house: 1,  beginSign: 'Taurus',      beginDms: '21.27.40', midSign: 'Gemini',      midDms: '09.01.55' },
  { house: 2,  beginSign: 'Gemini',      beginDms: '21.27.40', midSign: 'Cancer',      midDms: '03.53.25' },
  { house: 3,  beginSign: 'Cancer',      beginDms: '16.19.11', midSign: 'Cancer',      midDms: '28.44.56' },
  { house: 4,  beginSign: 'Leo',         beginDms: '11.10.41', midSign: 'Leo',         midDms: '23.36.26' },
  { house: 5,  beginSign: 'Virgo',       beginDms: '11.10.41', midSign: 'Virgo',       midDms: '28.44.56' },
  { house: 6,  beginSign: 'Libra',       beginDms: '16.19.11', midSign: 'Scorpio',     altMidSign: 'Scorpion', midDms: '03.53.25' },
  { house: 7,  beginSign: 'Scorpio',     altBeginSign: 'Scorpion', beginDms: '21.27.40', midSign: 'Sagittarius', midDms: '09.01.55' },
  { house: 8,  beginSign: 'Sagittarius', beginDms: '21.27.40', midSign: 'Capricorn',   midDms: '03.53.25' },
  { house: 9,  beginSign: 'Capricorn',   beginDms: '16.19.11', midSign: 'Capricorn',   midDms: '28.44.56' },
  { house: 10, beginSign: 'Aquarius',    beginDms: '11.10.41', midSign: 'Aquarius',    midDms: '23.36.26' },
  { house: 11, beginSign: 'Pisces',      beginDms: '11.10.41', midSign: 'Pisces',      midDms: '28.44.56' },
  { house: 12, beginSign: 'Aries',       beginDms: '16.19.11', midSign: 'Taurus',      midDms: '03.53.25' }
];

export const ANURAG_CHALIT_SHIFTS_BENCHMARK = [
  // Mars: Aquarius 12°23'13" -> In Rashi H9, but Chalit H10 (starts at Aquarius 11°10'41")
  { planet: 'Mars', rashiHouse: 9, chalitHouse: 10 },
  // Saturn: Aquarius 11°38'43" -> In Rashi H9, but Chalit H10 (starts at Aquarius 11°10'41")
  { planet: 'Satn', rashiHouse: 9, chalitHouse: 10 }
];

export const ANURAG_JAIMINI_PADAS_BENCHMARK = {
  AL: { refHouse: 1, signIndex: 6, signName: 'Libra', houseNumber: 5, label: 'Arudha Lagna (AL)' },
  UL: { refHouse: 12, signIndex: 9, signName: 'Capricorn', houseNumber: 8, label: 'Upapada Lagna (UL)' },
  A7: { refHouse: 7, signIndex: 4, signName: 'Leo', houseNumber: 3, label: 'Darapada (A7)' }
};

export const ANURAG_CHARA_KARAKAS_BENCHMARK = [
  { karakaKey: 'AK',  karakaName: 'Atmakaraka',    planet: 'Jupiter', signName: 'Libra',    deg: 20, min: 32, sec: 6 },
  { karakaKey: 'AmK', karakaName: 'Amatyakaraka',  planet: 'Venus',   signName: 'Pisces',   deg: 14, min: 31, sec: 50 },
  { karakaKey: 'BK',  karakaName: 'Bhratrikaraka', planet: 'Mars',    signName: 'Aquarius', deg: 12, min: 23, sec: 13 },
  { karakaKey: 'MK',  karakaName: 'Matrikaraka',   planet: 'Saturn',  signName: 'Aquarius', deg: 11, min: 38, sec: 43 },
  { karakaKey: 'PK',  karakaName: 'Putrakaraka',   planet: 'Mercury', signName: 'Aquarius', deg: 3,  min: 20, sec: 21 },
  { karakaKey: 'GK',  karakaName: 'Gnatikaraka',   planet: 'Moon',    signName: 'Aries',    deg: 3,  min: 17, sec: 28 },
  { karakaKey: 'DK',  karakaName: 'Darakaraka',    planet: 'Sun',     signName: 'Pisces',   deg: 0,  min: 40, sec: 34 }
];

export const ANURAG_FRIENDSHIP_BENCHMARK = {
  temporal: {
    Sun:  { Moon: 'Friend', Mars: 'Friend', Merc: 'Friend', Jupt: 'Enemy',  Venu: 'Enemy',  Satn: 'Friend' },
    Moon: { Sun: 'Friend',  Mars: 'Friend', Merc: 'Friend', Jupt: 'Enemy',  Venu: 'Friend', Satn: 'Friend' },
    Mars: { Sun: 'Friend',  Moon: 'Friend', Merc: 'Enemy',  Jupt: 'Enemy',  Venu: 'Friend', Satn: 'Enemy' },
    Merc: { Sun: 'Friend',  Moon: 'Friend', Mars: 'Enemy',  Jupt: 'Enemy',  Venu: 'Friend', Satn: 'Enemy' },
    Jupt: { Sun: 'Enemy',   Moon: 'Enemy',  Mars: 'Enemy',  Merc: 'Enemy',  Venu: 'Enemy',  Satn: 'Enemy' },
    Venu: { Sun: 'Enemy',   Moon: 'Friend', Mars: 'Friend', Merc: 'Friend', Jupt: 'Enemy',  Satn: 'Friend' },
    Satn: { Sun: 'Friend',  Moon: 'Friend', Mars: 'Enemy',  Merc: 'Enemy',  Jupt: 'Enemy',  Venu: 'Friend' }
  },
  fiveFold: {
    Sun:  { Moon: 'Intimat', Mars: 'Intimat', Merc: 'Friend',  Jupt: 'Neutral', Venu: 'Bitter',  Satn: 'Neutral' },
    Moon: { Sun: 'Intimat',  Mars: 'Friend',  Merc: 'Intimat', Jupt: 'Enemy',   Venu: 'Friend',  Satn: 'Friend' },
    Mars: { Sun: 'Intimat',  Moon: 'Intimat', Merc: 'Bitter',  Jupt: 'Neutral', Venu: 'Friend',  Satn: 'Enemy' },
    Merc: { Sun: 'Intimat',  Moon: 'Neutral', Mars: 'Enemy',   Jupt: 'Enemy',   Venu: 'Intimat', Satn: 'Enemy' },
    Jupt: { Sun: 'Neutral',  Moon: 'Neutral', Mars: 'Neutral', Merc: 'Bitter',  Venu: 'Bitter',  Satn: 'Enemy' },
    Venu: { Sun: 'Bitter',   Moon: 'Neutral', Mars: 'Friend',  Merc: 'Intimat', Jupt: 'Enemy',   Satn: 'Intimat' },
    Satn: { Sun: 'Neutral',  Moon: 'Neutral', Mars: 'Bitter',  Merc: 'Neutral', Jupt: 'Enemy',   Venu: 'Intimat' }
  }
};

