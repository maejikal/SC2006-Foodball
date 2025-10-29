import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './SearchPage.css';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const groupName = location.state?.groupName;
  const selectedLocation = location.state?.location;
  const isIndividual = location.state?.isIndividual || false;
  
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Track if preferences have been modified from saved profile
  const [preferencesModified, setPreferencesModified] = useState(false);
  
  // Group voting state (for real groups)
  const [hasVoted, setHasVoted] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const mealCuisines = ['western', 'italian', 'chinese', 'indonesian', 'indian', 'japanese', 'korean'];

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
            var tags = {
      "bar_and_grill": 'western', 'italian_restaurant': "italian_restaurant",
      'chinese_restaurant': "chinese", 'indonesian_restaurant': "indonesian",
      'indian_restaurant': "indian", 'japanese_restaurant': "japanese", 'korean_restaurant': "korean"
    };
            const cuisines = [
              tags[prefs.rank1.toLowerCase()],
              tags[prefs.rank2.toLowerCase()],
              tags[prefs.rank3.toLowerCase()]
            ];
            setSelectedCuisines(cuisines);
            
            const budget = data.budget || 50;
            setPriceRange(budget);
            
            // Auto-fetch initial recommendations
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
  }, [groupName]);

  const fetchRestaurants = async (cuisines = selectedCuisines, price = priceRange) => {
    try {
      // Call /foodball/{groupName} with location
      // Backend handles both real groups and individual users (username as groupName)
      const locationParam = selectedLocation?.name || 'Default Location';
      var cuisine_tag = ["","",""];
      var tags = {
      'western': "bar_and_grill", 'italian': "italian_restaurant",
      'chinese': "chinese_restaurant", 'indonesian': "indonesian_restaurant",
      'indian': "indian_restaurant", 'japanese': "japanese_restaurant", 'korean': "korean_restaurant"
    };
    for (let i=0;i<cuisines.length;i++){
      cuisine_tag[i] = tags[cuisines[i]];
    }
      const response = await fetch(
        `http://localhost:8080/foodball/${groupName}?long=${selectedLocation['latLng']['lng']}&lat=${selectedLocation['latLng']['lat']}&cuisines=${cuisine_tag}&username=${localStorage.getItem('username')}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        // Backend returns recommendations directly or as array
        const recs = Array.isArray(data) ? data : data.recommendations || [];
        setRestaurants(recs);
      } else {
        console.error('Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // Poll for voting status (only for real groups, not individuals)
  useEffect(() => {
    if (isIndividual || !hasVoted) return;

    const pollVotingStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/refresh/${groupName}`);
        const data = await response.json();

        if (data.allVotesIn || data.votingComplete) {
          setIsPolling(false);
          navigate('/result', { 
            state: { 
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
  }, [groupName, hasVoted, isIndividual, navigate]);

  const getCuisineRank = (cuisine) => {
    const index = selectedCuisines.indexOf(cuisine.toLowerCase());
    return index !== -1 ? index + 1 : null;
  };

  const toggleCuisine = (cuisine) => {
    if (!isIndividual && hasVoted) return;
    
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
    
    // Mark preferences as modified (for individuals only)
    if (isIndividual) {
      setPreferencesModified(true);
    }
  };

  const handlePriceChange = (e) => {
    setPriceRange(Number(e.target.value));
    
    // Mark preferences as modified (for individuals only)
    if (isIndividual) {
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
      
      if (isIndividual) {
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
    if (!isIndividual && hasVoted) return;
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
    
    const tags = {
      'western': "bar_and_grill", 
      'italian': "italian_restaurant",
      'chinese': "chinese_restaurant", 
      'indonesian': "indonesian_restaurant",
      'indian': "indian_restaurant", 
      'japanese': "japanese_restaurant", 
      'korean': "korean_restaurant"
    };

    const requestBody = {
      username: username,
      newValue: {
        rank1: tags[selectedCuisines[0]],
        rank2: tags[selectedCuisines[1]],
        rank3: tags[selectedCuisines[2]]
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
      if (!isIndividual) {
        // Group mode: submit vote
        const response = await fetch(`http://localhost:8080/foodball/${groupName}/vote`, {
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
              id: selectedRestaurant.id,
              name: selectedRestaurant.displayName?.text,
              address: selectedRestaurant.shortFormattedAddress || '',
              cuisine: selectedRestaurant.types
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
      alert(`Failed to ${isIndividual ? 'save' : 'vote'}. Please try again.`);
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
          {/* Map Container */}
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
              {isIndividual 
                ? 'Customize Your Search' 
                : `${groupName} - Select Your Preferences`}
            </h3>
            
            {!isIndividual && hasVoted && (
              <p style={{ color: '#90ee90', fontWeight: 'bold' }}>
                ✓ Vote submitted! Waiting for others...
                {isPolling && ' (Checking votes...)'}
              </p>
            )}
            
            {isIndividual && preferencesModified && (
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
                      !isIndividual && hasVoted ? 'disabled' : ''
                    }`}
                    onClick={() => toggleCuisine(cuisine)}
                    disabled={!isIndividual && hasVoted}
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
                disabled={!isIndividual && hasVoted}
              />
              <div className="priceLabels">
                <span>$10</span>
                <span>$100</span>
              </div>
            </div>

            {/* Update Button */}
            <button 
              onClick={handleUpdateRecommendations}
              disabled={isSaving || selectedCuisines.length !== 3 || (!isIndividual && hasVoted)}
              className="confirmBtn"
            >
              {isSaving ? 'Loading...' : 'update recommendations'}
            </button>
          </div>
        </div>

        {/* Restaurant List */}
        {restaurants.length > 0 ? (
          <div className="restaurantList">
            {restaurants.map((restaurant, index) => {
              const isSelected = selectedRestaurant?._id === restaurant._id;

              return (
                <div
                  key={restaurant.id || index}
                  className={`restaurantCard ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <img
                    src={restaurant.image || 'https://via.placeholder.com/150'}
                    alt={restaurant.displayName?.text}
                    className="restaurantImage"
                  />
                  <div className="restaurantInfo">
                    <h3>{restaurant.displayName?.text}</h3>
                    <p className="address">{restaurant.shortFormattedAddress || 'Address not available'}</p>
                    <p className="status">
                      {!isIndividual && !hasVoted ? 'Click to vote' : 
                       !isIndividual && hasVoted ? 'Voting closed' :
                       'Click to add to history'}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {selectedRestaurant && (isIndividual || !hasVoted) && (
              <button 
                onClick={handleConfirmRestaurant}
                className="confirmBtn"
              >
                {isIndividual ? 'add to history' : 'confirm vote'}
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
            <h2>{isIndividual ? 'Add to History' : 'Confirm Your Vote'}</h2>
            <p><strong>{selectedRestaurant.name}</strong></p>
            <p>
              {!isIndividual 
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
