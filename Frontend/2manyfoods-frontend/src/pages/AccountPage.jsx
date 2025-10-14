import React from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import UserAvatar from '../components/UserAvatar';
import './AccountPage.css';

const settings = [
  { name: 'Account', path: '/account' },
  { name: 'Notification', path: '/account/notification' },
  { name: 'Appearance', path: '/account/appearance' },
  { name: 'Privacy & Security', path: '/account/privacy' },
  { name: 'Food History / Foodprints', path: '/account/history' },
  { name: 'Language', path: '/account/language' },
];  

export default function AccountPage() {
  const user = {
    name: 'harry potter',
    email: 'harrypotter@gmail.com',
    avatar: 'public/assets/icons8-crab-50.png',
  };

  return (
    <div className="accountPage">
      <Navbar />
      <div className="accountContent">
        <UserAvatar src={user.avatar} alt={user.name} size={100} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <div className="settingsList">
          {settings.map((s) => (
            <div key={s.name} className="settingItem">
              <p>{s.name}</p>
              <span>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
