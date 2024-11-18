import React, { useState } from "react";
import { useAuthToken } from "../AuthTokenContext";
import "../styles/modal.css";

export default function EditReviewModal({ review, isOpen, onClose, onSave }) {
  const [editedReview, setEditedReview] = useState(review);
  const { accessToken } = useAuthToken();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReview((prevReview) => ({
      ...prevReview,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/reviews/${review.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            score: editedReview.score,
            body: editedReview.body,
            title: editedReview.title,
          }),
        }
      );

      if (response.ok) {
        const updatedReview = await response.json();
        onSave(updatedReview);
        onClose();
      } else {
        console.error("Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Review</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={editedReview.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="body">Review</label>
            <textarea
              id="body"
              name="body"
              value={editedReview.body}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="score">Score</label>
            <input
              type="number"
              id="score"
              name="score"
              value={editedReview.score}
              onChange={handleInputChange}
              min="0"
              max="10"
              required
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
