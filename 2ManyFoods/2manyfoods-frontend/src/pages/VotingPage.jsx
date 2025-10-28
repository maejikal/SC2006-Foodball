import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './VotingPage.css';

export default function VotingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, groupName, restaurants, isLeader } = location.state || {};
  
  const [userVotes, setUserVotes] = useState(new Set());
  const [allVotes, setAllVotes] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingComplete, setVotingComplete] = useState(false);
  const [winnerRestaurant, setWinnerRestaurant] = useState(null);

  // Check if restaurants exist
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="votingPage">
        <Navbar />
        <div className="votingContent">
          <div className="emptyState">
            <h1>No Restaurants Available</h1>
            <p>Waiting for recommendations to load...</p>
          </div>
        </div>
      </div>
    );
  }

  // Poll for voting results
  useEffect(() => {
    if (!groupId) return;

    const pollVotingResults = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/group/${groupId}/votes`);
        const data = await response.json();
        
        if (response.ok) {
          setAllVotes(data.votes || []);
          setVotingComplete(data.voting_complete || false);
          setWinnerRestaurant(data.winner || null);
        }
      } catch (error) {
        console.error('Error polling votes:', error);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(pollVotingResults, 3000);
    pollVotingResults(); // Initial call

    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    console.log('🔍 Voting status:', { votingComplete, winnerRestaurant });
    
    if (votingComplete && winnerRestaurant) {
      console.log('Navigating to results!');
      navigate('/foodball/results', {
        state: {
          groupId,
          groupName,
          winner: winnerRestaurant,
          allVotes
        }
      });
    }
  }, [votingComplete, winnerRestaurant, navigate, groupId, groupName, allVotes]);

  const handleVote = (restaurantId) => {
    const newVotes = new Set();
    
    if (userVotes.has(restaurantId)) {
      newVotes.clear();
    } else {
      newVotes.add(restaurantId);
    }
    
    setUserVotes(newVotes);
  };

  const submitVotes = async () => {
    if (userVotes.size === 0) {
      alert('Please select one restaurant!');
      return;
    }

    if (hasVoted) {
      alert('You already voted!');
      return;
    }

    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`http://localhost:8080/api/group/${groupId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          restaurant_ids: Array.from(userVotes)
        })
      });

      if (response.ok) {
        setHasVoted(true);
        alert('Vote submitted successfully!');
      } else {
        alert('Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote');
    }
  };

  return (
    <div className="votingPage">
      <Navbar />
      <div className="votingContent">
        <h1>Vote for {groupName}</h1>
        <p>Select your preferred restaurant</p>
        
        <div className="optionList">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant._id || index}
              className={`optionCard ${userVotes.has(restaurant._id) ? 'selected' : ''}`}
              onClick={() => !hasVoted && handleVote(restaurant._id)}
              style={{
                opacity: hasVoted ? 0.6 : 1,
                cursor: hasVoted ? 'not-allowed' : 'pointer'
              }}
            >
              <h3>{restaurant.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#bbb' }}>
                {restaurant.location?.address || 'Near NTU'}
              </p>
            </div>
          ))}
        </div>

        {!hasVoted && (
          <button
            onClick={submitVotes}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Submit Votes
          </button>
        )}

        {hasVoted && (
          <p style={{ marginTop: '2rem', color: '#48bb78', fontSize: '1.1rem' }}>
            ✓ Vote submitted! Waiting for others...
          </p>
        )}
      </div>
    </div>
  );
}
