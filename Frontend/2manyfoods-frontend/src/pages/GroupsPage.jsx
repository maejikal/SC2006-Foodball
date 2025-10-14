import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import GroupCard from '../components/GroupCard';
import InviteCard from '../components/InviteCard';
import './GroupsPage.css';

export default function GroupsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [yourGroups, setYourGroups] = useState([]);
  const [invites, setInvites] = useState([
    { 
      inviterName: 'hermione', 
      groupName: 'gryffindor', 
      id: 1,
      avatar: '/assets/icons8-butterfly-50.png',
      members: ['hermione', 'ron', 'neville', 'ginny', 'snape', 'dumbledore']
    },
    { 
      inviterName: 'ron', 
      groupName: 'da boyz', 
      id: 2,
      avatar: '/assets/icons8-shark-50.png',
      members: ['ron', 'harry', 'dean']
    },
  ]);

  // Check if a new group was created and add it to the list
  useEffect(() => {
    if (location.state?.newGroup) {
      const newGroup = location.state.newGroup;
      setYourGroups((prevGroups) => {
        // Check if group already exists to avoid duplicates
        const exists = prevGroups.some(g => g.id === newGroup.id);
        if (!exists) {
          return [...prevGroups, newGroup];
        }
        return prevGroups;
      });
    }
  }, [location.state?.newGroup]);

  const handleAccept = (inviteId) => {
    const acceptedInvite = invites.find((inv) => inv.id === inviteId);
    if (acceptedInvite) {
      // Create members text
      const memberNames = acceptedInvite.members.slice(0, 4).join(', ');
      const membersText = acceptedInvite.members.length > 4 
        ? `${memberNames} and ${acceptedInvite.members.length - 4}+ others`
        : memberNames;

      setYourGroups((prevGroups) => [
        ...prevGroups,
        {
          id: acceptedInvite.id,
          name: acceptedInvite.groupName,
          membersText: membersText,
        },
      ]);
      setInvites((prevInvites) => prevInvites.filter((inv) => inv.id !== inviteId));
    }
  };

  const handleReject = (inviteId) => {
    setInvites((prevInvites) => prevInvites.filter((inv) => inv.id !== inviteId));
  };

  return (
    <div className="groupsPage">
      <Navbar />
      <div className="groupsContent">
        <h1>groups</h1>

        {yourGroups.length === 0 ? (
          <p>you are not in any group, accept an invite or create one to begin</p>
        ) : (
          <div className="groupList">
            {yourGroups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                onClick={() => navigate(`/groups/${g.id}`)}
              />
            ))}
          </div>
        )}

        <div className="inviteSection">
          {invites.length > 0 && <h2>invites</h2>}
          {invites.map((inv) => (
            <InviteCard
              key={inv.id}
              inviterName={inv.inviterName}
              groupName={inv.groupName}
              avatar={inv.avatar}
              onAccept={() => handleAccept(inv.id)}
              onReject={() => handleReject(inv.id)}
            />
          ))}
        </div>

        <div className="createGroupBtn">
          <button onClick={() => navigate('/groups/create')}>+ create group</button>
        </div>
      </div>
    </div>
  );
}