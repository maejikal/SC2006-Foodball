import React from 'react';
import './FormInput.css';

export default function FormInput({ label, type = "text", name, value, onChange, placeholder, error }) {
  return (
    <div className="formInput">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? 'error' : ''}
      />
      {error && <div className="errorText">{error}</div>}
    </div>
  );
}
