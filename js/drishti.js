// Planetary Aspects (Drishti) Calculation Engine (Parashari System)

const SPECIAL_ASPECTS = {
  Mars: [4, 7, 8],
  Jupt: [5, 7, 9],
  Satn: [3, 7, 10],
  Rahu: [5, 7, 9],
  Ketu: [5, 7, 9]
};

export function calculateDrishti(planets) {
  const lagna = planets.find(p => p.key === 'ASC');
  if (!lagna) return { aspectsOnHouses: {}, aspectsOnPlanets: [], mutualAspects: [] };

  const houseOf = {};
  for (let p of planets) {
    houseOf[p.key] = ((p.signId - lagna.signId + 12) % 12) + 1;
  }

  // 1. Calculate which houses each planet aspects
  const aspectsOnHouses = {};
  for (let h = 1; h <= 12; h++) aspectsOnHouses[h] = [];

  const aspectsOnPlanets = [];
  const mutualAspects = [];
  const planetKeys = ['Sun', 'Moon', 'Mars', 'Merc', 'Jupt', 'Venu', 'Satn', 'Rahu', 'Ketu'];

  for (let pKey of planetKeys) {
    const p = planets.find(item => item.key === pKey);
    if (!p) continue;

    const pSign = p.signId;
    const pHouse = houseOf[pKey];
    const aspectHouses = SPECIAL_ASPECTS[pKey] || [7];

    for (let asp of aspectHouses) {
      // Target sign
      const targetSign = ((pSign - 1 + (asp - 1)) % 12) + 1;
      const targetHouse = ((pHouse - 1 + (asp - 1)) % 12) + 1;

      aspectsOnHouses[targetHouse].push({
        planetKey: p.key,
        planetName: p.name,
        aspectNumber: asp,
        fromHouse: pHouse
      });

      // Check if any other planet is located in that target sign
      for (let targetPlanet of planets) {
        if (targetPlanet.key === pKey || targetPlanet.key === 'ASC') continue;

        if (targetPlanet.signId === targetSign) {
          aspectsOnPlanets.push({
            aspectingPlanet: p.name,
            aspectingKey: p.key,
            aspectedPlanet: targetPlanet.name,
            aspectedKey: targetPlanet.key,
            aspectType: `${asp}th Aspect`,
            fromHouse: pHouse,
            toHouse: targetHouse
          });

          // Check if target planet also aspects source planet (Mutual Aspect)
          const targetAspects = SPECIAL_ASPECTS[targetPlanet.key] || [7];
          const reverseDiff = ((pSign - targetPlanet.signId + 12) % 12) + 1;
          if (targetAspects.includes(reverseDiff)) {
            // Avoid duplicates by comparing keys
            if (p.key < targetPlanet.key) {
              mutualAspects.push({
                planetA: p.name,
                planetB: targetPlanet.name,
                houseA: pHouse,
                houseB: targetHouse,
                description: `${p.name} (H${pHouse}) and ${targetPlanet.name} (H${targetHouse}) mutually aspect each other (${asp}th & ${reverseDiff}th aspect)`
              });
            }
          }
        }
      }
    }
  }

  return {
    houseOf,
    aspectsOnHouses,
    aspectsOnPlanets,
    mutualAspects
  };
}
