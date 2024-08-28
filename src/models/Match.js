/*class Match {
    constructor(team1, team2) {
      this.team1 = team1; 
      this.team2 = team2; 
      this.team1Score = 0; 
      this.team2Score = 0;
    }
  
    simulate() {
      this.team1Score = Math.floor(Math.random() * 100);
      this.team2Score = Math.floor(Math.random() * 100);
  
      const scoreDifference = this.team1Score - this.team2Score;
      if (this.team1Score > this.team2Score) {
        this.team1.updatePoints('win', scoreDifference);
        this.team2.updatePoints('loss', -scoreDifference);
      } else {
        this.team2.updatePoints('win', -scoreDifference);
        this.team1.updatePoints('loss', scoreDifference);
      }
    }
  }
  
  module.exports = Match;*/
  