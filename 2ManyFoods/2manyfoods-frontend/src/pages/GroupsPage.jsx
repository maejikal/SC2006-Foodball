import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import GroupCard from '../components/GroupCard';
import './GroupsPage.css';

export default function GroupsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [yourGroups, setYourGroups] = useState([]);

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

  return (
    <div className="groupsPage">
      <Navbar />

      <div className="groupsContent">
        <h1>Groups</h1>
        
        {/* Conditional description text */}
        <p>
          {yourGroups.length === 0 
            ? "You are not in any group, create one to begin" 
            : "View and manage your groups"}
        </p>

        {/* Create Group Button */}
        <div className="createGroupBtn">
          <button onClick={() => navigate('/groups/create')}>
            + create group
          </button>
        </div>

        {/* Single Groups Section */}
        <div className="groupsSection">
          {yourGroups.length === 0 ? (
            <div className="emptyState">
              <p>No groups yet. Create your first group to get started!</p>
            </div>
          ) : (
            <div className="groupList">
              {yourGroups.map((group) => (
                <GroupCard key={group.id} group={group}
                onClick={() => navigate('/groups/:groupId')} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
