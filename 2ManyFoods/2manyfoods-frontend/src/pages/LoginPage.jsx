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
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetMessage('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage('Password reset link sent! Please check your email.');
      } else {
        setResetMessage(data.error || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      setResetMessage('An error occurred. Please try again later.');
    }
  };

  const handleCloseModal = () => {
    setShowForgotPasswordModal(false);
    setResetEmail('');
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
        <div className="modalOverlay" onClick={handleCloseModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Reset Password</h2>
            <p className="modalInstructions">
              Please enter your email in the box below. We will send you a link to access further instructions.
            </p>
            
            <input
              type="email"
              className="resetEmailInput"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setResetMessage('');
              }}
            />
            
            {resetMessage && (
              <p className={`resetMessage ${resetMessage.includes('sent') ? 'success' : 'error'}`}>
                {resetMessage}
              </p>
            )}
            
            <div className="modalButtons">
              <button className="backBtn" onClick={handleCloseModal}>
                back to login
              </button>
              <button className="resetBtn" onClick={handleResetPassword}>
                reset password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}