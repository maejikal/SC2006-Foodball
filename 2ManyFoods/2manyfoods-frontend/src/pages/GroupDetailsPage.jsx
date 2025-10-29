import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './GroupDetailsPage.css';

export default function GroupDetailsPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();

  const initialGroupName = location.state?.groupName || 'supper';
  const initialGroupPic = location.state?.groupPic;

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const currentUsername = localStorage.getItem('username');

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

  // Check if current user is the leader
  const isLeader = currentUsername === group?.leaderId;

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
      .then(() => alert('Invite code copied to clipboard!'));
  };

  const handleToggleInviteCode = () => {
    setShowInviteCode(!showInviteCode);
  };

  const handleStartFoodball = async () => {
    if (!group) return;
    
    if (isLeader) {
      // Leader: Notify backend that session started, then navigate to MapPage
      try {
        await fetch('http://localhost:8080/api/foodball/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: groupId,
            username: currentUsername
          })
        });
        
        // Navigate to MapPage (same as individual)
        navigate('/location', 
          { state: { groupName: group.name, groupId: group.id, isIndividual: false } }
        );
      } catch (error) {
        console.error('Error starting foodball:', error);
        alert('Failed to start Foodball. Please try again.');
      }
    } else {
      // Member: Go to waiting page
      navigate('/foodball/waiting', 
        { state: { groupName: group.name, groupId: group.id } }
      );
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUsername,
          grp_id: groupId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave group');
      }

      // Navigate back to groups page
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
                className={`startFoodballBtn ${!isLeader ? 'disabled' : ''}`}
                onClick={handleStartFoodball}
                title={!isLeader ? 'Only the group leader can start Foodball' : ''}
              >
                Start Foodball
                {!isLeader && <span className="leaderOnlyTag">(Leader Only)</span>}
              </button>
            </div>

            <div className="membersSection">
              <h2>members ({group.membersCount}/{group.maxMembers})</h2>
              <div className="membersList">
                {members.map((member) => (
                  <div key={member.id} className="memberCard">
                    <img src={member.avatar} alt={member.name} className="memberAvatar"/>
                    <div className="memberInfo">
                      <h3>
                        {member.name}
                        {member.id === group.leaderId && <span className="leaderTag">LEADER</span>}
                      </h3>
                      <p>likes {member.preferences?.join(', ') || 'no preferences'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bottomButtons">
              <button className='backToGroupsBtn' onClick={handleBackToGroups}>
                Back To Groups
              </button>
              <button className='leaveGroupBtn' onClick={handleLeaveGroup}>
                Leave Group
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Popup */}
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
