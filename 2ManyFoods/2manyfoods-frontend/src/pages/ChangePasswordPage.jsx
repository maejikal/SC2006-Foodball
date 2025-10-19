import React, { useState } from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import { useNavigate } from 'react-router-dom';
import './ChangePasswordPage.css';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validatePassword = (password) => {
    const issues = [];

    if (password.length < 14) {
      issues.push('Password must be at least 14 characters long');
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      issues.push('Password must contain at least one number');
    }
    if (!/[a-zA-Z]/.test(password)) {
      issues.push('Password must contain at least one letter');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push('Password must contain at least one special character');
    }

    const commonWords = ['password', 'pass', '1234', 'qwerty', 'admin', 'letmein'];
    const lowerPassword = password.toLowerCase();
    const foundCommon = commonWords.find(word => lowerPassword.includes(word));
    if (foundCommon) {
      issues.push(`Password cannot contain common words like "${foundCommon}"`);
    }

    return issues;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordIssues = validatePassword(newPassword);
      if (passwordIssues.length > 0) {
        newErrors.newPassword = passwordIssues[0];
      }
    }

    if (newPassword && currentPassword && newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try{

      //api call here

      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage('Password changed successfully!');
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          navigate('/account');
        }, 2000);
      }, 1000);

    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      setIsLoading(false);
    }
    
  };

  return (
    <div className="changePasswordPage">
      <Navbar />
      <div className="changePasswordContent">
        <h3>Change Password</h3>

        <div className="passwordFormContainer">
          <p>Please enter your existing password and your new password</p>

          {/* Success Message */}
          {successMessage && (
            <div 
              className="successMessage" 
              style={{
                color: 'green', 
                backgroundColor: '#d4edda', 
                padding: '0.75rem', 
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
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
              {errorMessage}
            </div>
          )}
          
          <form className="passwordForm" onSubmit={handleSubmit}>
            <div className="formGroup">
              <label>Current Password</label>
              <div className="passwordInputWrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) {
                      setErrors((prev) => ({ ...prev, currentPassword: '' }));
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="togglePassword"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <img 
                    src={showCurrentPassword ? '/assets/icons8-eye-50.png' : '/assets/icons8-closed-eye-50.png'}
                    alt={showCurrentPassword ? 'Hide password' : 'Show password'}
                  />
                </button>
              </div>
              {errors.currentPassword && (
                <div className="error" style={{color: 'red', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                  {errors.currentPassword}
                </div>
              )}
            </div>

            <div className="formGroup">
              <label>New Password</label>
              <div className="passwordInputWrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="togglePassword"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <img 
                    src={showNewPassword ? '/assets/icons8-eye-50.png' : '/assets/icons8-closed-eye-50.png'}
                    alt={showNewPassword ? 'Hide password' : 'Show password'}
                  />
                </button>
              </div>
              {errors.newPassword && (
                <div className="error" style={{color: 'red', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                  {errors.newPassword}
                </div>
              )}
            </div>

            <div className="formGroup">
              <label>Confirm New Password</label>
              <div className="passwordInputWrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="togglePassword"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <img 
                    src={showConfirmPassword ? '/assets/icons8-eye-50.png' : '/assets/icons8-closed-eye-50.png'}
                    alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                  />
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="error" style={{color: 'red', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="changePasswordBtn"
              disabled={isLoading}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}