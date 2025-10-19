import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import EditProfileModal from '../components/EditProfileModal';
import './SecurityPage.css';

export default function SecurityPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'harry potter',
    email: 'harrypotter@gmail.com',
    avatar: '/assets/icons8-crab-50.png',
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    field: null,
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result });
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

  const handleSaveField = (field, newValue) => {
    setUser({ ...user, [field]: newValue });
  };

  return (
    <div className="securityPage">
      <Navbar />
      <div className="securityContent">
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
          <img src={user.avatar} alt={user.name} className="securityAvatar" />
          <label style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            background: 'white',
            color: 'black',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            ✎
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
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