import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './CreateGroupPage.css';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [groupPic, setGroupPic] = useState(null);

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupPic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a unique group ID (in real app, this would come from backend)
    const newGroupId = Date.now();
    
    console.log('Create group:', groupName);
    
    // Navigate to groups page with the new group data
    navigate('/groups', { 
      state: { 
        newGroup: {
          id: newGroupId,
          name: groupName,
          membersText: 'you'
        }
      } 
    });
  };

  return (
    <div className="createGroupPage">
      <Navbar />
      <div className="createGroupContainer">
        <h1>create group</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="groupPicInput" className="groupPicUpload">
            {groupPic ? (
              <img src={groupPic} alt="Group" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
            <input
              type="file"
              id="groupPicInput"
              accept="image/*"
              onChange={handlePicUpload}
            />
          </label>
          <p className="uploadText">upload a group pic</p>
          
          <input
            type="text"
            placeholder="group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          
          <button type="submit">create</button>
        </form>
      </div>
    </div>
  );
}