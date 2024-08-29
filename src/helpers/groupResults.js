// src/helpers/groupResults.js

function hasPlayed(groupResults, team1, team2) {
  console.log('Proveravam:', team1, team2);
  
  if (!groupResults) {
    console.log('Rezultati grupa nisu pronađeni.');
    return false;
  }

  for (const groupName in groupResults) {
    const group = groupResults[groupName];
    if (!group.matches) {
      console.log(`Nema utakmica za grupu ${groupName}.`);
      continue;
    }

    const hasPlayedMatch = group.matches.some(match =>
      (match.team1 === team1 && match.team2 === team2) ||
      (match.team1 === team2 && match.team2 === team1)
    );
    
    if (hasPlayedMatch) {
      console.log(`Timovi ${team1} i ${team2} su već igrali.`);
      return true;
    }
  }

  return false;
}

module.exports = { hasPlayed };
