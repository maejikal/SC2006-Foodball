import React, { useState } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate } from 'react-router-dom';
import './CuisinePreferencesPage.css';

export default function CuisinePreferencesPage() {
  const navigate = useNavigate();
  const [selectedCuisines, setSelectedCuisines] = useState([]);

  const cuisineOptions = [
    'Japanese', 'Italian', 'Korean', 'Chinese', 'Indian', 'Western', 'Thai', 'Malay'
  ];

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleSave = () => {
    console.log('Saved cuisines:', selectedCuisines);
    alert('Cuisine preferences saved!');
    navigate('/account');
  };

  return (
    <div className="cuisinePage">
      <Navbar />
      <div className="cuisineContent">
        <h1>Cuisine Preferences</h1>

        <div className="cuisineOptions">
          {cuisineOptions.map((cuisine, index) => (
            <div key={index} className="cuisineOption">
              <div className="cuisineLabel">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>{cuisine}</span>
              </div>
              <input
                type="checkbox"
                className="customCheckbox"
                checked={selectedCuisines.includes(cuisine)}
                onChange={() => toggleCuisine(cuisine)}
              />
            </div>
          ))}
        </div>

        <button className="saveBtn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}