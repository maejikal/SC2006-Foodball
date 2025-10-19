import React, { useState } from 'react';
import './EditProfileModal.css';

export default function EditProfileModal({ isOpen, onClose, field, currentValue, onSave }) {
  const [step, setStep] = useState(1);
  const [newValue, setNewValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStepOne = async () => {
    setError('');
    
    if (!newValue.trim()) {
      setError(`Please enter a new ${field}`);
      return;
    }

    if (field === 'email' && !isValidEmail(newValue)) {
      setError('Please enter a valid email address');
      return;
    }

    if (newValue === currentValue) {
      setError(`New ${field} must be different from current ${field}`);
      return;
    }

    setLoading(true);
    // Simulate sending verification code
    setTimeout(() => {
      const code = Math.random().toString().slice(2, 8);
      setSentCode(code);
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleStepTwo = async () => {
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode !== sentCode) {
      setError('Verification code is incorrect');
      return;
    }

    setLoading(true);
    // Simulate verification success
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 800);
  };

  const handleConfirm = () => {
    onSave(field, newValue);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setNewValue('');
    setVerificationCode('');
    setSentCode('');
    setError('');
    onClose();
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Change {field === 'email' ? 'Email' : 'Name'}</h2>
          <button className="closeBtn" onClick={handleClose}>✕</button>
        </div>

        <div className="stepIndicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`stepLine ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`stepLine ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {step === 1 && (
          <div className="stepContent">
            <p className="stepTitle">Enter new {field}</p>
            <input
              type={field === 'email' ? 'email' : 'text'}
              placeholder={`Current ${field}: ${currentValue}`}
              value={newValue}
              onChange={(e) => {
                setNewValue(e.target.value);
                setError('');
              }}
              className="modalInput"
            />
            {error && <p className="errorText">{error}</p>}
            <button 
              className="modalBtn primary"
              onClick={handleStepOne}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="stepContent">
            <p className="stepTitle">Enter verification code</p>
            <p className="stepSubtext">We've sent a 6-digit code to your current email</p>
            <input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                setError('');
              }}
              className="modalInput"
              maxLength="6"
            />
            {error && <p className="errorText">{error}</p>}
            <div className="modalActions">
              <button 
                className="modalBtn secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button 
                className="modalBtn primary"
                onClick={handleStepTwo}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="stepContent">
            <div className="successIcon">✓</div>
            <p className="stepTitle">Email verified!</p>
            <p className="stepSubtext">Your {field} has been verified. Click confirm to update.</p>
            <p className="newValue">New {field}: <strong>{newValue}</strong></p>
            <button 
              className="modalBtn primary"
              onClick={handleConfirm}
            >
              Confirm & Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
}