const apiKey = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZTVlMzY2ZDhhZjA0YzkwM2RhZjA3NDM2OWJjYjI3NSIsIm5iZiI6MTcyODkyODM3MS45MDY1LCJzdWIiOiI2NWU0MTY0ZWM5OTgyNjAxNjI2MTY3MjYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Pr_j4RiTEGPK_Zqvd9lvv2VgpJKhfrXi3mMUts9Vm6U';

// Options for fetch requests
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: apiKey
  }
};

// Fetch popular movies from TMDb
async function fetchPopularMovies() {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options);
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
  }
}

// Display the list of movies
function displayMovies(movies) {
  const movieList = document.getElementById('movie-list');
  movieList.innerHTML = ''; // Clear the list

  // Create list items for each movie
  movies.forEach(movie => {
    const listItem = document.createElement('li');
    listItem.textContent = movie.title;
    listItem.setAttribute('data-movie-id', movie.id); // Set movie ID in a custom attribute
    listItem.addEventListener('click', () => fetchMovieDetails(movie.id)); // Click event to fetch details and trailer
    movieList.appendChild(listItem);
  });
}

// Fetch movie details by movie ID
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options);
    const data = await response.json();
    displayMovieDetails(data);
    launchTrailer(data.id); // Launch the trailer using TMDb ID
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

// Display the selected movie's details
function displayMovieDetails(movie) {
  const movieDetail = document.getElementById('movie-detail');
  movieDetail.innerHTML = `
    <h3>${movie.title}</h3>
    <p><strong>Release Date:</strong> ${movie.release_date}</p>
    <p><strong>Overview:</strong> ${movie.overview}</p>
    <p><strong>Rating:</strong> ${movie.vote_average}/10</p>
  `;
}

// Launch the trailer in an iframe
function launchTrailer(tmdbId) {
  const trailerContainer = document.getElementById('trailer-container');
  trailerContainer.innerHTML = `
    <h3>Watch Movie</h3>
    <iframe 
      src="https://embed.su/embed/movie/${tmdbId}" 
      width="600" 
      height="400" 
      frameborder="0" 
      allowfullscreen>
    </iframe>
  `;
}

// Call the function to fetch popular movies when the page loads
fetchPopularMovies();
