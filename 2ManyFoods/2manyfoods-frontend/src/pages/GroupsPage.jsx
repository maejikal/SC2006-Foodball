import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import GroupCard from '../components/GroupCard';
import defaulGroupIcon from '../assets/Icons/defaultgroup.png';
import './GroupsPage.css';

export default function GroupsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [yourGroups, setYourGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const username = sessionStorage.getItem('username');
        if (!username) {
          console.error("Username not found in sessionStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/groups/user/${username}`);
        const data = await response.json();

        if (response.ok) {
          const mappedGroups = (data || []).map(g => ({
            ...g,
            picture: g.photo || defaulGroupIcon
          }));
          setYourGroups(mappedGroups);
        } else {
          console.error("Failed to fetch groups:", data.error);
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  // Handle removing a group when coming back from GroupDetailsPage
  useEffect(() => {
    if (location.state?.removeGroupId) {
      setYourGroups(prev => prev.filter(g => g.id !== location.state.removeGroupId));
      
      if (location.state?.message) {
        alert(location.state.message);
      }
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.newGroup) {
      const newGroup = location.state.newGroup;
      setYourGroups(prev => {
        const exists = prev.some(g => g.id === newGroup.id);
        if (!exists) {
          return [...prev, newGroup];
        }
        return prev;
      });
    }
  }, [location.state?.newGroup]);

  const handleGroupClick = (group) => {
    navigate(`/groups/${group.id}`, {
      state: {
        groupName: group.name,
        groupPic: group.picture || group.photo
      }
    });
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }

    setJoining(true);
    setJoinError('');

    try {
      const username = sessionStorage.getItem('username');
      const response = await fetch('http://localhost:8080/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          username: username
        })
      });

      const data = await response.json();

      if (response.ok) {
        const joinedGroup = {
          ...data.group,
          picture: data.group.photo || defaulGroupIcon
        };
        setYourGroups(prev => [...prev, joinedGroup]);
        setShowJoinModal(false);
        setInviteCode('');
        setJoinError('');
        alert(`Successfully joined ${data.group.name}!`);
      } else {
        setJoinError(data.error || 'Failed to join group');
      }
    } catch (err) {
      console.error("Error joining group:", err);
      setJoinError('An error occurred. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="groupsPage">
      <Navbar />

      <div className="groupsContent">
        <h1>Groups</h1>
        
        <p>
          {yourGroups.length === 0 
            ? "You are not in any group, create one to begin" 
            : "View and manage your groups"}
        </p>

        {/* Create & Join Group Buttons */}
        <div className="createGroupBtn">
          <button onClick={() => navigate('/groups/create')}>
            + create group
          </button>
          <button onClick={() => setShowJoinModal(true)}>
            + join group
          </button>
        </div>

        <div className="groupsSection">
          {loading ? (
            <p>Loading groups...</p>
          ) : yourGroups.length === 0 ? (
            <div className="emptyState">
              <p>No groups yet. Create your first group to get started!</p>
            </div>
          ) : (
            <div className="groupList">
              {yourGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  onClick={() => handleGroupClick(group)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="modalOverlay" onClick={() => setShowJoinModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>join group</h2>
            <p>Enter the invite code to join a group</p>
            <input
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="inviteCodeInput"
            />
            {joinError && <p className="errorMessage">{joinError}</p>}
            <div className="modalActions">
              <button 
                className="cancelBtn" 
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                  setJoinError('');
                }}
              >
                Cancel
              </button>
              <button 
                className="joinBtn" 
                onClick={handleJoinGroup}
                disabled={joining || !inviteCode.trim()}
              >
                {joining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
