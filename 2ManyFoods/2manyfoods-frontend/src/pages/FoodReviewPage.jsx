import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import StarRating from '../components/StarRating';
import './FoodReviewPage.css';

export default function FoodReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurantData = location.state?.restaurant;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!restaurantData) return;

    if (restaurantData.isEdit) {
      const loadExistingReview = async () => {
        setIsLoading(true);
        try {
          const username = sessionStorage.getItem('username');
          const response = await fetch(
            `http://localhost:8080/api/review/get?username=${username}&restaurant_id=${restaurantData.id}`
          );

          if (response.ok) {
            const data = await response.json();
            setRating(data.review.rating || 0);
            setReview(data.review.comment || '');
            if (data.review.photo) {
              setFilePreview(data.review.photo);
            }
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading review:', error);
          setError('Failed to load existing review');
          setIsLoading(false);
        }
      };

      loadExistingReview();
    }
  }, [restaurantData]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');

    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(selectedFile.type)) {
        setFileError('Please upload a valid image (JPEG, PNG, GIF)');
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setFileError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!review.trim()) {
      setError('Please write a review');
      return;
    }

    if (review.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    setIsSaving(true);

    try {
      const username = sessionStorage.getItem('username');
      const reviewData = {
        Username: username,
        Eatery_id: restaurantData.id,
        Rating: rating,
        Comment: review,
        Date: new Date().toISOString(),
        Photo: filePreview || ''
      };

      const endpoint = restaurantData.isEdit
        ? 'http://localhost:8080/api/review/update'
        : 'http://localhost:8080/api/review/create';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          restaurantData.isEdit
            ? 'Review updated successfully!'
            : 'Review submitted successfully!'
        );
        setTimeout(() => {
          window.location.href = '/account/history';
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }

      setIsSaving(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
      setIsSaving(false);
    }
  };

  if (!restaurantData) {
    return (
      <div className="reviewPage">
        <Navbar />
        <div className="reviewContent">
          <p>No restaurant data found. Please select a restaurant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviewPage">
      <Navbar />
      <div className="reviewContent">
        <h1>Write Your Review</h1>

        <div className="restaurantInfo">
          <img
            src={restaurantData.image}
            alt={restaurantData.name}
            className="restaurantImage"
          />
          <div className="restaurantName">{restaurantData.name}</div>
        </div>

        {isLoading && <p>Loading existing review...</p>}

        {error && <p className="errorMessage">{error}</p>}
        {successMessage && <p className="successMessage">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="starRating">
            <StarRating rating={rating} setRating={setRating} size={30} />
          </div>

          <textarea
            placeholder="Share your experience... (minimum 10 characters)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows="5"
          />

          <label className="fileUploadLabel">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </label>

          {fileError && <p className="errorMessage">{fileError}</p>}

          {filePreview && (
            <div>
              <img
                src={filePreview}
                alt="Preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '10px',
                  marginTop: '1rem'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : restaurantData.isEdit ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
