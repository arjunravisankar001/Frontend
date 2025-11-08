import './TopInstructors.css';
import React from 'react';

interface TopInstructorsProps {
  instructors: string[];
  loading: boolean;
  onSelectInstructor: (instructor: string) => void;
}

const TopInstructors: React.FC<TopInstructorsProps> = ({ 
  instructors, 
  loading, 
  onSelectInstructor 
}) => {
  return (
    <div className="top-instructors">
      <h2 className="section-title">🏆 Top 3 Instructors</h2>
      {loading ? (
        <div className="loading">Loading top instructors...</div>
      ) : instructors && instructors.length > 0 ? (
        <div className="instructors-list">
          {instructors.map((instructor, index) => (
            <div 
              key={index} 
              className="instructor-item"
              onClick={() => onSelectInstructor(instructor)}
            >
              <div className="rank">{index + 1}</div>
              <div className="instructor-name">{instructor}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">No data available</div>
      )}
    </div>
  );
};

export default TopInstructors;