const Group = require('./src/models/Gruops');
const Tournament = require('./src/models/KnockoutStage');
const { loadGroupsData, loadExhibitionsData } = require('./src/utils/dataLoader');
const { rankTeams, assignRanks } = require('./src/utils/ranking');

const groupsData = loadGroupsData();
const exhibitionsData = loadExhibitionsData();

// create and show gruop phase
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

// Rank teams from all gruops
const sortedTeams = rankTeams(allTeams);

// Results and who went to knockout
const rankedTeams = assignRanks(sortedTeams);
console.log('8 timova sa spiska idu u cetvrt-finale:')
console.log('----------')
console.log('(broj bodova/postignuti koševi/primljeni koševi/koš razlika)')
console.log('----------')
rankedTeams.forEach(team => {
  console.log(`${team.rank}: ${team.name} (${team.points} / ${team.pointsFor} / ${team.pointsAgainst} / ${team.pointDifference})`);
});

console.log('----------')

const quarterfinals = new Tournament(rankedTeams, exhibitionsData);
quarterfinals.playQuarterfinals();

// Quarter-finals results
console.log('Četvrt-finale:');
quarterfinals.getResults().quarterfinals.forEach(match => {
  console.log(`${match.matchNumber}: ${match.teamA} vs ${match.teamB} - Rezultat: ${match.result} | Pobednik: ${match.winner}`);
});
console.log('----------');

// play semi-finals
quarterfinals.playSemifinals();

// Semi-finals results
console.log('Polufinale:');
quarterfinals.getResults().semifinals.forEach(match => {
  console.log(`${match.matchNumber}: ${match.teamA} vs ${match.teamB} - Rezultat: ${match.result} | Pobednik: ${match.winner}`);
});
console.log('----------');

// play finals
quarterfinals.playFinals();

// Finals results
const finalResult = quarterfinals.getResults().final;
console.log('Finale:');
console.log(`1. ${finalResult.teamA} vs ${finalResult.teamB} - Rezultat: ${finalResult.result} | Pobednik: ${finalResult.winner}`);
console.log('----------');

// play for 3rd place
quarterfinals.playThirdPlaceMatch();

// 3rd place results
const thirdPlaceResult = quarterfinals.getResults().thirdPlace;
console.log('Utakmica za treće mesto:');
console.log(`1. ${thirdPlaceResult.teamA} vs ${thirdPlaceResult.teamB} - Rezultat: ${thirdPlaceResult.result} | Pobednik: ${thirdPlaceResult.winner}`);
console.log('----------');

// Medals
const finalWinner = finalResult.winner;
const secondPlace = finalResult.winner === finalResult.teamA ? finalResult.teamB : finalResult.teamA;
const thirdPlace = thirdPlaceResult.winner;

console.log(`Zlatna medalja: ${finalWinner}`);
console.log(`Srebrna medalja: ${secondPlace}`);
console.log(`Bronzana medalja: ${thirdPlace}`);

