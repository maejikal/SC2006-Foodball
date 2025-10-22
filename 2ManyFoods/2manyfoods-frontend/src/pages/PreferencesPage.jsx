import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import './PreferencesPage.css';

export default function PreferencesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isOnboarding = location.state?.isOnboarding || false;

  const cuisineOptions = ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'];

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

      try {

        // API call

        setTimeout(() => {
          setRank1('italian');
          setRank2('japanese');
          setRank3('korean');
          setBudget(50);
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error('Error loading preferences:', error);
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
    const userId = localStorage.getItem('userId');
    
    console.log('User ID from localStorage:', userId);
    
    if (!userId) {
      setError('User ID not found. Please sign up or log in again.');
      return;
    }

    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    const requestBody = {
      user_id: userId, 
      preferences: {
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
          <h1>Cuisine Preferences</h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
            Loading your preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="preferencePage">
      <Navbar />
      <div className="preferenceContent">
        <h1>
          {isOnboarding ? 'Set Your Preferences' : 'Preferences'}
        </h1>
        
        {isOnboarding ? (
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Select your top 3 favorite cuisines and budget (Step 2 of 2)
          </p>
        ) : (
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Select your top 3 favorite cuisines and budget range
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div 
            className="errorMessage" 
            style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div 
            className="successMessage" 
            style={{
              color: 'green',
              backgroundColor: '#d4edda',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {successMessage}
          </div>
        )}

        <label>
          Rank 1:
          <select value={rank1} onChange={e => { setRank1(e.target.value); setError(''); }} disabled={isSaving}>
            <option value="">Select a cuisine</option>
            {getOptions(rank2, rank3).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Rank 2:
          <select value={rank2} onChange={e => { setRank2(e.target.value); setError(''); }} disabled={isSaving}>
            <option value="">Select a cuisine</option>
            {getOptions(rank1, rank3).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Rank 3:
          <select value={rank3} onChange={e => { setRank3(e.target.value); setError(''); }} disabled={isSaving}>
            <option value="">Select a cuisine</option>
            {getOptions(rank1, rank2).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <div className="budgetSliderSection">
          <label style={{ marginBottom: '0.5rem' }}>
            Budget Range: ${budget}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="budgetSlider"
            disabled={isSaving}
          />
          <div className="budgetLabels">
            <span>$0</span>
            <span>$100+</span>
          </div>
        </div>

        <button className="saveBtn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : (isOnboarding ? 'Finish & Start Exploring' : 'Save Preferences')}
        </button>
      </div>
    </div>
  );
}