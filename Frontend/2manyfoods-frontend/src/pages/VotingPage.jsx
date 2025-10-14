import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VotingPage.css';
import Navbar from '../components/AuthenticatedNavbar';

export default function VotingPage() {
  const navigate = useNavigate();

  const options = [
    { id: 1, name: 'Mamma Mia Trattoria E Caffe' },
    { id: 2, name: 'Tang ^2 Malatang' },
    { id: 3, name: 'DIN TAI FUNG' },
  ];

  const handleVote = (optionId) => {
    console.log('Voted for:', optionId);
    navigate('/foodball/results');
  };

  return (
    <div className="votingPage">
      <Navbar />
      <div className="votingContent">
        <h1>vote for food!</h1>
        <p>Based on your preferences, these are the top 3 food suggestions:</p>
        <div className="optionList">
          {options.map((option) => (
            <div
              key={option.id}
              className="optionCard"
              onClick={() => handleVote(option.id)}
            >
              {option.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
