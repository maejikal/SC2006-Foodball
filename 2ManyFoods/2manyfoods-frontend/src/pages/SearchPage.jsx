import React, { useState } from 'react';
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
  const [selectedFoodType, setSelectedFoodType] = useState();
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const foodTypes = [
    { name: 'Snacks', icon: '🍿', cuisines: ['Chips', 'Popcorn', 'Nuts', 'Crackers', 'Cookies', 'Candy'] },
    { name: 'Meal', icon: '🍱', cuisines: ['Korean', 'Japanese', 'Barbecue', 'Chinese', 'Italian', 'Thai', 'Mexican', 'Indian', 'Vietnamese'] },
    { name: 'Vegan', icon: '🥗', cuisines: ['Salads', 'Smoothie Bowls', 'Vegan Burgers', 'Buddha Bowls', 'Vegan Pizza', 'Plant-Based'] },
    { name: 'Dessert', icon: '🍰', cuisines: ['Cakes', 'Ice Cream', 'Pastries', 'Cookies', 'Brownies', 'Pudding'] },
    { name: 'Drinks', icon: '🥤', cuisines: ['Coffee', 'Tea', 'Smoothies', 'Bubble Tea', 'Juice', 'Milkshakes'] }
  ];

  const getCurrentCuisines = () => {
    const foodType = foodTypes.find(ft => ft.name === selectedFoodType);
    return foodType ? foodType.cuisines : [];
  };

  const toggleFoodType = (foodType) => {
    setSelectedFoodType(foodType);
    setSelectedCuisines([]);
  };

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
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
                    <div className="icon">{food.icon}</div>
                    <span>{food.name}</span>
                  </button>
                ))}
              </div>
              <div className="cuisineTags">
                {getCurrentCuisines().map((cuisine) => (
                  <button
                    key={cuisine}
                    className={`cuisineTag ${selectedCuisines.includes(cuisine) ? 'selected' : ''}`}
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
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