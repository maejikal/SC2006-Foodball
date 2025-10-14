import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './InProgressPage.css';

export default function InProgressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupName = location.state?.groupName;

  const [selectedFoodType, setSelectedFoodType] = useState();
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(5);
  const [hungerLevel, setHungerLevel] = useState(5);

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

  const [members] = useState([
    {
      id: 1,
      name: 'Jessica',
      status: 'deciding...',
      avatar: '/assets/icons8-rabbit-50.png',
      submitted: false
    },
    {
      id: 2,
      name: 'Daniel',
      status: 'submitted',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel&backgroundColor=e0d5d5',
      submitted: true
    },
    {
      id: 3,
      name: 'Draco',
      status: 'deciding...',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Draco&backgroundColor=ffd6cc',
      submitted: false
    }
  ]);

  const toggleFoodType = (foodType) => {
    setSelectedFoodType(foodType);
    // Clear cuisine selections when switching food type
    setSelectedCuisines([]);
  };

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/invite/123`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Invite link copied to clipboard!');
    });
  };

  const handleSubmit = () => {
    console.log('Submit preferences', { 
      selectedFoodType, 
      selectedCuisines, 
      priceRange, 
      hungerLevel 
    });
    navigate('/foodball/voting');
  };

  return (
    <div className="inProgressPage">
      <Navbar />
      <div className="progressContent">
        <div className="progressHeader">
          <div className="groupNamePill">{groupName}</div>
          <button className="copyInviteBtn" onClick={handleCopyInviteLink}>
            copy invite link
          </button>
        </div>

        <div className="progressTitle">foodball in progress...</div>

        <div className="contentGrid">
          <div className="mapContainer">
            <img src="https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/103.8198,1.3521,11,0/600x400@2x?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazZ0bnFnbHkwMDAwM21xdnU5MHU0ZnE0In0.example" alt="Map" />
          </div>

          <div className="preferencesSection">
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

            <div className="sliderSection">
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

        <div className="hungerSection">
          <h2>pick your hunger level</h2>
          <div className="sliderSection">
            <input
              type="range"
              min="1"
              max="10"
              value={hungerLevel}
              onChange={(e) => setHungerLevel(e.target.value)}
              className="slider"
            />
            <div className="priceLabels">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <button className="submitBtn" onClick={handleSubmit}>
          submit preferences
        </button>

        <div className="membersSection">
          <h2>group members {members.length}/20</h2>
          <div className="memberStatusList">
            {members.map((member) => (
              <div key={member.id} className={`memberStatus ${member.submitted ? 'submitted' : ''}`}>
                <img src={member.avatar} alt={member.name} />
                <div className="memberInfo">
                  <h3>{member.name}</h3>
                  <p>{member.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}