const Team = require('./Team');
const { calculateForm } = require('../utils/form');

class Group {
  constructor(groupName, teams, exhibitionsData) {
    this.groupName = groupName;
    this.teams = teams.map(
      (team) => new Team(team.Team, team.ISOCode, team.FIBARanking)
    );
    this.exhibitionsData = exhibitionsData;
    this.matches = [];
  }

  playGames() {
    for (let i = 0; i < this.teams.length; i++) {
      for (let j = i + 1; j < this.teams.length; j++) {
        const teamA = this.teams[i];
        const teamB = this.teams[j];
        const result = this.simulateGame(teamA, teamB);
        teamA.updateResult(result.pointsFor, result.pointsAgainst);
        teamB.updateResult(result.pointsAgainst, result.pointsFor);
        console.log(`${teamA.name} - ${teamB.name} (${result.pointsFor}:${result.pointsAgainst})`);
        this.matches.push({ teamA: teamA.name, teamB: teamB.name });
      }
    }
  }

  simulateGame(teamA, teamB) {
    const formA = calculateForm(teamA.isoCode, this.exhibitionsData);
    const formB = calculateForm(teamB.isoCode, this.exhibitionsData);
    
    const baseScore = 80;
    
    // Izračunavanje bonus bodova na osnovu FIBA ranga
    const maxFIBARank = Math.min(...this.teams.map(team => team.fibaRanking));
    const rankRange = maxFIBARank - Math.min(...this.teams.map(team => team.fibaRanking)) + 1;

    const rankBonusA = Math.max(0, 10 - ((teamA.fibaRanking - 1) / rankRange) * 10);
    const rankBonusB = Math.max(0, 10 - ((teamB.fibaRanking - 1) / rankRange) * 10);

    let pointsA = baseScore + formA + Math.floor(Math.random() * 10) - 5 + rankBonusA;
    let pointsB = baseScore + formB + Math.floor(Math.random() * 10) - 5 + rankBonusB;

    while (pointsA === pointsB) {
      pointsA = baseScore + formA + Math.floor(Math.random() * 10) - 5 + rankBonusA;
      pointsB = baseScore + formB + Math.floor(Math.random() * 10) - 5 + rankBonusB;
    }

    return {
      pointsFor: pointsA,
      pointsAgainst: pointsB
    };
  }

  getStandings() {
    return this.teams
      .sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        if (a.getPointDifference() !== b.getPointDifference()) return b.getPointDifference() - a.getPointDifference();
        return b.pointsFor - a.pointsFor;
      })
      .map(team => ({
        name: team.name,
        wins: team.wins,
        losses: team.losses,
        points: team.points,
        pointsFor: team.pointsFor,
        pointsAgainst: team.pointsAgainst,
        pointDifference: team.getPointDifference()
      }));
  }

  getRankedTeams() {
    const standings = this.getStandings();
    return {
      firstPlace: standings[0],
      secondPlace: standings[1],
      thirdPlace: standings[2]
    };
  }

  getGames() {
    return this.matches;
  }
}

module.exports = Group;
