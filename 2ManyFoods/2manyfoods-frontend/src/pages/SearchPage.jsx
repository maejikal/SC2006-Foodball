import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import './SearchPage.css';

const dummyRestaurants = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    name: 'Cheongsujeong Korean Kitchen',
    address: '1 Jurong West Central 2, #03-34',
    priceRange: '$10-20',
    priceLevel: 'medium',
    statusText: "You've never eaten here before!",
    visited: false
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    name: 'Jalan Bahar Japanese & Korean Cuisine',
    address: '9 Jurong West Ave 5, #01-09',
    priceRange: '<$10',
    priceLevel: 'low',
    statusText: "You've never eaten here before!",
    visited: false
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    name: 'JIN.JJA Chicken',
    address: '3 Gateway Dr, #02-05 Westgate',
    priceRange: '$10-20',
    priceLevel: 'medium',
    statusText: "You ate here 1 month ago!",
    visited: true
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    name: 'Yakiniku-GO',
    address: '1 Jurong West Central 2, #B1-55',
    priceRange: '$20-30',
    priceLevel: 'high',
    statusText: "You've never eaten here before!",
    visited: false
  },
];

export default function SearchPage() {
  const [selectedFoodType, setSelectedFoodType] = useState('Meal');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userPreferences, setUserPreferences] = useState({
    rank1: '',
    rank2: '',
    rank3: ''
  });

  const foodTypes = [
    { name: 'Meal', icon: '/assets/icons8-meal-50.png', cuisines: ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'] },
  ];

  // Load user's saved preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {

        //api call

        setTimeout(() => {
          const preferences = {
            rank1: 'italian',
            rank2: 'japanese',
            rank3: 'korean'
          };
          
          setUserPreferences(preferences);
          
          setSelectedCuisines([
            preferences.rank1,
            preferences.rank2,
            preferences.rank3
          ]);
          
        }, 500);
        
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  // Get dynamic ranking based on position in selectedCuisines array
  const getCuisineRank = (cuisine) => {
    const index = selectedCuisines.indexOf(cuisine.toLowerCase());
    if (index === -1) return null;
    return index + 1;
  };

  const getCurrentCuisines = () => {
    const foodType = foodTypes.find(ft => ft.name === selectedFoodType);
    return foodType ? foodType.cuisines : [];
  };

  const toggleFoodType = (foodType) => {
    setSelectedFoodType(foodType);
    setSelectedCuisines([]);
  };

  // Always maintain exactly 3 selections
  const toggleCuisine = (cuisine) => {
    const lowerCuisine = cuisine.toLowerCase();
    
    if (selectedCuisines.includes(lowerCuisine)) {
      // Don't allow unselecting if it would go below 3
      if (selectedCuisines.length <= 3) {
        return;
      }
    } else {
      // Always add as #1 and drop the last one if needed
      if (selectedCuisines.length >= 3) {
        // Already 3 selected - replace the oldest (#3)
        setSelectedCuisines([lowerCuisine, ...selectedCuisines.slice(0, 2)]);
      } else {
        // Less than 3 - just add to front
        setSelectedCuisines([lowerCuisine, ...selectedCuisines]);
      }
    }
  };

  const handleConfirmChoice = async () => {
    if (selectedCuisines.length !== 3) {
      alert('Please select exactly 3 cuisines');
      return;
    }

    try {
      const preferencesData = {
        rank1: selectedCuisines[0],
        rank2: selectedCuisines[1],
        rank3: selectedCuisines[2]
      };

      //api call
      
      console.log('Saving preferences:', preferencesData);
      setTimeout(() => {
        setUserPreferences({
          rank1: preferencesData.rank1,
          rank2: preferencesData.rank2,
          rank3: preferencesData.rank3
        });
        
        alert('Preferences saved successfully!');
      }, 500);

    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  return (
    <div className="searchPage">
      <Navbar />
      <div className="searchContent">
        <div className="searchTop">
          <div className="mapContainer">
            <img 
              src="https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/103.8198,1.3521,11,0/600x400@2x?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazZ0bnFnbHkwMDAwM21xdnU5MHU0ZnE0In0.example" 
              alt="Map" 
            />
          </div>

          <div className="filtersSection">
            <div>
              <div className="foodTypes">
                {foodTypes.map((food) => (
                  <button
                    key={food.name}
                    className={`foodTypeBtn ${selectedFoodType === food.name ? 'selected' : ''}`}
                    onClick={() => toggleFoodType(food.name)}
                  >
                    <img src={food.icon} alt={food.name} className="foodIcon" />
                    <span>{food.name}</span>
                  </button>
                ))}
              </div>

              <div className="cuisineTags">
                {getCurrentCuisines().map((cuisine) => {
                  const rank = getCuisineRank(cuisine);
                  const isSelected = selectedCuisines.includes(cuisine.toLowerCase());
                  
                  return (
                    <button
                      key={cuisine}
                      className={`cuisineTag ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleCuisine(cuisine)}
                    >
                      <span>{cuisine}</span>
                      {isSelected && rank && (
                        <span className="rankBadge">#{rank}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="priceSliderSection">
              <input
                type="range"
                min="1"
                max="100"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="slider"
              />
              <div className="priceLabels">
                <span>$5</span>
                <span>$10</span>
                <span>$15</span>
                <span>$25</span>
                <span>$50</span>
                <span>$100 &gt;</span>
              </div>
            </div>

            <button 
              className="confirmBtn" 
              onClick={handleConfirmChoice}
              disabled={selectedCuisines.length !== 3}
            >
              Confirm Choice
            </button>
          </div>
        </div>

        <div className="searchBarContainer">
          <div className="searchBar">
            <svg className="searchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="restaurantList">
          {dummyRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurantCard">
              <img src={restaurant.image} alt={restaurant.name} className="restaurantImage" />
              <div className="restaurantInfo">
                <h3>{restaurant.name}</h3>
                <p className="address">{restaurant.address}</p>
                <p className={`price ${restaurant.priceLevel}`}>{restaurant.priceRange}</p>
                <p className={`status ${restaurant.visited ? 'visited' : ''}`}>{restaurant.statusText}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
