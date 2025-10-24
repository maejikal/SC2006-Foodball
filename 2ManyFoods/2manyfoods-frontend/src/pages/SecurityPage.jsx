import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import EditProfileModal from '../components/EditProfileModal';
import './SecurityPage.css';

export default function SecurityPage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: '/assets/icons8-crab-50.png',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalState, setModalState] = useState({
    isOpen: false,
    field: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError('');

      const username = localStorage.getItem('username');

      if (!username) {
        setError('Please log in to view your account');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/account/info/${username}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load account data');
        }

        setUser({
          name: data.username,
          email: data.email,
          avatar: data.profilePhoto || '/assets/icons8-crab-50.png'
        });
        setIsLoading(false);

      } catch (error) {
        setError('Failed to load account. Please try again.');
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newAvatar = reader.result;
        
        // Update UI immediately
        setUser({ ...user, avatar: newAvatar });
        
        const username = localStorage.getItem('username');
        
        try {
          const response = await fetch('http://localhost:8080/account/security', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              profile_photo: newAvatar
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to update profile photo');
          }

          console.log('Profile photo updated successfully!');

        } catch (error) {
          console.error('Error updating profile photo:', error);
          setError('Failed to update profile photo. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (field) => {
    setModalState({ isOpen: true, field });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, field: null });
  };

  const handleSaveField = async (field, newValue) => {
    const username = localStorage.getItem('username');
    
    if (!username) {
      setError('Please log in to make changes');
      return;
    }

    try {
      const requestBody = { username }; 

      if (field === 'name') {
        requestBody.new_username = newValue;
      } else if (field === 'email') {
        requestBody.new_email = newValue;
      }

      const response = await fetch('http://localhost:8080/account/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to update ${field}`);
      }

      setUser({ ...user, [field]: newValue });
      
      if (field === 'name') {
        localStorage.setItem('username', newValue);
      }

      alert(`${field === 'name' ? 'Username' : 'Email'} updated successfully!`);

      closeModal();

    } catch (error) {
      alert(error.message || `Failed to update ${field}. Please try again.`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="securityPage">
        <Navbar />
        <div className="securityContent">
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="securityPage">
        <Navbar />
        <div className="securityContent">
          <div 
            className="errorMessage" 
            style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="securityPage">
      <Navbar />
      <div className="securityContent">
        <div className="avatarContainer">
          <img src={user.avatar} alt={user.name} className="securityAvatar" />
          <label className="editAvatarLabel">
            <img 
              src="/assets/icons8-edit-20.png" 
              alt="Edit"
              className="editIcon"
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange}
              className="fileInput"
            />
          </label>
        </div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <div className="securityOptions">
          <div 
            className="securityItem"
            onClick={() => openModal('name')}
          >
            <span>Name</span>
            <span className="securityRight">{user.name} <span className="arrow">›</span></span>
          </div>

          <div 
            className="securityItem"
            onClick={() => openModal('email')}
          >
            <span>Email</span>
            <span className="securityRight">{user.email} <span className="arrow">›</span></span>
          </div>

          <div className="securityItem" onClick={() => navigate('/account/security/change-password')}>
            <span>Change Password</span>
            <span className="securityRight"><span className="arrow">›</span></span>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        field={modalState.field}
        currentValue={modalState.field === 'name' ? user.name : user.email}
        onSave={handleSaveField}
      />
    </div>
  );
}