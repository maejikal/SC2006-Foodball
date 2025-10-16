import React, { useState } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate } from 'react-router-dom';
import './DietaryPreferencesPage.css';
import halalIcon from '../assets/Icons/Halal.png';
import vegetarianIcon from '../assets/Icons/Vegetarian.png';
import peanutIcon from '../assets/Icons/peanut.png';
import shellfishIcon from '../assets/Icons/shellfish.png';
import milkIcon from '../assets/Icons/milk.png';
import eggIcon from '../assets/Icons/egg.png';

export default function DietaryPreferencesPage() {
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const dietaryOptions = [
    { id: 'halal', label: 'Halal' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'peanut', label: 'Peanut' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'milk', label: 'Milk' },
    { id: 'egg', label: 'Egg'}
  ];
  const dietaryIcons = {
    halal: halalIcon,
    vegetarian: vegetarianIcon,
    peanut: peanutIcon,
    shellfish: shellfishIcon,
    milk: milkIcon,
    egg: eggIcon,
  };

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
                <img
                  src ={dietaryIcons[option.id]}
                  alt={'${option.label} icon'}
                  className="dietaryIcon"
                />
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