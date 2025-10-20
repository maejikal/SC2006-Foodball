import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './CreateGroupPage.css';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [groupPic, setGroupPic] = useState(null);
  const [groupPicFile, setGroupPicFile] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    setImageError('');

    if (file) {

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setImageError('Please upload a valid image file (JPEG, PNG)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupPic(reader.result);
        setGroupPicFile(file);
      };
      reader.onerror = () => {
        setImageError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    setError('');

    if (!groupName.trim()) {
      setError('Group name is required');
      return false;
    }

    if (groupName.trim().length < 3) {
      setError('Group name must be at least 3 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      
      // Api Call

      setTimeout(() => {
        setIsCreating(false);
        // Navigate to groups page with the new group data
        navigate('/groups', {
          state: { 
            message: 'Group created successfully!',
            newGroup: {
              id: Date.now(), // Generate a unique group ID (in real app, this would come from backend)
              name: groupName.trim(),
              membersText: 'you',
              picture: groupPic
            }
          }
        });
      }, 1000);

    } catch (error) {
      console.error('Error creating group:', error);
      setError('Network error. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="createGroupPage">
      <Navbar />
      <div className="createGroupContainer">
        <h1>create group</h1>

        {/* Error Message */}
        {error && (
          <div 
            className="errorMessage" 
            style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="groupPicInput" className="groupPicUpload">
            {groupPic ? (
              <img src={groupPic} alt="Group" />
            ) : (
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
            <div className="editIconOverlay">
              <img src="/assets/icons8-edit-20.png" alt="Edit" />
            </div>
            <input
              type="file"
              id="groupPicInput"
              accept="image/*"
              onChange={handlePicUpload}
              style={{ display: 'none' }}
              disabled={isCreating}
            />
          </label>

          {/* Image Error Message */}
          {imageError && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {imageError}
            </p>
          )}

          <p className="uploadText">Upload group picture</p>
          
          <input
            type="text"
            placeholder="group name"
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setError('');
            }}
            required
            disabled={isCreating}
          />
          
          <button 
            type="submit"
            disabled={isCreating || !!imageError}
          >
            {isCreating ? 'Creating...' : 'create'}
          </button>
        </form>
      </div>
    </div>
  );
}