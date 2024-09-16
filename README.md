# Olympic Games Basketball Tournament Simulation

## Project Overview

This project simulates a basketball tournament in the Olympic Games using vanilla JavaScript. The simulation includes both the group stage and the knockout stage of the tournament.

## Rules for the Group Stage:

- Each team plays three games in their group (one against each other team).
- Teams receive:
    2 points for a win,
    1 point for a loss,
    0 points for a forfeit
- Teams in the group are ranked by total points. If two teams have the same number of points, the result of their head-to-head match determines their ranking. If three teams are tied, the ranking is based on the point difference in their head-to-head matches (forming a "circle").
  
- At the end of the group stage, the top three teams in each group are ranked from 1 to 9 as follows:

- The top teams from groups A, B, and C are ranked based on points, point difference (in case of a tie), and total points scored (in case of a further tie) to assign ranks 1, 2, and 3.
The second-placed teams are ranked the same way to assign ranks 4, 5, and 6.
The third-placed teams are ranked to assign ranks 7, 8, and 9.
The teams ranked from 1 to 8 advance to the knockout stage, while the 9th-ranked team is eliminated.

- The output displays the results of all group stage matches by rounds, as well as the final group standings and the eight teams that advance to the knockout stage.

## Knockout Stage

- Teams that qualify for the quarterfinals are placed into four pots:

- Pot D: Teams ranked 1 and 2,
- Pot E: Teams ranked 3 and 4,
- Pot F: Teams ranked 5 and 6,
- Pot G: Teams ranked 7 and 8.

- Teams from Pot D are randomly matched with teams from Pot G, and teams from Pot E are matched with teams from Pot F to form the quarterfinal pairs. A key rule is that teams from the same group cannot meet in the quarterfinals.

- At the same time, the pairs for the semifinals are drawn randomly, with the winners of Pot D and E crossing over with the winners of Pot F and G.

## Elimination Rounds

- The tournament proceeds in a single-elimination format, with the winners advancing to the semifinals and finals. The losers of the semifinals play for the bronze medal.

- The results of all knockout matches (quarterfinals, semifinals, third-place match, and finals) are displayed. Afterward, the project outputs the teams that won the medals.

## Bonus

- When determining the probability of a winner, take into account the team's form.
The starting point for this calculation can be the data from the exhibitions.json file, which contains the results of two exhibition games for each team.
The form should be recalculated as the tournament progresses, and you can also include the strength of the opponent and the score margin as factors for form.