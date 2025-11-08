import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { displayUser } from '../../api/userApi';
import type { User } from '../../types';

interface ProfileFieldProps {
  label: string;
  value?: string | string[];
  isArray?: boolean;
  isLink?: boolean;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, isArray = false, isLink = false }) => {
  return (
    <div className="profile-field">
      <span className="profile-label">{label}</span>
      <div className="profile-value">
        {isArray && Array.isArray(value) && value.length > 0 ? (
          <div className="tag-list">
            {value.map((item, index) => (
              <span key={index} className="tag">{item}</span>
            ))}
          </div>
        ) : isLink && value ? (
          <a href={value as string} target="_blank" rel="noopener noreferrer" className="resume-link">
            View Resume
          </a>
        ) : (
          <>{value || 'Not specified'}</>
        )}
      </div>
    </div>
  );
};

const ViewUser: React.FC = () => {
  const { queryUsername } = useParams<{ queryUsername: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [accessorUsername, setAccessorUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('No authentication token found. Please login.');
      window.location.href = '/login';
      return;
    }

    let username = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.username || payload.sub || '';
      setAccessorUsername(username);
    } catch (err) {
      console.error('Error decoding JWT token:', err);
      alert('Invalid session. Please login again.');
      window.location.href = '/login';
      return;
    }

    if (queryUsername) {
      loadUserProfile(username, queryUsername);
    }
  }, [queryUsername]);

  const loadUserProfile = async (accessor: string, query: string) => {
    try {
      const userData = await displayUser(accessor, query);
      setUser(userData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load profile information. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2>User Profile</h2>
          <p>Professional Information</p>
        </div>
        <div className="profile-content">
          <div className="loading">Loading profile information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2>User Profile</h2>
          <p>Professional Information</p>
        </div>
        <div className="profile-content">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isOwnProfile = accessorUsername === queryUsername;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>User Profile</h2>
        <p>Professional Information</p>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3 className="section-title">Basic Information</h3>
          <ProfileField label="Name" value={user.name} />
          <ProfileField label="Username" value={user.username} />
          <ProfileField label="Email" value={user.emailId} />
        </div>

        <div className="profile-section">
          <h3 className="section-title">Skills & Qualifications</h3>
          <ProfileField label="Skills" value={user.skillTagList} isArray />
          <ProfileField label="Qualifications" value={user.qualificationList} isArray />
          <ProfileField label="Resume" value={user.resumeLink} isLink />
        </div>

        <div className="profile-section">
          <h3 className="section-title">Learning & Teaching</h3>
          <ProfileField label="Topics to Teach" value={user.teachList} isArray />
          <ProfileField label="Topics to Learn" value={user.learnList} isArray />
        </div>

        {isOwnProfile && (
          <>
            <a href="/users/edit" className="edit-button">
              Edit Profile
            </a>
            <a href="/update-password.html" className="edit-button" style={{ marginLeft: '16px' }}>
              Update Password
            </a>
          </>
        )}
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .profile-container {
          max-width: 700px;
          margin: 40px auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .profile-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 32px;
          text-align: center;
        }

        .profile-header h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .profile-header p {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .profile-content {
          padding: 32px;
        }

        .profile-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .profile-field {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid #4f46e5;
          transition: all 0.3s ease;
        }

        .profile-field:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .profile-label {
          font-weight: 600;
          color: #4f46e5;
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-value {
          color: #374151;
          font-size: 1rem;
          line-height: 1.5;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .tag {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .resume-link {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
          padding: 8px 16px;
          border: 2px solid #4f46e5;
          border-radius: 8px;
          display: inline-block;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .resume-link:hover {
          background: #4f46e5;
          color: white;
          transform: translateY(-2px);
        }

        .edit-button {
          display: inline-block;
          margin-top: 16px;
          padding: 12px 28px;
          background: #10b981;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .edit-button:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .loading {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 20px;
        }

        .error {
          background: #fee2e2;
          color: #991b1b;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
          margin: 20px;
        }

        @media (max-width: 768px) {
          .profile-container {
            margin: 20px auto;
          }

          .profile-header,
          .profile-content {
            padding: 20px;
          }

          .profile-header h2 {
            font-size: 1.5rem;
          }

          .tag-list {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewUser;