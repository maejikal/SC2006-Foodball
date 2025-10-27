import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './FoodHistoryPage.css';

export default function FoodHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Load food history from backend
  useEffect(() => {
    const loadFoodHistory = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const username = localStorage.getItem('username');
        
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
            visitedDate: item.visited_date,
            cuisine: item.cuisine,
            address: item.address,
            priceRange: item.price_range
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

  const sortedHistory = [...history].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.visitedDate) - new Date(a.visitedDate);
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < rating;
      return (
        <svg
          key={i}
          className={`star ${isFilled ? 'filled' : 'empty'}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            fill: isFilled ? '#ffd700' : '#e0e0e0',
            marginRight: '2px'
          }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    });
  };

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
          <h1>Food history / Foodprints</h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
            Loading your food history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="foodHistoryPage">
        <Navbar />
        <div className="historySection">
          <h1>Food history / Foodprints</h1>
          <div 
            className="errorMessage" 
            style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="foodHistoryPage">
      <Navbar />
      <div className="historySection">
        <h1>Food history / Foodprints</h1>

        {/* Sort Options */}
        <div className="sortOptions" style={{ marginBottom: '1rem' }}>
          <label>Sort by: </label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rating</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
              No food history yet!
            </p>
            <p style={{ color: '#999', marginTop: '0.5rem' }}>
              Start exploring restaurants and they'll appear here.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem' }}
            >
              Discover Restaurants
            </button>
          </div>
        ) : (
          <ul className="historyList">
            {sortedHistory.map((item) => (
              <li key={item.id}>
                <div className="restaurantInfo">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <span>{item.name}</span>
                    <div className="restaurantMeta">
                      <small style={{ color: '#666' }}>
                        {formatDate(item.visitedDate)}
                      </small>
                      {item.cuisine && (
                        <small style={{ color: '#999', marginLeft: '0.5rem' }}>
                          • {item.cuisine}
                        </small>
                      )}
                    </div>
                    <div className="stars">
                      {item.reviewed ? (
                        renderStars(item.rating)
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.9rem' }}>
                          Not reviewed yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleReviewClick(item)}>
                  {item.reviewed ? 'Edit Review' : 'Review'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
