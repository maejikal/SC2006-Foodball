import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
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
  const [priceRange, setPriceRange] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hungerLevel, setHungerLevel] = useState(5);
  
  const [preferencesModified, setPreferencesModified] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

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
            
            const budget = data.budget || 50;
            setPriceRange(budget);
            
            if (isIndividual) {
              await fetchRestaurants(cuisines, budget);
            } else {
              await submitUserPreferencesToGroup(cuisines, budget);
              await fetchRestaurants(cuisines, budget);
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
  }, [groupName, isIndividual]);

  const submitUserPreferencesToGroup = async (cuisines, budget) => {
    try {
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
      
      const cuisine_tags = cuisines.map(c => tags[c]);
      
      await fetch(
        `http://localhost:8080/foodball/${groupName}?long=${selectedLocation['latLng']['lng']}&lat=${selectedLocation['latLng']['lat']}&cuisines=${cuisine_tags.join(',')}&username=${username}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error('Error submitting preferences:', error);
    }
  };

  const fetchRestaurants = async (cuisines = selectedCuisines, price = priceRange) => {
    try {
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
      
      const response = await fetch(
        `http://localhost:8080/foodball/${groupName}?long=${selectedLocation['latLng']['lng']}&lat=${selectedLocation['latLng']['lat']}&cuisines=${cuisine_tag}&username=${localStorage.getItem('username')}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        const recs = Array.isArray(data) ? data : data.recommendations || [];
        setRestaurants(recs);
      } else {
        console.error('Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // POLLING LOGIC - Navigate when finalVote exists
  useEffect(() => {
    if (isIndividual || !groupName) {
      return;
    }

    const pollVotingStatus = async () => {
      try {
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

  const handlePriceChange = (e) => {
    setPriceRange(Number(e.target.value));
    
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
      if (isIndividual) {
        await fetchRestaurants(selectedCuisines, priceRange);
        alert('Recommendations updated! Preferences will be saved when you add a restaurant to history.');
      } else {
        await fetchRestaurants(selectedCuisines, priceRange);
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
    const username = localStorage.getItem('username');
    
    try {
      if (!isIndividual) {
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
      } else {
        if (preferencesModified) {
          const prefsSaved = await savePreferencesToProfile();
          if (!prefsSaved) {
            alert('Warning: Preferences could not be saved, but restaurant will still be added to history.');
          }
        }
        
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
          <div className="restaurantList">
            {filteredRestaurants.map((restaurant, index) => {
              const isSelected = selectedRestaurant?.id === restaurant.id;

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
                        'Click to add to history'}
                      </p>
                    </div>
                    <p className="address">{restaurant.shortFormattedAddress || 'Address not available'}</p>
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