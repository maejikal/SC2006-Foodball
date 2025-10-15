import React, { useState } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate } from 'react-router-dom';
import './DietaryPreferencesPage.css';

export default function DietaryPreferencesPage() {
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const dietaryOptions = [
    { id: 'halal', label: 'Halal' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'diary-free', label: 'Diary-Free' },
    { id: 'non-pork', label: 'Non-pork' }
  ];

  const togglePreference = (label) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else {
      setSelectedPreferences([...selectedPreferences, label]);
    }
  };

  const handleSave = (s) => {
    console.log('Saving dietary preferences:', selectedPreferences);
    alert('Dietary preferences saved!');
  };

  return (
    <div className="dietaryPage">
      <Navbar />
      <div className="dietaryContent">
        <h1>Dietary Preferences</h1>
        
        <div className="dietaryOptions">
          {dietaryOptions.map((option) => (
            <div key={option.id} className="dietaryOption">
              <div className="dietaryLabel">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>{option.label}</span>
              </div>
              <input
                type="checkbox"
                className="customCheckbox"
                checked={selectedPreferences.includes(option.label)}
                onChange={() => togglePreference(option.label)}
              />
            </div>
          ))}
        </div>

        <button
          className="saveBtn"
          onClick={() => {
            handleSave();
            navigate('/account');
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}