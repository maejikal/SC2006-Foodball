import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import StarRating from '../components/StarRating';
import foodIcon from '../assets/Icons/food.png';
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
          let formattedHistory = data.history.map((item, index) => ({
            id: index + 1,
            restaurantId: item.restaurant_id,
            name: item.restaurant_name,
            image: item.image || foodIcon,
            reviewed: false,
            rating: 0,
            visitedDate: item.visited_date
          }));
          
          // Sort by date (newest first)
          formattedHistory.sort((a, b) => new Date(b.visitedDate) - new Date(a.visitedDate));
          
          // Then deduplicate (keeps first occurrence = latest visit)
          const seen = {};
          formattedHistory = formattedHistory.filter(item => {
            if (!seen[item.restaurantId]) {
              seen[item.restaurantId] = true;
              return true;
            }
            return false;
          });
          
          // Load review status directly
          const updatedHistory = await Promise.all(
            formattedHistory.map(async (item) => {
              try {
                const response = await fetch(
                  `http://localhost:8080/api/review/get?username=${username}&restaurant_id=${item.restaurantId}`
                );
                console.log(`Checking review for ${item.name}:`, response.status, response.ok);
                
                const data = await response.json();
                console.log(`Response data for ${item.name}:`, data);
                
                // If response is 200 AND data.success is true, mark as reviewed
                if (response.status === 200 && data.success) {
                  return {
                    ...item,
                    reviewed: true,
                    rating: data.review?.rating || 0
                  };
                }
                
                // If response is 404, it means no review exists
                if (response.status === 404) {
                  return { ...item, reviewed: false, rating: 0 };
                }
                
                // For any other status, treat as not reviewed
                return { ...item, reviewed: false, rating: 0 };
              } catch (error) {
                console.error(`Error checking review for ${item.name}:`, error);
                return { ...item, reviewed: false, rating: 0 };
              }
            })
          );
          
          console.log('Final history:', updatedHistory);
          setHistory(updatedHistory);
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
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, reloading history');
        loadFoodHistory();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };


  const handleReview = (item) => {
    navigate('/account/review', {
      state: {
        restaurant: {
          id: item.restaurantId,
          name: item.name,
          image: item.image,
          isEdit: item.reviewed
        }
      }
    });
  };


  return (
    <div className="foodHistoryPage">
      <Navbar />
      <div className="historySection">
        <h1>Food History</h1>
        
        {isLoading ? (
          <p>Loading your food history...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : history.length === 0 ? (
          <p>No food history yet! Start exploring restaurants.</p>
        ) : (
          <ul className="historyList">
            {history.map((item) => (
              <li key={item.id}>
                <div className="restaurantInfo">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <span>{item.name}</span>
                    {item.reviewed && <StarRating rating={item.rating} disabled={true} size={18} />}
                    <small>{formatDate(item.visitedDate)}</small>
                  </div>
                </div>
                <button onClick={() => handleReview(item)}>
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
