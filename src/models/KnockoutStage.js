const { calculateForm } = require("../utils/form");
const fs = require("fs");
const path = require("path");

const groupsFilePath = path.join(__dirname, "../../data/groups.json");
const groupsData = JSON.parse(fs.readFileSync(groupsFilePath, "utf8"));

function getFIBARanking(teamName) {
  for (const group in groupsData) {
    const team = groupsData[group].find((team) => team.Team === teamName);
    if (team) {
      return team.FIBARanking;
    }
  }
  return null;
}

function havePlayedBefore(teamA, teamB) {
  const groupMatches = [
    // Matches from gruop A
    ["Kanada", "Australija"],
    ["Kanada", "Grčka"],
    ["Kanada", "Španija"],
    ["Australija", "Grčka"],
    ["Australija", "Španija"],
    ["Grčka", "Španija"],

    // Matches from gruop B
    ["Nemačka", "Francuska"],
    ["Nemačka", "Brazil"],
    ["Nemačka", "Japan"],
    ["Francuska", "Brazil"],
    ["Francuska", "Japan"],
    ["Brazil", "Japan"],

    // Matches from gruop C
    ["Sjedinjene Države", "Srbija"],
    ["Sjedinjene Države", "Južni Sudan"],
    ["Sjedinjene Države", "Puerto Riko"],
    ["Srbija", "Južni Sudan"],
    ["Srbija", "Puerto Riko"],
    ["Južni Sudan", "Puerto Riko"],
  ];

  return groupMatches.some(
    (match) =>
      (match[0] === teamA && match[1] === teamB) ||
      (match[0] === teamB && match[1] === teamA),
  );
}
class Tournament {
  constructor(teams, exhibitionsData) {
    if (teams.length !== 8) {
      throw new Error("For the tournament, exactly 8 teams are required.");
    }
    this.teams = teams;
    this.exhibitionsData = exhibitionsData;
    this.matches = [];
  }

  simulateMatch(teamA, teamB) {
    const formA = calculateForm(teamA.name, this.exhibitionsData);
    const formB = calculateForm(teamB.name, this.exhibitionsData);

    if (isNaN(formA) || isNaN(formB)) {
      throw new Error("Invalid form value returned by calculateForm");
    }

    const baseScore = 80;

    const rankingA = getFIBARanking(teamA.name);
    const rankingB = getFIBARanking(teamB.name);

    if (rankingA === null || rankingB === null) {
      throw new Error("FIBA ranking not found for one of the teams");
    }

    const bonusA = 25 - rankingA;
    const bonusB = 25 - rankingB;

    let pointsA =
      baseScore + formA + bonusA + Math.floor(Math.random() * 10) - 5;
    let pointsB =
      baseScore + formB + bonusB + Math.floor(Math.random() * 10) - 5;

    if (isNaN(pointsA) || isNaN(pointsB)) {
      throw new Error("Invalid points calculation");
    }

    while (pointsA === pointsB) {
      pointsA = baseScore + formA + bonusA + Math.floor(Math.random() * 10) - 5;
      pointsB = baseScore + formB + bonusB + Math.floor(Math.random() * 10) - 5;
    }

    return {
      pointsFor: pointsA,
      pointsAgainst: pointsB,
      winner: pointsA > pointsB ? teamA : teamB,
    };
  }

  playQuarterfinals() {
    const firstSeed = this.teams.slice(0, 2);
    const secondSeed = this.teams.slice(2, 4);
    const thirdSeed = this.teams.slice(4, 6);
    const fourthSeed = this.teams.slice(6);

    const usedTeams = [];
    const matchups = [];

    // function to find valid opponent
    function findSingleOpponent(seedTeam, opponents) {
      const validOpponents = opponents.filter(
        (opponent) =>
          !havePlayedBefore(seedTeam.name, opponent.name) &&
          !usedTeams.includes(opponent.name),
      );
      if (validOpponents.length === 1) {
        return validOpponents[0];
      }
      return null;
    }

    // paring valid opponents
    firstSeed.forEach((team) => {
      const opponent = findSingleOpponent(team, fourthSeed);
      if (opponent) {
        matchups.push([team, opponent]);
        usedTeams.push(team.name, opponent.name);
      }
    });

    secondSeed.forEach((team) => {
      const opponent = findSingleOpponent(team, thirdSeed);
      if (opponent) {
        matchups.push([team, opponent]);
        usedTeams.push(team.name, opponent.name);
      }
    });

    // paring other opponents
    function findRemainingMatchups(seed, opponents) {
      seed.forEach((team) => {
        if (!usedTeams.includes(team.name)) {
          const remainingOpponents = opponents.filter(
            (opponent) =>
              !usedTeams.includes(opponent.name) &&
              !havePlayedBefore(team.name, opponent.name),
          );
          if (remainingOpponents.length > 0) {
            const opponent =
              remainingOpponents[
                Math.floor(Math.random() * remainingOpponents.length)
              ];
            matchups.push([team, opponent]);
            usedTeams.push(team.name, opponent.name);
          } else {
            throw new Error(`Nema validnog protivnika za tim ${team.name}.`);
          }
        }
      });
    }

    findRemainingMatchups(firstSeed, fourthSeed);
    findRemainingMatchups(secondSeed, thirdSeed);

    if (matchups.length !== 4) {
      throw new Error("Ne mogu da pronađem sve validne kombinacije mečeva.");
    }

    console.log("Četvrtfinalni parovi:");
    matchups.forEach((match, index) => {
      const [teamA, teamB] = match;
      console.log(`${index + 1}: ${teamA.name} vs ${teamB.name}`);
    });

    console.log("----------");

    matchups.forEach((match, index) => {
      const [teamA, teamB] = match;
      try {
        const result = this.simulateMatch(teamA, teamB);
        this.matches.push({
          matchNumber: index + 1,
          teamA: teamA.name,
          teamB: teamB.name,
          result: `${result.pointsFor}:${result.pointsAgainst}`,
          winner: result.winner.name,
        });
      } catch (error) {
        console.error(
          `Greška prilikom simulacije meča ${index + 1}: ${error.message}`,
        );
      }
    });
  }

  playSemifinals() {
    if (this.matches.length !== 4) {
      throw new Error("Potrebno je da postoje 4 odigrana meca.");
    }

    // quarter-finals winners
    const quarterfinalWinners = this.matches.map((match) => match.winner);

    // original pots for teams
    const firstSeed = this.teams.slice(0, 2).map((team) => team.name);
    const secondSeed = this.teams.slice(2, 4).map((team) => team.name);

    const thirdSeed = this.teams.slice(4, 6).map((team) => team.name);
    const fourthSeed = this.teams.slice(6).map((team) => team.name);

    // divide the winning teams according to the pots
    const winnersFromFirstAndFourthSeed = quarterfinalWinners.filter(
      (winner) => firstSeed.includes(winner) || fourthSeed.includes(winner),
    );

    const winnersFromSecondAndThirdSeed = quarterfinalWinners.filter(
      (winner) => secondSeed.includes(winner) || thirdSeed.includes(winner),
    );

    if (
      winnersFromFirstAndFourthSeed.length !== 2 ||
      winnersFromSecondAndThirdSeed.length !== 2
    ) {
      throw new Error("Invalid semifinal pairing due to improper seeding.");
    }

    // form semi-final pairs by crossing pots
    const semifinalMatchups = [
      [winnersFromFirstAndFourthSeed[0], winnersFromSecondAndThirdSeed[0]],
      [winnersFromFirstAndFourthSeed[1], winnersFromSecondAndThirdSeed[1]],
    ];

    semifinalMatchups.forEach((match, index) => {
      const [teamA, teamB] = match;
      const result = this.simulateMatch({ name: teamA }, { name: teamB });
      this.matches.push({
        stage: "Semifinals",
        matchNumber: index + 1,
        teamA,
        teamB,
        result: `${result.pointsFor}:${result.pointsAgainst}`,
        winner: result.winner.name,
      });
    });
  }

  playFinals() {
    if (this.matches.length !== 6) {
      throw new Error("Trebalo bi da postoji 2 polufinalna meca.");
    }

    const finalTeams = this.matches
      .filter((match) => match.stage === "Semifinals")
      .map((match) => ({
        name: match.winner,
      }));

    if (finalTeams.length !== 2) {
      throw new Error("Trebalo bi da bude tacno 2 tima u finalu.");
    }

    const [teamA, teamB] = finalTeams;
    const result = this.simulateMatch(teamA, teamB);
    this.matches.push({
      stage: "Final",
      matchNumber: 1,
      teamA: teamA.name,
      teamB: teamB.name,
      result: `${result.pointsFor}:${result.pointsAgainst}`,
      winner: result.winner.name,
    });
  }

  playThirdPlaceMatch() {
    if (this.matches.length !== 7) {
      throw new Error(
        "Treba da postoji 1 finalni mec da bi se odigrao mec za trece mesto.",
      );
    }

    const semifinalLosers = this.matches
      .filter((match) => match.stage === "Semifinals")
      .map((match) => ({
        name: match.winner === match.teamA ? match.teamB : match.teamA,
      }));

    if (semifinalLosers.length !== 2) {
      throw new Error("Trebalo bi da postoje 2 tima da igraju za trece mesto.");
    }

    const [teamA, teamB] = semifinalLosers;
    const result = this.simulateMatch(teamA, teamB);
    this.matches.push({
      stage: "Third Place",
      matchNumber: 1,
      teamA: teamA.name,
      teamB: teamB.name,
      result: `${result.pointsFor}:${result.pointsAgainst}`,
      winner: result.winner.name,
    });
  }

  getResults() {
    const results = {
      quarterfinals: this.matches.filter((match) => !match.stage),
      semifinals: this.matches.filter((match) => match.stage === "Semifinals"),
      final: this.matches.find((match) => match.stage === "Final"),
      thirdPlace: this.matches.find((match) => match.stage === "Third Place"),
    };

    return results;
  }
}

module.exports = Tournament;
