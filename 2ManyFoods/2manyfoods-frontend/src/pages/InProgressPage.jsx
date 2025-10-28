import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './InProgressPage.css';

export default function InProgressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const groupName = location.state?.groupName || 'Unknown Group';
  const groupId = location.state?.groupId;

  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState(50);
  const [hungerLevel, setHungerLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [allMembersReady, setAllMembersReady] = useState(false);
  const [isLeader, setIsLeader] = useState(false);

  const cuisineOptions = ['Western', 'Italian', 'Chinese', 'Malay', 'Indian', 'Japanese', 'Korean', 'Thai', 'Vietnamese'];

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const username = localStorage.getItem('username');
        
        const response = await fetch(`http://localhost:8080/account/cuisine/${username}`);
        const data = await response.json();
        
        if (response.ok && data.preferences) {
          const prefs = [data.preferences.rank1, data.preferences.rank2, data.preferences.rank3].filter(Boolean);
          setSelectedCuisines(prefs.map(p => p.charAt(0).toUpperCase() + p.slice(1)));
          setPriceRange(data.budget || 50);
        } else {
          setSelectedCuisines(['Italian', 'Japanese', 'Korean']);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setSelectedCuisines(['Italian', 'Japanese', 'Korean']);
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, []);

  // Poll group status every 3 seconds
  useEffect(() => {
    if (!groupId) return;

    const pollGroupStatus = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await fetch(`http://localhost:8080/api/group/${groupId}/status`);
        const data = await response.json();
        
        if (response.ok) {
          setMembers(data.members || []);
      
          const currentMember = data.members.find(m => m.username === username);
          if (currentMember) {
            setIsLeader(currentMember.is_leader === true);
          }
          
          const allReady = data.members.every(m => m.preferences_set === true);
          setAllMembersReady(allReady);

          if (data.voting_started && data.restaurants) {
            navigate('/foodball/voting', {
              state: {
                groupId: groupId,
                groupName: groupName,
                restaurants: data.restaurants,
                isLeader: currentMember?.is_leader || false
              }
            });
          }
        }
      } catch (error) {
        console.error('Error polling group status:', error);
      }
    };

    pollGroupStatus();
    const interval = setInterval(pollGroupStatus, 3000);

    return () => clearInterval(interval);
  }, [groupId, navigate, groupName]);

  const getCuisineRank = (cuisine) => {
    const index = selectedCuisines.indexOf(cuisine);
    return index !== -1 ? index + 1 : null;
  };

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      if (selectedCuisines.length <= 3) return;
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      if (selectedCuisines.length >= 3) {
        setSelectedCuisines([cuisine, selectedCuisines[0], selectedCuisines[1]]);
      } else {
        setSelectedCuisines([cuisine, ...selectedCuisines]);
      }
    }
  };

  const handleSavePreferences = async () => {
    if (selectedCuisines.length !== 3) {
      alert('Please select exactly 3 cuisines');
      return;
    }

    const username = localStorage.getItem('username');
    setIsSaving(true);

    try {
      const saveResponse = await fetch('http://localhost:8080/account/cuisine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          preferences: {
            rank1: selectedCuisines[0].toLowerCase(),
            rank2: selectedCuisines[1].toLowerCase(),
            rank3: selectedCuisines[2].toLowerCase()
          },
          budget: priceRange
        })
      });

      if (!saveResponse.ok) throw new Error('Failed to save preferences');

      const groupResponse = await fetch(`http://localhost:8080/api/group/${groupId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          cuisines: selectedCuisines.map(c => c.toLowerCase()),
          price_range: priceRange,
          hunger_level: hungerLevel
        })
      });

      if (!groupResponse.ok) throw new Error('Failed to update group preferences');

      alert('Preferences saved successfully!');
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
      setIsSaving(false);
    }
  };

  const handleStartVoting = async () => {
    if (!allMembersReady) {
      alert('Not all members are ready!');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/recommendations/group/${groupId}`,
        { method: 'POST' }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      
      if (!data.eateries || data.eateries.length === 0) {
        alert('No restaurants found. Try different preferences!');
        return;
      }

      await fetch(`http://localhost:8080/api/group/${groupId}/start-voting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurants: data.eateries })
    });
      
      navigate('/foodball/voting', {
        state: {
          groupId: groupId,
          groupName: groupName,
          restaurants: data.eateries,
          isLeader: true
        }
      });
      
    } catch (error) {
      console.error('Error starting voting:', error);
      alert('Failed to start voting. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="inProgressPage">
        <Navbar />
        <div className="content">
          <h2>Loading your preferences...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="inProgressPage">
      <Navbar />
      <div className="content">
        <div className="header">
          <h1>{groupName}</h1>
          <p className="subtitle">Set your dining preferences</p>
        </div>

        <div className="preferenceSection">
          <h3>Meal Preference</h3>
          <p className="hint">Select 3 cuisines in order of preference</p>
          <div className="cuisineTags">
            {cuisineOptions.map((cuisine) => {
              const rank = getCuisineRank(cuisine);
              return (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`cuisineTag ${rank ? 'selected' : ''}`}
                >
                  {cuisine}
                  {rank && <span className="rankBadge">{rank}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="preferenceSection">
          <h3>Price Range</h3>
          <input
            type="range"
            min="10"
            max="100"
            value={priceRange}
            onChange={(e) => setPriceRange(parseInt(e.target.value))}
            className="slider"
          />
          <div className="sliderLabels">
            <span>$10</span>
            <span className="currentValue">${priceRange}</span>
            <span>$100+</span>
          </div>
        </div>

        <div className="preferenceSection">
          <h3>Hunger Level</h3>
          <input
            type="range"
            min="1"
            max="10"
            value={hungerLevel}
            onChange={(e) => setHungerLevel(parseInt(e.target.value))}
            className="slider"
          />
          <div className="sliderLabels">
            <span>Light</span>
            <span className="currentValue">{hungerLevel}/10</span>
            <span>Starving</span>
          </div>
        </div>

        <button 
          onClick={handleSavePreferences} 
          className="saveBtn"
          disabled={isSaving || selectedCuisines.length !== 3}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>

        <div className="membersSection">
          <h3>Group Members</h3>
          <div className="membersList">
            {members.map((member) => (
              <div key={member.username} className="memberCard">
                <div className="memberInfo">
                  <span className="memberName">{member.username}</span>
                  {member.is_leader && <span className="leaderBadge">Leader</span>}
                </div>
                <span className={`status ${member.preferences_set ? 'ready' : 'deciding'}`}>
                  {member.preferences_set ? 'Ready' : 'Deciding...'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ONLY SHOW BUTTON IF USER IS LEADER */}
        {isLeader && (
          <button 
            onClick={handleStartVoting} 
            className="startVotingBtn"
            disabled={!allMembersReady}
          >
            {allMembersReady ? 'Start Voting' : 'Waiting for members...'}
          </button>
        )}

        {/* ONLY SHOW MESSAGE IF USER IS NOT LEADER */}
        {!isLeader && (
          <div className="waitingMessage">
            <p>Waiting for leader to start voting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
