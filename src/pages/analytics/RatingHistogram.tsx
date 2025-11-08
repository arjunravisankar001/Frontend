import { useState, useEffect } from 'react';
import { getRatingHistogram } from '../../api/analyticsApi';
import './RatingHistogram.css';

const RatingHistogram = (username: string) => {
  const [histogram, setHistogram] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      loadHistogram();
    }
  }, [username]);

  const loadHistogram = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRatingHistogram(username);
      setHistogram(data);
    } catch (err) {
      setError('Failed to load rating histogram');
      console.error('Error loading rating histogram:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rating-histogram loading">
        <div className="histogram-header">
          <h3 className="histogram-title">📊 Rating Distribution</h3>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rating-histogram error">
        <div className="histogram-header">
          <h3 className="histogram-title">📊 Rating Distribution</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!histogram) {
    return null;
  }

  const maxValue = Math.max(...histogram, 1);
  const total = histogram.reduce((sum, count) => sum + count, 0);

  return (
    <div className="rating-histogram">
      <div className="histogram-header">
        <h3 className="histogram-title">📊 Rating Distribution</h3>
        <p className="histogram-subtitle">Total Ratings: {total}</p>
      </div>
      <div className="histogram-bars">
        {histogram.map((count, index) => {
          const rating = index + 1;
          const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
          const heightPercentage = maxValue > 0 ? (count / maxValue * 100) : 0;
          
          return (
            <div key={rating} className="histogram-bar-container">
              <div className="histogram-bar-wrapper">
                <div 
                  className="histogram-bar" 
                  style={{ height: `${heightPercentage}%` }}
                  title={`${count} ratings (${percentage}%)`}
                >
                  <span className="bar-count">{count}</span>
                </div>
              </div>
              <div className="histogram-label">
                <span className="rating-stars">{'⭐'.repeat(rating)}</span>
                <span className="rating-number">{rating}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingHistogram;