import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';

export default function EditProfileModal({ isOpen, onClose, field, currentValue, onSave }) {
  const [newValue, setNewValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewValue(currentValue || '');
      setConfirmValue('');
      setVerificationCode('');
      setShowVerification(false);
      setError('');
    }
  }, [isOpen, currentValue]);

  if (!isOpen) return null;

  const handleSendVerification = () => {
    setError('');

    // Validation
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
      // Here you would typically send verification code to the new email
      console.log('Verification code sent to:', newValue);
    } else {
      // For name, save directly without verification
      onSave(field, newValue);
      onClose();
    }
  };

  const handleVerify = () => {
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    onSave(field, newValue);
    onClose();
  };

  const getFieldLabel = () => {
    return field === 'name' ? 'Name' : 'Email';
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <h3>Edit {getFieldLabel()}</h3>
        
        {!showVerification ? (
          <>
            <div className="modalBody">
              {/* ✓ NEW: Show current value */}
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
                A verification code has been sent to {newValue}
              </p>
              <div className="formGroup">
                <label>Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                />
              </div>

              {error && (
                <div className="errorMessage">{error}</div>
              )}
            </div>

            <div className="modalActions">
              <button className="cancelBtn" onClick={() => setShowVerification(false)}>
                Back
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