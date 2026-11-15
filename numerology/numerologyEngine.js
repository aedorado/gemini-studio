/**
 * Vedic Numerology Engine
 * Classical & Modern Vedic Grid and 120-Year Dasha Calculations
 */

export const PLANET_MAP = {
  1: 'Sun',
  2: 'Moon',
  3: 'Jupiter',
  4: 'Rahu',
  5: 'Mercury',
  6: 'Venus',
  7: 'Ketu',
  8: 'Saturn',
  9: 'Mars',
};

export const PLANET_DEVANAGARI = {
  1: 'सूर्य (Sun)',
  2: 'चन्द्र (Moon)',
  3: 'गुरु (Jupiter)',
  4: 'राहु (Rahu)',
  5: 'बुध (Mercury)',
  6: 'शुक्र (Venus)',
  7: 'केतु (Ketu)',
  8: 'शनि (Saturn)',
  9: 'मंगल (Mars)',
};

// Vedic Weekday Values (JS 0=Sun..6=Sat)
export const WEEKDAY_VALUES = {
  0: 1, // Sunday -> Sun (1)
  1: 2, // Monday -> Moon (2)
  2: 9, // Tuesday -> Mars (9)
  3: 5, // Wednesday -> Mercury (5)
  4: 3, // Thursday -> Jupiter (3)
  5: 6, // Friday -> Venus (6)
  6: 8, // Saturday -> Saturn (8)
};

export const VEDIC_GRID_LAYOUT = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4],
];

export const VEDIC_GRID_PLANES = [
  { name: 'Thought Plane (मानसिक त्रिकोण)', numbers: [3, 1, 9], desc: 'Vision, leadership, courage & clarity' },
  { name: 'Will / Emotional Plane (इच्छा शक्ति)', numbers: [6, 7, 5], desc: 'Creativity, spirituality, communication & harmony' },
  { name: 'Action / Practical Plane (कर्म क्षेत्र)', numbers: [2, 8, 4], desc: 'Intuition, patience, discipline & manifestation' },
];

/**
 * Reduce any positive number to a single digit (1-9)
 */
export function reduceToSingle(n) {
  let val = Math.abs(Math.floor(n));
  while (val > 9) {
    val = String(val).split('').reduce((acc, digit) => acc + Number(digit), 0);
  }
  return val;
}

/**
 * Calculate Root Number (Moolank / मूलनांक)
 * Special Vedic exemptions: 10 -> 1, 20 -> 2, 30 -> 3
 */
export function getRootNumber(dob) {
  const d = dob instanceof Date ? dob.getDate() : new Date(dob).getDate();
  if (d === 10) return 1;
  if (d === 20) return 2;
  if (d === 30) return 3;
  return reduceToSingle(d);
}

/**
 * Calculate Destiny Number (Bhagyank / भाग्यांक)
 * Day + Month + reduce(Year)
 */
export function getDestinyNumber(dob) {
  const date = dob instanceof Date ? dob : new Date(dob);
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return reduceToSingle(d + m + reduceToSingle(y));
}

/**
 * Get Vedic Weekday value for a date
 */
export function getWeekdayValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  return WEEKDAY_VALUES[d.getDay()];
}

/**
 * Date helper: add years
 */
export function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * Date helper: add days
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format Date as DD.MM.YYYY
 */
export function formatDateDMY(date) {
  const d = date instanceof Date ? date : new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Generate 1-9 cyclic sequence starting from a given number
 */
export function getSequenceFrom(start) {
  const seq = [start];
  let n = start;
  for (let i = 0; i < 8; i++) {
    n = n === 9 ? 1 : n + 1;
    seq.push(n);
  }
  return seq;
}

/**
 * Collect all digits present in the Vedic Grid for a given DOB
 */
export function collectGridNumbers(dob) {
  const date = dob instanceof Date ? dob : new Date(dob);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const shortYear = String(year).slice(2);
  const nums = [];

  for (const ch of String(day)) nums.push(Number(ch));
  for (const ch of String(month)) nums.push(Number(ch));
  for (const ch of shortYear) nums.push(Number(ch));

  // RN: include ONLY if day >= 10 and not in [10, 20, 30]
  const exempt = [10, 20, 30];
  if (day >= 10 && !exempt.includes(day)) {
    nums.push(getRootNumber(date));
  }

  // Destiny Number: always added
  nums.push(getDestinyNumber(date));

  return nums;
}

/**
 * Breakdown grid digits by category (plain DOB digits, Root Number, Destiny Number)
 */
export function getDigitBreakdown(dob) {
  const date = dob instanceof Date ? dob : new Date(dob);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const yr2 = (date.getFullYear() % 100).toString().padStart(2, '0');
  const exempt = [10, 20, 30];

  const plainD = [];
  const rnD = [];

  if (day < 10) {
    rnD.push(day);
  } else {
    for (const ch of day.toString()) plainD.push(+ch);
    if (!exempt.includes(day)) rnD.push(getRootNumber(date));
  }

  for (const ch of month.toString()) plainD.push(+ch);
  for (const ch of yr2) plainD.push(+ch);

  const dnD = [getDestinyNumber(date)];
  return { plainD, rnD, dnD };
}

/**
 * 120-Year Mahadasha Sequence (Cycling 1-9 starting from Root Number)
 */
export function calculateMahadashas(dob, totalYears = 120) {
  const date = dob instanceof Date ? dob : new Date(dob);
  const rn = getRootNumber(date);
  const limit = addYears(date, totalYears);
  const entries = [];
  let current = new Date(date);
  let n = rn;

  while (current < limit) {
    const end = addYears(current, n);
    entries.push({
      number: n,
      planet: PLANET_MAP[n],
      planetDevanagari: PLANET_DEVANAGARI[n],
      years: n,
      startDate: new Date(current),
      endDate: new Date(end),
    });
    current = end;
    n = n === 9 ? 1 : n + 1;
  }
  return entries;
}

/**
 * Antardasha — One entry per year of life (total 120 years)
 * Formula: reduce(last2(Year) + birthMonth + RN + weekdayOfDOBInThatYear)
 */
export function calculateAntardashas(dob, totalYears = 120) {
  const date = dob instanceof Date ? dob : new Date(dob);
  const rn = getRootNumber(date);
  const birthMonth = date.getMonth() + 1;
  const entries = [];

  for (let i = 0; i < totalYears; i++) {
    const yearStart = addYears(date, i);
    const yearEnd = addYears(date, i + 1);
    const currentYear = yearStart.getFullYear();
    const last2 = currentYear % 100;

    const dobInYear = new Date(currentYear, date.getMonth(), date.getDate());
    const weekdayVal = getWeekdayValue(dobInYear);

    const adNumber = reduceToSingle(last2 + birthMonth + rn + weekdayVal);

    entries.push({
      number: adNumber,
      planet: PLANET_MAP[adNumber],
      planetDevanagari: PLANET_DEVANAGARI[adNumber],
      yearLabel: `${formatDateDMY(yearStart)} – ${formatDateDMY(yearEnd)}`,
      startDate: yearStart,
      endDate: yearEnd,
      age: i,
      calYear: currentYear,
    });
  }

  return entries;
}

/**
 * Pratyantar Dasha: 9 sub-periods within each Antardasha year
 * Accounts for leap-years and exact bonus days distribution
 */
export function calculatePratyantars(adNumber, adStart) {
  const start = adStart instanceof Date ? adStart : new Date(adStart);
  const seq = getSequenceFrom(adNumber);
  const entries = [];

  const year = start.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const bonus = new Array(9).fill(0);

  if (!isLeapYear) {
    // 5 extra days: +1 to indices 2, 4, 6, 8, and index 8 gets +1 extra (+2 total)
    [2, 4, 6, 8].forEach(idx => bonus[idx]++);
    bonus[8]++;
  } else {
    // 6 extra days: +1 to indices 1, 3, 5, 7, and index 8 gets +2
    [1, 3, 5, 7].forEach(idx => bonus[idx]++);
    bonus[8] += 2;
  }

  let current = new Date(start);
  seq.forEach((num, i) => {
    const days = num * 8 + bonus[i];
    const end = addDays(current, days);
    entries.push({
      number: num,
      planet: PLANET_MAP[num],
      planetDevanagari: PLANET_DEVANAGARI[num],
      days,
      startDate: new Date(current),
      endDate: end,
    });
    // Next PD starts the next day
    current = addDays(end, 1);
  });

  return entries;
}

/**
 * Daily Dasha (Dina Dasha)
 * reduce(pdNumber + getWeekdayValue(date))
 */
export function calculateDailyDasha(pdNumber, targetDate) {
  const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const wd = getWeekdayValue(d);
  return reduceToSingle(pdNumber + wd);
}

/**
 * Subdivide an Antardasha year into 12 equal months
 */
export function buildMonths(ad) {
  const ms = ad.endDate.getTime() - ad.startDate.getTime();
  const seg = ms / 12;
  const months = [];
  let n = ad.number;

  for (let i = 0; i < 12; i++) {
    const start = new Date(ad.startDate.getTime() + seg * i);
    const end = new Date(ad.startDate.getTime() + seg * (i + 1));
    months.push({
      number: n,
      planet: PLANET_MAP[n],
      planetDevanagari: PLANET_DEVANAGARI[n],
      start,
      end,
      monthIndex: i,
    });
    n = n === 9 ? 1 : n + 1;
  }
  return months;
}

/**
 * Find active periods (MD, AD, PD, DD) for a given target timestamp (defaults to now)
 */
export function findCurrentStatus(dob, mahadashas, antardashas, targetDate = new Date()) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const targetMs = target.getTime();

  const md = mahadashas.find(m => targetMs >= m.startDate.getTime() && targetMs < m.endDate.getTime());
  const ad = antardashas.find(a => targetMs >= a.startDate.getTime() && targetMs < a.endDate.getTime());

  let pd = undefined;
  if (ad) {
    const pds = calculatePratyantars(ad.number, ad.startDate);
    pd = pds.find(p => targetMs >= p.startDate.getTime() && targetMs <= p.endDate.getTime());
  }

  let dd = undefined;
  if (pd) {
    dd = calculateDailyDasha(pd.number, target);
  }

  return { md, ad, pd, dd, targetDate: target };
}

/**
 * Count frequencies of digits 1-9 in the Vedic Grid
 */
export function getGridCounts(dob) {
  const numbers = collectGridNumbers(dob);
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  numbers.forEach(n => {
    if (n >= 1 && n <= 9) counts[n]++;
  });
  return counts;
}
