// src/utils/ranking.js

function rankTeams(teams) {
  return teams.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.pointDifference !== b.pointDifference) return b.pointDifference - a.pointDifference;
      return b.pointsFor - a.pointsFor;
  });
}

function assignRanks(teams) {
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
  return teams.slice(0, 8).map((team, index) => {
      return {
          rank: ranks[index],
          ...team
      };
  });
}

module.exports = { rankTeams, assignRanks };
