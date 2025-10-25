import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  //store the form input values
  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target; //get which field changed and it new value
    setForm((prev) => ({ ...prev, [name]: value })); //update it

    //clear error message
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Email or username is required';
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
    e.preventDefault(); //prevent page refresh
    console.log('Login form submitted', form); // can remove later one
    setAuthError('');

    if(!validateForm()){
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

    console.log('Login successful:', data);

    if (data.username) {
      localStorage.setItem('username', data.username);
    }
    
    navigate('/search');

  } catch (error) {
    console.error('Login error:', error);
    setAuthError(error.message || 'Invalid email or password. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="loginPage">
      <Navbar />
      <div className="loginContainer">
        <h1>Login</h1>

        <div style={{marginBottom:'0.5rem'}}>
          <img
            src="/assets/2manyfoods-logo.png"
            alt="2manyfoods"
            style={{width:'150px', height: '150px'}}
          />
        </div>
        {/*if logn fails, show error message*/}
        {authError && (
          <div className="authError" style={{color: 'red', marginBottom: '1rem'}}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            type="text"
            name="usernameOrEmail"
            placeholder="email"
            value={form.usernameOrEmail}
            onChange={handleChange}
            required // make sure field is not empty
          />
          {errors.usernameOrEmail && (
            <div className="error">{errors.usernameOrEmail}</div>
          )}

          <div className="passwordInputWrapper">
            <FormInput
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="password"
              value={form.password}
              onChange={handleChange}
              required // make sure field is not empty
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

          <div className="forgotLink">
            <a href="/forgot">forgot password?</a>
          </div>

          <Button
            text={isLoading ? "Logging in..." : "login"}
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', backgroundColor: '#7f56d9', color: 'white' }}
          />

        </form>

        <p>
          don't have an account?{' '}
          <a href="/signup">sign up</a>
        </p>
      </div>
    </div>
  );
}