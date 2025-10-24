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

  const currentUserId = localStorage.getItem('userId');

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

  // Generate mock invite code
  useEffect(() => {
    const generateMockCode = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return code;
    };
    setInviteCode(generateMockCode());
  }, [groupId]);

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/groups/invite/${groupId}`)
      .then(() => alert('Invite link copied to clipboard!'));
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
      .then(() => alert('Invite code copied to clipboard!'));
  };

  const handleStartFoodball = () => {
    if (!group) return;
    const isLeader = currentUserId === group.leaderId;
    navigate(isLeader ? '/foodball/select-location' : '/foodball/waiting', 
      { state: { groupName: group.name, groupId: group.id } }
    );
  };

  const handleBackToGroups = () => {
    navigate('/groups', {
      state: { newGroup: { id: group?.id, name: group?.name, membersText: `${members.length} members` } }
    });
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
                  <button className="copyInviteBtn" onClick={handleCopyInviteLink}>
                    copy invite link
                  </button>
                </div>
                <div className="inviteCodeSection">
                  <p className="inviteCodeLabel">invite code:</p>
                  <div className="inviteCodeDisplay">
                    <span className="inviteCode">{inviteCode}</span>
                    <button className="copyCodeBtn" onClick={handleCopyInviteCode}>
                      copy
                    </button>
                  </div>
                </div>
              </div>
              <button className="startFoodballBtn" onClick={handleStartFoodball}>
                start foodball
              </button>
            </div>

            <div className="membersSection">
              <h2>members ({group.membersCount}/{group.maxMembers})</h2>
              <div className="membersList">
                {members.map((member) => (
                  <div key={member.id} className="memberCard">
                    <img src={member.avatar} alt={member.name} className="memberAvatar"/>
                    <div className="memberInfo">
                      <h3>{member.name}</h3>
                      <p>likes {member.preferences?.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleBackToGroups}
              style={{
                background: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '0.7rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.95rem',
                marginTop: '2rem',
                textTransform: 'lowercase'
              }}
            >
              back to groups
            </button>
          </>
        )}
      </div>
    </div>
  );
}
