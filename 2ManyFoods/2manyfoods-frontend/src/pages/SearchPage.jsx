import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import './SearchPage.css';

export default function SearchPage() {
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPreferences, setUserPreferences] = useState({ rank1: '', rank2: '', rank3: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const mealCuisines = ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'];

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const preferences = {
          rank1: 'italian',
          rank2: 'japanese',
          rank3: 'korean'
        };
        setUserPreferences(preferences);
        setSelectedCuisines([preferences.rank1, preferences.rank2, preferences.rank3]);
        setIsLoading(false);
        
        await fetchRestaurants([preferences.rank1, preferences.rank2, preferences.rank3], 50);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setIsLoading(false);
      }
    };
    loadUserPreferences();
  }, []);

  const fetchRestaurants = async (cuisines, price) => {
    try {
      const username = localStorage.getItem('username');
      const cuisineParams = cuisines.map(c => `cuisines=${c}`).join('&');
      const response = await fetch(
        `http://localhost:8080/api/search?username=${username}&${cuisineParams}&price_range=${price}`
      );
      const data = await response.json();
      
      if (response.ok && data.eateries) {
        setRestaurants(data.eateries);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const getCuisineRank = (cuisine) => {
    const index = selectedCuisines.indexOf(cuisine.toLowerCase());
    if (index === -1) return null;
    return index + 1;
  };

  const toggleCuisine = (cuisine) => {
    const lowerCuisine = cuisine.toLowerCase();
    if (selectedCuisines.includes(lowerCuisine)) {
      if (selectedCuisines.length <= 3) return;
    } else {
      if (selectedCuisines.length >= 3) {
        setSelectedCuisines([lowerCuisine, ...selectedCuisines.slice(0, 2)]);
      } else {
        setSelectedCuisines([lowerCuisine, ...selectedCuisines]);
      }
    }
  };

  const handleConfirmChoice = async () => {
    if (selectedCuisines.length !== 3) {
      alert('Please select exactly 3 cuisines');
      return;
    }

    const username = localStorage.getItem('username');
    if (!username) {
      alert('Please log in to save preferences');
      return;
    }

    setIsSaving(true);
    try {
      const requestBody = {
        username: username,
        preferences: {
          rank1: selectedCuisines[0],
          rank2: selectedCuisines[1],
          rank3: selectedCuisines[2]
        },
        budget: priceRange
      };

      const response = await fetch('http://localhost:8080/account/cuisine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      setUserPreferences({
        rank1: selectedCuisines[0],
        rank2: selectedCuisines[1],
        rank3: selectedCuisines[2]
      });

      await fetchRestaurants(selectedCuisines, priceRange);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleConfirmRestaurant = () => {
    if (!selectedRestaurant) {
      alert('Please select a restaurant first!');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleSaveToHistory = async () => {
    const username = localStorage.getItem('username');
    
    try {
      const response = await fetch('http://localhost:8080/api/history/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          restaurant: {
            id: selectedRestaurant._id,
            name: selectedRestaurant.name,
            address: selectedRestaurant.location.address,
            price_range: selectedRestaurant.price_range,
            cuisine: selectedRestaurant.cuisine
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Restaurant added to your food history! Enjoy your meal! 🍽️');
        setShowConfirmModal(false);
        setSelectedRestaurant(null);
      } else {
        throw new Error(data.error || 'Failed to save to history');
      }
    } catch (error) {
      console.error('Error saving to history:', error);
      alert('Failed to save to history. Please try again.');
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="searchPage">
        <Navbar />
        <div className="searchContent">
          <h2>Loading your preferences...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="searchPage">
      <Navbar />
      <div className="searchContent">
        <div className="searchTop">
          <div className="mapContainer">
            <img src="https://via.placeholder.com/600x350?text=Map+Placeholder" alt="Map" />
          </div>

          <div className="filtersSection">
            <div>
              <h3>Meal Preference</h3>
              <div className="cuisineTags">
                {mealCuisines.map((cuisine) => {
                  const rank = getCuisineRank(cuisine);
                  return (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`cuisineTag ${rank ? 'selected' : ''}`}
                    >
                      {cuisine}
                      {rank && <span className="rankBadge">{rank}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="priceSliderSection">
              <h3>Price Range</h3>
              <input
                type="range"
                min="10"
                max="100"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="slider"
              />
              <div className="priceLabels">
                <span>$10</span>
                <span>${priceRange}</span>
                <span>$100+</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmChoice} 
              className="confirmBtn"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Confirm Choice'}
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
          </div>
        </div>

        <div className="restaurantList">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className={`restaurantCard ${selectedRestaurant?._id === restaurant._id ? 'selected' : ''}`}
                onClick={() => handleRestaurantClick(restaurant)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="restaurantImage"
                />
                <div className="restaurantInfo">
                  <h3>{restaurant.name}</h3>
                  <p className="address">{restaurant.location.address}</p>
                  <p className="price">${restaurant.price_range}</p>
                  <p className="status">You've never eaten here before!</p>
                </div>
              </div>
            ))
          ) : (
            <p>No restaurants found. Try different preferences!</p>
          )}
        </div>

        {selectedRestaurant && (
          <button 
            onClick={handleConfirmRestaurant} 
            className="confirmBtn"
            style={{ marginTop: '1rem' }}
          >
            Confirm Restaurant: {selectedRestaurant.name}
          </button>
        )}
      </div>

      {showConfirmModal && (
        <div className="modalOverlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Your Visit</h2>
            <p>
              Are you sure you're going to <strong>{selectedRestaurant.name}</strong> to eat?
            </p>
            <p>This restaurant will be added to your food history.</p>
            <div className="modalButtons">
              <button onClick={handleSaveToHistory} className="confirmBtn">
                Yes, I'm Going!
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
