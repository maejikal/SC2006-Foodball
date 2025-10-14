import React from 'react';
import './TagFilterGroup.css';

export default function TagFilterGroup({ tags, selectedTags, onToggle }) {
  return (
    <div className="tagFilterGroup">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            className={`tag ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggle(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
