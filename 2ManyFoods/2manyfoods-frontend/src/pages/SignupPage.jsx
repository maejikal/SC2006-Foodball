import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import './SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  // store signup form input values
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Phone validation 
  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{8,15}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  // Password validation
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

    return issues; // return all the problem found
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordIssues = validatePassword(form.password, form.username);
      if (passwordIssues.length > 0) {
        newErrors.password = passwordIssues[0]; // Shows first issue
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup form submitted', form); // remove later
    setAuthError('');
    if (!validateForm()) {
    return; 
    }

    setIsLoading(true);

    try {

      //app call

      setTimeout(() => {
          setIsLoading(false);
          navigate('/account/dietary', { state: { isOnboarding: true } }); 
        }, 1000);    

    } catch (error) {
      setAuthError('An error occurred. Please try again.');
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
          <FormInput
            type='email' // make it email type
            name="email"
            placeholder="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <div className="error">{errors.email}</div>
          )}
          
          <FormInput
            type="password" //make the field show **
            name="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <div className="error">{errors.password}</div>
          )}

          <FormInput
            type="password"
            name="confirmPassword"
            placeholder="confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
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
            type='tel' // phone type, so keyboard shows numpad
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
            disabled={isLoading} // disable the button during submit
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
    </div>
  );
}
