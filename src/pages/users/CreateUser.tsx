import React, { useState, useEffect } from 'react';
import { createProfile } from '../../api/userApi';
import type { User } from '../../types';

interface TagInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, onTagsChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onTagsChange([...tags, trimmed]);
        setInputValue('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="tag-input-container">
        <div className="tag-display">
          {tags.map((tag, index) => (
            <div key={index} className="tag">
              {tag}
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeTag(tag)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={inputValue}
          onKeyPress={handleKeyPress}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
    </div>
  );
};

const CreateUser: React.FC = () => {
  const [username, setUsername] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    emailId: '',
    resumeLink: '',
  });
  const [skillTagList, setSkillTagList] = useState<string[]>([]);
  const [qualificationList, setQualificationList] = useState<string[]>([]);
  const [teachList, setTeachList] = useState<string[]>([]);
  const [learnList, setLearnList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('No authentication token found. Please login.');
      window.location.href = '/login';
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const extractedUsername = payload.username || payload.sub || '';
      setUsername(extractedUsername);
    } catch (err) {
      console.error('Error decoding JWT token:', err);
      alert('Invalid session. Please login again.');
      window.location.href = '/login';
    }
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.emailId.trim()) {
      setError('Please fill in all required fields (Name and Email).');
      return;
    }

    const newUser: User = {
      name: formData.name,
      username: username,
      emailId: formData.emailId,
      skillTagList,
      qualificationList,
      resumeLink: formData.resumeLink,
      teachList,
      learnList,
      selfAccess: true,
    };

    setLoading(true);

    try {
      const createdUser = await createProfile(newUser);
      setSuccess('Profile created successfully!');
      setTimeout(() => {
        window.location.href = `/users/view/${createdUser.username}`;
      }, 2000);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create profile. Please check your input and try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2>Create User Profile</h2>
          <p>Add Professional Information</p>
        </div>
        <div className="profile-content">
          <div className="loading">Creating profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Create User Profile</h2>
        <p>Add Professional Information</p>
      </div>

      <div className="profile-content">
        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success">
            {success}
            <a
              href={`/users/view/${username}`}
              style={{ color: '#065f46', textDecoration: 'underline', marginLeft: '8px' }}
            >
              View Profile
            </a>
          </div>
        )}

        <div id="createForm">
          <div className="profile-section">
            <h3 className="section-title">Basic Information</h3>

            <div className="form-field">
              <label htmlFor="name" className="form-label">Name *</label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-input"
                value={username}
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="emailId" className="form-label">Email *</label>
              <input
                type="email"
                id="emailId"
                className="form-input"
                placeholder="Enter email"
                value={formData.emailId}
                onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title">Skills & Qualifications</h3>
            <TagInput
              label="Skills"
              tags={skillTagList}
              onTagsChange={setSkillTagList}
              placeholder="Type and press Enter to add skills"
            />
            <TagInput
              label="Qualifications"
              tags={qualificationList}
              onTagsChange={setQualificationList}
              placeholder="Type and press Enter to add qualifications"
            />
            <div className="form-field">
              <label htmlFor="resumeLink" className="form-label">Resume Link</label>
              <input
                type="url"
                id="resumeLink"
                className="form-input"
                placeholder="Enter resume link"
                value={formData.resumeLink}
                onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
              />
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title">Learning & Teaching</h3>
            <TagInput
              label="Topics to Teach"
              tags={teachList}
              onTagsChange={setTeachList}
              placeholder="Type and press Enter to add topics to teach"
            />
            <TagInput
              label="Topics to Learn"
              tags={learnList}
              onTagsChange={setLearnList}
              placeholder="Type and press Enter to add topics to learn"
            />
          </div>

          <div className="button-group">
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              Create Profile
            </button>
            <a href="/" className="btn btn-secondary">
              Cancel
            </a>
          </div>
        </div>
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

        .form-field {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid #4f46e5;
          transition: all 0.3s ease;
        }

        .form-field:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .form-label {
          font-weight: 600;
          color: #4f46e5;
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          background: white;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .tag-input-container {
          position: relative;
        }

        .tag-display {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
          min-height: 40px;
          padding: 8px;
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          background: white;
        }

        .tag {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tag-remove {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
        }

        .tag-remove:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .button-group {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 32px;
          padding-top: 32px;
          border-top: 2px solid #e5e7eb;
        }

        .btn {
          padding: 12px 32px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
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
          margin: 20px 0;
        }

        .success {
          background: #d1fae5;
          color: #065f46;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
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

          .button-group {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateUser;