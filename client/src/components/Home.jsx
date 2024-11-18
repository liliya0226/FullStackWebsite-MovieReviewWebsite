import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthToken } from "../AuthTokenContext";
import "../styles/home.css";

export default function Home() {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const { accessToken } = useAuthToken() || "";
  const [recentReviews, setRecentReviews] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const username = user
    ? user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/username`]
    : "";
  const navigate = useNavigate();

  const queryPopularMovies = async () => {
    const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.APP_REACT_API_KEY}&language=en-US&page=1`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: process.env.REACT_APP_API_AUTH_TOKEN,
      },
    };

    try {
      const response = await fetch(apiUrl, options);
      const data = await response.json();

      if (data.results) {
        if (isAuthenticated) {
          navigate("/app/search/popular", { state: { results: data } });
        } else {
          navigate(`/search/popular`, { state: { results: data } });
        }
      } else {
        console.error("Error in API call...");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchRecentReviews = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/recent/reviews`
      );

      if (response.ok) {
        const reviews = await response.json();
        const movieDetailsPromises = reviews.map(async (review) => {
          const movieResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${review.movieId}?api_key=${process.env.REACT_APP_API_KEY}`
          );
          if (movieResponse.ok) {
            const movieData = await movieResponse.json();
            return {
              ...review,
              posterPath: movieData.poster_path,
            };
          }
          return review;
        });

        const reviewsWithPosters = await Promise.all(movieDetailsPromises);
        setRecentReviews(reviewsWithPosters);
      } else {
        console.error("Fetch failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/user/${username}/favorites`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const favorites = await response.json();
        const favoritesPromises = favorites.map(async (favorite) => {
          const movieResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${favorite.movieId}?api_key=${process.env.REACT_APP_API_KEY}`
          );
          if (movieResponse.ok) {
            const movieData = await movieResponse.json();
            return {
              ...favorite,
              posterPath: movieData.poster_path,
            };
          }
          return favorite;
        });

        const favoritesWithPosters = await Promise.all(favoritesPromises);
        setUserFavorites(favoritesWithPosters);
      }
    } catch (error) {
      console.error("Error fetching user favorites: ", error);
    }
  };

  const navigateToMovieDetails = async (movieId) => {
    const movieDetails = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.REACT_APP_API_KEY}&append_to_response=credits`
    );
    const response = await movieDetails.json();
    navigate(`/search/${response.title}/${movieId}`, {
      state: { movieDetails: response },
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      fetchRecentReviews();
    } else {
      fetchUserFavorites();
    }
  }, []);

  useEffect(() => {}, [recentReviews, userFavorites]);

  const queryTopMovies = async () => {
    const apiUrl =
      "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: process.env.REACT_APP_API_AUTH_TOKEN,
      },
    };

    try {
      const response = await fetch(apiUrl, options);
      const data = await response.json();

      if (data.results) {
        if (isAuthenticated) {
          navigate(`/app/search/top`, { state: { results: data } });
        } else {
          navigate(`/search/top`, { state: { results: data } });
        }
      } else {
        console.error("Error in API call...");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="home">
      <div className="section-container">
        <div className="popular-movies-section">
          <div className="popular-movies-content">
            <div className="popular-movies-title-container">
              <h3 className="popular-movies-title">🎞️ Popular Movies 🎞️</h3>
            </div>
            <p className="popular-movies-body">
              Check out the most popular movies everyone's talking about.
            </p>
          </div>
          <div className="popular-movies-button-container">
            <button
              className="popular-movies-button"
              onClick={queryPopularMovies}
            >
              See more
            </button>
          </div>
        </div>
        <div className="top-rated-section">
          <div className="top-rated-content">
            <div className="top-rated-title-container">
              <h3 className="top-rated-title">⭐ Top Rated Movies ⭐</h3>
            </div>
            <p className="top-rated-body">
              For those looking to expand their movie knowledge, check out our
              top rated films of all time.
            </p>
          </div>
          <div className="top-rated-button-container">
            <button className="top-rated-button" onClick={queryTopMovies}>
              See more
            </button>
          </div>
        </div>
      </div>
      {isAuthenticated ? (
        <div className="home-user-selections">
          <div className="home-user-selections-container">
            <div className="user-selections-title-container">
              <h3 className="user-selections-title">
                🍿 Your Recent Favorites 🍿
              </h3>
            </div>
            <div className="user-selections-posters">
              {userFavorites.map((favorite) => (
                <div key={favorite.id} className="user-selections-poster">
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${favorite.posterPath}`}
                    alt={`${favorite.id} Poster`}
                    onClick={() => navigateToMovieDetails(favorite.movieId)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="home-user-selections">
          <div className="home-user-selections-container">
            <div className="user-selections-title-container">
              <h3 className="user-selections-title">
                {" "}
                🍿 Movies our users are talking about 🍿{" "}
              </h3>
            </div>
            <div className="user-selections-posters">
              {recentReviews.map((review) => (
                <div key={review.id} className="user-selections-poster">
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${review.posterPath}`}
                    alt={`${review.title} Poster`}
                    onClick={() => navigateToMovieDetails(review.movieId)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
