import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './ResultsPage.css';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupName, winner } = location.state || {};

  if (!winner) {
    return (
      <div className="resultsPage">
        <Navbar />
        <div className="resultsContent">
          <h1>No Results</h1>
          <p>Something went wrong. Please try again.</p>
          <button onClick={() => navigate('/groups')}>Back to Groups</button>
        </div>
      </div>
    );
  }

  return (
    <div className="resultsPage">
      <Navbar />
      
      <div className="resultsContent">
        <h1>Group Decision!</h1>

        <div className="resultCard">
          <div className="resultDetails">
            <h2>{winner.displayName?.text || winner.name}</h2>
            
            <p className="address" style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#ccc' }}>
              {winner.shortFormattedAddress || winner.vicinity || winner.formatted_address || 'Location'}
            </p>

            {groupName && (
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#aaa' }}>
                Group: {groupName}
              </p>
            )}
          </div>
        </div>

        <button onClick={() => navigate('/groups')}>Back to Groups</button>
      </div>
    </div>
  );
}
