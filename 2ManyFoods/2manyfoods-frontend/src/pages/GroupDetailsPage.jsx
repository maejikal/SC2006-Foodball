import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './GroupDetailsPage.css';

export default function GroupDetailsPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const currentUsername = localStorage.getItem('username');
  const isLeader = currentUsername === group?.leaderId;

  // Mapping for cuisine tags (same as SearchPage)
  const cuisineTags = {
    "bar_and_grill": 'western',
    'italian_restaurant': "italian",
    'chinese_restaurant': "chinese",
    'indonesian_restaurant': "indonesian",
    'indian_restaurant': "indian",
    'japanese_restaurant': "japanese",
    'korean_restaurant': "korean"
  };

  // Convert cuisine tag to display name
  const getDisplayCuisine = (cuisineTag) => {
    return cuisineTags[cuisineTag] || cuisineTag;
  };

  // Format preferences for display
  const getFormattedPreferences = (prefs) => {
    if (!prefs) return 'no preferences';
    
    // If preferences is an object with rank1, rank2, rank3
    if (prefs.rank1 || prefs.rank2 || prefs.rank3) {
      return [prefs.rank1, prefs.rank2, prefs.rank3]
        .filter(Boolean)
        .map(pref => getDisplayCuisine(pref))
        .join(', ');
    }
    
    // If preferences is an array
    if (Array.isArray(prefs)) {
      return prefs
        .map(pref => getDisplayCuisine(pref))
        .join(', ');
    }
    
    // Otherwise return as is
    return 'no preferences';
  };

  // Fetch group data
  useEffect(() => {
    async function fetchGroup() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:8080/api/groups/${groupId}`);
        const data = await response.json();
        if (response.ok) {
          setGroup({
            id: data.id,
            name: data.name,
            membersCount: data.total_users,
            maxMembers: 20,
            photo: data.photo,
            leaderId: data.owner
          });
          setMembers(data.members);
          setInviteCode(data.invite_code || '');
        } else {
          setError(data.error || 'Failed to fetch group.');
        }
      } catch (err) {
        setError('Error fetching group data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();
  }, [groupId]);

  // Members auto-navigate when leader starts (polls for rec_cons)
  useEffect(() => {
    if (!group || isLeader) return;

    const checkLeaderStarted = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/foodball/status/${group.name}`);
        const data = await response.json();

        if (data.status === 'ready') {
          navigate('/search', {
            state: {
              groupName: group.name,
              groupId: group.id,
              isIndividual: false,
              location: data.location
            }
          });
        }
      } catch (error) {
        console.error('Error checking leader status:', error);
      }
    };

    const interval = setInterval(checkLeaderStarted, 2000);
    return () => clearInterval(interval);
  }, [group, isLeader, navigate]);

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
      .then(() => alert('Invite code copied to clipboard!'));
  };

  const handleToggleInviteCode = () => {
    setShowInviteCode(!showInviteCode);
  };

  const handleStartFoodball = async () => {
    if (!group || !isLeader) return;

    try {
      await fetch('http://localhost:8080/api/foodball/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: groupId,
          username: currentUsername
        })
      });

      navigate('/location', {
        state: { groupName: group.name, groupId: group.id, isIndividual: false }
      });
    } catch (error) {
      console.error('Error starting foodball:', error);
      alert('Failed to start Foodball. Please try again.');
    }
  };

  const handleBackToGroups = () => {
    navigate('/groups');
  };

  const handleLeaveGroup = () => {
    setShowLeaveConfirmation(true);
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirmation(false);
  };

  const handleConfirmLeave = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/groups/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUsername,
          grp_id: groupId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave group');
      }

      navigate('/groups', {
        state: {
          removeGroupId: groupId,
          message: 'Successfully left the group'
        }
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      alert(`Failed to leave group: ${error.message}`);
      setShowLeaveConfirmation(false);
    }
  };

  return (
    <div className="groupDetailsPage">
      <Navbar />
      <div className="groupDetailContent">
        {loading ? (
          <p className="loadingText">Loading group...</p>
        ) : error ? (
          <p className="errorText">{error}</p>
        ) : !group ? (
          <p className="errorText">Group not found.</p>
        ) : (
          <>
            <div className="groupHeader">
              <div className="groupTitleSection">
                <h1 className="groupName">{group.name}</h1>
                <div className="groupActions">
                  <button className="showInviteCodeBtn" onClick={handleToggleInviteCode}>
                    {showInviteCode ? 'Hide' : 'Show'} Invite Code
                  </button>
                </div>
                {showInviteCode && (
                  <div className="inviteCodeSection">
                    <p className="inviteCodeLabel">Invite Code:</p>
                    <div className="inviteCodeDisplay">
                      <span className="inviteCode">{inviteCode}</span>
                      <button className="copyCodeBtn" onClick={handleCopyInviteCode}>
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="startFoodballBtn"
                onClick={handleStartFoodball}
                disabled={!isLeader}
                title={!isLeader ? 'Only the group leader can start Foodball' : 'Start Foodball'}
              >
                {isLeader ? 'Start Foodball' : 'Wait for leader to start'}
              </button>
            </div>

            <div className="membersSection">
              <h2>members ({group.membersCount}/{group.maxMembers})</h2>
              <div className="membersList">
                {members.map((member) => (
                  <div key={member.id} className="memberCard">
                    <img src={member.avatar} alt={member.name} className="memberAvatar" />
                    <div className="memberInfo">
                      <h3>
                        {member.name}
                        {member.id === group.leaderId && <span className="leaderTag">LEADER</span>}
                      </h3>
                      <p>likes {getFormattedPreferences(member.preferences)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bottomButtons">
              <button className="backToGroupsBtn" onClick={handleBackToGroups}>
                Back To Groups
              </button>
              <button className="leaveGroupBtn" onClick={handleLeaveGroup}>
                Leave Group
              </button>
            </div>
          </>
        )}
      </div>

      {showLeaveConfirmation && (
        <div className="confirmationOverlay">
          <div className="confirmationModal">
            <h3>Are you sure?</h3>
            <p>Do you want to leave this group?</p>
            <div className="confirmationButtons">
              <button className="cancelBtn" onClick={handleCancelLeave}>
                Cancel
              </button>
              <button className="confirmBtn" onClick={handleConfirmLeave}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
