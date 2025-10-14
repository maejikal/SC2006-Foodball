import React from 'react';
import './UserAvatar.css';

export default function UserAvatar({ src, alt, size = 50 }) {
  return (
    <img
      src={src}
      alt={alt}
      className="userAvatar"
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
}
