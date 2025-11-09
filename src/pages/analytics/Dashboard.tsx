import { useState, useEffect, useRef } from 'react';
import { getTop3Instructors, getAllAnalytics } from '../../api/analyticsApi';
import StatCard from './StatCard';
import UserSearch from './UserSearch';
import TopInstructors from './TopInstructors';
import RatingHistogram from './RatingHistogram';
import AttendanceTimeline from './AttendanceTimeline';
import './Dashboard.css';
import Layout from '../../components/Layout';

interface Analytics {
  avgRating: number | null;
  attendedCount: number | null;
  conductedCount: number | null;
  avgAttendance: number | null;
  bestRatedSession: string | null;
  bestAttendedSession: string | null;
  uniqueLearners: number | null;
  repeatLearners: number | null;
}

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [topInstructors, setTopInstructors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [topLoading, setTopLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const hasLoadedTopInstructors = useRef<boolean>(false);

  useEffect(() => {
    // Prevent double-loading
    if (hasLoadedTopInstructors.current) return;
    hasLoadedTopInstructors.current = true;

    loadTopInstructors();
  }, []);

  const loadTopInstructors = async (): Promise<void> => {
    setTopLoading(true);
    try {
      const instructors = await getTop3Instructors();
      setTopInstructors(instructors);
    } catch (err) {
      console.error('Error loading top instructors:', err);
      setError('Failed to load top instructors');
    } finally {
      setTopLoading(false);
    }
  };

  const handleSearch = async (username: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setCurrentUser(username);
    
    try {
      const data = await getAllAnalytics(username);
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics. Please check the username and try again.');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Choroid Analytics Dashboard</h1>
        <p>View comprehensive statistics for instructors and learners</p>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <TopInstructors 
            instructors={topInstructors} 
            loading={topLoading}
            onSelectInstructor={handleSearch}
          />
        </div>

        <div className="main-content">
          <UserSearch onSearch={handleSearch} loading={loading} />

          {error && (
            <div className="error-message">{error}</div>
          )}

          {currentUser && (
            <div className="current-user">
              <h2>Analytics for: <span className="username">{currentUser}</span></h2>
            </div>
          )}

          {analytics && (
            <>
              <section className="stats-section">
                <h3 className="section-subtitle">📈 Instructor Performance</h3>
                <div className="stats-grid">
                  <StatCard
                    title="Average Rating"
                    value={analytics.avgRating}
                    icon="⭐"
                    type="rating"
                    loading={loading}
                  />
                  <StatCard
                    title="Sessions Conducted"
                    value={analytics.conductedCount}
                    icon="🎓"
                    type="number"
                    loading={loading}
                  />
                  <StatCard
                    title="Average Attendance"
                    value={analytics.avgAttendance}
                    icon="👥"
                    type="decimal"
                    loading={loading}
                  />
                  <StatCard
                    title="Unique Learners"
                    value={analytics.uniqueLearners}
                    icon="👤"
                    type="number"
                    loading={loading}
                  />
                </div>
              </section>

              <section className="stats-section">
                <h3 className="section-subtitle">🎯 Engagement Metrics</h3>
                <div className="stats-grid">
                  <StatCard
                    title="Sessions Attended"
                    value={analytics.attendedCount}
                    icon="📚"
                    type="number"
                    loading={loading}
                  />
                  <StatCard
                    title="Repeat Learners"
                    value={analytics.repeatLearners}
                    icon="🔄"
                    type="number"
                    loading={loading}
                  />
                  <StatCard
                    title="Best Rated Session"
                    value={analytics.bestRatedSession}
                    icon="🏅"
                    type="session"
                    loading={loading}
                  />
                  <StatCard
                    title="Best Attended Session"
                    value={analytics.bestAttendedSession}
                    icon="🎪"
                    type="session"
                    loading={loading}
                  />
                </div>
              </section>

              <section className="charts-section">
                <h3 className="section-subtitle">📊 Visual Analytics</h3>
                <RatingHistogram username={currentUser} />
                <AttendanceTimeline username={currentUser} />
              </section>
            </>
          )}

          {!analytics && !loading && !error && (
            <div className="welcome-message">
              <h2>👋 Welcome!</h2>
              <p>Enter a username above to view their analytics, or click on a top instructor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Dashboard;
