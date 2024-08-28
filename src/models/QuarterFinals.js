// src/utils/QuarterFinals.js

function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  function generateQuarterFinals(pots) {
    const { D, E, F, G } = pots;
  
    // Proveri da li svaki šešir ima dovoljno timova
    if (D.length < 1 || G.length < 1 || E.length < 1 || F.length < 1) {
      throw new Error('Nema dovoljno timova u svim šeširima za formiranje parova.');
    }
  
    // Nasumično pomešaj timove iz šešira
    const shuffledD = shuffleArray(D);
    const shuffledG = shuffleArray(G);
    const shuffledE = shuffleArray(E);
    const shuffledF = shuffleArray(F);
  
    // Formiraj parove četvrtfinala
    const quarterFinals = [];
  
    // Formiranje parova između šešira D i G
    for (let i = 0; i < Math.min(shuffledD.length, shuffledG.length); i++) {
      quarterFinals.push({
        match: `D${i + 1} vs G${i + 1}`,
        teamA: shuffledD[i],
        teamB: shuffledG[i],
      });
    }
  
    // Formiranje parova između šešira E i F
    for (let i = 0; i < Math.min(shuffledE.length, shuffledF.length); i++) {
      quarterFinals.push({
        match: `E${i + 1} vs F${i + 1}`,
        teamA: shuffledE[i],
        teamB: shuffledF[i],
      });
    }
  
    return quarterFinals;
  }
  
  module.exports = { generateQuarterFinals };
  