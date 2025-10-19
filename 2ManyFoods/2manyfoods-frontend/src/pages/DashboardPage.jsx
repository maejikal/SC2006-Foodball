import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedNavbar from '../components/AuthenticatedNavbar';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/account');
  };

  return (
    <div className="dashboardPage">
      <AuthenticatedNavbar />
      <div className="dashboardContent">
        <div className="accountCard">
          <img src="/assets/icons8-crab-50.png" alt="Profile" className="profileIcon" />
          <h2>@harry potter</h2>
          <p>harrypotter@gmail.com</p>
          <button className="editButton" onClick={handleEditProfile}>edit profile</button>
        </div>
      </div>
    </div>
  );
}