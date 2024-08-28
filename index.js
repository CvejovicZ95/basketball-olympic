// index.js

const Group = require('./src/models/Gruops');
const { loadGroupsData, loadExhibitionsData } = require('./src/utils/dataLoader');
const { rankTeams, assignRanks } = require('./src/utils/ranking');


// Učitaj podatke iz JSON fajlova
const groupsData = loadGroupsData();
const exhibitionsData = loadExhibitionsData();

// Kreiraj i prikaži grupnu fazu
const groups = Object.keys(groupsData).map(groupName => {
  return new Group(groupName, groupsData[groupName], exhibitionsData);
});

groups.forEach(group => {
  console.log(`Grupa ${group.groupName}:`);
  group.playGames();
  const standings = group.getStandings();
  console.log('----------------------')
  console.log(`Konačan poredak:`);
  standings.forEach((team, index) => {
    const pointDifferenceSign = team.pointDifference >= 0 ? '+' : '';
    console.log(`${index + 1}. ${team.name.padEnd(12)} ${team.wins} / ${team.losses} / ${team.points} / ${team.pointsFor} / ${team.pointsAgainst} / ${pointDifferenceSign}${team.pointDifference}`);
  });
  console.log("\n");
});

const allTeams = [];
groups.forEach(group => {
  const rankedTeams = group.getRankedTeams();
  allTeams.push({
    ...rankedTeams.firstPlace,
    rankType: 'first'
  });
  allTeams.push({
    ...rankedTeams.secondPlace,
    rankType: 'second'
  });
  allTeams.push({
    ...rankedTeams.thirdPlace,
    rankType: 'third'
  });
});

// Rangiraj sve timove iz grupa A, B i C
const sortedTeams = rankTeams(allTeams);

// Dodeli rangove i ispiši rezultate za prolaz dalje
const rankedTeams = assignRanks(sortedTeams);
console.log('Prvih 8 timova sa spiska idu u cetvrt-finale:')
console.log('----------')
console.log('(broj bodova/postignuti koševi/primljeni koševi/koš razlika)')
console.log('----------')
rankedTeams.forEach(team => {
  console.log(`${team.rank}: ${team.name} (${team.points} / ${team.pointsFor} / ${team.pointsAgainst} / ${team.pointDifference})`);
});
