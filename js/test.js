document.addEventListener('DOMContentLoaded', (event) => {
    const teamInput = document.getElementById('teamInput');
    teamInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTeam();
        }
    });
});

let teams = [];
let nextRoundSpots = {}; // Track the next available spot for each round


function addTeam() {
    const teamInput = document.getElementById('teamInput');
    const teamName = teamInput.value.trim();
    if (teamName) {
        teams.push({ name: teamName, wins: 0, losses: 0 });
        updateTeamList();
        updateScoreTable();
        teamInput.value = '';
    }
}

function deleteTeam(index) {
    teams.splice(index, 1);
    updateTeamList();
    updateScoreTable();
}

function updateTeamList() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';
    teams.forEach((team, index) => {
        const li = document.createElement('li');
        li.textContent = team.name;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = () => deleteTeam(index);
        li.appendChild(deleteButton);
        teamList.appendChild(li);
    });
}

function updateScoreTable() {
    const scoreTable = document.getElementById('scoreTable');
    scoreTable.innerHTML = `
        <tr>
            <th>Team</th>
            <th>Wins</th>
            <th>Losses</th>
        </tr>`;
    teams.forEach((team, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team.name}</td>
            <td id="win-${index}">${team.wins}</td>
            <td id="loss-${index}">${team.losses}</td>`;
        scoreTable.appendChild(row);
    });
}

function generateTournament() {
    const tournamentTree = document.getElementById('tournamentTree');
    tournamentTree.innerHTML = '<h1>Tournament Generator</h1><button onclick="generateTournament()">Generate Tournament</button>'; 

    if (teams.length < 2) {
        alert('Add at least two teams to generate a tournament');
        return;
    }

    let rounds = createTournamentTree(teams.map(team => team.name));
    const totalRounds = rounds.length;

    rounds.reverse().forEach((roundMatches, index) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';

        const h3 = document.createElement('h3');
        h3.textContent = getRoundName(totalRounds - index, totalRounds);
        roundDiv.appendChild(h3);

        roundMatches.forEach((match, matchIndex) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            roundDiv.appendChild(matchDiv);

            const [team1, team2] = match.split(' vs ');
            const currentRoundIndex = totalRounds - index;
            const currentMatchId1 = `${currentRoundIndex}-${matchIndex * 2 + 1}`;
            const currentMatchId2 = `${currentRoundIndex}-${matchIndex * 2 + 2}`;

            const teamDiv1 = document.createElement('div');
            teamDiv1.className = 'team left';
            teamDiv1.id = currentMatchId1;
            teamDiv1.onclick = () => selectWinner(teamDiv1, team1, team2, currentRoundIndex, matchIndex, 'left');
            teamDiv1.textContent = team1;
            matchDiv.appendChild(teamDiv1);

            const vsDiv = document.createElement('div');
            vsDiv.className = 'vs';
            vsDiv.textContent = 'vs';
            matchDiv.appendChild(vsDiv);

            const teamDiv2 = document.createElement('div');
            teamDiv2.className = 'team right';
            teamDiv2.id = currentMatchId2;
            teamDiv2.onclick = () => selectWinner(teamDiv2, team1, team2, currentRoundIndex, matchIndex, 'right');
            teamDiv2.textContent = team2;
            matchDiv.appendChild(teamDiv2);
        });

        tournamentTree.appendChild(roundDiv);
    });
}


function createTournamentTree(participants) {
    let rounds = [];
    let currentRound = participants.slice();

    while (currentRound.length > 1) {
        let nextRound = [];
        for (let i = 0; i < currentRound.length; i += 2) {
            let team1 = currentRound[i];
            let team2 = currentRound[i + 1]; // Handle odd number of teams
            nextRound.push(team1 + ' vs ' + team2);
        }
        rounds.push(nextRound);
        currentRound = nextRound.map(match => ''); // Prepare next round with empty winners
    }
    return rounds;
}

function getRoundName(roundNumber, totalRounds) {
    if (roundNumber === totalRounds) {
        return 'Final';
    } else if (roundNumber === totalRounds - 1) {
        return 'Semifinals';
    } else {
        return `Round ${roundNumber}`;
    }
}

function selectWinner(teamDiv, team1, team2, currentRoundIndex, matchIndex, side) {

    const nextRoundIndex = currentRoundIndex + 1;
    if (nextRoundIndex >= 0) {
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const nextWinnerId = `${nextRoundIndex}-${nextMatchIndex * 2 + (side === 'left' ? 1 : 2)}`;
        const nextWinnerDiv = document.getElementById(nextWinnerId);
        
        if (nextWinnerDiv) {
            nextWinnerDiv.textContent = teamDiv.textContent;
        }
    }

    const winningTeam = teamDiv.textContent;
    const losingTeam = (side === 'left') ? team2 : team1;
    updateTeamRecords(winningTeam, losingTeam);
    updateScoreTable();
}

function updateTeamRecords(winningTeamName, losingTeamName) {
    const winningTeam = teams.find(team => team.name === winningTeamName);
    const losingTeam = teams.find(team => team.name === losingTeamName);

    if (winningTeam && losingTeam) {
        winningTeam.wins += 1;
        losingTeam.losses += 1;
    }
}
