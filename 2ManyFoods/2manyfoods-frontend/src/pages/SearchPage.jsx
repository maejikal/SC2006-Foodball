import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import StarRating from '../components/StarRating';
import './SearchPage.css';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);
  
  // Get data from navigation state
  const groupName = location.state?.groupName;
  const groupId = location.state?.groupId;
  const selectedLocation = location.state?.location;
  const isIndividual = location.state?.isIndividual || false;
  
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hungerLevel, setHungerLevel] = useState(5);
  
  const [preferencesModified, setPreferencesModified] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [restaurantRatings, setRestaurantRatings] = useState({});

  const mealCuisines = ['western', 'italian', 'chinese', 'indonesian', 'indian', 'japanese', 'korean'];

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Load preferences and fetch initial recommendations
  useEffect(() => {
    const loadPreferencesAndFetch = async () => {
      setIsLoading(true);
      const username = sessionStorage.getItem('username');

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
            const tags = {
              "bar_and_grill": 'western', 
              'italian_restaurant': "italian",
              'chinese_restaurant': "chinese", 
              'indonesian_restaurant': "indonesian",
              'indian_restaurant': "indian", 
              'japanese_restaurant': "japanese", 
              'korean_restaurant': "korean"
            };
            const cuisines = [
              tags[prefs.rank1.toLowerCase()],
              tags[prefs.rank2.toLowerCase()],
              tags[prefs.rank3.toLowerCase()]
            ];
            setSelectedCuisines(cuisines);
            
            if (isIndividual) {
              await submitUserPreferencesToGroup(cuisines);
              await fetchRestaurants(cuisines);
            } else {
              await submitUserPreferencesToGroup(cuisines);
              await fetchRestaurants(cuisines);
            }
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        setIsLoading(false);
      }
    };

    loadPreferencesAndFetch();
  }, [groupName, isIndividual, selectedLocation]);

  const submitUserPreferencesToGroup = async (cuisines) => {
  try {
    if (!selectedLocation) {
      console.error('No location selected');
      return;
    }

    const username = sessionStorage.getItem('username');
    const tags = {
      'western': "bar_and_grill", 
      'italian': "italian_restaurant",
      'chinese': "chinese_restaurant", 
      'indonesian': "indonesian_restaurant",
      'indian': "indian_restaurant", 
      'japanese': "japanese_restaurant", 
      'korean': "korean_restaurant"
    };
    
    const cuisine_tags = cuisines.map(c => tags[c]);
    
    // Handle both nested and flat location structures
    const lat = selectedLocation.lat || selectedLocation?.['latLng']?.lat;
    const lng = selectedLocation.lng || selectedLocation?.['latLng']?.lng;
    
    if (!lat || !lng) {
      console.error('Invalid location coordinates:', { lat, lng });
      return;
    }
    
    await fetch(
      `http://localhost:8080/foodball/${groupName}?long=${lng}&lat=${lat}&cuisines=${cuisine_tags.join(',')}&username=${username}`,
      { method: 'GET' }
    );
  } catch (error) {
    console.error('Error submitting preferences:', error);
  }
};


  const fetchRestaurants = async (cuisines = selectedCuisines) => {
  try {
    if (!selectedLocation) {
      console.error('No location selected');
      return;
    }

    const tags = {
      'western': "bar_and_grill", 
      'italian': "italian_restaurant",
      'chinese': "chinese_restaurant", 
      'indonesian': "indonesian_restaurant",
      'indian': "indian_restaurant", 
      'japanese': "japanese_restaurant", 
      'korean': "korean_restaurant"
    };
    const cuisine_tag = cuisines.map(c => tags[c]);
    
    // Handle both nested and flat location structures
    const lat = selectedLocation.lat || selectedLocation?.['latLng']?.lat;
    const lng = selectedLocation.lng || selectedLocation?.['latLng']?.lng;
    
    if (!lat || !lng) {
      console.error('Invalid location coordinates:', { lat, lng });
      alert('Location coordinates not found. Please select a location again.');
      return;
    }
    
    const response = await fetch(
      `http://localhost:8080/foodball/${groupName}?long=${lng}&lat=${lat}&cuisines=${cuisine_tag}&username=${sessionStorage.getItem('username')}`,
      { method: 'GET' }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      const recs = Array.isArray(data) ? data : data.recommendations || [];
      setRestaurants(recs);
      
      // Fetch ratings for all restaurants
      recs.forEach(restaurant => {
        fetchRestaurantRating(restaurant.id);
      });
    } else {
      console.error('Failed to get recommendations');
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error);
  }
};

  const fetchRestaurantRating = async (restaurantId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/review/restaurant/${restaurantId}`);
      const data = await response.json();
      
      if (data.success) {
        setRestaurantRatings(prev => ({
          ...prev,
          [restaurantId]: {
            average: data.average_rating,
            count: data.total_reviews
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  // POLLING LOGIC - Navigate when finalVote exists
  useEffect(() => {
    if (isIndividual || !groupName) {
      return;
    }

    const pollVotingStatus = async () => {
      try {
        const username = sessionStorage.getItem('username');
        const response = await fetch(`http://localhost:8080/refresh/${groupName}`);
        const data = await response.json();

        if (response.ok) {
          if (data.recommendations && Array.isArray(data.recommendations)) {
            setRestaurants(data.recommendations);
          }

          // Navigate when finalVote exists AND haven't navigated yet
          if (data.finalVote && !hasNavigatedRef.current) {
            hasNavigatedRef.current = true;

            const restaurantsList = restaurants.length > 0 ? restaurants : data.recommendations || [];
            const winningRestaurant = restaurantsList.find(r => r.id === data.finalVote);
            await fetch('http://localhost:8080/api/history/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: username,
                groupName: groupName,
                restaurant: {
                  id: winningRestaurant.id,
                  name: winningRestaurant.displayName?.text || winningRestaurant.name,
                  address: winningRestaurant.shortFormattedAddress || winningRestaurant.vicinity || '',
                  cuisine: winningRestaurant.types || []
                }
              })
            });
            navigate('/result', {
              state: {
                groupName: groupName,
                winner: winningRestaurant || {
                  id: data.finalVote,
                  displayName: { text: 'Selected Restaurant' }
                },
                groupId: groupId
              }
            });

            return;
          }
        }
        else{
          setRestaurants(data.recommendations);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Poll immediately first
    pollVotingStatus();
    
    const interval = setInterval(pollVotingStatus, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isIndividual, groupName, navigate, groupId, restaurants]);

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
      // Fetch new restaurants
      await fetchRestaurants(selectedCuisines);
      
      // Save preferences to database for individual mode
      if (isIndividual && preferencesModified) {
        const prefsSaved = await savePreferencesToProfile();
        if (prefsSaved) {
          setPreferencesModified(false);
          alert('Recommendations updated and preferences saved!');
        } else {
          alert('Recommendations updated, but failed to save preferences.');
        }
      } else if (isIndividual) {
        alert('Recommendations updated!');
      } else {
        // For group mode, just update recommendations without saving to profile
        alert('Recommendations updated!');
      }
      
    } catch (error) {
      console.error('Error updating recommendations:', error);
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
    const username = sessionStorage.getItem('username');
    
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
      type:'cuisine',
      newValue: {
        rank1: tags[selectedCuisines[0]],
        rank2: tags[selectedCuisines[1]],
        rank3: tags[selectedCuisines[2]]
      },
      field: "preferences"
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
    const username = sessionStorage.getItem('username');
    
    try {
      if (isIndividual) {
        const response = await fetch(`http://localhost:8080/foodball/${groupName}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            restaurant_id: selectedRestaurant.id,
            hunger: hungerLevel
          })
        });

        const data = await response.json();

        if (response.ok) {
          if (preferencesModified) {
            const prefsSaved = await savePreferencesToProfile();
            if (!prefsSaved) {
              alert('Warning: Preferences could not be saved, but restaurant will still be added to history.');
            }
          }

          try {
            await fetch('http://localhost:8080/api/history/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: username,
                groupName: username,
                restaurant: {
                  id: selectedRestaurant.id,
                  name: selectedRestaurant.displayName?.text,
                  address: selectedRestaurant.shortFormattedAddress || '',
                  cuisine: selectedRestaurant.types
                }
              })
            });
          } catch (error) {
            console.error('Error saving to history:', error);
          }

          setShowConfirmModal(false);
          navigate('/result', {
            state: {
              winner: selectedRestaurant,
              groupName: null
            }
          });
        } else {
          throw new Error(data.error || 'Failed to submit vote');
        }
      } else {
        const response = await fetch(`http://localhost:8080/foodball/${groupName}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            restaurant_id: selectedRestaurant.id,
            hunger: hungerLevel
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setHasVoted(true);
          setShowConfirmModal(false);

          if (selectedCuisines.length === 3)
          {
            await savePreferencesToProfile();
          }
          
          if (data.finalVote) {
            const winningRestaurant = restaurants.find(r => r.id === data.finalVote);
            
            try {
              await fetch('http://localhost:8080/api/history/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: username,
                  groupName: groupName,
                  restaurant: {
                    id: winningRestaurant.id,
                    name: winningRestaurant.displayName?.text || winningRestaurant.name,
                    address: winningRestaurant.shortFormattedAddress || winningRestaurant.vicinity || '',
                    cuisine: winningRestaurant.types || []
                  }
                })
              });
            } catch (error) {
              console.error('Error saving to history:', error);
            }
            
            navigate('/result', {
              state: {
                groupName: groupName,
                winner: winningRestaurant || { id: data.finalVote, displayName: { text: 'Selected Restaurant' } },
                groupId: groupId
              }
            });
          } else {
            alert('Vote submitted! Waiting for others...');
          }
        } else {
          throw new Error(data.error || 'Failed to submit vote');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${isIndividual ? 'save' : 'vote'}. Please try again.`);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.displayName?.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="filtersSection">
            <h3>
              {isIndividual 
                ? 'Customize Your Search' 
                : `${groupName} - Select Your Preferences`}
            </h3>
            
            {!isIndividual && hasVoted && (
              <p style={{ color: '#90ee90', fontWeight: 'bold' }}>
                ✓ Vote submitted! Waiting for others...
              </p>
            )}
            
            {isIndividual && preferencesModified && (
              <p style={{ color: '#f4a460', fontSize: '0.85rem', fontStyle: 'italic' }}>
                * Preferences will be saved when you add a restaurant to history
              </p>
            )}

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

            {!isIndividual && (
              <div className="hungerSliderSection">
                <h3>Hunger Level: {hungerLevel}</h3>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hungerLevel}
                  onChange={(e) => setHungerLevel(Number(e.target.value))}
                  className="slider"
                  disabled={hasVoted}
                />
              </div>
            )}

            <button 
              onClick={handleUpdateRecommendations}
              disabled={isSaving || selectedCuisines.length !== 3 || (!isIndividual && hasVoted)}
              className="confirmBtn"
              style={{ marginTop: '1.5rem' }}
            >
              {isSaving ? 'Loading...' : 'update recommendations'}
            </button>
          </div>
        </div>

        <div className="searchBarContainer">
          <div className="searchBar">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clearBtn" 
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {filteredRestaurants.length > 0 ? (
          <>
            <div className="restaurantList">
              {filteredRestaurants.map((restaurant, index) => {
                const isSelected = selectedRestaurant?.id === restaurant.id;
                const rating = restaurantRatings[restaurant.id];

                return (
                  <div
                    key={restaurant.id || index}
                    className={`restaurantCard ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <div className="restaurantInfo">
                      <div className="restaurantHeader">
                        <h3>{restaurant.displayName?.text}</h3>
                        <p className="status">
                          {!isIndividual && !hasVoted ? 'Click to vote' : 
                          !isIndividual && hasVoted ? 'Voting closed' :
                          'Click to choose'}
                        </p>
                      </div>
                      <p className="address">{restaurant.shortFormattedAddress || 'Address not available'}</p>
                    </div>
                    
                    {rating && (
                      <div className="ratingTooltip">
                        <div className="ratingStarsContainer">
                          <StarRating 
                            rating={restaurantRatings[restaurant.id]?.average || 0}
                            disabled={true}
                            size={16}
                          />
                        </div>
                        <div className="ratingNumber">
                          {(restaurantRatings[restaurant.id]?.average || 0).toFixed(1)}
                        </div>
                        <div className="ratingText">
                          ({restaurantRatings[restaurant.id]?.count || 0} reviews)
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {selectedRestaurant && (isIndividual || !hasVoted) && (
              <button 
                onClick={handleConfirmRestaurant}
                className="confirmBtn"
                style={{ marginTop: '1.5rem' }}
              >
                {isIndividual ? 'add to history' : 'confirm vote'}
              </button>
            )}
          </>
        ) : (
          <div className="restaurantList">
            <p>No recommendations found. Try adjusting your preferences!</p>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="modalOverlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{isIndividual ? 'Add to History' : 'Confirm Your Vote'}</h2>
            <p><strong>{selectedRestaurant.displayName?.text}</strong></p>
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