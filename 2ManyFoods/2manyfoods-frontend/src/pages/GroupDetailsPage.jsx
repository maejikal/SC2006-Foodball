import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './GroupDetailsPage.css';

export default function GroupDetailsPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();

  // Get group data from location state if it's a new group
  const initialGroupName = location.state?.groupName || 'supper';
  const initialGroupPic = location.state?.groupPic;

  const [group] = useState({
    id: groupId,
    name: initialGroupName,
    membersCount: 4,
    maxMembers: 20,
  });

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

  const handleAddMember = () => {
    const inviteLink = `${window.location.origin}/groups/invite/${groupId}`;
    // In a real app, this would open a share dialog or invite modal
    alert(`Send this invite link to new members:\n${inviteLink}`);
  };

  const handleStartFoodball = () => {
    navigate('/foodball/in-progress', {
      state: {
        groupName: group.name,
        groupId: group.id
      }
    });
  };

  const handleBackToGroups = () => {
    // Pass the group data back to GroupsPage
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
              <button className="addMemberBtn" onClick={handleAddMember}>
                add member
              </button>
            </div>
          </div>
          <button className="startFoodballBtn" onClick={handleStartFoodball}>
            start a foodball
          </button>
        </div>

        <div className="membersSection">
          <h2>group members {group.membersCount}/{group.maxMembers}</h2>
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
      </div>
    </div>
  );
}