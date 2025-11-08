import './StatCard.css';

const StatCard = ({ title, value, icon, type = 'number', loading = false }) => {
  const formatValue = () => {
    if (loading) return '...';
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'rating':
        return typeof value === 'number' ? value.toFixed(2) : value;
      case 'decimal':
        return typeof value === 'number' ? value.toFixed(1) : value;
      case 'session':
        return value || 'N/A';
      default:
        return value;
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