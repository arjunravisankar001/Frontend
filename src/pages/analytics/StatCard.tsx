import './StatCard.css';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  icon: React.ReactNode;
  type?: 'number' | 'rating' | 'decimal' | 'session';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  type = 'number', 
  loading = false 
}) => {
  const formatValue = (): string => {
    if (loading) return '...';
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'rating':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      case 'decimal':
        return typeof value === 'number' ? value.toFixed(1) : String(value);
      case 'session':
        return String(value) || 'N/A';
      default:
        return String(value);
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <p className={`stat-card-value ${type === 'session' ? 'session-name' : ''}`}>
          {formatValue()}
        </p>
      </div>
    </div>
  );
};

export default StatCard;