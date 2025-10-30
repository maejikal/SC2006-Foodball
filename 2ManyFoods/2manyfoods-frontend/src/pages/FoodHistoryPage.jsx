import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './FoodHistoryPage.css';

export default function FoodHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFoodHistory = async () => {
      setIsLoading(true);
      setError('');

      try {
        const username = sessionStorage.getItem('username');
        
        if (!username) {
          setError('Please log in to view your history');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/history/get?username=${username}`);
        const data = await response.json();
        
        if (response.ok) {
          const formattedHistory = data.history.map((item, index) => ({
            id: index + 1,
            restaurantId: item.restaurant_id,
            name: item.restaurant_name,
            image: item.image || '/assets/placeholder-restaurant.jpg',
            reviewed: false,
            rating: 0,
            visitedDate: item.visited_date
          }));
          
          setHistory(formattedHistory);
        } else {
          throw new Error(data.error || 'Failed to load history');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading food history:', error);
        setError('Network error. Please try again.');
        setIsLoading(false);
      }
    };

    loadFoodHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {Array.from({ length: 5 }, (_, i) => (
          <span 
            key={i} 
            className={`star ${i < rating ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleReviewClick = (restaurant) => {
    navigate('/account/review', {
      state: {
        restaurant: {
          id: restaurant.restaurantId,
          historyId: restaurant.id,
          name: restaurant.name,
          image: restaurant.image,
          isEdit: restaurant.reviewed,
          currentRating: restaurant.rating
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="foodHistoryPage">
        <Navbar />
        <div className="historySection">
          <p>Loading your food history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="foodHistoryPage">
        <Navbar />
        <div className="historySection">
          <p style={{ color: '#ff4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="foodHistoryPage">
      <Navbar />
      
      <div className="historySection">
        <h1>Food History</h1>

        {history.length === 0 ? (
          <p>No food history yet! Start exploring restaurants.</p>
        ) : (
          <ul className="historyList">
            {history.map((item) => (
              <li key={item.id}>
                <div className="restaurantInfo">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <span>{item.name}</span>
                    <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                      {formatDate(item.visitedDate)}
                    </small>
                    {item.reviewed ? (
                      renderStars(item.rating)
                    ) : (
                      <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                        Not reviewed yet
                      </small>
                    )}
                  </div>
                </div>

                <button onClick={() => handleReviewClick(item)}>
                  {item.reviewed ? 'Edit Review' : 'Write Review'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
