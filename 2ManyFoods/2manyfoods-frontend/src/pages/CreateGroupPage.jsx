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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('http://localhost:8080/api/groups/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Username: localStorage.getItem('username'), 
          GroupName: groupName,
          photo: groupPic || ''
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create group');
      }

      navigate('/groups', {
        state: {
          message: result.message,
          newGroup: {
            id: result.group_id,
            name: groupName.trim(),
            membersText: 'you',
            picture: groupPic
          }
        }
      });
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="createGroupPage">
      <Navbar />
      <div className="createGroupContainer">
        <h1>Create Group</h1>

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