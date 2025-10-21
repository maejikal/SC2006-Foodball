import React, { useState, useEffect } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate } from 'react-router-dom';
import './CuisinePreferencesPage.css';

export default function CuisinePreferencesPage() {
  const navigate = useNavigate();

  const cuisineOptions = ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'];

  // where we store the preference
  const [rank1, setRank1] = useState('');
  const [rank2, setRank2] = useState('');
  const [rank3, setRank3] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  //load current preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      setError('');

      try {

        //api call here
        
        setTimeout(() => {
          // Simulate loaded data (remove later)
          setRank1('italian');
          setRank2('japanese');
          setRank3('korean');
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error('Error loading preferences:', error);
        setError('Failed to load preferences. Please try again.');
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []); 

  const validateForm = () => {
    if (!rank1 || !rank2 || !rank3) {
      setError('Please select all 3 cuisine preferences');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      
      //api call here

      setTimeout(() => {
        setIsSaving(false);
        setSuccessMessage('Cuisine preferences saved successfully!');
        
        // Navigate after 2 seconds
        setTimeout(() => {
          navigate('/account');
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('An error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  // Prevent same cuisine from being selected
  const getOptions = (exclude1, exclude2) =>
    cuisineOptions.filter(opt => opt !== exclude1 && opt !== exclude2);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="cuisinePage">
        <Navbar />
        <div className="cuisineContent">
          <h1>Cuisine Preferences</h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
            Loading your preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cuisinePage">
      <Navbar />
      <div className="cuisineContent">
        <h1>Cuisine Preferences</h1>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Select your top 3 favorite cuisines in order of preference
        </p>

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
          <select 
            value={rank1} 
            onChange={e => {
              setRank1(e.target.value); // update the value
              setError(''); 
            }}
            disabled={isSaving}
          >
            <option value="">Select a cuisine</option>
            {getOptions(rank2, rank3).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Rank 2:
          <select 
            value={rank2} 
            onChange={e => {
              setRank2(e.target.value);
              setError('');
            }}
            disabled={isSaving}
          >
            <option value="">Select a cuisine</option>
            {getOptions(rank1, rank3).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Rank 3:
          <select 
            value={rank3} 
            onChange={e => {
              setRank3(e.target.value);
              setError('');
            }}
            disabled={isSaving}
          >
            <option value="">Select a cuisine</option>
            {getOptions(rank1, rank2).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <button 
          className="saveBtn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}