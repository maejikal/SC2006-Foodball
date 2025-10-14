import React from 'react';
import './Button.css'; // or module

export default function Button({ text, variant = "default", ...props }) {
  return (
    <button className={`btn ${variant}`} {...props}>
      {text}
    </button>
  );
}
