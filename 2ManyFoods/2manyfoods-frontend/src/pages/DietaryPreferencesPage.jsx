import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isOnboarding = location.state?.isOnboarding || false;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  // load the existing preference
  useEffect(() => {
    // Skip loading preferences if this is onboarding (new user)
    if (isOnboarding) {
      setIsLoading(false);
      return;
    }

    // Load existing preferences for settings page
    const loadPreferences = async () => {
      setIsLoading(true);
      setError('');

      const username = localStorage.getItem('username');
      if (!username) {
        setError('Please log in to view preferences');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/account/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load preferences');
        }

        const dietaryDict = data.dietaryRequirements || {};
        const preferencesArray = Object.keys(dietaryDict).filter(
          key => dietaryDict[key]
        );

        setSelectedPreferences(preferencesArray);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load preferences. Please try again.');
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [isOnboarding]);

  const togglePreference = (label) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else {
      setSelectedPreferences([...selectedPreferences, label]);
    }
    setError('');
  };

  const handleSave = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      setError('Username not found. Please sign up or log in again.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    const dietaryDict = selectedPreferences.reduce((acc, pref) => {
      acc[pref] = true;
      return acc;
    }, {});

    const requestBody = {
      username: username,
      // dietary_requirements: dietaryDict,
      field: "DietaryRequirements",
      newValue: dietaryDict
    };

    try {
      const response = await fetch('http://localhost:8080/account/dietary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save dietary preferences');
      }

      setIsSaving(false);

      if (isOnboarding) {
        // Move to next step - cuisine preferences
        navigate('/account/preferences', { state: { isOnboarding: true } });
      } else {
        setSuccessMessage('Dietary preferences saved successfully!');
        setTimeout(() => {
          navigate('/account');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving dietary preferences:', error);
      setError(error.message || 'An error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dietaryPage">
        <Navbar />
        <div className="dietaryContent">
          <p>Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dietaryPage">
      <Navbar />
      <div className="dietaryContent">
        <h1>{isOnboarding ? 'Select any dietary restrictions or preferences (Step 1 of 2)' : 'Select your dietary restrictions and preferences'}</h1>
        
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Success Message */}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="dietaryOptions">
          {dietaryOptions.map((option) => (
            <div key={option.id} className="dietaryOption">
              <label className="dietaryLabel">
                <img src={dietaryIcons[option.id]} alt={option.label} className="dietaryIcon" />
                <span>{option.label}</span>
              </label>
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
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : (isOnboarding ? 'Next' : 'Save')}
        </button>
      </div>
    </div>
  );
}
