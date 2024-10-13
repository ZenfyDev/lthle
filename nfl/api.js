let gamesData = [];

// Function to format date as YYYYMMDD
function getFormattedDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Function to handle team click
function handleTeamClick(teamName) {
  alert(`You clicked on ${teamName}`);
}

// Function to handle watch button click
function handleWatchButtonClick(gameId) {
  alert(`Watch button clicked for game ${gameId}`);
}

// Function to get live game time and period from ESPN API
function getLiveGameTime(event) {
  const status = event.status.type.name;

  // Check if the game is in progress
  if (status === 'STATUS_IN_PROGRESS') {
    const clock = event.status.displayClock;  // Live game clock
    const period = event.status.period;       // Quarter/period
    return `Q${period} - ${clock}`;
  }
  
  // Check if the game is finished
  if (status === 'STATUS_FINAL') {
    return 'Final';
  }

  // If it's scheduled or about to start
  if (status === 'STATUS_SCHEDULED') {
    return 'Scheduled';
  }

  return 'Unknown status';
}

// Function to update the scoreboard
function updateScoreboard() {
  // Construct the API URL with the current date
  const currentDate = getFormattedDate();
  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${currentDate}`;

  // Fetch data from the API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      gamesData = data.events; // Store the data globally

      const container = document.getElementById('container');
      container.innerHTML = ''; // Clear the container before updating

      gamesData.forEach(event => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game';

        const gameName = document.createElement('h2');
        gameName.textContent = event.name;

        const gameDate = document.createElement('p');
        gameDate.textContent = `Date: ${new Date(event.date).toLocaleDateString()}`;

        // Handle competitions
        const competitions = event.competitions[0]; // Assuming there's only one competition per event
        const competitionElement = document.createElement('div');
        competitionElement.className = 'competitions';

        competitions.competitors.forEach(competitor => {
          const teamElement = document.createElement('div');
          teamElement.className = 'team';

          // Team logo URL (Replace with actual logo URL from the API or a static URL)
          const teamLogoUrl = competitor.team.logo || 'https://via.placeholder.com/50'; // Placeholder image

          const teamNameElement = document.createElement('span');
          teamNameElement.className = 'team-name';
          teamNameElement.textContent = competitor.team.name;
          teamNameElement.onclick = () => handleTeamClick(competitor.team.name);

          teamElement.innerHTML = `
            <img src="${teamLogoUrl}" alt="${competitor.team.name} Logo">
            <div class="team-details">
              ${teamNameElement.outerHTML}
              <span class="team-score">${competitor.score}</span>
            </div>
          `;
          competitionElement.appendChild(teamElement);
        });

        // Get live game time and period
        const timeLeftElement = document.createElement('p');
        timeLeftElement.className = 'time-left';
        timeLeftElement.textContent = getLiveGameTime(event);

        // Create Watch button
        const watchButton = document.createElement('button');
        watchButton.className = 'watch-button';
        if (event.status.type.name === 'STATUS_FINAL') {
          watchButton.classList.add('ended');
          watchButton.textContent = 'Watch';
        } else {
          watchButton.classList.add('live');
          watchButton.textContent = 'Watch';
        }

        // Pass the competitor's team name directly to the hello function
        watchButton.onclick = () => hello(competitions.competitors[0].team.name);

        gameElement.appendChild(gameName);
        gameElement.appendChild(gameDate);
        gameElement.appendChild(competitionElement);
        gameElement.appendChild(timeLeftElement);
        gameElement.appendChild(watchButton);

        container.appendChild(gameElement);
      });

      // Start the live update for time left
      startLiveUpdate();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

let streamurl = "https://nflwebcast.com/live/";

function hello(name){
  const lowerCaseName = name.toLowerCase(); 
  var gron = streamurl + lowerCaseName +".html";
  openWebsite(gron);
  console.log(gron);
}

// Function to update time left for each game
function updateTimeLeft() {
  const timeLeftElements = document.querySelectorAll('.time-left');

  timeLeftElements.forEach(element => {
    const gameId = element.dataset.gameId; // You can store the game ID if needed
    // Update the game time status for each game
    const game = gamesData.find(g => g.id === gameId);
    if (game) {
      element.textContent = getLiveGameTime(game);
    }
  });
}

// Function to start live update of time left
function startLiveUpdate() {
  updateTimeLeft(); // Initial update
  setInterval(updateTimeLeft, 1000); // Update every second
}

// Initial update
updateScoreboard();

// Set interval to update scoreboard every 30 seconds (adjust as needed)
setInterval(updateScoreboard, 30000); // 30000 ms = 30 seconds
