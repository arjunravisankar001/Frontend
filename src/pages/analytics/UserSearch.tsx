import React, { useState } from 'react';
import './UserSearch.css';

interface UserSearchProps {
  onSearch: (username: string) => void;
  loading: boolean;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSearch, loading }) => {
  const [username, setUsername] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <div className="user-search">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username..."
          className="search-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="search-button" 
          disabled={loading || !username.trim()}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default UserSearch;