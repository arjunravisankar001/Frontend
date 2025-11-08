import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchSessions, getSessionById } from "../api/sessionApi";
import { getByUserId } from "../api/rarfApi";
import type { Session } from "../types";
import { useEffect, useState } from "react";
import { getUsernameFromToken, isTokenExpired } from "../utils/jwtUtils";
import { queryClient } from "../queryClient";

export default function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const currentTime = new Date().toISOString();

  // Fetch sessions conducted by user (past)
  const { data: conductedPastData } = useQuery({
    queryKey: ["sessions", "conductedPast", username],
    queryFn: () =>
      searchSessions({
        creatorId: username,
        startBefore: currentTime,
        page: 0,
        size: 3,
        sortBy: "start",
        sortOrder: "desc",
      }),
    enabled: !!username,
  });

  // Fetch sessions conducted by user (upcoming)
  const { data: conductedUpcomingData } = useQuery({
    queryKey: ["sessions", "conductedUpcoming", username],
    queryFn: () =>
      searchSessions({
        creatorId: username,
        startAfter: currentTime,
        page: 0,
        size: 3,
        sortBy: "start",
        sortOrder: "asc",
      }),
    enabled: !!username,
  });

  // Fetch all sessions attended by user via RARF
  const { data: attendedRarfs } = useQuery({
    queryKey: ["rarfs", "user", username],
    queryFn: () => getByUserId(username),
    enabled: !!username,
  });

  // Get session IDs from attended RARFs
  // For past sessions: only include if feedbackFilled is true
  // For upcoming sessions: include all registered sessions
  const attendedPastSessionIds = attendedRarfs
    ?.filter((rarf) => rarf.feedbackFilled)
    .map((rarf) => rarf.sessionId) || [];
  const attendedAllSessionIds = attendedRarfs?.map((rarf) => rarf.sessionId) || [];

  // Fetch attended sessions (past)
  const { data: attendedPastData } = useQuery({
    queryKey: ["sessions", "attendedPast", username, attendedPastSessionIds],
    queryFn: async () => {
      if (attendedPastSessionIds.length === 0) return { items: [] };
      const allSessions = await Promise.all(
        attendedPastSessionIds.map((id) => getSessionById(id))
      );
      const pastSessions = allSessions
        .filter((s) => new Date(s.start) < new Date())
        .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
        .slice(0, 3);
      return { items: pastSessions };
    },
    enabled: !!username && attendedPastSessionIds.length > 0,
  });

  // Fetch attended sessions (upcoming)
  const { data: attendedUpcomingData } = useQuery({
    queryKey: ["sessions", "attendedUpcoming", username, attendedAllSessionIds],
    queryFn: async () => {
      if (attendedAllSessionIds.length === 0) return { items: [] };
      const allSessions = await Promise.all(
        attendedAllSessionIds.map((id) => getSessionById(id))
      );
      const upcomingSessions = allSessions
        .filter((s) => new Date(s.start) >= new Date())
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 3);
      return { items: upcomingSessions };
    },
    enabled: !!username && attendedAllSessionIds.length > 0,
  });

  const conductedPast = conductedPastData?.items || [];
  const conductedUpcoming = conductedUpcomingData?.items || [];
  const attendedPast = attendedPastData?.items || [];
  const attendedUpcoming = attendedUpcomingData?.items || [];

  const prefetchSession = (id: string) => {
    if (!queryClient.getQueryData(["session", id])) {
      queryClient.prefetchQuery({
        queryKey: ["session", id],
        queryFn: () => getSessionById(id),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  const renderSessionCard = (session: Session) => (
    <li
      key={session.id}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
    >
      <Link
        to={`/sessions/${session.id}/view`}
        onMouseEnter={() => prefetchSession(session.id)}
        onFocus={() => prefetchSession(session.id)}
        className="block"
      >
        <h2 className="text-xl font-semibold text-indigo-700 mb-1">
          {session.title}
        </h2>
        <p className="text-sm text-gray-600 mb-2">By: {session.creatorId}</p>
        <p className="text-sm text-gray-500 mb-3">
          Start: {new Date(session.start).toLocaleString()}
        </p>
        <div className="flex flex-wrap gap-2">
          {session.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </li>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500">
      {/* Topbar */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-indigo-600 hover:text-indigo-800 focus:outline-none"
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
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-indigo-700">
              Choroid
            </h1>
            <div className="flex gap-3">
              <Link
                to={`/users/view/${username}`}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition"
              >
                Profile
              </Link>
              <Link
                to="/change-password"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700">
              <h2 className="text-white text-2xl font-bold">Navigation</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <Link
                to="/sessions"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 font-medium transition"
              >
                All Sessions
              </Link>
              <Link
                to="/sessions/create"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 font-medium transition"
              >
                Create New Session
              </Link>
              <Link
                to="/sessions/search"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 font-medium transition"
              >
                Search Sessions
              </Link>
              <Link
                to="/users/search"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 font-medium transition"
              >
                Search Users
              </Link>
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center py-8 px-6">
                <h1 className="text-4xl font-bold mb-2">
                  Choroid - The learning platform for your everyday needs
                </h1>
                <p className="opacity-90 text-lg">Welcome back, {username}!</p>
              </div>
            </div>

            {/* Four Columns of Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Column 1: Past Conducted Sessions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">
                  Recent Sessions Conducted
                </h2>
                {conductedPast.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-4">
                    No past sessions
                  </p>
                ) : (
                  <ul className="space-y-4">{conductedPast.map(renderSessionCard)}</ul>
                )}
              </div>

              {/* Column 2: Past Attended Sessions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-purple-700 mb-4 border-b pb-2">
                  Recent Sessions Attended
                </h2>
                {attendedPast.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-4">
                    No past sessions
                  </p>
                ) : (
                  <ul className="space-y-4">{attendedPast.map(renderSessionCard)}</ul>
                )}
              </div>

              {/* Column 3: Upcoming Conducted Sessions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b pb-2">
                  Upcoming Sessions to Conduct
                </h2>
                {conductedUpcoming.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-4">
                    No upcoming sessions
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {conductedUpcoming.map(renderSessionCard)}
                  </ul>
                )}
              </div>

              {/* Column 4: Upcoming Attended Sessions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-pink-700 mb-4 border-b pb-2">
                  Upcoming Sessions to Attend
                </h2>
                {attendedUpcoming.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-4">
                    No upcoming sessions
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {attendedUpcoming.map(renderSessionCard)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}