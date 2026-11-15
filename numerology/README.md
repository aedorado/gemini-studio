# Vedic Numerology Studio & 120-Year Dasha System

## 🌟 Overview
The Vedic Numerology module provides offline, deterministic, high-precision numerological calculations based on traditional Vedic principles and 120-year Dasha timing systems.

---

## 📐 Core Astrological & Mathematical Principles

### 1. Root Number (Moolank / मूलनांक)
- Derived from the day of birth: `Day ∈ [1, 31]`
- Special Vedic exemptions:
  - Day 10 → Root 1
  - Day 20 → Root 2
  - Day 30 → Root 3
- For all other multi-digit days, standard digital root reduction applies (`reduceToSingle(day)`).

### 2. Destiny Number (Bhagyank / भाग्यांक)
- Represents life path and purpose.
- Formula: `reduceToSingle(Day + Month + reduceToSingle(Year))`

### 3. Planetary Associations
- `1`: Sun (सूर्य)
- `2`: Moon (चन्द्र)
- `3`: Jupiter (गुरु)
- `4`: Rahu (राहु)
- `5`: Mercury (बुध)
- `6`: Venus (शुक्र)
- `7`: Ketu (केतु)
- `8`: Saturn (शनि)
- `9`: Mars (मंगल)

### 4. Vedic Weekday Numerical Values
- Sunday: `1` (Sun)
- Monday: `2` (Moon)
- Tuesday: `9` (Mars)
- Wednesday: `5` (Mercury)
- Thursday: `3` (Jupiter)
- Friday: `6` (Venus)
- Saturday: `8` (Saturn)

### 5. The 3×3 Vedic Grid
Standard Vedic layout:
```
[ 3 ] [ 1 ] [ 9 ]  --> Thought Plane (Vision & Leadership)
[ 6 ] [ 7 ] [ 5 ]  --> Will / Emotional Plane (Harmony & Spirit)
[ 2 ] [ 8 ] [ 4 ]  --> Action / Manifestation Plane (Karma & Discipline)
```
- **DOB Digits**: Digits of Day, Month, and 2-digit Year.
- **Root Number (RN)**: Appended if Day ≥ 10 and not in {10, 20, 30}. Tagged with `r`.
- **Destiny Number (DN)**: Always placed on the grid. Tagged with `d`.
- **Active Dashas**: Highlighted dynamically with real-time indicators.

### 6. 120-Year Dasha Timeline
- **Mahadasha (MD)**: Starts with the Root Number, running sequentially from 1 to 9 cyclically. Each MD period lasts for as many years as its number (e.g. Number 6 lasts 6 years).
- **Antardasha (AD)**: Computed for each year of life:
  `reduceToSingle(Last2(Year) + BirthMonth + RootNumber + WeekdayValue)`
- **Pratyantar Dasha (PD)**: 9 sub-periods per AD year, rigorously leap-year aware.
- **Daily Dasha (DD)**: `reduceToSingle(PD_Number + WeekdayValue)`

---

## 📂 Module Files
- `numerologyEngine.js`: Core deterministic calculation algorithms.
- `predictionsData.js`: Comprehensive 81 (1–9 × 1–9) bilingual (Hindi & English) Root × Destiny prediction matrix.
- `numerologyRenderer.js`: Interactive UI components for the 3×3 grid, timeline charts, dasha tables, and prediction panels.
