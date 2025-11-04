import React from 'react';

import './FormInput.css';

export default function FormInput({ label, type = "text", name, value, onChange, placeholder, error }) {

return (
  <div className="formInput">
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <span className="errorText">{error}</span>}
  </div>
);
}
