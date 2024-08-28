// src/models/Quarterfinals.js

const { calculateForm } = require('../utils/form');

class Quarterfinals {
  constructor(teams, exhibitionsData) {
    if (teams.length !== 8) {
      throw new Error('For quarterfinals, exactly 8 teams are required.');
    }
    this.teams = teams;
    this.exhibitionsData = exhibitionsData;
    this.matches = [];
  }

  simulateMatch(teamA, teamB) {
    const formA = calculateForm(teamA.isoCode, this.exhibitionsData);
    const formB = calculateForm(teamB.isoCode, this.exhibitionsData);

    if (isNaN(formA) || isNaN(formB)) {
      throw new Error('Invalid form value returned by calculateForm');
    }

    const baseScore = 80;

    let pointsA = baseScore + formA + Math.floor(Math.random() * 10) - 5 ;
    let pointsB = baseScore + formB + Math.floor(Math.random() * 10) - 5 ;

    if (isNaN(pointsA) || isNaN(pointsB)) {
      throw new Error('Invalid points calculation');
    }

    while (pointsA === pointsB) {
      pointsA = baseScore + formA + Math.floor(Math.random() * 10) - 5 ;
      pointsB = baseScore + formB + Math.floor(Math.random() * 10) - 5 ;
    }

    return {
      pointsFor: pointsA,
      pointsAgainst: pointsB,
      winner: pointsA > pointsB ? teamA : teamB
    };
  }

  playQuarterfinals() {
    const matchups = [
      [this.teams[0], this.teams[7]],
      [this.teams[1], this.teams[6]],
      [this.teams[2], this.teams[5]],
      [this.teams[3], this.teams[4]]
    ];

    matchups.forEach((match, index) => {
      const [teamA, teamB] = match;
      const result = this.simulateMatch(teamA, teamB);
      this.matches.push({
        matchNumber: index + 1,
        teamA: teamA.name,
        teamB: teamB.name,
        result: `${result.pointsFor}:${result.pointsAgainst}`,
        winner: result.winner.name
      });
    });
  }

  getResults() {
    return this.matches;
  }
}

module.exports = Quarterfinals;
