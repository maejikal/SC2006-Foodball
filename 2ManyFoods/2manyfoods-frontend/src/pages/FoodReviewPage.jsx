import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './FoodReviewPage.css';

export default function FoodReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get restaurant data from FoodHistoryPage
  const restaurantData = location.state?.restaurant;

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [file, setFile] = useState(null); //stores the uploaded file
  const [filePreview, setFilePreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // loading existing review (for edit)
  useEffect(() => {
    if (!restaurantData) {
      navigate('/account/history');
      return;
    }

    if (restaurantData.isEdit) {
      const loadExistingReview = async () => {
        setIsLoading(true);
        
        try {

          //Api call

          setTimeout(() => {
            setRating(restaurantData.currentRating || 0);
            setReview(''); // Load existing review text from backend
            setIsLoading(false);
          }, 500);
          
        } catch (error) {
          console.error('Error loading review:', error);
          setError('Failed to load existing review');
          setIsLoading(false);
        }
      };
      
      loadExistingReview();
    }
  }, [restaurantData, navigate]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');
    
    if (selectedFile) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
      const validTypes = [...validImageTypes, ...validVideoTypes];
      
      if (!validTypes.includes(selectedFile.type)) {
        setFileError('Please upload a valid image (JPEG, PNG, GIF) or video (MP4, MOV, AVI)');
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

  // save review to backend
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      
      //Api Call

      setTimeout(() => {
        setIsSaving(false);
        setSuccessMessage(restaurantData.isEdit ? 'Review updated successfully!' : 'Review submitted successfully!');
        
        setTimeout(() => {
          navigate('/account/history');
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Network error. Please try again.');
      setIsSaving(false);
    }
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
          <h1>{restaurantData.isEdit ? 'Edit Review' : 'Review'}</h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="reviewPage">
      <Navbar />
      <div className="reviewContent">
        <h1>{restaurantData.isEdit ? 'Edit Review' : 'Review'}</h1>
        
        {/* Restaurant Info */}
        <div className="restaurantInfo">
          <img 
            src={restaurantData.image} 
            alt={restaurantData.name} 
            className="restaurantImage" 
          />
          <span className="restaurantName">{restaurantData.name}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="errorMessage" 
            style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div 
            className="successMessage" 
            style={{
              color: 'green',
              backgroundColor: '#d4edda',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Star Rating with SVG */}
        <div className="starRating">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            const isFilled = ratingValue <= (hover || rating);
            
            return (
              <label key={ratingValue}>
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                  style={{ display: 'none' }}
                  disabled={isSaving}
                />
                <svg
                  className={`star ${isFilled ? 'filled' : 'empty'}`}
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  onMouseEnter={() => !isSaving && setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    fill: isFilled ? '#ffd700' : '#e0e0e0',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                > 
                  {/*star shape path*/} 
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /> 
                </svg> 
              </label>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Share your review of the eatery (minimum 10 characters)"
            rows={8}
            value={review}
            onChange={(e) => {
              setReview(e.target.value);
              setError('');
            }}
            disabled={isSaving}
            maxLength={1000}
          />
          {/*character counter*/}
          <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}> 
            {review.length}/1000 characters
          </small>

          <label className="fileUploadLabel">
            Add photos/videos (optional, max 10MB):
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/mov,video/avi"
              onChange={handleFileUpload}
              disabled={isSaving}
            />
          </label>
          
          {/* File Error */}
          {fileError && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {fileError}
            </p>
          )}

          {/* File Preview */}
          {filePreview && (
            <div className="filePreview" style={{ marginTop: '1rem' }}>
              {file && file.type.startsWith('video/') ? (
                <video src={filePreview} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
              ) : (
                <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
              )}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSaving || !!fileError}
          >
            {isSaving ? 'Submitting...' : (restaurantData.isEdit ? 'Update Review' : 'Submit Review')}
          </button>
        </form>
      </div>
    </div>
  );
}