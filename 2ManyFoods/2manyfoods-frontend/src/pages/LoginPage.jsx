import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [tempEmail, setTempEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Email is required';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 14) {
      newErrors.password = 'Password must be at least 14 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.usernameOrEmail,
          password: form.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
    
      // CRITICAL: Clear any existing session data first
      sessionStorage.clear();
      
      if (data.username) {
        sessionStorage.setItem('username', data.username);
      }
      
      navigate('/');
    } catch (error) {
      setAuthError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    setResetEmail('');
    setResetMessage('');
    setResetStep(1);
  };

  const handleResetPassword = async () => {
    if (resetStep === 1) {
      // Step 1: Send code
      if (!resetEmail.trim()) {
        setResetMessage('Email required');
        return;
      }
      try {
        const response = await fetch('http://localhost:8080/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setTempEmail(resetEmail);
        setResetStep(2);
        setResetMessage('');
      } catch (error) {
        setResetMessage(error.message);
      }
    } else if (resetStep === 2) {
      // Step 2: Verify code
      if (!resetCode.trim()) {
        setResetMessage('Enter code');
        return;
      }
      try {
        const response = await fetch('http://localhost:8080/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: tempEmail, code: resetCode })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setResetStep(3);
        setResetMessage('');
      } catch (error) {
        setResetMessage(error.message);
      }
    } else if (resetStep === 3) {
      // Step 3: Reset password
      if (!newPassword || !confirmPassword) {
        setResetMessage('Enter both passwords');
        return;
      }
      if (newPassword !== confirmPassword) {
        setResetMessage('Passwords must match');
        return;
      }
      if (newPassword.length < 14) {
        setResetMessage('Password must be 14+ characters');
        return;
      }
      try {
        const response = await fetch('http://localhost:8080/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: tempEmail, newPassword })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setResetMessage('Password reset successfully!');
        setTimeout(() => handleCloseModal(), 1500);
      } catch (error) {
        setResetMessage(error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowForgotPasswordModal(false);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetMessage('');
  };

  return (
    <div className="loginPage">
      <Navbar />
      <div className="loginContainer">
        <h1>login</h1>
        <img src="/assets/2manyfoods-logo.png" alt="2manyfoods" />
        
        <form onSubmit={handleSubmit}>
          {authError && <div className="error">{authError}</div>}
          
          <input
            type="text"
            name="usernameOrEmail"
            placeholder="Email"
            value={form.usernameOrEmail}
            onChange={handleChange}
          />
          {errors.usernameOrEmail && <div className="error">{errors.usernameOrEmail}</div>}
          
          <div className="passwordInputWrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="togglePassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img 
                src={showPassword ? "/assets/icons8-eye-50.png" : "/assets/icons8-closed-eye-50.png"} 
                alt="Toggle password visibility"
              />
            </button>
          </div>
          {errors.password && <div className="error">{errors.password}</div>}
          
          <div className="forgotLink">
            <a href="#" onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>
              forgot password?
            </a>
          </div>
          
          <Button 
            type="submit" 
            variant="default"
            text={isLoading ? 'logging in...' : 'login'}
            disabled={isLoading}
          />
        </form>
        
        <p>
          Don't have an account?{' '}
          <a href="/signup">sign up</a>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseModal}>×</button>
            
            {resetStep === 1 && (
              <>
                <h2>Reset Password</h2>
                <input 
                  type="email" 
                  placeholder="Enter email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <Button onClick={handleResetPassword} text="Send Code" />
              </>
            )}
            
            {resetStep === 2 && (
              <>
                <h2>Enter Code</h2>
                <p>Code sent to {tempEmail}</p>
                <input 
                  type="text" 
                  placeholder="Enter code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                />
                <Button onClick={handleResetPassword} text="Verify" />
              </>
            )}
            
            {resetStep === 3 && (
              <>
                <h2>New Password</h2>
                <input 
                  type="password" 
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button onClick={handleResetPassword} text="Reset" />
              </>
            )}
            
            {resetMessage && <p className="error">{resetMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
