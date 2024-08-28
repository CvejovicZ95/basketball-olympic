const { calculateForm } = require('../utils/form');
const fs = require('fs');
const path = require('path');

// Učitajte grupu i ranking podatke iz JSON fajla
const groupsFilePath = path.join(__dirname, '../../data/groups.json');
const groupsData = JSON.parse(fs.readFileSync(groupsFilePath, 'utf8'));

// Funkcija za dobijanje FIBA rankinga tima na osnovu imena tima
function getFIBARanking(teamName) {
  for (const group in groupsData) {
    const team = groupsData[group].find(team => team.Team === teamName);
    if (team) {
      return team.FIBARanking;
    }
  }
  return null; // Ako tim nije pronađen
}

// Funkcija za nasumično mešanje elemenata u nizu
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

class Tournament {
  constructor(teams, exhibitionsData) {
    if (teams.length !== 8) {
      throw new Error('For the tournament, exactly 8 teams are required.');
    }
    this.teams = teams;
    this.exhibitionsData = exhibitionsData;
    this.matches = [];
  }

  simulateMatch(teamA, teamB) {
    const formA = calculateForm(teamA.name, this.exhibitionsData);
    const formB = calculateForm(teamB.name, this.exhibitionsData);

    if (isNaN(formA) || isNaN(formB)) {
      throw new Error('Invalid form value returned by calculateForm');
    }

    const baseScore = 80;

    // Dobijanje FIBA rankinga za timove koristeći nazive timova
    const rankingA = getFIBARanking(teamA.name);
    const rankingB = getFIBARanking(teamB.name);

    if (rankingA === null || rankingB === null) {
      throw new Error('FIBA ranking not found for one of the teams');
    }

    // Veći rang znači veći bonus, na primer, rang može biti korišćen kao bonus
    const bonusA = 25 - rankingA;
    const bonusB = 25 - rankingB;

    let pointsA = baseScore + formA + bonusA + Math.floor(Math.random() * 10) - 5;
    let pointsB = baseScore + formB + bonusB + Math.floor(Math.random() * 10) - 5;

    if (isNaN(pointsA) || isNaN(pointsB)) {
      throw new Error('Invalid points calculation');
    }

    while (pointsA === pointsB) {
      pointsA = baseScore + formA + bonusA + Math.floor(Math.random() * 10) - 5;
      pointsB = baseScore + formB + bonusB + Math.floor(Math.random() * 10) - 5;
    }

    return {
      pointsFor: pointsA,
      pointsAgainst: pointsB,
      winner: pointsA > pointsB ? teamA : teamB
    };
  }

  playQuarterfinals() {
    // Razdvojte timove u sesire
    const firstSeed = this.teams.slice(0, 2); // Timovi 1 i 2
    const secondSeed = this.teams.slice(2, 4); // Timovi 3 i 4
    const thirdSeed = this.teams.slice(4, 6); // Timovi 5 i 6
    const fourthSeed = this.teams.slice(6);   // Timovi 7 i 8

    // Nasumično pomešajte timove unutar svakog sesira
    const shuffledFirstSeed = shuffleArray([...firstSeed]);
    const shuffledSecondSeed = shuffleArray([...secondSeed]);
    const shuffledThirdSeed = shuffleArray([...thirdSeed]);
    const shuffledFourthSeed = shuffleArray([...fourthSeed]);

    // Nasumično izaberite parove između sesira
    const matchups = [
      [shuffledFirstSeed[0], shuffledFourthSeed[0]],
      [shuffledFirstSeed[1], shuffledFourthSeed[1]],
      [shuffledSecondSeed[0], shuffledThirdSeed[0]],
      [shuffledSecondSeed[1], shuffledThirdSeed[1]]
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

  playSemifinals() {
    if (this.matches.length !== 4) {
      throw new Error('There should be 4 quarterfinal matches to proceed to semifinals.');
    }

    // Preuzmite pobednike iz četvrtfinala
    const semifinalTeams = this.matches.map(match => ({
      name: match.winner
    }));

    // Nasumično pomešajte timove za polufinale
    const shuffledSemifinalTeams = shuffleArray([...semifinalTeams]);

    // Razdelite timove na polufinalne parove
    const semifinalMatchups = [
      [shuffledSemifinalTeams[0], shuffledSemifinalTeams[1]],
      [shuffledSemifinalTeams[2], shuffledSemifinalTeams[3]]
    ];

    semifinalMatchups.forEach((match, index) => {
      const [teamA, teamB] = match;
      const result = this.simulateMatch(teamA, teamB);
      this.matches.push({
        stage: 'Semifinals',
        matchNumber: index + 1,
        teamA: teamA.name,
        teamB: teamB.name,
        result: `${result.pointsFor}:${result.pointsAgainst}`,
        winner: result.winner.name
      });
    });
  }

  playFinals() {
    if (this.matches.length !== 6) {
      throw new Error('There should be 2 semifinals matches to proceed to finals.');
    }

    const finalTeams = this.matches
      .filter(match => match.stage === 'Semifinals')
      .map(match => ({
        name: match.winner
      }));

    if (finalTeams.length !== 2) {
      throw new Error('There should be exactly 2 teams for the final.');
    }

    const [teamA, teamB] = finalTeams;
    const result = this.simulateMatch(teamA, teamB);
    this.matches.push({
      stage: 'Final',
      matchNumber: 1,
      teamA: teamA.name,
      teamB: teamB.name,
      result: `${result.pointsFor}:${result.pointsAgainst}`,
      winner: result.winner.name
    });
  }

  playThirdPlaceMatch() {
    if (this.matches.length !== 7) {
      throw new Error('There should be 1 final match to proceed to third place match.');
    }

    const semifinalLosers = this.matches
      .filter(match => match.stage === 'Semifinals')
      .map(match => ({
        name: match.winner === match.teamA ? match.teamB : match.teamA
      }));

    if (semifinalLosers.length !== 2) {
      throw new Error('There should be exactly 2 teams for the third place match.');
    }

    const [teamA, teamB] = semifinalLosers;
    const result = this.simulateMatch(teamA, teamB);
    this.matches.push({
      stage: 'Third Place',
      matchNumber: 1,
      teamA: teamA.name,
      teamB: teamB.name,
      result: `${result.pointsFor}:${result.pointsAgainst}`,
      winner: result.winner.name
    });
  }

  getResults() {
    const results = {
      quarterfinals: this.matches.filter(match => !match.stage),
      semifinals: this.matches.filter(match => match.stage === 'Semifinals'),
      final: this.matches.find(match => match.stage === 'Final'),
      thirdPlace: this.matches.find(match => match.stage === 'Third Place')
    };

    return results;
  }
}

module.exports = Tournament;
