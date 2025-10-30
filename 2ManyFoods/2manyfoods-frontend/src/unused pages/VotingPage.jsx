import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './VotingPage.css';

export default function VotingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, groupName, restaurants, isLeader } = location.state || {};
  
  const [userVotes, setUserVotes] = useState(new Set());
  const [hasVoted, setHasVoted] = useState(false);

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

  useEffect(() => {
    if (!groupId) return;

    const pollVotingStatus = async () => {
      try {
        const username = sessionStorage.getItem('username');
        
        const response = await fetch(`http://localhost:8080/refresh/${groupId}`);
        const data = await response.json();
        
        console.log('Poll data:', data);
        
        if (data.votingStatus && data.votingStatus[username]) {
          setHasVoted(true);
        }
        
        const allVoted = data.votingStatus && 
          Object.keys(data.votingStatus).length > 0 &&
          Object.values(data.votingStatus).every(v => v === true);
        
        if (allVoted) {
          console.log('All voted! Navigating...');
          
          const winnerId = data.winner;
          const winnerRestaurant = restaurants.find(r => r._id === winnerId) || restaurants[0];
          const totalVotes = data.voteDetails?.[winnerId] || Object.keys(data.votingStatus).length;
          
          navigate('/foodball/results', {
            state: {
              groupId,
              groupName,
              winner: winnerRestaurant,
              totalVotes: totalVotes,
              voteDetails: data.voteDetails
            }
          });
        }
      } catch (error) {
        console.error('Error polling:', error);
      }
    };

    pollVotingStatus();
    const interval = setInterval(pollVotingStatus, 2000);
    return () => clearInterval(interval);
  }, [groupId, navigate, groupName, restaurants]);

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
      const username = sessionStorage.getItem('username');
      const response = await fetch(`http://localhost:8080/foodball/${groupId}/vote`, {
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
