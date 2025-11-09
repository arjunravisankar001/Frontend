import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUsernameFromToken, isTokenExpired } from "../utils/jwtUtils";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isTokenExpired()) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const name = getUsernameFromToken();
    if (!name) {
      alert("Could not retrieve username from token. Please log in again.");
      navigate("/login");
      return;
    }

    setUsername(name);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');
    alert('You have been signed out successfully.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500">
      {/* Topbar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 w-full">
            {/* Left: Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              aria-label="Toggle sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {sidebarOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Center: Logo/Title */}
            <Link
              to="/"
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                <svg className="relative h-8 w-8 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Choroid
              </span>
            </Link>

            {/* Right: User Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 mr-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-200 font-medium text-sm">
                  {username}
                </span>
              </div>
              <Link
                to={`/users/view/${username}`}
                className="px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-sm transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out mt-16 border-r border-gray-800`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">Navigation</h2>
              <p className="text-xs text-gray-400 mt-1">Quick access to all features</p>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {/* Home */}
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white font-medium transition-all group"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              
              {/* Sessions Section */}
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Sessions</div>
              </div>
              <Link
                to="/sessions"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white font-medium transition-all group"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                All Sessions
              </Link>
              <Link
                to="/sessions/create"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white font-medium transition-all group"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Session
              </Link>
              <Link
                to="/sessions/search"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white font-medium transition-all group"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Sessions
              </Link>
              
              {/* Users Section */}
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Users</div>
              </div>
              <Link
                to="/users/search"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white font-medium transition-all group"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Search Users
              </Link>
              
              {/* Other Section */}
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Other</div>
              </div>
              <Link
                to="/analytics"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white font-medium transition-all group"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </Link>
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 mt-16"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6 lg:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
