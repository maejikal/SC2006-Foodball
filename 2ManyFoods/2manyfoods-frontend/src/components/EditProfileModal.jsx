import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';

export default function EditProfileModal({ isOpen, onClose, field, currentValue, onSave }) {
  const [newValue, setNewValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');

  // Check if this is being used for email verification (signup flow)
  const isEmailVerification = field === 'email_verification';

  useEffect(() => {
    if (isOpen) {
      setNewValue(currentValue || '');
      setConfirmValue('');
      setVerificationCode('');
      setShowVerification(isEmailVerification); // Auto-show verification for signup
      setError('');
    }
  }, [isOpen, currentValue, isEmailVerification]);

  if (!isOpen) return null;

  const handleSendVerification = () => {
    setError('');

    // Skip validation if already in email verification mode (signup)
    if (isEmailVerification) {
      return;
    }

    // Validation for profile edit mode
    if (!newValue.trim()) {
      setError(`New ${field} cannot be empty`);
      return;
    }

    if (newValue !== confirmValue) {
      setError(`${field === 'name' ? 'Names' : 'Emails'} do not match`);
      return;
    }

    if (newValue === currentValue) {
      setError('New value must be different from current value');
      return;
    }

    if (field === 'name' && newValue.length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }

    if (field === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newValue)) {
        setError('Please enter a valid email address');
        return;
      }
      // For email, show verification step
      setShowVerification(true);
      console.log('Verification code sent to:', newValue);
    } else {
      // For name, save directly without verification
      onSave(field, newValue);
      onClose();
    }
  };

  const handleVerify = async () => {
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      // For email verification (signup), pass verification code
      // For profile edit, pass new value
      await onSave(field, isEmailVerification ? verificationCode : newValue);
      onClose();
    } catch (error) {
      setError(error.message || 'Verification failed. Please try again.');
    }
  };

  const getFieldLabel = () => {
    if (isEmailVerification) return 'Email';
    return field === 'name' ? 'Name' : 'Email';
  };

  const getModalTitle = () => {
    if (isEmailVerification) return 'Verify Email';
    return `Edit ${getFieldLabel()}`;
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <h3>{getModalTitle()}</h3>
        
        {!showVerification ? (
          <>
            <div className="modalBody">
              {/* Show current value only in edit mode */}
              <div style={{ marginBottom: '1rem', color: '#999', fontSize: '0.9rem' }}>
                Current {getFieldLabel()}: <strong style={{ color: '#ddd' }}>{currentValue}</strong>
              </div>

              <div className="formGroup">
                <label>New {getFieldLabel()}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Enter new ${field}`}
                />
              </div>

              <div className="formGroup">
                <label>Confirm {getFieldLabel()}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  placeholder={`Confirm new ${field}`}
                />
              </div>

              {error && (
                <div className="errorMessage">{error}</div>
              )}
            </div>

            <div className="modalActions">
              <button className="cancelBtn" onClick={onClose}>
                Cancel
              </button>
              <button className="saveBtn" onClick={handleSendVerification}>
                {field === 'email' ? 'Send Verification' : 'Save'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modalBody">
              <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#ddd' }}>
                A verification code has been sent to <strong>{currentValue}</strong>
              </p>
              <div className="formGroup">
                <label>Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  maxLength="6"
                />
              </div>

              {error && (
                <div className="errorMessage">{error}</div>
              )}
            </div>

            <div className="modalActions">
              <button 
                className="cancelBtn" 
                onClick={() => {
                  if (isEmailVerification) {
                    onClose(); // Close modal for signup flow
                  } else {
                    setShowVerification(false); // Go back for edit flow
                  }
                }}
              >
                {isEmailVerification ? 'Cancel' : 'Back'}
              </button>
              <button className="saveBtn" onClick={handleVerify}>
                Verify
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}