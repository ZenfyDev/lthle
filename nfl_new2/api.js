let gamesData = [];

// Format YYYYMMDD
function getFormattedDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Simple time-left score (bigger = more time remaining / earlier in day)
function timeLeftScore(event){
  const st = event.status?.type?.name || "";
  // Order: in-progress first (more time left first), then scheduled by start time, then final
  if (st === "STATUS_IN_PROGRESS"){
    const period = Number(event.status?.period || 0);
    const clock = (event.status?.displayClock || "0:00").split(":");
    const mm = Number(clock[0] || 0), ss = Number(clock[1] || 0);
    const secsThisQ = mm*60 + ss; // time left this quarter
    const quartersLeft = Math.max(0, 4 - period); // rough
    return quartersLeft*15*60 + secsThisQ + 1_000_000; // ensure in-progress > scheduled
  }
  if (st === "STATUS_SCHEDULED"){
    const ts = new Date(event.date).getTime();
    return 100_000 + (10_000_000 - ts); // earlier start => larger score
  }
  // final last
  return 0;
}

// Click handlers
function handleTeamClick(teamName) {
  alert(`You clicked on ${teamName}`);
}

// Open stream for home team via nflwebcast under UV


function openStreamFor(event){
  try{
    const comp = event.competitions?.[0];
    const team = comp?.competitors?.[0]?.team?.name || "";
    // Prefer local /channels/{team}.html
    if (window.openTeamStream && team && window.openTeamStream(team)) {
      return;
    }
    // Fallback to previous UV behavior
    const lower = (team || "nflnetwork").toLowerCase().replace(/\s+/g, '');
    const target = `https://nflwebcast.com/live/${lower}.html`;
    const final  = "https://bg.kardna.net/uv.html#" + target;
    openWebsite(final);
  } catch (_e) {
    openWebsite("https://bg.kardna.net/uv.html#aHR0cHM6Ly9uZmx3ZWJjYXN0LmNvbS9saXZlL25mbG5ldHdvcmsuaHRtbA==");
  }
}

    // Fallback to Kardna UV (previous behavior)
    const lower = (team || "nflnetwork").toLowerCase().replace(/\s+/g, '');
    const target = `https://nflwebcast.com/live/${lower}.html`;
    const final = "https://bg.kardna.net/uv.html#" + target;
    openWebsite(final);
  }catch(_e){
    openWebsite("https://bg.kardna.net/uv.html#aHR0cHM6Ly9uZmx3ZWJjYXN0LmNvbS9saXZlL25mbG5ldHdvcmsuaHRtbA==");
  }
}

    // Fallback to your previous behavior (UV link)
    const lower = (team || "nflnetwork").toLowerCase().replace(/\s+/g, '');
    const target = `https://nflwebcast.com/live/${lower}.html`;
    const final = "https://bg.kardna.net/uv.html#" + target;
    openWebsite(final);
  }catch(_e){
    openWebsite("https://bg.kardna.net/uv.html#aHR0cHM6Ly9uZmx3ZWJjYXN0LmNvbS9saXZlL25mbG5ldHdvcmsuaHRtbA==");
  }
}

function getLiveGameTime(event) {
  const st = event.status?.type?.name || "";
  if (st === 'STATUS_IN_PROGRESS') {
    const clock = event.status.displayClock;
    const period = event.status.period;
    return `Q${period} • ${clock}`;
  }
  if (st === 'STATUS_FINAL') return 'Final';
  if (st === 'STATUS_SCHEDULED') {
    // Show local kickoff time
    const t = new Date(event.date);
    return t.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
  }
  return '—';
}

function updateScoreboard() {
  const currentDate = getFormattedDate();
  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${currentDate}`;

  fetch(apiUrl)
    .then(r => r.json())
    .then(data => {
      gamesData = data.events || [];

      // Sort: most time left first, then scheduled, then finals
      gamesData.sort((a,b)=> timeLeftScore(b) - timeLeftScore(a));

      const container = document.getElementById('container');
      container.innerHTML = '';

      gamesData.forEach(event => {
        const gameEl = document.createElement('div');
        gameEl.className = 'game';

        const title = document.createElement('h2');
        title.textContent = event.name || 'Game';

        const dateP = document.createElement('p');
        dateP.className = 'muted';
        dateP.textContent = `Date: ${new Date(event.date).toLocaleDateString()}`;

        // competition
        const comp = event.competitions?.[0];
        const compEl = document.createElement('div');
        compEl.className = 'competitions';

        (comp?.competitors || []).forEach(competitor => {
          const teamEl = document.createElement('div');
          teamEl.className = 'team';

          const logo = competitor.team?.logo || 'https://via.placeholder.com/50';
          const nm = competitor.team?.name || 'Team';

          const left = document.createElement('div');
          left.style.display = 'flex';
          left.style.alignItems = 'center';
          left.style.gap = '10px';
          const img = document.createElement('img');
          img.src = logo; img.alt = nm + " logo";

          const name = document.createElement('span');
          name.className = 'team-name';
          name.textContent = nm;
          name.onclick = () => handleTeamClick(nm);

          left.appendChild(img);
          left.appendChild(name);

          const score = document.createElement('span');
          score.className = 'team-score';
          score.textContent = String(competitor.score ?? '');

          teamEl.appendChild(left);
          teamEl.appendChild(score);
          compEl.appendChild(teamEl);
        });

        const timeLeft = document.createElement('p');
        timeLeft.className = 'time-left';
        timeLeft.dataset.id = event.id;
        timeLeft.textContent = getLiveGameTime(event);

        const watchBtn = document.createElement('button');
        watchBtn.className = 'watch-button';
        const st = event.status?.type?.name || "";
        if (st === 'STATUS_FINAL'){ watchBtn.classList.add('ended'); }
        else { watchBtn.classList.add('live'); }
        watchBtn.textContent = 'Watch';
        watchBtn.addEventListener('click', () => openStreamFor(event));

        gameEl.appendChild(title);
        gameEl.appendChild(dateP);
        gameEl.appendChild(compEl);
        gameEl.appendChild(timeLeft);
        gameEl.appendChild(watchBtn);

        container.appendChild(gameEl);
      });

      startLiveUpdate();
    })
    .catch(err => console.error('Error:', err));
}

function updateTimeLeft(){
  const els = document.querySelectorAll('.time-left');
  els.forEach(el => {
    const id = el.dataset.id;
    const g = gamesData.find(x => x.id === id);
    if (g) el.textContent = getLiveGameTime(g);
  });
}

function startLiveUpdate(){
  updateTimeLeft();
  if (window.__ticker) clearInterval(window.__ticker);
  window.__ticker = setInterval(updateTimeLeft, 1000);
}

updateScoreboard();
setInterval(updateScoreboard, 30000);