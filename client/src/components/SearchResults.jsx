import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/results.css";

export default function SearchResults() {
  const location = useLocation();
  const { results } = location.state || {};
  const { criteria } = useParams();
  const { isAuthenticated } = useAuth0();
  const [searchResults, setSearchResults] = useState(results);
  const [movieDetails, setMovieDetails] = useState([]);
  const navigate = useNavigate();

  const getMovieDetails = async () => {
    const movieDetailsPromises = searchResults.results.map(async (movie) => {
      const query = encodeURIComponent(movie.id);
      const apiUrl = `https://api.themoviedb.org/3/movie/${query}?api_key=${process.env.REACT_APP_API_KEY}&append_to_response=credits`;
      const response = await fetch(apiUrl);
      return response.json();
    });

    const allMovieDetails = await Promise.all(movieDetailsPromises);

    setMovieDetails(allMovieDetails);
  };

  const checkRedirect = (movieId, movie) => {
    if (isAuthenticated) {
      navigate(`/app/search/${criteria}/${movieId}`, {
        state: { movieDetails: movie },
      });
    } else {
      navigate(`/search/${criteria}/${movieId}`, {
        state: { movieDetails: movie },
      });
    }
  };

  useEffect(() => {
    if (location.state && location.state.results) {
      setSearchResults(location.state.results);
    }
  }, [location.state]);

  useEffect(() => {
    if (searchResults && searchResults.results) {
      getMovieDetails();
    }
  }, [searchResults]);

  return (
    <div key={criteria} className="results-container">
      <h2>Search Results</h2>
      <ul className="results-list">
        {movieDetails && movieDetails.length > 0 ? (
          movieDetails.map((movie) => (
            <li key={movie.id} className="result-item">
              <img
                className="movie-poster"
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                alt={`${movie.title} Poster`}
              />
              <div className="movie-info">
                <h3 className="movie-title">
                  {movie.title} (
                  {movie.release_date !== "" && movie.release_date
                    ? movie.release_date.split("-")[0]
                    : "N/A"}
                  )
                </h3>
                <h4 className="movie-director">
                  Directed by:{" "}
                  {movie.credits
                    ? movie.credits.crew.find(
                        (member) => member.job === "Director"
                      )?.name || "N/A"
                    : "N/A"}
                </h4>
                <p className="movie-overview">{movie.overview}</p>
                <button
                  className="movie-info-button"
                  onClick={() => checkRedirect(movie.id, movie)}
                >
                  {" "}
                  Learn More{" "}
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </ul>
    </div>
  );
}
