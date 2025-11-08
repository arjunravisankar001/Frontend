import { useState, useEffect } from 'react';
import { getAttendanceTimeline } from '../../api/analyticsApi';
import './AttendanceTimeline.css';

interface AttendanceTimelineProps {
  username: string;
}

const AttendanceTimeline: React.FC<AttendanceTimelineProps> = ({ username }) => {
  const [timeline, setTimeline] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (username) {
      loadTimeline();
    }
  }, [username]);

  const loadTimeline = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data = await getAttendanceTimeline(username);
      setTimeline(data);
    } catch (err) {
      setError('Failed to load attendance timeline');
      console.error('Error loading attendance timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="attendance-timeline loading">
        <div className="timeline-header">
          <h3 className="timeline-title">📈 Attendance Timeline</h3>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-timeline error">
        <div className="timeline-header">
          <h3 className="timeline-title">📈 Attendance Timeline</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return null;
  }

  const maxAttendance = Math.max(...timeline, 1);
  const minAttendance = Math.min(...timeline, 0);
  const avgAttendance = timeline.reduce((sum, val) => sum + val, 0) / timeline.length;
  
  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 250;
  const padding = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  
  // Calculate points
  const points = timeline.map((value, index) => {
    const x = padding.left + (index / (timeline.length - 1)) * chartWidth;
    const normalizedValue = (value - minAttendance) / (maxAttendance - minAttendance || 1);
    const y = padding.top + (1 - normalizedValue) * chartHeight;
    return { x, y, value, index: index + 1 };
  });
  
  // Create SVG path
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`
  ).join(' ');
  
  // Create area path (fill under the line)
  const areaPath = `${pathData} L ${points[points.length - 1].x},${svgHeight - padding.bottom} L ${padding.left},${svgHeight - padding.bottom} Z`;

  return (
    <div className="attendance-timeline">
      <div className="timeline-header">
        <h3 className="timeline-title">📈 Attendance Timeline</h3>
        <div className="timeline-stats">
          <span className="timeline-stat">
            <strong>Sessions:</strong> {timeline.length}
          </span>
          <span className="timeline-stat">
            <strong>Avg Attendance:</strong> {avgAttendance.toFixed(1)}
          </span>
          <span className="timeline-stat">
            <strong>Peak:</strong> {maxAttendance}
          </span>
        </div>
      </div>
      <div className="timeline-chart-container">
        <div className="timeline-y-axis">
          {[maxAttendance, Math.floor((maxAttendance + minAttendance) / 2), minAttendance].map((val, idx) => (
            <span key={idx} className="y-axis-label">{val}</span>
          ))}
        </div>
        <div className="timeline-line-chart">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            preserveAspectRatio="xMidYMid meet" 
            className="line-chart-svg"
          >
            {/* Grid lines */}
            <line 
              x1={padding.left} 
              y1={padding.top + chartHeight * 0.25} 
              x2={svgWidth - padding.right} 
              y2={padding.top + chartHeight * 0.25} 
              className="grid-line" 
            />
            <line 
              x1={padding.left} 
              y1={padding.top + chartHeight * 0.5} 
              x2={svgWidth - padding.right} 
              y2={padding.top + chartHeight * 0.5} 
              className="grid-line" 
            />
            <line 
              x1={padding.left} 
              y1={padding.top + chartHeight * 0.75} 
              x2={svgWidth - padding.right} 
              y2={padding.top + chartHeight * 0.75} 
              className="grid-line" 
            />
            
            {/* Area under curve */}
            <path
              d={areaPath}
              className="area-path"
            />
            
            {/* Main line */}
            <path
              d={pathData}
              className="line-path"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <g key={index} className="data-point-group">
                <title>Session {point.index}: {point.value} attendees</title>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  className="data-point-circle"
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="timeline-x-axis">
        {timeline.length <= 10 ? (
          timeline.map((_, index) => (
            <span key={index} className="x-axis-label">{index + 1}</span>
          ))
        ) : (
          // Show fewer labels for many sessions
          [0, Math.floor(timeline.length / 4), Math.floor(timeline.length / 2), 
           Math.floor(3 * timeline.length / 4), timeline.length - 1].map((index) => (
            <span key={index} className="x-axis-label" style={{ left: `${(index / (timeline.length - 1)) * 100}%` }}>
              {index + 1}
            </span>
          ))
        )}
      </div>
      <div className="timeline-footer">
        <span className="x-axis-title">Session Number</span>
      </div>
    </div>
  );
};

export default AttendanceTimeline;