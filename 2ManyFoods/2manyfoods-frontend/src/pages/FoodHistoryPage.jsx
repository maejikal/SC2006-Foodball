import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './FoodHistoryPage.css';

export default function FoodHistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([
    {
      name: "Mamma Mia Trattoria E Caffe",
      image: "/assets/restaurants/mamma-mia.jpg",
      reviewed: false,
      rating: 0
    },
    {
      name: "TANG^2 Malatang - 超烫麻辣烫",
      image: "/assets/restaurants/tang2.jpg",
      reviewed: true,
      rating: 4
    },
    {
      name: "DIN TAI FUNG",
      image: "/assets/restaurants/dintaifung.jpg",
      reviewed: true,
      rating: 5
    }
  ]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>★</span>
      );
    }
    return stars;
  };

  return (
    <div className="foodHistoryPage">
      <Navbar />
      <div className="historySection">
        <h1>Food history / Foodprints</h1>
        <ul className="historyList">
          {history.map((item, index) => (
            <li key={index}>
              <div className="restaurantInfo">
                <img src={item.image} alt={item.name} />
                <div>
                  <span>{item.name}</span>
                  <div className="stars">{renderStars(item.rating)}</div>
                </div>
              </div>
              <button onClick={() => navigate('/account/review')}>
                {item.reviewed ? 'Edit Review' : 'Review'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
