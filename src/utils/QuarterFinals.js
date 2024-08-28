// src/utils/quarterfinalDraw.js

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

function drawQuarterfinals(rankedTeams) {
  const potD = rankedTeams.filter(team => team.rank <= 2);  // Teams with rank 1 and 2
  const potE = rankedTeams.filter(team => team.rank > 2 && team.rank <= 4); // Teams with rank 3 and 4
  const potF = rankedTeams.filter(team => team.rank > 4 && team.rank <= 6); // Teams with rank 5 and 6
  const potG = rankedTeams.filter(team => team.rank > 6 && team.rank <= 8); // Teams with rank 7 and 8

  // Shuffle pots
  const shuffledPotD = shuffle([...potD]);
  const shuffledPotG = shuffle([...potG]);
  const shuffledPotE = shuffle([...potE]);
  const shuffledPotF = shuffle([...potF]);

  // Create quarterfinal matchups
  const quarterfinals = [];

  // Match teams from pot D with teams from pot G
  while (shuffledPotD.length > 0 && shuffledPotG.length > 0) {
      const teamD = shuffledPotD.pop();
      const teamG = shuffledPotG.pop();
      quarterfinals.push({ teamD: teamD.name, teamG: teamG.name });
  }

  // Match teams from pot E with teams from pot F
  while (shuffledPotE.length > 0 && shuffledPotF.length > 0) {
      const teamE = shuffledPotE.pop();
      const teamF = shuffledPotF.pop();
      quarterfinals.push({ teamE: teamE.name, teamF: teamF.name });
  }

  return quarterfinals;
}

module.exports = { drawQuarterfinals };
