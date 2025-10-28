import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './ResultsPage.css';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    groupId, 
    groupName, 
    winner, 
    allVotes = [],
    totalVotes,
    voteDetails 
  } = location.state || {};
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (winner && !hasSaved) {
      handleSaveToHistory();
    }
  }, [winner, hasSaved]);

  const handleSaveToHistory = async () => {
    const username = localStorage.getItem('username');
    setIsSaving(true);

    try {
      const response = await fetch('http://localhost:8080/api/history/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          restaurant: {
            id: winner.place_id || winner._id,
            name: winner.name,
            address: winner.vicinity || winner.formatted_address || 'Unknown location',
            price_range: winner.price_level || 0,
            cuisine: winner.types?.[0] || 'Restaurant',
            image: winner.photos?.[0]?.photo_reference || ''
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setHasSaved(true);
        console.log('Saved to food history!');
      } else {
        throw new Error(data.error || 'Failed to save to history');
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!winner) {
    return (
      <div className="resultsPage">
        <Navbar />
        <div className="resultsContent">
          <h1>No Results Available</h1>
          <button onClick={() => navigate('/groups')}>
            back to groups
          </button>
        </div>
      </div>
    );
  }

  const voteCount = totalVotes || allVotes.length || 1;

  return (
    <div className="resultsPage">
      <Navbar />
      <div className="resultsContent">
        <h1>{groupName}</h1>
        
        <div className="resultCard">
          {winner.photos && winner.photos.length > 0 && (
            <img 
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${winner.photos[0].photo_reference}&key=YOUR_API_KEY`}
              alt={winner.name}
            />
          )}
          
          <div className="resultDetails">
            <h2>{winner.name}</h2>
            <p>{winner.vicinity || winner.formatted_address || winner.location?.address || 'Near NTU'}</p>
            
            {winner.rating && (
              <p>⭐ {winner.rating} / 5</p>
            )}
            
            {winner.price_level && (
              <p>{'$'.repeat(winner.price_level)}</p>
            )}
            
            <p>Total Votes: {voteCount}</p>
          </div>

          <div className="membersVotes">
            {allVotes.map((vote, index) => (
              <div key={index} className="memberAvatar" title={vote.username}>
                {vote.username.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/groups')}>
          back to groups
        </button>
      </div>
    </div>
  );
}
