document.addEventListener('DOMContentLoaded', (event) => {
    const teamInput = document.getElementById('teamInput');
    teamInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTeam();
        }
    });
});

let teams = [];
let round = 0;

function addTeam() {
    const teamInput = document.getElementById('teamInput');
    const teamName = teamInput.value.trim();
    if (teamName) {
        teams.push(teamName);
        updateTeamList();
        teamInput.value = '';
    }
}

function deleteTeam(index) {
    teams.splice(index, 1);
    updateTeamList();
}

function updateTeamList() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';
    teams.forEach((team, index) => {
        const li = document.createElement('li');
        li.textContent = team;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = () => deleteTeam(index);
        li.appendChild(deleteButton);
        teamList.appendChild(li);
    });
}

function generateTournament() {
    const tournamentTree = document.getElementById('tournamentTree');
    tournamentTree.innerHTML = '<h1>Tournament Generator</h1><button onclick="generateTournament()">Generate Tournament</button>';
    winners = {}; // Reset winners
    
    const winnersList = document.getElementById('winners');
    winnersList.innerHTML = '';
    
    if (teams.length < 2) {
        alert('Add at least two teams to generate a tournament');
        return;
    }

    round = 1;
    updateStatistics(0, 0);

    let rounds = createTournamentTree(teams);
    const totalRounds = rounds.length;

    rounds.reverse().forEach((roundMatches, index) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        roundDiv.innerHTML = `<h3>${getRoundName(totalRounds - index, totalRounds)}</h3>`;
        
        roundMatches.forEach((match, matchIndex) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            const [team1, team2] = match.split(' vs ');
            const currentRoundIndex = totalRounds - index;
            const currentMatchId1 = `${currentRoundIndex}-${matchIndex * 2 + 1}`;
            const currentMatchId2 = `${currentRoundIndex}-${matchIndex * 2 + 2}`;
            const nextRoundIndex = totalRounds - index - 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            matchDiv.innerHTML = `
                <div class="left team" id="${currentMatchId1}" onclick="selectWinner(this, ${currentRoundIndex}, ${matchIndex}, 'left')">${team1}</div>
                <div class="vs">vs</div>
                <div class="right team" id="${currentMatchId2}" onclick="selectWinner(this, ${currentRoundIndex}, ${matchIndex}, 'right')">${team2}</div>`;
            
            if (nextRoundIndex >= 0) {
                matchDiv.innerHTML += `<div class="winner" id="winner${nextRoundIndex}-${nextMatchIndex}"></div>`;
            }
            
            roundDiv.appendChild(matchDiv);
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
            let team2 = currentRound[i + 1] || 'TBD'; // Handle odd number of teams
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

function updateStatistics(matches, winnersCount) {
    document.getElementById('round').textContent = round;
    document.getElementById('matches').textContent = matches;
    const winnersList = document.getElementById('winners');
    winnersList.innerHTML = '';
    
    if (winnersCount) {
        teams.slice(0, winnersCount).forEach(winner => {
            const li = document.createElement('li');
            li.textContent = winner;
            winnersList.appendChild(li);
        });
    }
}

function selectWinner(teamDiv, currentRoundIndex, matchIndex, side) {
    // Update the current match winner
    const winnerDiv = teamDiv.parentElement.querySelector('.winner');
    winnerDiv.textContent = teamDiv.textContent;

    // Update the next round's match slot
    const nextRoundIndex = currentRoundIndex - 1;
    if (nextRoundIndex >= 0) {
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const nextWinnerId = `winner${nextRoundIndex}-${nextMatchIndex}`;
        const nextWinnerDiv = document.getElementById(nextWinnerId);
        if (nextWinnerDiv) {
            const matchDiv = nextWinnerDiv.parentElement;
            if (matchDiv) {
                if (side === 'left') {
                    matchDiv.querySelector('.left.team').textContent = teamDiv.textContent;
                } else {
                    matchDiv.querySelector('.right.team').textContent = teamDiv.textContent;
                }
            }
        }
    }
}