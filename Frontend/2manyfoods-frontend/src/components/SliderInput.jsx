import React from 'react';
import './SliderInput.css';

export default function SliderInput({ min, max, value, onChange }) {
  return (
    <input
      type="range"
      className="slider"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
    />
  );
}
