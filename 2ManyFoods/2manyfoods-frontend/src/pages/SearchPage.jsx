import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import './SearchPage.css';

export default function SearchPage() {
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const mealCuisines = ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'];

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    const loadPreferences = async () => {
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
            await fetchRestaurants(cuisines, data.budget || 50);
          }
          
          setPriceRange(data.budget || 50);
        }
        
        setIsLoading(false);

      } catch (error) {
        console.error('Failed to load preferences:', error);
        setIsLoading(false);
      }
    };

    loadPreferences();
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
    return index !== -1 ? index + 1 : null;
  };

  const toggleCuisine = (cuisine) => {
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
  };

  const handleConfirmChoice = async () => {
    if (selectedCuisines.length !== 3) {
      alert('Please select exactly 3 cuisines');
      return;
    }

    const username = localStorage.getItem('username');
    setIsSaving(true);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

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

      if (response.ok) {
        alert('Restaurant added to history!');
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    } finally {
      setShowConfirmModal(false);
      setSelectedRestaurant(null);
    }
  };

  if (isLoading) {
    return (
      <div className="searchPage">
        <Navbar />
        <div className="searchContent">
          <p>Loading your preferences...</p>
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
            <img 
              src="https://via.placeholder.com/600x350?text=Map+View" 
              alt="Map"
            />
          </div>
          <div className="filtersSection">
            <h3>Select Your Cuisine</h3>
            <div className="cuisineTags">
              {mealCuisines.map((cuisine) => {
                const rank = getCuisineRank(cuisine);
                const isSelected = selectedCuisines.includes(cuisine.toLowerCase());
                
                return (
                  <button
                    key={cuisine}
                    className={`cuisineTag ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    {rank && <span className="rankBadge">{rank}</span>}
                  </button>
                );
              })}
            </div>

            <div className="priceSliderSection">
              <h3>Budget: ${priceRange}</h3>
              <input
                type="range"
                min="10"
                max="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="slider"
              />
              <div className="priceLabels">
                <span>$10</span>
                <span>$100</span>
              </div>
            </div>

            <button
              onClick={handleConfirmChoice}
              disabled={isSaving || selectedCuisines.length !== 3}
              className="confirmBtn"
            >
              {isSaving ? 'Saving...' : 'Confirm Choice'}
            </button>
          </div>
        </div>

        {restaurants.length > 0 && (
          <div className="restaurantList">
            {restaurants.map((restaurant, index) => {
              const isSelected = selectedRestaurant?._id === restaurant._id;
              
              return (
                <div
                  key={restaurant._id || index}
                  className={`restaurantCard ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <img
                    src={restaurant.image || 'https://via.placeholder.com/150'}
                    alt={restaurant.name}
                    className="restaurantImage"
                  />
                  <div className="restaurantInfo">
                    <h3>{restaurant.name}</h3>
                    <p className="address">{restaurant.location.address}</p>
                    <p className={`price ${restaurant.price_range <= 30 ? 'low' : restaurant.price_range <= 60 ? 'medium' : 'high'}`}>
                      ${restaurant.price_range}
                    </p>
                    <p className="status">Click to add to history</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {restaurants.length > 0 && (
          <button
            onClick={handleConfirmRestaurant}
            disabled={!selectedRestaurant}
            className="confirmBtn"
          >
            Confirm Restaurant
          </button>
        )}

        {showConfirmModal && selectedRestaurant && (
          <div className="modalOverlay" onClick={() => setShowConfirmModal(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h2>Add to Food History?</h2>
              <p><strong>{selectedRestaurant.name}</strong></p>
              <p>This restaurant will be added to your food history.</p>
              <div className="modalButtons">
                <button onClick={handleSaveToHistory} className="confirmBtn">
                  Yes, I'm going!
                </button>
                <button onClick={() => setShowConfirmModal(false)} className="cancelBtn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
