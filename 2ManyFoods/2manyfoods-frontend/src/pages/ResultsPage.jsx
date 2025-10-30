import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/AuthenticatedNavbar';
import './ResultsPage.css';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupName, winner } = location.state || {};
  
  const isIndividual = !groupName;

  if (!winner) {
    return (
      <div className="resultsPage">
        <Navbar />
        <div className="resultsContent">
          <h1>Something went wrong. Please try again.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="resultsPage">
      <Navbar />
      <div className="resultsContent">
        <h1>{isIndividual ? 'Chosen food!' : 'We have a winner!'}</h1>
        <div className="resultCard">
          <div className="resultDetails">
            <h2>{winner.displayName?.text || winner.name || 'Restaurant'}</h2>
            <p>{winner.shortFormattedAddress || winner.vicinity || winner.formatted_address || 'Location'}</p>
            {!isIndividual && (
              <div className="groupInfo">
                <strong>Group:</strong> {groupName}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => navigate(isIndividual ? '/' : '/groups')}>
          {isIndividual ? 'back to home' : 'back to groups'}
        </button>
      </div>
    </div>
  );
}
