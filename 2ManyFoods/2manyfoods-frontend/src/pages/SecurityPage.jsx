import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import UserAvatar from '../components/UserAvatar';
import './SecurityPage.css';

export default function SecurityPage() {
  const navigate = useNavigate();

  const user = {
    name: 'harry potter',
    email: 'harrypotter@gmail.com',
    avatar: '/assets/icons8-crab-50.png',
  };

  return (
    <div className="securityPage">
      <Navbar />
      <div className="securityContent">
        <UserAvatar src={user.avatar} alt={user.name} size={80} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <div className="securityOptions">
          <div className="securityItem">
            <span>Name</span>
            <span className="securityRight">{user.name} <span className="arrow">›</span></span>
          </div>

          <div className="securityItem">
            <span>Email</span>
            <span className="securityRight">{user.email} <span className="arrow">›</span></span>
          </div>

          <div className="securityItem" onClick={() => navigate('/account/security/change-password')}>
            <span>Change Password</span>
            <span className="securityRight"><span className="arrow">›</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}