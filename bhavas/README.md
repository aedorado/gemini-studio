# 🏛️ Bhavas Module: 12 Houses Delineation Engine

This module provides exhaustive, source-backed astrological interpretations and strength evaluations for all **12 Bhavas (Houses)** in Vedic Astrology (Jyotish).

---

## 📖 Primary Source Literature & Provenance

All interpretations, yogas, and planetary rules in this module are directly extracted and compiled from canonical reference texts, primarily:

- **Primary Source**: **MS Mehta**, *Advanced Techniques of Predictive Astrology* (Vol. 1), New Delhi.
  - PDF Reference: `reference_books/ahtmd_mehta.pdf`
  - Chapter 1: First House / Lagna (Tanu Bhava) (Pages 29–42)
  - Chapter 2: Second House / Kutumba & Dhana (Pages 42–61)
  - Chapter 3: Third House / Sahaja & Parakrama (Pages 61–72)
  - Chapter 4: Fourth House / Sukha, Mother & Real Estate (Pages 73–88)
  - Chapter 5: Fifth House / Putra Bhava, Progeny, Purva Punya & High Learning (Pages 89–113)
  - Chapters 6–12: Sixth through Twelfth Houses
- **Classical Authorities Cited**:
  - *Brihat Parashara Hora Shastra (BPHS)* (Maharishi Parashara)
  - *Phala Deepika* (Mantreswara)
  - *Jataka Tattwa* (Mahadeva)
  - *Sanketa Nidhi* (Ramadayalu)
  - *Bhava Kutuhalam* (Jivanatha Daivajna)
  - *Jataka Parijata* (Vaidyanatha Dikshita)
  - *Uttara Kalamrita* (Kalidasa)
  - *Sarvartha Chintamani* (Venkatesha Daivajna)
  - *Chamatkar Chintamani* (Bhatt Narayana)
  - *Bhavartha Ratnakara* (Ramanujacharya)
  - *Satyajatakam* (Sage Satyacharya)
  - Modern research & teachings of **K.N. Rao** (*Planets and Children*, *Karma and Rebirth*)

---

## 📂 Module Structure

```
bhavas/
├── README.md               # Architecture, schema, and methodology (this file)
├── house_1.json / .js      # 1st House: Tanu Bhava (Lagna, Personality, Vitality)
├── house_2.json / .js      # 2nd House: Dhana Bhava (Wealth, Family, Speech, Indu Lagna)
├── house_3.json / .js      # 3rd House: Sahaja Bhava (Courage, Siblings, Sangeet/Arts, Sports)
├── house_4.json / .js      # 4th House: Sukha Bhava (Mother, Palatial Mansions, Vehicles, Education)
├── house_5.json / .js      # 5th House: Putra Bhava (Progeny, Beeja/Kshetra, Purva Punya, Double Transit Timeline)
├── ...
├── house_12.json / .js     # 12th House
├── bhavasEngine.js         # Core evaluation engine (analyzes chart placements)
└── tests/
    └── test_bhavas.js      # Verifies delineation logic against active test profiles
```

---

## 📐 Data Schema (`house_{N}.json`)

Each house definition follows a strictly typed, traceable JSON schema:

```json
{
  "houseNumber": 1,
  "name": "Tanu Bhava",
  "sanskritName": "प्रथम भाव (तनु भाव / लग्न)",
  "significations": [
    "Body, physical constitution, complexion, and stature",
    "Personality, character, demeanor, and self-expression",
    "General prosperity and success in the world",
    "Early childhood, beginning of life",
    "Vitality, stamina, immunity, and longevity"
  ],
  "naturalKaraka": ["Sun"],
  "sources": [
    {
      "book": "Advanced Techniques of Predictive Astrology",
      "author": "MS Mehta",
      "chapter": "Chapter 1: First House or Lagna - Body and Personality",
      "pages": "29-42"
    }
  ],
  "authoritiesSummary": {
    "satyacharya": "Foreign stay, virtuous/sinful acts, place of residence, Balarishta, happiness or sorrow.",
    "uttaraKalamrita": "Assigns 33 significations including limbs, hair, fame, freedom from sickness.",
    "jatakaParijata": "Splendor, bodily features, fame, longevity, and royal favor.",
    "threeTripodsRule": "Lagna, Sun, and Moon are the three tripods of life. Strength in all three confers world renown."
  },
  "lordInHouses": {
    "1": { "title": "Lagna Lord in 1st House", "favorable": "...", "afflicted": "...", "notes": "..." },
    "2": { "title": "Lagna Lord in 2nd House", ... },
    ...
    "12": { "title": "Lagna Lord in 12th House", ... }
  },
  "planetsInHouse": {
    "Sun": { "strong": "...", "afflicted": "...", "specialYogas": ["..."] },
    "Moon": { ... },
    ...
    "Ketu": { ... }
  },
  "specialYogas": [
    {
      "name": "Chamara Yoga",
      "condition": "Ascendant combined with a strong benefic, and Lagna Lord exalted or in own sign in Kendra or Trikona.",
      "effects": "Rich, famous, long-lived, kingly status.",
      "source": "Mehta, Ch. 1, p. 40"
    }
  ],
  "caseStudies": [
    {
      "native": "Pt. Jawaharlal Nehru",
      "combination": "Cancer rising with Moon in Lagna, free of malefic aspects.",
      "effect": "Handsome, charismatic personality, world-renowned leader."
    }
  ]
}
```

---

## ⚙️ Evaluation Pipeline (`bhavasEngine.js`)

When evaluating a native's chart for a specific House:
1. **House Identity**: Derives Rashi, Bhava Madhya (cusp degree), sign lord, and natural Karaka.
2. **Lord Placement**: Determines which house and sign the Bhava Lord occupies, checking dignity (*Exalted, Own, Moolatrikona, Debilitated, Combust, Retrograde, Friendly/Enemy*).
3. **Occupant Grahas**: Retrieves all planets positioned in the house and attaches Mehta's specific dicta.
4. **Drishti (Aspects)**: Maps aspects cast onto the house and house lord by functional benefics and malefics.
5. **Special House Yogas**: Evaluates criteria for house-specific classical combinations (e.g., Chamara, Parvata, Parijata).
6. **Strength Metrics**: Integrates with existing **Bhavabala** (from `shadbala.js`) and **Sarvashtakavarga (SAV) Bindus** (from `ashtakavarga.js`).
