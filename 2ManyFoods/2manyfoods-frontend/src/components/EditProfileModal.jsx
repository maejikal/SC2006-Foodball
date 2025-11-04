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
      setNewValue(isEmailVerification ? (currentValue || '') : '');
      setConfirmValue('');
      setVerificationCode('');
      setShowVerification(isEmailVerification); // Auto-show verification for signup
      setError('');
    }
  }, [isOpen, currentValue, isEmailVerification]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on any child elements
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendVerification = async () => {
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
      
      // Send verification code to the new email
      try {
        const response = await fetch('http://localhost:8080/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newValue })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send verification code');
        }

        // Show verification step
        setShowVerification(true);
      } catch (error) {
        setError(error.message || 'Failed to send verification code. Please try again.');
      }
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
      if (isEmailVerification) {
        // For signup flow - verify the code
        await onSave(field, verificationCode);
      } else {
        // For profile edit flow - verify code then update email
        const response = await fetch('http://localhost:8080/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newValue,
            code: verificationCode
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid verification code');
        }

        // Verification successful, now update the email
        await onSave(field, newValue);
      }
      
      onClose();
    } catch (error) {
      setError(error.message || 'Verification failed. Please try again.');
      setVerificationCode(''); // Clear the input when verification fails
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
    <div className="modalOverlay" onClick={handleOverlayClick}>
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
                  onFocus={(e) => !isEmailVerification && e.target.select()} // added
                  placeholder={`Enter new ${field}`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                />
              </div>

              <div className="formGroup">
                <label>Confirm {getFieldLabel()}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  placeholder={`Confirm new ${field}`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
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
                A verification code has been sent to <strong>{isEmailVerification ? currentValue : newValue}</strong>
              </p>
              <div className="formGroup">
                <label>Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  maxLength="6"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  autoFocus
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