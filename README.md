# Jyotish Gemini Studio 🪐

A full-fledged Vedic Astrology (Jyotish) software and Gemini AI consultation studio ready for 1-click deployment on [Vercel](https://vercel.com).

Calculate **Kundali from Birth Details** (or paste raw software coordinates), compute **Shodashvarga (all 16 Divisional Charts)**, **Ashtakavarga (337 bindus)**, **Vimshottari Dasha (Mahadasha, Antardasha & Pratyantardasha)**, and **Real-Time Gochar Transits (Sade Sati, Guru Bala)** with high-precision NASA JPL ephemerides and IAU Lahiri Ayanamsha — all formatted for **[Gemini](https://gemini.google.com)**.

---

## 🚀 Two Input Modes (Full Software Engine)

### 1. 🗓️ Calculate from Birth Details (Full Software Mode)
- **Inputs**: Date of Birth, Time of Birth (HH:MM:SS), and **100% Offline Astrological Atlas**.
- **Offline Atlas (Zero External API Calls)**:
  - Bundled with **7,300+ cities worldwide** (`city-timezones`), including all Indian district headquarters and sacred astrological towns (*Varanasi, Ujjain, Vrindavan, Haridwar, Tirupati, Puri, etc.*).
  - Instant local autocomplete search sorted by population.
  - Automatically derives exact latitude, longitude, and historical timezone offset (via browser's built-in `Intl` engine, including historical DST) with **zero network latency and zero API keys**.
- **Astronomical Precision Engine**:
  - Direct integration of NASA JPL VSOP87 & ELP2000-82 astronomical models via `astronomy-engine`.
  - Canonical **Chitra Paksha / Lahiri Ayanamsha** ($23^\circ 51' 25.53''$ base + precession).
  - True Local Sidereal Time (**RAMC**) to compute the exact **Ascendant (Lagna)** down to the arcsecond.


### 2. 📜 Paste Raw Text Coordinates (Direct Paste Mode)
- Directly paste lines from Jagannatha Hora, AstroSage, or Parashara's Light:
  ```
  Planets Sign Latitude Nakshatra Pada
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
  ```
- Normalizes DMS degrees, retrograde tags (`[R]`), sign variations, and nakshatra padas.

---

## 🔮 Core Vedic Astrology Modules

1. **Shodashvarga (16 Divisional Charts)**:
   - Full *Brihat Parashara Hora Shastra (BPHS)* calculations:
     `D1` (Rashi), `D2` (Hora), `D3` (Drekkana), `D4` (Chaturthamsha), `D7` (Saptamsha), `D9` (Navamsha), `D10` (Dashamsha), `D12` (Dwadamsha), `D16` (Shodashamsha), `D20` (Vimshamsha), `D24` (Chaturvimshamsha), `D27` (Saptavimshamsha), `D30` (Trimshamsha), `D40` (Khavedamsha), `D45` (Akshavedamsha), and `D60` (Shashtiamsha).
   - Detects **Vargottama** grahas and planetary dignities (*Exalted, Own, Moolatrikona, Debilitated, Friend, Enemy*).

2. **Ashtakavarga Matrix (337 Bindus)**:
   - 7-planet Bhinna Ashtakavarga (BAV) + Sarvashtakavarga (SAV) summing to exactly 337 points.
   - 12-pillar visual bar chart highlighting strong ($\ge 28$) and weak ($< 25$) houses.

3. **Vimshottari Dasha Explorer**:
   - Computes Moon's nakshatra balance at birth down to days.
   - 120-year hierarchical tree: **Mahadasha (MD)** $\rightarrow$ **Antardasha (AD)** $\rightarrow$ **Pratyantardasha (PD)**.
   - Identifies the **Currently Active Dasha** with a live progress bar.

4. **Real-Time Transits (Gochar & Sade Sati)**:
   - Calculates planetary transits for any date (past, present, or future).
   - Detects **Sade Sati phases** (Rising, Peak Janma Shani, Setting), **Kantaka Shani**, **Ashtama Shani**, and **Guru Gochara**.
   - Cross-references transit houses against your personal **Ashtakavarga SAV points**.

5. **Special Yogas Detector**:
   - Pancha Mahapurusha (*Malavya, Ruchaka, Bhadra, Hamsa, Sasa*), *Gajakesari*, *Budhaditya*, *Guru-Mangala*, Upachaya Rahu, and Stelliums.

6. **Interactive Kundali Visualizer**:
   - Interactive SVG charts: Switch between **North Indian (Diamond)** and **South Indian (Square)** styles.
   - Dropdown to view any of the 16 Varga charts.

7. **Gemini AI Prompt Studio**:
   - Formats complete chart data into structured prompts for [gemini.google.com](https://gemini.google.com).
   - Presets for Career, Relationships, Dasha + Transit Timing, Remedies, and Custom Questions.
   - 1-Click **Copy Prompt** + **Open Gemini** buttons.

---

## 🚢 Deploying to Vercel

The app runs 100% client-side with zero external build requirements:

### Via GitHub
```bash
git init
git add .
git commit -m "Full-fledged Jyotish Gemini Studio"
git remote add origin https://github.com/<your-username>/astro-tools.git
git push -u origin main
```
Import the repository on [vercel.com/new](https://vercel.com/new) and click **Deploy**.

### Via Vercel CLI
```bash
vercel
```

---

## 💻 Running Locally

```bash
npm start
# or
node server.js
```
Open [http://localhost:3030](http://localhost:3030) in your browser.
