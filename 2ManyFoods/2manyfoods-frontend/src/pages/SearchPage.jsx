import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './SearchPage.css';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get location data from navigation state
  const groupId = location.state?.groupId;
  const groupName = location.state?.groupName;
  const selectedLocation = location.state?.location;
  const isGroupMode = !!groupId;
  
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Track if preferences have been modified from saved profile
  const [preferencesModified, setPreferencesModified] = useState(false);
  
  // Group voting state
  const [hasVoted, setHasVoted] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const mealCuisines = ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'];
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Load preferences and fetch initial recommendations
  useEffect(() => {
    const loadPreferencesAndFetch = async () => {
      setIsLoading(true);
      const username = localStorage.getItem('username');
      
      if (!username) {
        console.error('No username found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/account/${username}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (response.ok && data.preferences) {
          const prefs = data.preferences;
          if (prefs.rank1 && prefs.rank2 && prefs.rank3) {
            const cuisines = [
              prefs.rank1.toLowerCase(),
              prefs.rank2.toLowerCase(),
              prefs.rank3.toLowerCase()
            ];
            setSelectedCuisines(cuisines);
            
            const budget = data.budget || 50;
            setPriceRange(budget);
            
            // Auto-fetch initial recommendations with profile preferences and location
            await fetchRestaurants(cuisines, budget);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        setIsLoading(false);
      }
    };

    loadPreferencesAndFetch();
  }, [isGroupMode, groupId]);

  const fetchRestaurants = async (cuisines = selectedCuisines, price = priceRange) => {
    try {
      const username = localStorage.getItem('username');
      
      if (isGroupMode) {
        // Group mode: call /foodball/{groupId} with location
        const queryParams = selectedLocation 
          ? `?location=${encodeURIComponent(selectedLocation.name)}`
          : '';
        
        const response = await fetch(
          `http://localhost:8080/foodball/${groupId}${queryParams}`,
          { method: 'GET' }
        );
        
        const data = await response.json();
        
        if (response.ok && data.recommendations) {
          setRestaurants(data.recommendations);
        } else {
          console.error('Failed to get group recommendations');
        }
      } else {
        // Individual mode: call /foodball/{username} with location
        const queryParams = selectedLocation 
          ? `?location=${encodeURIComponent(selectedLocation.name)}`
          : '';
        
        const response = await fetch(
          `http://localhost:8080/foodball/${username}${queryParams}`,
          { method: 'GET' }
        );
        
        const data = await response.json();
        
        if (response.ok && data.recommendations) {
          setRestaurants(data.recommendations);
        } else {
          console.error('Failed to get recommendations');
        }
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // Poll for voting status in group mode
  useEffect(() => {
    if (!isGroupMode || !hasVoted) return;

    const pollVotingStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/refresh/${groupId}`);
        const data = await response.json();

        if (data.allVotesIn || data.votingComplete) {
          setIsPolling(false);
          navigate('/result', { 
            state: { 
              groupId: groupId,
              groupName: groupName,
              winner: data.winner 
            } 
          });
        }
      } catch (error) {
        console.error('Error polling votes:', error);
      }
    };

    setIsPolling(true);
    const interval = setInterval(pollVotingStatus, 3000);

    return () => clearInterval(interval);
  }, [groupId, hasVoted, isGroupMode, navigate, groupName]);

  const getCuisineRank = (cuisine) => {
    const index = selectedCuisines.indexOf(cuisine.toLowerCase());
    return index !== -1 ? index + 1 : null;
  };

  const toggleCuisine = (cuisine) => {
    if (isGroupMode && hasVoted) return;
    
    const lowerCuisine = cuisine.toLowerCase();
    
    if (selectedCuisines.includes(lowerCuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== lowerCuisine));
    } else {
      if (selectedCuisines.length >= 3) {
        setSelectedCuisines([lowerCuisine, ...selectedCuisines.slice(0, 2)]);
      } else {
        setSelectedCuisines([lowerCuisine, ...selectedCuisines]);
      }
    }
    
    // Mark preferences as modified
    if (!isGroupMode) {
      setPreferencesModified(true);
    }
  };

  const handlePriceChange = (e) => {
    setPriceRange(Number(e.target.value));
    
    // Mark preferences as modified
    if (!isGroupMode) {
      setPreferencesModified(true);
    }
  };

  const handleUpdateRecommendations = async () => {
    if (selectedCuisines.length !== 3) {
      alert('Please select exactly 3 cuisines');
      return;
    }

    setIsSaving(true);
    
    try {
      await fetchRestaurants(selectedCuisines, priceRange);
      
      if (!isGroupMode) {
        alert('Recommendations updated! Preferences will be saved when you add a restaurant to history.');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      alert('Failed to update recommendations. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    if (isGroupMode && hasVoted) return;
    setSelectedRestaurant(restaurant);
  };

  const handleConfirmRestaurant = () => {
    if (!selectedRestaurant) {
      alert('Please select a restaurant first!');
      return;
    }
    setShowConfirmModal(true);
  };

  const savePreferencesToProfile = async () => {
    const username = localStorage.getItem('username');
    
    const requestBody = {
      username: username,
      cuisine_preferences: {
        rank1: capitalize(selectedCuisines[0]),
        rank2: capitalize(selectedCuisines[1]),
        rank3: capitalize(selectedCuisines[2])
      },
      budget: priceRange
    };

    try {
      const response = await fetch('http://localhost:8080/account/cuisine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save preferences');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  };

  const handleVoteOrSave = async () => {
    const username = localStorage.getItem('username');
    
    try {
      if (isGroupMode) {
        // Group mode: submit vote
        const response = await fetch(`http://localhost:8080/foodball/${groupId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            restaurant_id: selectedRestaurant._id
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setHasVoted(true);
          setShowConfirmModal(false);
          alert('Vote submitted! Waiting for others...');
          
          if (data.allVotesIn || data.votingComplete) {
            navigate('/result', { 
              state: { 
                groupId: groupId,
                groupName: groupName,
                winner: data.winner 
              } 
            });
          }
        } else {
          throw new Error(data.error || 'Failed to submit vote');
        }
      } else {
        // Individual mode: save preferences first, then add to history
        
        // Save preferences to profile if they were modified
        if (preferencesModified) {
          const prefsSaved = await savePreferencesToProfile();
          if (!prefsSaved) {
            alert('Warning: Preferences could not be saved, but restaurant will still be added to history.');
          }
        }
        
        // Add restaurant to history
        const response = await fetch('http://localhost:8080/api/history/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            restaurant: {
              id: selectedRestaurant._id,
              name: selectedRestaurant.name,
              address: selectedRestaurant.location?.address || '',
              price_range: selectedRestaurant.price_range,
              cuisine: selectedRestaurant.cuisine
            }
          })
        });

        if (response.ok) {
          alert(preferencesModified 
            ? 'Restaurant added to history and preferences saved!' 
            : 'Restaurant added to history!');
          setPreferencesModified(false);
        } else {
          throw new Error('Failed to add to history');
        }
        
        setShowConfirmModal(false);
        setSelectedRestaurant(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${isGroupMode ? 'vote' : 'save'}. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="searchPage">
        <Navbar />
        <div className="searchContent">
          <p>Loading your preferences and recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="searchPage">
      <Navbar />
      
      <div className="searchContent">
        <div className="searchTop">
          {/* Map Container - Shows selected location */}
          <div className="mapContainer">
            {selectedLocation ? (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#1e2a3a'
              }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  📍 {selectedLocation.name}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#999' }}>
                  Searching restaurants near this location
                </p>
              </div>
            ) : (
              <img 
                src="https://via.placeholder.com/600x350?text=No+Location+Selected" 
                alt="Map" 
              />
            )}
          </div>

          {/* Filters Section */}
          <div className="filtersSection">
            <h3>
              {isGroupMode 
                ? `${groupName} - Select Your Preferences` 
                : 'Customize Your Search'}
            </h3>
            
            {isGroupMode && hasVoted && (
              <p style={{ color: '#90ee90', fontWeight: 'bold' }}>
                ✓ Vote submitted! Waiting for others...
                {isPolling && ' (Checking votes...)'}
              </p>
            )}
            
            {!isGroupMode && preferencesModified && (
              <p style={{ color: '#f4a460', fontSize: '0.85rem', fontStyle: 'italic' }}>
                * Preferences will be saved when you add a restaurant to history
              </p>
            )}

            {/* Cuisine Tags */}
            <div className="cuisineTags">
              {mealCuisines.map((cuisine) => {
                const rank = getCuisineRank(cuisine);
                return (
                  <button
                    key={cuisine}
                    className={`cuisineTag ${rank ? 'selected' : ''} ${
                      isGroupMode && hasVoted ? 'disabled' : ''
                    }`}
                    onClick={() => toggleCuisine(cuisine)}
                    disabled={isGroupMode && hasVoted}
                  >
                    {capitalize(cuisine)}
                    {rank && <span className="rankBadge">{rank}</span>}
                  </button>
                );
              })}
            </div>

            {/* Price Slider */}
            <div className="priceSliderSection">
              <h3>Budget: ${priceRange}</h3>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={priceRange}
                onChange={handlePriceChange}
                className="slider"
                disabled={isGroupMode && hasVoted}
              />
              <div className="priceLabels">
                <span>$10</span>
                <span>$100</span>
              </div>
            </div>

            {/* Confirm Button */}
            <button 
              onClick={handleUpdateRecommendations}
              disabled={isSaving || selectedCuisines.length !== 3 || (isGroupMode && hasVoted)}
              className="confirmBtn"
            >
              {isSaving ? 'Loading...' : 'update recommendations'}
            </button>
          </div>
        </div>

        {/* Restaurant List */}
        {restaurants.length > 0 ? (
          <div className="restaurantList">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className={`restaurantCard ${
                  selectedRestaurant?._id === restaurant._id ? 'selected' : ''
                }`}
                onClick={() => handleRestaurantClick(restaurant)}
              >
                <img 
                  src={restaurant.image || 'https://via.placeholder.com/150'} 
                  alt={restaurant.name}
                  className="restaurantImage"
                />
                <div className="restaurantInfo">
                  <h3>{restaurant.name}</h3>
                  <p className="address">{restaurant.location?.address || 'Address not available'}</p>
                  <p className={`price ${
                    restaurant.price_range <= 30 ? 'low' : 
                    restaurant.price_range <= 60 ? 'medium' : 'high'
                  }`}>
                    ${restaurant.price_range}
                  </p>
                  <p className="status">
                    {isGroupMode && !hasVoted ? 'Click to vote' : 
                     isGroupMode && hasVoted ? 'Voting closed' :
                     'Click to add to history'}
                  </p>
                </div>
              </div>
            ))}
            
            {selectedRestaurant && !hasVoted && (
              <button 
                onClick={handleConfirmRestaurant}
                className="confirmBtn"
              >
                {isGroupMode ? 'confirm vote' : 'add to history'}
              </button>
            )}
          </div>
        ) : (
          <div className="restaurantList">
            <p>No recommendations found. Try adjusting your preferences!</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modalOverlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{isGroupMode ? 'Confirm Your Vote' : 'Add to History'}</h2>
            <p><strong>{selectedRestaurant.name}</strong></p>
            <p>
              {isGroupMode 
                ? 'Cast your vote for this restaurant?' 
                : preferencesModified
                  ? 'This restaurant will be added to your food history and your preferences will be saved.'
                  : 'This restaurant will be added to your food history.'
              }
            </p>
            <div className="modalButtons">
              <button onClick={handleVoteOrSave} className="confirmBtn">
                Confirm
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="cancelBtn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
