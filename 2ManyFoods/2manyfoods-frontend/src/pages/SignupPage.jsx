import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import EditProfileModal from '../components/EditProfileModal';
import './SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Email verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [tempEmail, setTempEmail] = useState(''); // Store email being verified

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Reset email verification if email changes
    if (name === 'email' && isEmailVerified) {
      setIsEmailVerified(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{8,15}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validatePassword = (password, username) => {
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

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      issues.push('Password cannot contain your username');
    }

    const commonWords = ['password', 'pass', '1234', 'qwerty', 'admin', 'letmein'];
    const lowerPassword = password.toLowerCase();
    const foundCommon = commonWords.find(word => lowerPassword.includes(word));
    if (foundCommon) {
      issues.push(`Password cannot contain common words like "${foundCommon}"`);
    }

    return issues;
  };

  const handleSendVerification = async () => {
    if (!form.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }

    if (!isValidEmail(form.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setIsSendingCode(true);
    setAuthError('');

    try {
      const response = await fetch('http://localhost:8080/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      // Store the email being verified and open modal
      setTempEmail(form.email);
      setShowVerificationModal(true);
    } catch (error) {
      setAuthError(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmail = async (field, verificationCode) => {
    try {
      const response = await fetch('http://localhost:8080/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tempEmail,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Verification successful
      setIsEmailVerified(true);
      alert('Email verified successfully!');
      
    } catch (error) {
      throw error; // Let EditProfileModal handle the error display
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isEmailVerified) {
      newErrors.email = 'Please verify your email first';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordIssues = validatePassword(form.password, form.username);
      if (passwordIssues.length > 0) {
        newErrors.password = passwordIssues[0];
      }
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          email: form.email,
          phone: form.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      if (data.username) {
        localStorage.setItem('username', data.username);
      }

      navigate('/account/dietary', { state: { isOnboarding: true } });

    } catch (error) {
      setAuthError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signupPage">
      <Navbar />
      <div className="signupContainer">
        <h1>sign up</h1>
        <div className='logo'>
          <img
            src="/assets/2manyfoods-logo.png"
            alt="2manyfoods"
            style={{width:'150px', height: '150px'}}
          />
        </div>

        {authError && (
          <div className="authError" style={{color: 'red', marginBottom: '1rem'}}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email with Verification Button */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <FormInput
                type='email'
                name="email"
                placeholder="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="button"
              onClick={handleSendVerification}
              disabled={isSendingCode || isEmailVerified}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: isEmailVerified ? '#4caf50' : '#6e4ccf',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: isEmailVerified ? 'default' : 'pointer',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                opacity: isSendingCode ? 0.6 : 1
              }}
            >
              {isSendingCode ? 'Sending...' : isEmailVerified ? '✓ Verified' : 'Verify'}
            </button>
          </div>
          {errors.email && (
            <div className="error">{errors.email}</div>
          )}
          
          <div className="passwordInputWrapper">
            <FormInput
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="togglePassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img 
                src={showPassword ? '/assets/icons8-eye-50.png' : '/assets/icons8-closed-eye-50.png'}
                alt={showPassword ? 'Hide password' : 'Show password'}
              />
            </button>
          </div>
          {errors.password && (
            <div className="error">{errors.password}</div>
          )}

          <div className="passwordInputWrapper">
            <FormInput
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
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
            <div className="error">{errors.confirmPassword}</div>
          )}

          <FormInput
            name="username"
            placeholder="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          {errors.username && (
            <div className="error">{errors.username}</div>
          )}

          <FormInput
            type='tel'
            name="phone"
            placeholder="phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && (
            <div className="error">{errors.phone}</div>
          )}

          <Button
            text={isLoading ? "Signing up..." : "sign up"}
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#6e4ccf',
              color: 'white',
              padding: '0.8rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          />
        </form>
      </div>

      {/* Reuse EditProfileModal for Email Verification */}
      <EditProfileModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        field="email_verification"
        currentValue={tempEmail}
        onSave={handleVerifyEmail}
      />
    </div>
  );
}