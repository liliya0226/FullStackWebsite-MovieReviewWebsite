import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthToken } from "../AuthTokenContext";
import EditReviewModal from "./EditReviewModal";
import "../styles/profile.css";

export default function Profile() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { accessToken } = useAuthToken();
  const username = user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/username`];
  const [favorites, setFavorites] = useState([]);
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {}, [reviews]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/favorites/${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        console.error("Failed to fetch favorites", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching favorites: ", error);
    }
  };

  const fetchMovieDetails = async (favorites) => {
    try {
      const movieDetailPromises = favorites.map(async (favorite) => {
        const query = encodeURIComponent(favorite.movieId);
        const apiUrl = `https://api.themoviedb.org/3/movie/${query}?api_key=${process.env.REACT_APP_API_KEY}&append_to_response=credits`;
        const response = await fetch(apiUrl);
        return response.json();
      });

      const movieDetails = await Promise.all(movieDetailPromises);
      setMovies(movieDetails);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  const fetchReviews = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/reviews/${username}/profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setReviews(data);
    }
  };

  const deleteReview = async (id) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/reviews/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      setReviews(reviews.filter((review) => review.id !== id));
    }
  };

  const handleEditClick = (review) => {
    setSelectedReview({ ...review, accessToken });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const handleSaveReview = async (updatedReview) => {
    setReviews((prevReviews) =>
      prevReviews.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    );

    await fetch(
      `${process.env.REACT_APP_API_URL}/reviews/${updatedReview.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${updatedReview.accessToken}`,
        },
        body: JSON.stringify({
          score: updatedReview.score,
          body: updatedReview.body,
          title: updatedReview.title,
          username: username,
        }),
      }
    );
  };

  useEffect(() => {
    fetchFavorites();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      fetchMovieDetails(favorites);
    }
  }, [favorites]);

  const navigateToFavorites = () => {
    navigate(`/app/${username}/favorites`, {
      state: { favorites: movies, isEditing: false },
    });
  };

  const navigateToEditFavorites = () => {
    navigate(`/app/${username}/favorites`, {
      state: { favorites: movies, isEditing: true },
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-user-info">
        <div className="profile-user-username">
          <strong>👤 Username:</strong> {username}
        </div>
        <div className="profile-user-email">
          <strong>📧 Email:</strong> {user.email}
        </div>
        <div className="profile-user-isVerified">
          <strong>✅ Verified:</strong> {user.email_verified.toString()}
        </div>
        <div className="profile-user-createdAt">
          <strong>📅 Member Since:</strong> {user.updated_at.split("T")[0]}
        </div>
      </div>
      <div className="profile-favorites-reviews-container">
        <div className="favorites-container">
          <div className="favorites-header">
            <strong>Favorites:</strong>
          </div>
          <div className="favorites-items">
            {movies.length > 0 ? (
              movies.slice(0, 3).map((movie, index) => (
                <div key={index} className="favorites-item">
                  <img
                    className="favorite-image"
                    onClick={() =>
                      navigate(`/app/favorites/${movie.id}`, {
                        state: { movieDetails: movie },
                      })
                    }
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={`${movie.title} poster`}
                  />
                </div>
              ))
            ) : (
              <h3> You have no favorite movies selected. </h3>
            )}
          </div>
          <div className="favorites-button-container">
            <button className="favorites-button" onClick={navigateToFavorites}>
              See all
            </button>
            <button
              className="favorites-button edit-button"
              onClick={navigateToEditFavorites}
            >
              Edit Favorites
            </button>
          </div>
        </div>
        <div className="profile-reviews-container">
          <div className="profile-reviews-title-container">
            <h2 className="profile-reviews-title">Reviews</h2>
          </div>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="profile-review-card">
                <h3 className="review-title">{review.title}</h3>
                <p className="review-score">
                  <strong>⭐</strong>
                  {review.score}/10
                </p>
                <p className="review-author">
                  <strong>Movie:</strong> {review.moviename}
                </p>
                <p className="review-body">{review.body}</p>
                <div className="profile-review-button-container">
                  <button
                    className="profile-review-edit-button"
                    onClick={() => handleEditClick(review)}
                  >
                    Edit review
                  </button>
                  <button
                    className="profile-review-delete-button"
                    onClick={() => deleteReview(review.id)}
                  >
                    Delete review
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="profile-reviews-no-review-message">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </div>
      {selectedReview && (
        <EditReviewModal
          review={selectedReview}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSaveReview}
        />
      )}
    </div>
  );
}
