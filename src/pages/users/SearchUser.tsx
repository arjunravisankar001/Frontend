import React, { useState, useEffect } from 'react';
import { searchUser, getTeachList, getLearnList } from '../../api/userApi';
import type { User, SearchQueryUser } from '../../types';
import Layout from '../../components/Layout';
import { getUsernameFromToken } from '../../utils/jwtUtils';

interface UserCardProps {
  user: User;
  onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div className="user-card" onClick={onClick}>
      <div className="user-name">{user.name || 'Anonymous User'}</div>

      {user.teachList && user.teachList.length > 0 && (
        <div className="user-section">
          <div className="section-label">Can Teach:</div>
          <div className="tag-list">
            {user.teachList.map((topic, index) => (
              <span key={index} className="tag">{topic}</span>
            ))}
          </div>
        </div>
      )}

      {user.learnList && user.learnList.length > 0 && (
        <div className="user-section">
          <div className="section-label">Wants to Learn:</div>
          <div className="tag-list">
            {user.learnList.map((topic, index) => (
              <span key={index} className="tag">{topic}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchUser: React.FC = () => {
  const [nameInput, setNameInput] = useState('');
  const [selectedTeachTopics, setSelectedTeachTopics] = useState<string[]>([]);
  const [selectedLearnTopics, setSelectedLearnTopics] = useState<string[]>([]);
  const [teachTopics, setTeachTopics] = useState<string[]>([]);
  const [learnTopics, setLearnTopics] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadTopicOptions();
  }, []);

  const loadTopicOptions = async () => {
    try {
      const [teachList, learnList] = await Promise.all([
        getTeachList(),
        getLearnList()
      ]);
      setTeachTopics(teachList);
      setLearnTopics(learnList);
    } catch (err) {
      console.error('Error loading topics:', err);
    }
  };

  const handleTeachTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTeachTopics(selected);
  };

  const handleLearnTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedLearnTopics(selected);
  };

  const handleSearch = async () => {
    setError(null);

    if (!nameInput.trim() && selectedTeachTopics.length === 0 && selectedLearnTopics.length === 0) {
      alert('Please provide at least one search criteria');
      return;
    }

    const accessorUsername = getUsernameFromToken();
    if (!accessorUsername) {
      alert('Could not get username. Please login again.');
      window.location.href = '/login';
      return;
    }

    const searchQuery: Partial<SearchQueryUser> = {};
    
    if (nameInput.trim()) {
      searchQuery.nameSubstring = nameInput.trim();
    }
    if (selectedTeachTopics.length > 0) {
      searchQuery.teachList = selectedTeachTopics;
    }
    if (selectedLearnTopics.length > 0) {
      searchQuery.learnList = selectedLearnTopics;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const users = await searchUser(accessorUsername, searchQuery as SearchQueryUser);
      setSearchResults(users);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username: string) => {
    window.location.href = `/users/view/${username}`;
  };

  return (
    <Layout>
    <div className="search-container">
      <div className="search-header">
        <h2>Search Users</h2>
        <p>Find users by their skills and interests</p>
      </div>

      <div className="search-form">
        <div className="search-field">
          <label className="search-label">Name</label>
          <input
            type="text"
            id="nameInput"
            className="search-input"
            placeholder="Enter name (partial match allowed)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label className="search-label">Topics to Teach</label>
          <select
            id="teachTopicsSelect"
            className="search-input"
            multiple
            value={selectedTeachTopics}
            onChange={handleTeachTopicChange}
          >
            {teachTopics.length === 0 && (
              <option value="" disabled>Loading topics...</option>
            )}
            {teachTopics.map((topic, index) => (
              <option key={index} value={topic}>{topic}</option>
            ))}
          </select>
          <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
            Hold Ctrl/Cmd to select multiple
          </small>
        </div>

        <div className="search-field">
          <label className="search-label">Topics to Learn</label>
          <select
            id="learnTopicsSelect"
            className="search-input"
            multiple
            value={selectedLearnTopics}
            onChange={handleLearnTopicChange}
          >
            {learnTopics.length === 0 && (
              <option value="" disabled>Loading topics...</option>
            )}
            {learnTopics.map((topic, index) => (
              <option key={index} value={topic}>{topic}</option>
            ))}
          </select>
          <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
            Hold Ctrl/Cmd to select multiple
          </small>
        </div>

        <button
          type="button"
          className="search-button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Users'}
        </button>
      </div>

      {showResults && (
        <div className="results-container">
          <div className="results-header">
            {loading ? 'Searching...' : 
             searchResults === null ? 'Search Results' :
             searchResults.length === 0 ? 'No Results Found' :
             `Found ${searchResults.length} user${searchResults.length === 1 ? '' : 's'}`}
          </div>
          <div id="resultsContent">
            {loading && <div className="loading">Searching for users...</div>}
            {error && <div className="error">{error}</div>}
            {!loading && searchResults !== null && searchResults.length === 0 && (
              <div className="no-results">
                No users found matching your search criteria. Try different keywords.
              </div>
            )}
            {!loading && searchResults && searchResults.length > 0 && (
              <>
                {searchResults.map((user, index) => (
                  <UserCard
                    key={index}
                    user={user}
                    onClick={() => handleUserClick(user.username)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .search-container {
          max-width: 800px;
          margin: 40px auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .search-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 32px;
          text-align: center;
        }

        .search-header h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .search-header p {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .search-form {
          padding: 32px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        .search-field {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid #4f46e5;
          transition: all 0.3s ease;
        }

        .search-field:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .search-label {
          font-weight: 600;
          color: #4f46e5;
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          background: white;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-input[multiple] {
          min-height: 120px;
          padding: 8px;
        }

        .search-input option {
          padding: 8px 12px;
          margin: 2px 0;
        }

        .search-input option:checked {
          background: #4f46e5;
          color: white;
        }

        .search-button {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .search-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
        }

        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .results-container {
          padding: 32px;
        }

        .results-header {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 24px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .user-card {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid #4f46e5;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .user-card:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .user-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .user-section {
          margin-bottom: 12px;
        }

        .section-label {
          font-weight: 600;
          color: #4f46e5;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .no-results {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 40px 20px;
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
          margin: 20px 0;
        }

        @media (max-width: 768px) {
          .search-container {
            margin: 20px auto;
          }

          .search-header,
          .search-form,
          .results-container {
            padding: 20px;
          }

          .search-header h2 {
            font-size: 1.5rem;
          }

          .tag-list {
            justify-content: center;
          }
        }
      `}</style>
    </div>
    </Layout>
  );
};

export default SearchUser;