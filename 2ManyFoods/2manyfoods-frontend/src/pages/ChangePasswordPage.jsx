import React, { useState } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import './ChangePasswordPage.css';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = {
    avatar: '/assets/icons8-crab-50.png',
    name: 'harry potter'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    console.log('Changing password...');
    // Handle password change logic here
    alert('Password changed successfully!');
  };

  const handleAvatarEdit = () => {
    console.log('Edit avatar clicked');
    // Handle avatar edit logic
  };

  return (
    <div className="changePasswordPage">
      <Navbar />
      <div className="changePasswordContent">
        <h2>Account & Security</h2>
        
        <div className="avatarSection">
          <img src={user.avatar} alt={user.name} />
          <div className="editIcon" onClick={handleAvatarEdit}>
            ✎
          </div>
        </div>

        <h3>Change Password</h3>

        <div className="passwordFormContainer">
          <p>Please enter your existing password and your new password</p>
          
          <form className="passwordForm" onSubmit={handleSubmit}>
            <div className="formGroup">
              <label>Current Password</label>
              <div className="passwordInputWrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="togglePassword"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  👁
                </button>
              </div>
            </div>

            <div className="formGroup">
              <label>New Password</label>
              <div className="passwordInputWrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="togglePassword"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  👁
                </button>
              </div>
            </div>

            <div className="formGroup">
              <label>Confirm New Password</label>
              <div className="passwordInputWrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="togglePassword"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  👁
                </button>
              </div>
            </div>

            <button type="submit" className="changePasswordBtn">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}