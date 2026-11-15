// Astrological Constants and Reference Data

export const SIGNS = [
  { id: 1, name: 'Aries', sanskrit: 'Mesha', lord: 'Mars', element: 'Fire', mobility: 'Movable', symbol: '♈' },
  { id: 2, name: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus', element: 'Earth', mobility: 'Fixed', symbol: '♉' },
  { id: 3, name: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury', element: 'Air', mobility: 'Dual', symbol: '♊' },
  { id: 4, name: 'Cancer', sanskrit: 'Karka', lord: 'Moon', element: 'Water', mobility: 'Movable', symbol: '♋' },
  { id: 5, name: 'Leo', sanskrit: 'Simha', lord: 'Sun', element: 'Fire', mobility: 'Fixed', symbol: '♌' },
  { id: 6, name: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury', element: 'Earth', mobility: 'Dual', symbol: '♍' },
  { id: 7, name: 'Libra', sanskrit: 'Tula', lord: 'Venus', element: 'Air', mobility: 'Movable', symbol: '♎' },
  { id: 8, name: 'Scorpio', sanskrit: 'Vrischika', lord: 'Mars', element: 'Water', mobility: 'Fixed', symbol: '♏' },
  { id: 9, name: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter', element: 'Fire', mobility: 'Dual', symbol: '♐' },
  { id: 10, name: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn', element: 'Earth', mobility: 'Movable', symbol: '♑' },
  { id: 11, name: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn', element: 'Air', mobility: 'Fixed', symbol: '♒' },
  { id: 12, name: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter', element: 'Water', mobility: 'Dual', symbol: '♓' }
];

export const RASHI_LORDS = SIGNS.map(s => s.lord);

export const PLANETS = [
  { key: 'ASC', name: 'Ascendant', sanskrit: 'Lagna', symbol: 'Asc', color: '#6366F1' },
  { key: 'Sun', name: 'Sun', sanskrit: 'Surya', symbol: 'Su', color: '#F59E0B' },
  { key: 'Moon', name: 'Moon', sanskrit: 'Chandra', symbol: 'Mo', color: '#E2E8F0' },
  { key: 'Mars', name: 'Mars', sanskrit: 'Mangala', symbol: 'Ma', color: '#EF4444' },
  { key: 'Merc', name: 'Mercury', sanskrit: 'Budha', symbol: 'Me', color: '#10B981' },
  { key: 'Jupt', name: 'Jupiter', sanskrit: 'Guru', symbol: 'Ju', color: '#FBBF24' },
  { key: 'Venu', name: 'Venus', sanskrit: 'Shukra', symbol: 'Ve', color: '#EC4899' },
  { key: 'Satn', name: 'Saturn', sanskrit: 'Shani', symbol: 'Sa', color: '#3B82F6' },
  { key: 'Rahu', name: 'Rahu', sanskrit: 'Rahu', symbol: 'Ra', color: '#8B5CF6' },
  { key: 'Ketu', name: 'Ketu', sanskrit: 'Ketu', symbol: 'Ke', color: '#9CA3AF' },
  { key: 'Uran', name: 'Uranus', sanskrit: 'Harshal', symbol: 'Ur', color: '#06B6D4' },
  { key: 'Nept', name: 'Neptune', sanskrit: 'Varuna', symbol: 'Ne', color: '#3B82F6' },
  { key: 'Plut', name: 'Pluto', sanskrit: 'Yama', symbol: 'Pl', color: '#64748B' }
];

export const NAKSHATRAS = [
  { id: 1, name: 'Ashvini', lord: 'Ketu', deity: 'Ashvini Kumaras' },
  { id: 2, name: 'Bharani', lord: 'Venus', deity: 'Yama' },
  { id: 3, name: 'Krittika', lord: 'Sun', deity: 'Agni' },
  { id: 4, name: 'Rohini', lord: 'Moon', deity: 'Brahma' },
  { id: 5, name: 'Mrigashira', lord: 'Mars', deity: 'Soma' },
  { id: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra' },
  { id: 7, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi' },
  { id: 8, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati' },
  { id: 9, name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas' },
  { id: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitris' },
  { id: 11, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga' },
  { id: 12, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman' },
  { id: 13, name: 'Hasta', lord: 'Moon', deity: 'Savitr' },
  { id: 14, name: 'Chitra', lord: 'Mars', deity: 'Tvashtar' },
  { id: 15, name: 'Svati', lord: 'Rahu', deity: 'Vayu' },
  { id: 16, name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni' },
  { id: 17, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra' },
  { id: 18, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra' },
  { id: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti' },
  { id: 20, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas' },
  { id: 21, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas' },
  { id: 22, name: 'Shravana', lord: 'Moon', deity: 'Vishnu' },
  { id: 23, name: 'Dhanishta', lord: 'Mars', deity: 'Ashta Vasus' },
  { id: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna' },
  { id: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada' },
  { id: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya' },
  { id: 27, name: 'Revati', lord: 'Mercury', deity: 'Pushan' }
];

export const VIMSHOTTARI_LORDS = [
  { lord: 'Ketu', years: 7, color: '#9CA3AF' },
  { lord: 'Venus', years: 20, color: '#EC4899' },
  { lord: 'Sun', years: 6, color: '#F59E0B' },
  { lord: 'Moon', years: 10, color: '#E2E8F0' },
  { lord: 'Mars', years: 7, color: '#EF4444' },
  { lord: 'Rahu', years: 18, color: '#8B5CF6' },
  { lord: 'Jupiter', years: 16, color: '#FBBF24' },
  { lord: 'Saturn', years: 19, color: '#3B82F6' },
  { lord: 'Mercury', years: 17, color: '#10B981' }
];

export const SHODASHVARGA_DEFS = [
  { code: 'D1', factor: 1, name: 'Rashi', significance: 'Physical body, general destiny, core personality' },
  { code: 'D2', factor: 2, name: 'Hora', significance: 'Wealth, prosperity, resources, sun/moon energies' },
  { code: 'D3', factor: 3, name: 'Drekkana', significance: 'Siblings, courage, vitality, energy' },
  { code: 'D4', factor: 4, name: 'Chaturthamsha', significance: 'Fixed assets, fortune, properties, shelter' },
  { code: 'D7', factor: 7, name: 'Saptamsha', significance: 'Children, progeny, creativity, creative legacy' },
  { code: 'D9', factor: 9, name: 'Navamsha', significance: 'Spouse, dharma, inner potential, second half of life' },
  { code: 'D10', factor: 10, name: 'Dashamsha', significance: 'Career, profession, status, public honors' },
  { code: 'D12', factor: 12, name: 'Dwadamsha', significance: 'Parents, ancestors, past karma lineage' },
  { code: 'D16', factor: 16, name: 'Shodashamsha', significance: 'Vehicles, luxuries, happiness, conveyances' },
  { code: 'D20', factor: 20, name: 'Vimshamsha', significance: 'Spiritual inclination, upasana, religious devotion' },
  { code: 'D24', factor: 24, name: 'Chaturvimshamsha', significance: 'Higher education, learning, intellect, skill' },
  { code: 'D27', factor: 27, name: 'Saptavimshamsha', significance: 'Strengths, weaknesses, subconscious vitality' },
  { code: 'D30', factor: 30, name: 'Trimshamsha', significance: 'Misfortunes, evils, arishta, character flaws' },
  { code: 'D40', factor: 40, name: 'Khavedamsha', significance: 'Auspicious and inauspicious events, auspiciousness' },
  { code: 'D45', factor: 45, name: 'Akshavedamsha', significance: 'Purity of character, moral fiber, general well-being' },
  { code: 'D60', factor: 60, name: 'Shashtiamsha', significance: 'Past-life karma, root destiny, fine-tuning Parasara' }
];

export const ASHTAKAVARGA_RULES = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Merc: [3, 5, 6, 9, 10, 11, 12],
    Jupt: [5, 6, 9, 11],
    Venu: [6, 7, 12],
    Satn: [1, 2, 4, 7, 8, 9, 10, 11],
    ASC:  [3, 4, 6, 10, 11, 12]
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Merc: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupt: [1, 4, 7, 8, 10, 11, 12],
    Venu: [3, 4, 5, 7, 9, 10, 11],
    Satn: [3, 5, 6, 11],
    ASC:  [3, 6, 10, 11]
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Merc: [3, 5, 6, 11],
    Jupt: [6, 10, 11, 12],
    Venu: [6, 8, 11, 12],
    Satn: [1, 4, 7, 8, 9, 10, 11],
    ASC:  [1, 3, 6, 10, 11]
  },
  Merc: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Merc: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupt: [6, 8, 11, 12],
    Venu: [1, 2, 3, 4, 5, 8, 9, 11],
    Satn: [1, 2, 4, 7, 8, 9, 10, 11],
    ASC:  [1, 2, 4, 6, 8, 10, 11]
  },
  Jupt: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Merc: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupt: [1, 2, 3, 4, 7, 8, 10, 11],
    Venu: [2, 5, 6, 9, 10, 11],
    Satn: [3, 5, 6, 12],
    ASC:  [1, 2, 4, 5, 6, 7, 9, 10, 11]
  },
  Venu: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Merc: [3, 5, 6, 9, 11],
    Jupt: [5, 8, 9, 10, 11],
    Venu: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Satn: [3, 4, 5, 8, 9, 10, 11],
    ASC:  [1, 2, 3, 4, 5, 8, 9, 11]
  },
  Satn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Merc: [6, 8, 9, 10, 11, 12],
    Jupt: [5, 6, 11, 12],
    Venu: [6, 11, 12],
    Satn: [3, 5, 6, 11],
    ASC:  [1, 3, 4, 6, 10, 11]
  }
};
