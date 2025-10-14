import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted', form);
    // Navigate or authenticate
    navigate('/dashboard');
  };

  return (
    <div className="loginPage">
      <Navbar />
      <div className="loginContainer">
        <h1>Login</h1>

        {/* 🍜 Emoji */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍜</div>

        <form onSubmit={handleSubmit}>
          <FormInput
            type="text"
            name="usernameOrEmail"
            placeholder="email/username"
            value={form.usernameOrEmail}
            onChange={handleChange}
          />
          {errors.usernameOrEmail && (
            <div className="error">{errors.usernameOrEmail}</div>
          )}

          <FormInput
            type="password"
            name="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && (
            <div className="error">{errors.password}</div>
          )}

          <div className="forgotLink">
            <a href="/forgot">forgot password?</a>
          </div>

          <Button
            text="login"
            type="submit"
            style={{ width: '100%', backgroundColor: '#7f56d9', color: 'white' }}
          />

        </form>

        <p>
          don’t have an account?{' '}
          <a href="/signup">sign up</a>
        </p>
      </div>
    </div>
  );
}
