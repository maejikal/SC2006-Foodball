import React from 'react';
import './GroupCard.css';

export default function GroupCard({ group, onClick }) {
  return (
    <div className="groupCard" onClick={onClick}>
      <div className="groupCardContent">
        {group.picture && (
          <img 
            src={group.picture} 
            alt={group.name} 
            className="groupPicture"
          />
        )}
        <div className="groupInfo">
          <h3>{group.name}</h3>
          <p>{group.membersText}</p>
        </div>
      </div>
    </div>
  );
}
