import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import './PreferencesPage.css';

export default function PreferencesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = location.state?.isOnboarding || false;

  const cuisineOptions = ['Western', 'Italian', 'Chinese', 'Malay', 'Indian', 'Japanese', 'Korean'];

  // where we store the preference
  const [rank1, setRank1] = useState('');
  const [rank2, setRank2] = useState('');
  const [rank3, setRank3] = useState('');
  const [budget, setBudget] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  //load current preferences
  useEffect(() => {
    // Skip loading if this is onboarding (new user)
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

        // Load cuisine preferences
        const prefs = data.preferences || {};
        setRank1(prefs.rank1 || '');
        setRank2(prefs.rank2 || '');
        setRank3(prefs.rank3 || '');
        setBudget(data.budget || 50);

        setIsLoading(false);
      } catch (error) {
        setError('Failed to load preferences. Please try again.');
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [isOnboarding]);

  const validateForm = () => {
    if (!rank1 || !rank2 || !rank3) {
      setError('Please select all 3 cuisine preferences');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      setError('Username not found. Please sign up or log in again.');
      return;
    }

    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    const requestBody = {
      username: username,
      cuisine_preferences: {
        rank1: rank1,
        rank2: rank2,
        rank3: rank3
      },
      budget: budget
    };

    console.log('Sending to backend:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch('http://localhost:8080/account/cuisine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      console.log('Preferences saved:', data);
      setIsSaving(false);

      if (isOnboarding) {
        // Onboarding complete - go to dashboard
        navigate('/search');
      } else {
        setSuccessMessage('Preferences saved successfully!');
        setTimeout(() => {
          navigate('/account');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(error.message || 'An error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  //prevent same option
  const getOptions = (exclude1, exclude2) => 
    cuisineOptions.filter(opt => opt !== exclude1 && opt !== exclude2);

  if (isLoading) {
    return (
      <div className="preferencePage">
        <Navbar />
        <div className="preferenceContent">
          <p>Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preferencePage">
      <Navbar />
      <div className="preferenceContent">
        <h1>{isOnboarding ? 'Select your top 3 favorite cuisines and budget (Step 2 of 2)' : 'Select your top 3 favorite cuisines and budget range'}</h1>
        
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Success Message */}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <label>
          First Choice:
          <select 
            value={rank1} 
            onChange={(e) => setRank1(e.target.value)}
          >
            <option value="">Select cuisine</option>
            {getOptions(rank2, rank3).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        <label>
          Second Choice:
          <select 
            value={rank2} 
            onChange={(e) => setRank2(e.target.value)}
          >
            <option value="">Select cuisine</option>
            {getOptions(rank1, rank3).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        <label>
          Third Choice:
          <select 
            value={rank3} 
            onChange={(e) => setRank3(e.target.value)}
          >
            <option value="">Select cuisine</option>
            {getOptions(rank1, rank2).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        <div className="budgetSliderSection">
          <label>Budget per meal: ${budget}</label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="budgetSlider"
          />
          <div className="budgetLabels">
            <span>$5</span>
            <span>$100</span>
          </div>
        </div>

        <button 
          className="saveBtn"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : (isOnboarding ? 'Complete' : 'Save')}
        </button>
      </div>
    </div>
  );
}