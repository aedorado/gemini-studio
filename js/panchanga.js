// Panchanga Calculation Engine (Tithi, Vaara, Nakshatra, Yoga, Karana)

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

const VAARA_NAMES = [
  { day: 'Sunday', sanskrit: 'Ravivara', lord: 'Sun' },
  { day: 'Monday', sanskrit: 'Somavara', lord: 'Moon' },
  { day: 'Tuesday', sanskrit: 'Mangalavara', lord: 'Mars' },
  { day: 'Wednesday', sanskrit: 'Budhavara', lord: 'Mercury' },
  { day: 'Thursday', sanskrit: 'Guruvara', lord: 'Jupiter' },
  { day: 'Friday', sanskrit: 'Shukravara', lord: 'Venus' },
  { day: 'Saturday', sanskrit: 'Shanivara', lord: 'Saturn' }
];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Asiddhi (Siddhi)', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti'
];

const MOVABLE_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];

export function calculatePanchanga(sunPlanet, moonPlanet, birthDateObj = new Date()) {
  if (!sunPlanet || !moonPlanet) return null;

  const sunLong = sunPlanet.absLongitude;
  const moonLong = moonPlanet.absLongitude;

  // 1. Tithi: Based on angular separation between Moon and Sun (each tithi is 12 degrees)
  let diff = (moonLong - sunLong + 360) % 360;
  const tithiIndex = Math.floor(diff / 12); // 0 to 29
  const tithiNumber = tithiIndex + 1; // 1 to 30
  const isShukla = tithiIndex < 15;
  const paksha = isShukla ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
  const tithiNameInPaksha = tithiIndex === 14 ? 'Purnima (Full Moon)' : (tithiIndex === 29 ? 'Amavasya (New Moon)' : TITHI_NAMES[tithiIndex % 15]);
  const tithiProgressPct = Math.round(((diff % 12) / 12) * 100);

  // 2. Vaara (Day of Week)
  const dayIdx = birthDateObj.getDay(); // 0 = Sunday
  const vaara = VAARA_NAMES[dayIdx];

  // 3. Nakshatra & Pada
  const nakshatra = {
    name: moonPlanet.nakshatraName,
    pada: moonPlanet.pada,
    lord: moonPlanet.nakshatraLord
  };

  // 4. Nitya Yoga: Based on sum of Sun and Moon longitudes (each yoga is 13°20' = 800 minutes)
  const sumLong = (sunLong + moonLong) % 360;
  const yogaIndex = Math.floor((sumLong * 60) / 800);
  const yogaName = YOGA_NAMES[yogaIndex % 27];
  const isAuspiciousYoga = !['Atiganda', 'Shoola', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti'].includes(yogaName);

  // 5. Karana: Half of a tithi (6 degrees each = 60 karanas in a lunar month)
  const karanaIndex = Math.floor(diff / 6); // 0 to 59
  let karanaName = '';

  if (karanaIndex === 0) {
    karanaName = 'Kimstughna (Fixed)';
  } else if (karanaIndex >= 57) {
    const fixedKaranas = ['Shakuni (Fixed)', 'Chatushpada (Fixed)', 'Naga (Fixed)'];
    karanaName = fixedKaranas[karanaIndex - 57];
  } else {
    // 56 movable karana periods cycling through the 7 movable karanas 8 times
    const movIdx = (karanaIndex - 1) % 7;
    karanaName = MOVABLE_KARANAS[movIdx];
  }

  return {
    tithi: {
      number: tithiNumber,
      name: tithiNameInPaksha,
      paksha,
      progressPct: tithiProgressPct
    },
    vaara: {
      name: vaara.day,
      sanskrit: vaara.sanskrit,
      lord: vaara.lord
    },
    nakshatra,
    yoga: {
      name: yogaName,
      isAuspicious: isAuspiciousYoga
    },
    karana: {
      name: karanaName
    }
  };
}
