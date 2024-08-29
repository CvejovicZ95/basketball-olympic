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

function havePlayedBefore(teamA, teamB) {
  // Predefinisani podaci o grupnim mečevima
  const groupMatches = [
    // Grupa A
    ["Kanada", "Australija"],
    ["Kanada", "Grčka"],
    ["Kanada", "Španija"],
    ["Australija", "Grčka"],
    ["Australija", "Španija"],
    ["Grčka", "Španija"],
    
    // Grupa B
    ["Nemačka", "Francuska"],
    ["Nemačka", "Brazil"],
    ["Nemačka", "Japan"],
    ["Francuska", "Brazil"],
    ["Francuska", "Japan"],
    ["Brazil", "Japan"],
    
    // Grupa C
    ["Sjedinjene Države", "Srbija"],
    ["Sjedinjene Države", "Južni Sudan"],
    ["Sjedinjene Države", "Puerto Riko"],
    ["Srbija", "Južni Sudan"],
    ["Srbija", "Puerto Riko"],
    ["Južni Sudan", "Puerto Riko"],
  ]

  return groupMatches.some(match => (match[0] === teamA && match[1] === teamB) || (match[0] === teamB && match[1] === teamA));
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
    const firstSeed = this.teams.slice(0, 2); // Teams 1 and 2
    const secondSeed = this.teams.slice(2, 4); // Teams 3 and 4
    const thirdSeed = this.teams.slice(4, 6); // Teams 5 and 6
    const fourthSeed = this.teams.slice(6);   // Teams 7 and 8
  
    // Shuffling seeds
    const shuffledFirstSeed = shuffleArray([...firstSeed]);
    const shuffledSecondSeed = shuffleArray([...secondSeed]);
    const shuffledThirdSeed = shuffleArray([...thirdSeed]);
    const shuffledFourthSeed = shuffleArray([...fourthSeed]);
  
    // Function to find a valid opponent for a given team
    function findValidOpponent(seedTeam, opponents, usedMatchups) {
      const validOpponents = opponents.filter(opponent => 
        !havePlayedBefore(seedTeam.name, opponent.name) && 
        !usedMatchups.some(match => 
          (match[0].name === seedTeam.name && match[1].name === opponent.name) ||
          (match[0].name === opponent.name && match[1].name === seedTeam.name)
        )
      );
      console.log(`Validni protivnici za ${seedTeam.name}:`, validOpponents.map(opponent => opponent.name));
      if (validOpponents.length === 0) {
        throw new Error(`Nema validnog protivnika za tim ${seedTeam.name}.`);
      }
      return validOpponents[Math.floor(Math.random() * validOpponents.length)];
    }
  
    const usedMatchups = [];
    
    const matchups = [
      [shuffledFirstSeed[0], findValidOpponent(shuffledFirstSeed[0], shuffledFourthSeed, usedMatchups)],
      [shuffledFirstSeed[1], findValidOpponent(shuffledFirstSeed[1], shuffledFourthSeed, usedMatchups)],
      [shuffledSecondSeed[0], findValidOpponent(shuffledSecondSeed[0], shuffledThirdSeed, usedMatchups)],
      [shuffledSecondSeed[1], findValidOpponent(shuffledSecondSeed[1], shuffledThirdSeed, usedMatchups)]
    ];

    // Ensure that the matchups list does not contain duplicate matches
    matchups.forEach(match => usedMatchups.push(match));
    
    console.log("Četvrtfinalne utakmice:");
    matchups.forEach((match, index) => {
      const [teamA, teamB] = match;
      console.log(`Match ${index + 1}: ${teamA.name} vs ${teamB.name}`);
    });
  
    matchups.forEach((match, index) => {
      const [teamA, teamB] = match;
      try {
        const result = this.simulateMatch(teamA, teamB);
        this.matches.push({
          matchNumber: index + 1,
          teamA: teamA.name,
          teamB: teamB.name,
          result: `${result.pointsFor}:${result.pointsAgainst}`,
          winner: result.winner.name
        });
      } catch (error) {
        console.error(`Greška prilikom simulacije meča ${index + 1}: ${error.message}`);
      }
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
