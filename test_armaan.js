import { calculateChartFromBirthDetails } from './js/ephemeris.js';
import { calculateShodashvargaMatrix } from './js/shodashvarga.js';
import * as shad from './js/shadbala.js';

const chart = calculateChartFromBirthDetails({
  year: 2001, month: 9, day: 2,
  hour: 16, minute: 2, second: 0,
  lat: 29.719, lon: 75.9068, tz: 5.5
});

const matrix = calculateShodashvargaMatrix(chart.planets).matrix;

const userTable = {
  Sun: { ochcha: 17.95, sapta: 142.5, oja: 30, kendra: 15, drek: 0, sthana: 205.45, dig: 40.71, nato: 42.01, paksha: 1.7, thri: 0, abda: 0, masa: 0, vara: 45, hora: 0, ayana: 79.79, yuddha: 0, kala: 168.49, chesta: 36.66, nais: 60, drik: -8.85, total: 502.46 },
  Moon: { ochcha: 32.69, sapta: 71.25, oja: 15, kendra: 15, drek: 0, sthana: 133.94, dig: 39.01, nato: 17.99, paksha: 58.3, thri: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 42.31, yuddha: 0, kala: 118.6, chesta: 58.3, nais: 51.42, drik: -2.0, total: 399.27 },
  Mars: { ochcha: 41.68, sapta: 93.75, oja: 30, kendra: 60, drek: 15, sthana: 240.43, dig: 43.67, nato: 17.99, paksha: 1.7, thri: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 0.22, yuddha: 0, kala: 19.91, chesta: 43.68, nais: 17.16, drik: -0.61, total: 364.23 },
  Merc: { ochcha: 57.74, sapta: 91.88, oja: 0, kendra: 60, drek: 0, sthana: 209.61, dig: 23.81, nato: 60, paksha: 58.3, thri: 0, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 31.05, yuddha: 0, kala: 149.35, chesta: 19.33, nais: 25.74, drik: 11.76, total: 439.61 },
  Jupt: { ochcha: 53.77, sapta: 105, oja: 30, kendra: 60, drek: 0, sthana: 248.77, dig: 3.49, nato: 42.01, paksha: 58.3, thri: 60, abda: 0, masa: 0, vara: 0, hora: 0, ayana: 59.27, yuddha: 0, kala: 219.58, chesta: 21.8, nais: 34.26, drik: -4.41, total: 523.48 },
  Venu: { ochcha: 24.47, sapta: 45, oja: 30, kendra: 30, drek: 0, sthana: 129.47, dig: 30.14, nato: 42.01, paksha: 58.3, thri: 0, abda: 0, masa: 30, vara: 0, hora: 60, ayana: 53.34, yuddha: 0, kala: 243.65, chesta: 20.82, nais: 42.84, drik: -15.29, total: 451.63 },
  Satn: { ochcha: 10.18, sapta: 142.5, oja: 0, kendra: 15, drek: 0, sthana: 167.68, dig: 47.93, nato: 17.99, paksha: 1.7, thri: 60, abda: 15, masa: 0, vara: 0, hora: 0, ayana: 1.2, yuddha: 0, kala: 95.89, chesta: 29.12, nais: 8.58, drik: 4.06, total: 353.27 }
};

const planets = chart.planets.filter(p => userTable[p.key]);
const lagna = chart.planets.find(p => p.key === 'ASC');

for (let p of planets) {
  const k = p.key;
  const u = userTable[k];
  const rec = matrix.find(r => r.key === k);
  const ochcha = shad.calculateUchchaBala(k, p.absLongitude);
  const sapta = shad.calculateSaptavargajaBala(k, rec, planets);
  const oja = shad.calculateOjayugmaBala(k, p.signIndex + 1, rec.vargas['D9']);
  const houseNum = ((p.signIndex - lagna.signIndex + 12) % 12) + 1;
  const kendra = shad.calculateKendraBala(houseNum);
  const drek = shad.calculateDrekkanaBala(k, p.degInSign);
  const dig = shad.calculateDigBala(k, p.absLongitude, lagna.absLongitude);
  const kalaObj = shad.calculateKalaBala(k, 16 + 2/60, chart.planets.find(pl => pl.key === 'Sun').absLongitude, chart.planets.find(pl => pl.key === 'Moon').absLongitude, new Date('2001-09-02'));
  const chesta = shad.calculateChestaBala(k, p.isRetro, p.absLongitude, chart.planets.find(pl => pl.key === 'Sun').absLongitude);
  const drik = shad.calculateDrikBala(k, p.absLongitude, planets);
  
  console.log(`\n=================== ${k} ===================`);
  console.log(`Ochcha:    calc=${ochcha} vs AstroSage=${u.ochcha} (diff: ${(ochcha - u.ochcha).toFixed(2)})`);
  console.log(`Sapta:     calc=${sapta} vs AstroSage=${u.sapta} (diff: ${(sapta - u.sapta).toFixed(2)})`);
  console.log(`Ojayugma:  calc=${oja} vs AstroSage=${u.oja} (diff: ${(oja - u.oja).toFixed(2)})`);
  console.log(`Kendra:    calc=${kendra} vs AstroSage=${u.kendra} (diff: ${(kendra - u.kendra).toFixed(2)})`);
  console.log(`Drekkana:  calc=${drek} vs AstroSage=${u.drek} (diff: ${(drek - u.drek).toFixed(2)})`);
  console.log(`Dig:       calc=${dig} vs AstroSage=${u.dig} (diff: ${(dig - u.dig).toFixed(2)})`);
  console.log(`Nato:      calc=${kalaObj.natonnatha} vs AstroSage=${u.nato} (diff: ${(kalaObj.natonnatha - u.nato).toFixed(2)})`);
  console.log(`Paksha:    calc=${kalaObj.paksha} vs AstroSage=${u.paksha} (diff: ${(kalaObj.paksha - u.paksha).toFixed(2)})`);
  console.log(`Thribhaga: calc=${kalaObj.tribhaga} vs AstroSage=${u.thri} (diff: ${(kalaObj.tribhaga - u.thri).toFixed(2)})`);
  console.log(`Abda:      calc=${kalaObj.abda} vs AstroSage=${u.abda} (diff: ${(kalaObj.abda - u.abda).toFixed(2)})`);
  console.log(`Masa:      calc=${kalaObj.masa} vs AstroSage=${u.masa} (diff: ${(kalaObj.masa - u.masa).toFixed(2)})`);
  console.log(`Vara:      calc=${kalaObj.vara} vs AstroSage=${u.vara} (diff: ${(kalaObj.vara - u.vara).toFixed(2)})`);
  console.log(`Hora:      calc=${kalaObj.hora} vs AstroSage=${u.hora} (diff: ${(kalaObj.hora - u.hora).toFixed(2)})`);
  console.log(`Ayana:     calc=${kalaObj.ayana} vs AstroSage=${u.ayana} (diff: ${(kalaObj.ayana - u.ayana).toFixed(2)})`);
  console.log(`Chesta:    calc=${chesta} vs AstroSage=${u.chesta} (diff: ${(chesta - u.chesta).toFixed(2)})`);
  console.log(`Drik:      calc=${drik} vs AstroSage=${u.drik} (diff: ${(drik - u.drik).toFixed(2)})`);
}
