import React from 'react';
import Navbar from '../components/AuthenticatedNavbar';
import './ResultsPage.css';

export default function ResultsPage() {
  // Simulated data (replace with actual state or props later)
  const selectedRestaurant = {
    name: 'Mamma Mia Trattoria E Caffè',
    image: 'https://prod-gravy-uploads.s3.ap-southeast-1.amazonaws.com/brands/d9eebf4d-a2ad-4308-94fd-0eef568ca8cd/mamma-mia%21-trattoria-e-caffe.jpg_db3297e46c074e8a823070df3304557c.jpg',
    voters: [
      { name: 'Jessica', avatar: '/avatars/jessica.png' },
      { name: 'Draco', avatar: '/avatars/draco.png' },
      { name: 'You', avatar: '/avatars/you.png' },
    ],
  };

  return (
    <div className="resultsPage">
      <Navbar />
      <div className="resultsContent">
        <h1>foodball has spoken...</h1>

        <div className="resultCard">
          <img src={selectedRestaurant.image} />
          <div className="resultDetails">
            <h2>{selectedRestaurant.name}</h2>
            <div className="membersVotes">
              {selectedRestaurant.voters.map((member, index) => (
                <img
                  key={index}
                  src={member.avatar}
                  alt={member.name}
                  className="memberAvatar"
                />
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => window.location.href = '/foodball/in-progress'}>
          retry foodball
        </button>
      </div>
    </div>
  );
}
