import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthToken } from "../AuthTokenContext";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/detailsPage.css";

export default function MovieDetails() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth0();
  const username = isAuthenticated
    ? user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/username`]
    : "";
  const { accessToken } = useAuthToken();
  const { movieDetails } = location.state || {};
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    id: movieDetails.id,
    title: movieDetails.title,
    director:
      movieDetails.credits.crew.find((member) => member.job === "Director")
        ?.name || "N/A",
    tagline: movieDetails.tagline || "N/A",
    genre: movieDetails.genres,
    origin: movieDetails.origin_country[0],
    releaseDate: movieDetails.release_date,
    poster: movieDetails.poster_path,
    overview: movieDetails.overview,
    budget: movieDetails.budget,
    runtime: movieDetails.runtime,
  });

  useEffect(() => {
    checkForFavorite();
    getReviews();
  }, [details.id, user, accessToken, isFavorite, reviews]);

  const checkForFavorite = async () => {
    if (!isAuthenticated) {
      return;
    }
    const apiUrl = `${process.env.REACT_APP_API_URL}/favorite/${username}/${details.id}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      Authorization: `Bearer ${accessToken}`,
    });

    if (response.ok) {
      const data = await response.json();
      if (data === null) {
        return;
      } else {
        setIsFavorite(true);
      }
    }
  };

  const getReviews = async () => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/reviews/${details.id}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      setReviews(await response.json());
      console.log(reviews);
    }
  };

  const addFavorite = async () => {
    fetch(`${process.env.REACT_APP_API_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        username: user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/username`],
        movieId: details.id,
      }),
    });
    setIsFavorite(true);
  };

  return (
    <div className="movie-page-container">
      <div className="movie-details-container">
        <div className="movie-details-poster">
          <img
            src={`https://image.tmdb.org/t/p/w500/${details.poster}`}
            alt={`${details.title} Poster`}
          />
        </div>
        <div className="movie-details-info">
          <h1 className="movie-details-title">{details.title}</h1>
          <p className="movie-details-director">
            {" "}
            <strong>Director: </strong>
            {details.director}{" "}
          </p>
          <p className="movie-details-genre">
            <strong>Genre:</strong>{" "}
            {details.genre.map((g) => g.name).join(", ")}
          </p>
          <p className="movie-details-origin">
            <strong>Origin:</strong> {details.origin}
          </p>
          <p className="movie-details-release-date">
            <strong>Release Date:</strong> {details.releaseDate.split("-")[0]}
          </p>
          <p className="movie-details-overview">{details.overview}</p>
          <p className="movie-details-budget">
            <strong>Budget:</strong> ${details.budget.toLocaleString()}
          </p>
          <p className="movie-details-runtime">
            <strong>Runtime:</strong> {details.runtime} minutes
          </p>
          {isAuthenticated ? (
            <div className="movie-details-buttons">
              <button
                className="movie-details-review-button"
                onClick={() =>
                  navigate(`/app/create/review/${details.id}`, {
                    state: { movie: details, from: location.pathname },
                  })
                }
              >
                Write a review
              </button>
              {isFavorite ? (
                <div className="movie-details-favorited-message">
                  {" "}
                  Favorited{" "}
                </div>
              ) : (
                <button
                  className="movie-details-favorite-button"
                  onClick={addFavorite}
                >
                  Add to favorites
                </button>
              )}
            </div>
          ) : (
            <div className="movie-details-login-message">
              <strong>
                <div className="movie-details-login-message-body">
                  Login to review and favorite films.
                </div>
              </strong>
            </div>
          )}
        </div>
      </div>
      <div className="reviews-container">
        <div className="reviews-title-container">
          <h2 className="reviews-title">Reviews</h2>
        </div>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <h3 className="review-title">{review.title}</h3>
              <p className="review-score">
                <strong>⭐</strong> {review.score}/10
              </p>
              <p className="review-body">{review.body}</p>
              <p className="review-author">
                <strong>By:</strong> {review.username}
              </p>
            </div>
          ))
        ) : (
          <p className="reviews-no-review-message">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
}
