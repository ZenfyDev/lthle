let gamesData = [];

    // Function to format date as YYYYMMDD
    function getFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }

    // Function to calculate time left in the game
    function getTimeLeft(endTime) {
      const now = new Date();
      const end = new Date(endTime);
      const timeDiff = end - now;
      
      if (timeDiff <= 0) return 'Game Ended';

      const minutes = Math.floor(timeDiff / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      return `${minutes}m ${seconds}s`;
    }

    // Function to handle team click
    function handleTeamClick(teamName) {
      alert(`You clicked on ${teamName}`);
      // Add more functionality here
    }

    // Function to handle watch button click
    function handleWatchButtonClick(gameId) {
      alert(`Watch button clicked for game ${gameId}`);
      // Add more functionality here
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
          // Sort games by time left (most time left first)
          gamesData.sort((a, b) => new Date(a.date) - new Date(b.date));

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
              lol = teamNameElement.textContent;
              teamElement.innerHTML = `
                <img src="${teamLogoUrl}" alt="${competitor.team.name} Logo">
                <div class="team-details">
                  ${teamNameElement.outerHTML}
                  <span class="team-score">${competitor.score}</span>
                </div>
              `;
              competitionElement.appendChild(teamElement);
            });

            const timeLeftElement = document.createElement('p');
            timeLeftElement.className = 'time-left';
            const endTime = event.date || new Date(); // Replace with actual end time from API
            timeLeftElement.dataset.endTime = endTime; // Store end time in a data attribute
            timeLeftElement.textContent = `Time Left: ${getTimeLeft(endTime)}`;

            // Create Watch button
            const watchButton = document.createElement('button');
            watchButton.className = 'watch-button';
            if (new Date(endTime) <= new Date()) {
              watchButton.classList.add('ended');
              watchButton.textContent = 'Watch';
            } else {
              watchButton.classList.add('live');
              watchButton.textContent = 'Watch';
            }
      
            watchButton.onclick = () => hello(lol);
              

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
      openWebsite(streamurl + lowerCaseName +".html");
      
    }
    // Function to update time left for each game
    function updateTimeLeft() {
      const timeLeftElements = document.querySelectorAll('.time-left');

      timeLeftElements.forEach(element => {
        const endTime = new Date(element.dataset.endTime);
        element.textContent = `Time Left: ${getTimeLeft(endTime)}`;
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

    