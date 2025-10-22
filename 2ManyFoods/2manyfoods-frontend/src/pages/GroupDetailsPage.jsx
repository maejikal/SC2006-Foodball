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

  const [group] = useState({
    id: groupId,
    name: initialGroupName,
    membersCount: 4,
    maxMembers: 20,
  });

  const [inviteCode, setInviteCode] = useState('');

  // TODO: Replace with actual user session data
  const currentUserId = 4; // Mock current user ID - change here to see leader or user page
  const groupLeaderId = 4; // Mock leader ID (first member or creator)

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

  const [members] = useState([
    { 
      id: 1, 
      name: 'Jessica', 
      preferences: 'likes italian, seafood, mala', 
      avatar: '/assets/icons8-rabbit-50.png' 
    },
    { 
      id: 2, 
      name: 'Daniel', 
      preferences: 'likes thai, seafood, mala', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel&backgroundColor=e0d5d5' 
    },
    { 
      id: 3, 
      name: 'Draco', 
      preferences: 'likes chinese, chicken rice', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Draco&backgroundColor=ffd6cc' 
    },
    { 
      id: 4, 
      name: 'You', 
      preferences: 'likes chinese, chicken rice', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=ffd6cc' 
    }
  ]);

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/invite/${groupId}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Invite link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      alert('Invite code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleStartFoodball = () => {
    // Check if current user is the leader
    const isLeader = currentUserId === groupLeaderId;

    if (isLeader) {
      // Leader goes to location selection page
      navigate('/foodball/select-location', { 
        state: { 
          groupName: group.name, 
          groupId: group.id 
        } 
      });
    } else {
      // Other members go to waiting page
      navigate('/foodball/waiting', { 
        state: { 
          groupName: group.name, 
          groupId: group.id 
        } 
      });
    }
  };

  const handleBackToGroups = () => {
    navigate('/groups', { 
      state: { 
        newGroup: { 
          id: group.id, 
          name: group.name, 
          membersText: 'you' 
        } 
      } 
    });
  };

  return (
    <div className="groupDetailsPage">
      <Navbar />
      <div className="groupDetailContent">
        <div className="groupHeader">
          <div className="groupTitleSection">
            <h1>{group.name}</h1>
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
                <img src={member.avatar} alt={member.name} />
                <div className="memberInfo">
                  <h3>{member.name}</h3>
                  <p>{member.preferences}</p>
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
      </div>
    </div>
  );
}
