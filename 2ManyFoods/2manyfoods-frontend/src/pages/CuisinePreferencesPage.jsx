import React, { useState } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate } from 'react-router-dom';
import './CuisinePreferencesPage.css';

export default function CuisinePreferencesPage() {
  const navigate = useNavigate();
  const [selectedCuisines, setSelectedCuisines] = useState([]);

  const cuisineOptions = ['western', 'italian', 'chinese', 'malay', 'indian', 'japanese', 'korean'];

  const [rank1, setRank1] = useState('');
  const [rank2, setRank2] = useState('');
  const [rank3, setRank3] = useState('');

  const handleSave = () => {
    console.log('Cuisine rankings:', {rank1, rank2, rank3});
    alert('Cuisine preferences saved!');
    navigate('/account');
  };

  const getOptions = (exclude1, exclude2) =>
    cuisineOptions.filter(opt => opt !== exclude1 && opt != exclude2);

  return (
    <div className="cuisinePage">
      <Navbar />
      <div className="cuisineContent">
        <h1>Cuisine Preferences</h1>

        <label>
          Rank 1:
          <select value={rank1} onChange={e => setRank1(e.target.value)}>
            <option value="">Select a cuisine</option>
            {getOptions(rank2, rank3).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Rank 2:
          <select value={rank2} onChange={e => setRank2(e.target.value)}>
            <option value="">Select a cuisine</option>
            {getOptions(rank1, rank3).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Rank 3:
          <select value={rank3} onChange={e => setRank3(e.target.value)}>
            <option value="">Select a cuisine</option>
            {getOptions(rank1, rank2).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <button className="saveBtn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}