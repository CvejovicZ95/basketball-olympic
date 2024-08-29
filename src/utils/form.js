function calculateForm(teamISOCode, exhibitionsData) {
  const results = exhibitionsData[teamISOCode];

  if (!results || results.length === 0) {
    return 0;
  }

  let totalPointDifference = 0;
  let wins = 0;

  results.forEach((match) => {
    const [teamPoints, opponentPoints] = match.Result.split("-").map(Number);

    totalPointDifference += teamPoints - opponentPoints;

    if (teamPoints > opponentPoints) {
      wins++;
    }
  });

  const averagePointDifference = totalPointDifference / results.length;
  const winBonus = wins * 5;

  const formBonus = Math.floor(averagePointDifference / 10 + winBonus);

  return formBonus;
}

module.exports = { calculateForm };
