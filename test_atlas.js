import { searchCities, getTimezoneOffsetHours } from './js/atlas.js';

// Test searching cities offline
async function runTest() {
  console.log('Testing Atlas Search...');
  const tests = ['Deoria', 'Varanasi', 'Jaipur', 'Ujjain', 'London', 'New York', 'Ahmedabad'];

  for (let q of tests) {
    const res = await searchCities(q, 3);
    console.log(`Query "${q}" returned ${res.length} matches:`);
    res.forEach(c => {
      const offset = getTimezoneOffsetHours(c.timezone, new Date('1994-03-15'));
      console.log(`  - ${c.displayLabel} (Lat: ${c.lat}, Lon: ${c.lon}, TZ: ${c.timezone} -> Offset in 1994: ${offset} hrs)`);
    });
  }

  // Explicit verification for Deoria
  const deoriaRes = await searchCities('Deoria', 1);
  if (!deoriaRes.length || deoriaRes[0].cityName !== 'Deoria' || deoriaRes[0].lat !== 26.5017 || deoriaRes[0].lon !== 83.7794) {
    throw new Error('Deoria atlas verification failed: ' + JSON.stringify(deoriaRes));
  }
  console.log('\n✓ Deoria correctly matched in Atlas: ' + JSON.stringify(deoriaRes[0]));

  console.log('\n✓ ATLAS TEST COMPLETED WITH 100% SUCCESS!');
}

runTest();
