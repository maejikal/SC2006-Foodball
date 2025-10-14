import React from 'react';
import AuthenticatedNavbar from '../components/AuthenticatedNavbar';
import './DashboardPage.css';

export default function DashboardPage() {
  return (
    <div className="dashboardPage">
      <AuthenticatedNavbar />
      <div className="dashboardContent">
        <div className="accountCard">
          <div className="emoji">🍜</div>
          <h2>@username</h2>
          <p>username@gmail.com</p>
          <button className="editButton">edit profile</button>
        </div>
      </div>
    </div>
  );
}
