import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      setError('');

      //loading preference
      try {
        
        //api cai
        setTimeout(() => {
          setSelectedPreferences(['Halal', 'Vegetarian']);
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error('Error loading dietary preferences:', error);
        setError('Failed to load preferences. Please try again.');
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const togglePreference = (label) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else {
      setSelectedPreferences([...selectedPreferences, label]);
    }

    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    setIsSaving(true);

    try {

      //api call

      setTimeout(() => {
        setIsSaving(false);
        setSuccessMessage('Dietary preferences saved successfully!');
        
        // Navigate after 2 seconds
        setTimeout(() => {
          navigate('/account');
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Error saving dietary preferences:', error);
      setError('An error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dietaryPage">
        <Navbar />
        <div className="dietaryContent">
          <h1>Dietary Preferences</h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
            Loading your preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dietaryPage">
      <Navbar />
      <div className="dietaryContent">
        <h1>Dietary Preferences</h1>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Select your dietary restrictions and preferences
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
        
        <div className="dietaryOptions">
          {dietaryOptions.map((option) => (
            <div key={option.id} className="dietaryOption">
              <div className="dietaryLabel">
                <img
                  src ={dietaryIcons[option.id]}
                  alt={`${option.label} icon`}
                  className="dietaryIcon"
                />
                <span>{option.label}</span>
              </div>
              <input
                type="checkbox"
                className="customCheckbox"
                checked={selectedPreferences.includes(option.label)}
                onChange={() => togglePreference(option.label)}
                disabled={isSaving}
              />
            </div>
          ))}
        </div>

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