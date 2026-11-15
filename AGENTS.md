# Jyotish Gemini Studio — AI Agent Operating Guidelines

This document defines the mandatory engineering protocol, architectural standards, and astrological data integrity rules for any AI agent working on this codebase.

---

## 🏛️ 1. Core Philosophy: Source-Backed Jyotish (Zero Hallucination)

1. **Every Astrological Rule Must Have Classical or Master Provenance**:
   - Generic or vague pop-astrology interpretations are **strictly prohibited**.
   - Every interpretation rule, yoga definition, or house delineation must be traceable to classical treatises (*Brihat Parashara Hora Shastra*, *Phala Deepika*, *Jataka Parijata*, *Uttara Kalamrita*, *Saravali*, *Bhavartha Ratnakara*) or validated master texts in the project's repository (specifically **MS Mehta's *Advanced Techniques of Predictive Astrology*** located in `reference_books/ahtmd_mehta.pdf`).
   - Each data entry must record its source: `sourceBook`, `chapter`, `page` or `shlokaReference`.

2. **Folder-First Modular Architecture**:
   - When building a new interpretation subsystem (such as the 12 Bhavas Studio), **always build the module in its own dedicated directory first** before touching `studio.html` or `js/app.js`.
   - Each module folder must contain:
     - `README.md`: Explaining the mathematical/astrological principles, classical sources, and JSON schema.
     - Structured data files (e.g., `house_1.json`, `house_2.json`, etc.) containing verbatim or faithful structured interpretations.
     - An engine / evaluator file (e.g., `engine.js` or `bhavasEngine.js`) that operates on the standard `chartData` object.
     - Unit tests verifying the evaluator against known charts (e.g., in `tests/`).

3. **Deterministic & Offline-First Calculations**:
   - The astronomical engine (`astronomy-engine`, Lahiri Ayanamsha, RAMC ascendant derivation, Shadbala, Ashtakavarga, Bhavabala) must remain 100% offline, pure JavaScript, and reproducible down to the arcsecond.
   - Never introduce external HTTP API dependencies for chart calculations or interpretations.

---

## 📁 2. Repository Layout & Module Conventions

- `bhavas/`: Dedicated folder for the 12 Houses (Bhava Delineation) module.
  - `README.md`: Documentation, schema, and methodology.
  - `house_*.json`: Structured data per house based on Mehta's chapters.
  - `bhavasEngine.js`: Core calculation and evaluation engine for houses.
- `js/`: Core calculation and UI logic (`app.js`, `chartRenderer.js`, `shadbala.js`, `yogas.js`, `dasha.js`, etc.).
- `reference_books/`: Primary source PDFs and canonical reference materials.
- `tests/`: Automated Node.js test suites. Always run `node tests/...` or verify before deploying changes.
- `studio.html` & `style.css`: The primary interactive web application.

---

## 🔬 3. Standard Workflow for Adding New House Chapters

When adding or expanding chapters from Mehta's book (or other source texts):
1. **Extract and Review Primary Source**:
   - Use `./dump_pages <start> <end>` to extract raw text from `reference_books/ahtmd_mehta.pdf`.
   - Review the chapter thoroughly (significations, lord placements 1–12, graha placements, yogas, special exceptions, and chart examples).
2. **Draft the Structured House JSON**:
   - Follow the standardized schema defined in `bhavas/README.md`.
   - Include positive, negative, and conditional outcomes.
3. **Write/Extend Unit Tests**:
   - Test placement evaluations against sample charts in `databank.html` or `js/defaultProfiles.js`.
4. **Integrate into UI (`studio.html`)**:
   - Add responsive sub-tabs and cards following the existing design system (sleek dark mode, glassmorphism, gold/amber accents, clear typography).
