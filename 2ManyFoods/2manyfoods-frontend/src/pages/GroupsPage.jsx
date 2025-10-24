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

  return (
    <div className="groupsPage">
      <Navbar />
      <div className="groupsContent">
        <h1>groups</h1>
        <p>view and manage your groups</p>
        
        <div className="createGroupBtn">
          <button onClick={() => navigate('/groups/create')}>+ create group</button>
        </div>

        <div className="yourGroupsSection">
          <h2>your groups</h2>
          {loading ? (
            <p style={{ color: 'white', fontSize: '1rem' }}>Loading groups...</p>
          ) : yourGroups.length === 0 ? (
            <p style={{ color: 'white', fontSize: '1rem' }}>you are not in any group, create one to begin</p>
          ) : (
            <div className="groupList">
              {yourGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onClick={() => navigate(`/groups/${group.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
