import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './FoodReviewPage.css';

export default function FoodReviewPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Review submitted successfully!');
    navigate('/account/history');
  };

  return (
    <div className="reviewPage">
      <Navbar />
      <div className="reviewContent">
        <h1>Review</h1>
        <div className="restaurantInfo">
          <img src="/images/mamma-mia.jpg" alt="restaurant" className="restaurantImage" />
          <span className="restaurantName">Mamma Mia Trattoria E Caffe</span>
        </div>

        <div className="starRating">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <label key={ratingValue}>
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                />
                <span
                  className={`star ${ratingValue <= (hover || rating) ? 'filled' : ''}`}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              </label>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Share your review of the eatery"
            rows={8}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          <label className="fileUploadLabel">
            Add photos/videos:
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}