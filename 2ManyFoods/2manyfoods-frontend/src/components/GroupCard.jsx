import React from 'react';
import './GroupCard.css';

export default function GroupCard({ group, onClick }) {
  return (
    <div className="groupCard" onClick={onClick}>
      <h3>{group.name}</h3>
      <p>{group.membersText}</p>
    </div>
  );
}