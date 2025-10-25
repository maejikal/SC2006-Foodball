import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import GroupCard from '../components/GroupCard';
import './GroupsPage.css';

export default function GroupsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [yourGroups, setYourGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          console.error("Username not found in localStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/groups/user/${username}`);
        const data = await response.json();

        if (response.ok) {
          const mappedGroups = (data || []).map(g => ({
            ...g,
            picture: g.photo || "/assets/default-group.png"
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

  // Handler for when a group card is clicked
  const handleGroupClick = (group) => {
    navigate(`/groups/${group.id}`, {
      state: {
        groupName: group.name,
        groupPic: group.picture || group.photo
      }
    });
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

        {/* Create Group Button */}
        <div className="createGroupBtn">
          <button onClick={() => navigate('/groups/create')}>
            + create group
          </button>
        </div>

        {/* Single Groups Section */}
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
    </div>
  );
}
