import React from 'react';

export default function InviteCard({ inviterName, groupName, onAccept, onReject, avatar }) {
  return (
    <div className="inviteCard">
      <img src={avatar} alt={inviterName} />
      <div className="inviteText">
        {inviterName} is inviting you to join the group "{groupName}"!
      </div>
      <div className="inviteActions">
        <button className="acceptBtn" onClick={onAccept}>
          accept
        </button>
        <button className="rejectBtn" onClick={onReject}>
          reject
        </button>
      </div>
    </div>
  );
}