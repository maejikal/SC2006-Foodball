import { useState } from 'react';
import starIcon from '../assets/Icons/star.svg';
import './StarRating.css';

export default function StarRating({ rating, setRating, size = 24, disabled = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="starRating">
      {[1, 2, 3, 4, 5].map((star) => (
        <img
          key={star}
          src={starIcon}
          alt={`Star ${star}`}
          className={`star ${star <= (hover || rating) ? 'filled' : 'empty'}`}
          style={{ 
            width: size, 
            height: size,
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.6 : 1
          }}
          onClick={() => !disabled && setRating?.(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
        />
      ))}
    </div>
  );
}
