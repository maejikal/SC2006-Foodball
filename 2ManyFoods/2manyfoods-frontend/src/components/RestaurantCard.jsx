import React from 'react';
import './RestaurantCard.css';

export default function RestaurantCard({ image, name, address, priceRange, statusText }) {
  return (
    <div className="restaurantCard">
      <div className="imageWrapper">
        <img src={image} alt={name} />
      </div>
      <div className="info">
        <h3>{name}</h3>
        <p>{address}</p>
        <p className="price">{priceRange}</p>
        <p className="status">{statusText}</p>
      </div>
    </div>
  );
}
