import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import "../styles/reviewForm.css";

export default function MovieReviewForm() {
  const { movie, location } = useLocation().state || {};
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { accessToken } = useAuthToken();
  const [review, setReview] = useState({
    username: user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/username`],
    title: "",
    body: "",
    score: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReview((prevReview) => ({
      ...prevReview,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, body, score } = review;

    if (title.length === 0 || title.length > 255) {
      alert("Title must be greater than 0 and less than 255 characters.");
      return;
    }

    if (body.length === 0 || body.length > 255) {
      alert("Body must be greater than 0 and less than 255 characters.");
      return;
    }

    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10) {
      alert("Score must be a valid integer between 0 and 10.");
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/create/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        username: review.username,
        title: review.title,
        body: review.body,
        score: review.score,
        movieId: movie.id,
        moviename: movie.title,
      }),
    });
    navigate(-1, { state: { movieDetails: movie } });
  };

  return (
    <div className="review-form-container">
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="movie-poster">
            <img
              src={`https://image.tmdb.org/t/p/w500/${movie.poster}`}
              alt={`${movie.title} Poster`}
            />
          </div>
          <div className="form-fields">
            <div className="review-form-title-container">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={review.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="review-form-score-container">
              <label htmlFor="score">Score</label>
              <input
                type="number"
                id="score"
                name="score"
                value={review.score}
                onChange={handleInputChange}
                min="0"
                max="10"
                required
              />
            </div>
            <div className="review-form-body-container">
              <label htmlFor="body">Your Review</label>
              <textarea
                id="body"
                name="body"
                value={review.body}
                onChange={handleInputChange}
                rows="6"
                required
              />
            </div>
            <button type="submit" className="review-form-submit-button">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
