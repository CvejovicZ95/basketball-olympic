class Team {
  constructor(name, isoCode, fibaRanking) {
    this.name = name;
    this.isoCode = isoCode;
    this.fibaRanking = fibaRanking;
    this.wins = 0;
    this.losses = 0;
    this.pointsFor = 0;
    this.pointsAgainst = 0;
    this.points = 0;
  }

  updateResult(pointsFor, pointsAgainst) {
    this.pointsFor += pointsFor;
    this.pointsAgainst += pointsAgainst;
    if (pointsFor > pointsAgainst) {
      this.wins += 1;
      this.points += 2;
    } else {
      this.losses += 1;
      this.points += 1;
    }
  }

  getPointDifference() {
    return this.pointsFor - this.pointsAgainst;
  }
}

module.exports = Team;
