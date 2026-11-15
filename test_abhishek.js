import { calculateChartFromBirthDetails } from './js/ephemeris.js';
import { calculateShodashvargaMatrix } from './js/shodashvarga.js';
import * as sb from './js/shadbala.js';

const chart = calculateChartFromBirthDetails({
  year: 1995, month: 10, day: 31, hour: 7, minute: 35, second: 0,
  lat: 27.5979, lon: 78.0534, tz: 5.5
});

const matrix = calculateShodashvargaMatrix(chart.planets).matrix;
const pKeys = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn'];
const user = {
  Sun: { ochcha: 1.13, sapta: 88.12, oja: 30, kendra: 60, drek: 0, sthana: 179.25, dig: 36.25, nato: 37.79, paksha: 29.14, thri: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 24.74, yuddha: 0, kala: 91.67, chesta: 17.61, nais: 60, drik: -4.83, total: 379.95 },
  Moon: { ochcha: 24.32, sapta: 127.5, oja: 30, kendra: 60, drek: 0, sthana: 241.82, dig: 54.61, nato: 22.21, paksha: 30.86, thri: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 52.59, yuddha: 0, kala: 105.66, chesta: 30.86, nais: 51.42, drik: 4.11, total: 488.48 },
  Mars: { ochcha: 35.19, sapta: 165, oja: 0, kendra: 30, drek: 0, sthana: 230.19, dig: 26.19, nato: 22.21, paksha: 29.14, thri: 0, abda: 15, masa: 0, vara: 45, hora: 60, ayana: 2.67, yuddha: 0, kala: 174.02, chesta: 14.99, nais: 17.16, drik: -3.06, total: 459.49 },
  Merc: { ochcha: 55.24, sapta: 127.5, oja: 0, kendra: 15, drek: 0, sthana: 197.74, dig: 50.74, nato: 60, paksha: 30.86, thri: 60, abda: 0, masa: 30, vara: 0, hora: 0, ayana: 41.37, yuddha: 0, kala: 222.23, chesta: 23.84, nais: 25.74, drik: -4.83, total: 515.47 },
  Jupt: { ochcha: 14.31, sapta: 106.88, oja: 0, kendra: 30, drek: 0, sthana: 151.19, dig: 51.67, nato: 37.79, paksha: 30.86, thri: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 1.02, yuddha: 0, kala: 129.67, chesta: 15.5, nais: 34.26, drik: -2.3, total: 379.98 },
  Venu: { ochcha: 11.69, sapta: 86.25, oja: 30, kendra: 30, drek: 0, sthana: 157.94, dig: 29.97, nato: 37.79, paksha: 30.86, thri: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 5.57, yuddha: 0, kala: 74.22, chesta: 12.17, nais: 42.84, drik: -4.48, total: 312.66 },
  Satn: { ochcha: 18.47, sapta: 120, oja: 15, kendra: 30, drek: 0, sthana: 183.47, dig: 39.17, nato: 22.21, paksha: 29.14, thri: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 35.84, yuddha: 0, kala: 87.19, chesta: 45.54, nais: 8.58, drik: 3.3, total: 367.25 }
};

const lagna = chart.planets.find(p => p.key === 'ASC');
const sun = chart.planets.find(p => p.key === 'Sun');
const moon = chart.planets.find(p => p.key === 'Moon');

for (let k of pKeys) {
  const p = chart.planets.find(pl => pl.key === k);
  const u = user[k];
  const ochcha = sb.calculateUchchaBala(k, p.absLongitude);
  const rec = matrix.find(r => r.key === k);
  const sapta = sb.calculateSaptavargajaBala(k, rec, chart.planets);
  const houseNum = ((p.signIndex - lagna.signIndex + 12) % 12) + 1;
  const kendra = sb.calculateKendraBala(houseNum);
  const dig = sb.calculateDigBala(k, p.absLongitude, lagna.absLongitude);
  const kalaObj = sb.calculateKalaBala(k, 7 + 35/60, sun.absLongitude, moon.absLongitude, new Date('1995-10-31'), p.absLongitude);
  const chesta = sb.calculateChestaBala(k, p.isRetro, p.absLongitude, sun.absLongitude);
  const drik = sb.calculateDrikBala(k, p.absLongitude, chart.planets.filter(pl => pKeys.includes(pl.key)));
  
  console.log(`=== ${k} ===`);
  console.log(`Ochcha:    calc=${ochcha} vs user=${u.ochcha} (diff: ${(ochcha - u.ochcha).toFixed(2)})`);
  console.log(`Sapta:     calc=${sapta} vs user=${u.sapta} (diff: ${(sapta - u.sapta).toFixed(2)})`);
  console.log(`Kendra:    calc=${kendra} vs user=${u.kendra} (diff: ${(kendra - u.kendra).toFixed(2)})`);
  console.log(`Dig:       calc=${dig} vs user=${u.dig} (diff: ${(dig - u.dig).toFixed(2)})`);
  console.log(`Nato:      calc=${kalaObj.natonnatha} vs user=${u.nato} (diff: ${(kalaObj.natonnatha - u.nato).toFixed(2)})`);
  console.log(`Paksha:    calc=${kalaObj.paksha} vs user=${u.paksha} (diff: ${(kalaObj.paksha - u.paksha).toFixed(2)})`);
  console.log(`Thri:      calc=${kalaObj.tribhaga} vs user=${u.thri} (diff: ${(kalaObj.tribhaga - u.thri).toFixed(2)})`);
  console.log(`Vara:      calc=${kalaObj.vara} vs user=${u.vara} (diff: ${(kalaObj.vara - u.vara).toFixed(2)})`);
  console.log(`Hora:      calc=${kalaObj.hora} vs user=${u.hora} (diff: ${(kalaObj.hora - u.hora).toFixed(2)})`);
  console.log(`Ayana:     calc=${kalaObj.ayana} vs user=${u.ayana} (diff: ${(kalaObj.ayana - u.ayana).toFixed(2)})`);
  console.log(`Chesta:    calc=${chesta} vs user=${u.chesta} (diff: ${(chesta - u.chesta).toFixed(2)})`);
  console.log(`Drik:      calc=${drik} vs user=${u.drik} (diff: ${(drik - u.drik).toFixed(2)})`);
}
