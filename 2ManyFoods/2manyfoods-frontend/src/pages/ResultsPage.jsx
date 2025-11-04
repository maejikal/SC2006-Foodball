import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import StarRating from '../components/StarRating';
import './ResultsPage.css';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupName, winner } = location.state || {};
  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const isIndividual = !groupName;

  useEffect(() => {
    if (winner && winner.id) {
      fetchReviews();
    }
  }, [winner]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`http://localhost:8080/api/review/restaurant/${winner.id}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setAverageRating(data.average_rating);
        setTotalReviews(data.total_reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const renderStars = (rating) => {
    return <StarRating rating={rating} setRating={() => {}} size={16} disabled={true} />;
  };

  if (!winner) {
    return (
      <div className="resultsPage">
        <Navbar />
        <div className="resultsContent">
          <h1>Something went wrong. Please try again.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="resultsPage">
      <Navbar />
      <div className="resultsContent">
        <h1>{isIndividual ? 'Chosen food!' : 'We have a winner!'}</h1>
        <div className="resultCard">
          <div className="resultDetails">
            <h2>{winner.displayName?.text || winner.name || 'Restaurant'}</h2>
            <p>{winner.shortFormattedAddress || winner.vicinity || winner.formatted_address || 'Location'}</p>
            {!isIndividual && (
              <div className="groupInfo">
                <strong>Group:</strong> {groupName}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviewsSection">
          <div className="reviewsSectionTitle">
            <h3>Reviews for {winner.displayName?.text || winner.name || 'this restaurant'}</h3>
          </div>
          
          <button 
            className="reviewsToggle"
            onClick={() => setShowReviews(!showReviews)}
          >
            <div className="reviewsHeader">
              <span className="averageRating">
                {averageRating > 0 ? (
                  <>
                    <span className="stars">{renderStars(Math.round(averageRating))}</span>
                    <span className="ratingNumber">{averageRating}</span>
                  </>
                ) : (
                  'No ratings yet'
                )}
              </span>
              <span className="reviewCount">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <span className="toggleIcon">{showReviews ? '▲' : '▼'}</span>
          </button>

          {showReviews && (
            <div className="reviewsList">
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="reviewItem">
                    <div className="reviewTopSection">
                      <div className="reviewUserInfo">
                        <span className="reviewUsername">{review.username}</span>
                        <span className="reviewDate">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <span className="reviewRating">{renderStars(review.rating)}</span>
                    </div>
                    {review.comment && (
                      <p className="reviewComment">{review.comment}</p>
                    )}
                    {review.photo && (
                      <img 
                        src={review.photo} 
                        alt="Review" 
                        className="reviewPhotoThumbnail"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="noReviews">No reviews yet. Be the first to review!</p>
              )}
            </div>
          )}
        </div>

        <button onClick={() => navigate(isIndividual ? '/' : '/groups')}>
          {isIndividual ? 'back to home' : 'back to groups'}
        </button>
      </div>
    </div>
  );
}