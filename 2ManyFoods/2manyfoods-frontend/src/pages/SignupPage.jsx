import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup form submitted', form);
    navigate('/dashboard');
  };

  return (
    <div className="signupPage">
      <Navbar />
      <div className="signupContainer">
        <h1>sign up</h1>
        <div className="emoji">🍜</div>
        <form onSubmit={handleSubmit}>
          <FormInput
            name="email"
            placeholder="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <FormInput
            type="password"
            name="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <FormInput
            type="password"
            name="confirmPassword"
            placeholder="confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          <FormInput
            name="username"
            placeholder="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
          />
          <FormInput
            name="phone"
            placeholder="phone number"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <Button
            text="sign up"
            type="submit"
            style={{
              width: '110%',
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
