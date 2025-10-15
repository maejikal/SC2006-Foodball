import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import UserAvatar from '../components/UserAvatar';
import './AccountPage.css';

export default function AccountPage() {
  const navigate = useNavigate();

  const user = {
    name: 'harry potter',
    email: 'harrypotter@gmail.com',
    avatar: '/assets/icons8-crab-50.png',
  };

  const settings = [
    { name: 'account & security', path: '/account/security' },
    { name: 'dietary preference', path: '/account/dietary' },
    { name: 'cuisine preference', path: '/account/cuisine' },
    { name: 'food history / foodprints', path: '/account/history' },
  ];

  return (
    <div className="accountPage">
      <Navbar />
      <div className="accountContent">
        <UserAvatar src={user.avatar} alt={user.name} size={100} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <div className="settingsList">
          {settings.map((s) => (
            <div
              key={s.name}
              className="settingItem"
              onClick={() => navigate(s.path)}
            >
              <p>{s.name}</p>
              <span>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
