import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './FoodReviewPage.css';

export default function FoodReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const restaurantData = location.state?.restaurant;

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Only try to load existing review if editing
    if (restaurantData && restaurantData.isEdit) {
      const loadExistingReview = async () => {
        setIsLoading(true);
        try {
          const username = localStorage.getItem('username');
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

  const validateForm = () => {
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return false;
    }

    if (!review.trim()) {
      setError('Please write a review');
      return false;
    }

    if (review.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const username = localStorage.getItem('username');
      
      const reviewData = {
        Username: username,
        EateryID: restaurantData.id,
        Rating: rating,
        Comment: review,
        Date: new Date().toISOString(),
        Photo: filePreview || ''
      };

      const endpoint = restaurantData.isEdit 
        ? 'http://localhost:8080/api/review/update'
        : 'http://localhost:8080/api/review/create';
      
      const method = 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
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
          navigate('/account/history');
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

  // Render SVG stars for rating
  const renderStars = (currentRating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const ratingValue = i + 1;
      const isFilled = ratingValue <= (hover || currentRating);
      return (
        <svg
          key={i}
          onClick={() => setRating(ratingValue)}
          onMouseEnter={() => setHover(ratingValue)}
          onMouseLeave={() => setHover(0)}
          width="40"
          height="40"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            fill: isFilled ? '#ffc107' : '#e4e5e9',
            cursor: 'pointer',
            marginRight: '4px'
          }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    });
  };

  if (!restaurantData) {
    return (
      <div className="reviewPage">
        <Navbar />
        <div className="reviewContent">
          <p>No restaurant data found. Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="reviewPage">
        <Navbar />
        <div className="reviewContent">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviewPage">
      <Navbar />
      <div className="reviewContent">
        <h1>{restaurantData.isEdit ? 'Edit Review' : 'Write a Review'}</h1>

        <div className="restaurantInfo">
          <img 
            src={restaurantData.image} 
            alt={restaurantData.name} 
            className="restaurantImage"
          />
          <h2 className="restaurantName">{restaurantData.name}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="starRating">
            {renderStars(rating)}
          </div>

          {/* Review Textarea */}
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience at this restaurant..."
            rows="6"
          />
          <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '-0.5rem' }}>
            {review.length} characters (min 10)
          </p>

          {/* File Upload */}
          <label className="fileUploadLabel">
            Add Photo or Video (Optional)
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
            />
          </label>
          {fileError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{fileError}</p>}
          
          {filePreview && (
            <div style={{ marginTop: '1rem', maxWidth: '300px' }}>
              {file && file.type.startsWith('video') ? (
                <video src={filePreview} controls style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <img src={filePreview} alt="Preview" style={{ width: '100%', borderRadius: '10px' }} />
              )}
            </div>
          )}

          {/* Error & Success Messages */}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {successMessage && <p style={{ color: '#4caf50' }}>{successMessage}</p>}

          {/* Submit Button */}
          <button type="submit" disabled={isSaving}>
            {isSaving 
              ? (restaurantData.isEdit ? 'Updating...' : 'Submitting...') 
              : (restaurantData.isEdit ? 'Update Review' : 'Submit Review')
            }
          </button>
        </form>
      </div>
    </div>
  );
}
