import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchSessions, getSessionById } from "../api/sessionApi";
import { getByUserId } from "../api/rarfApi";
import type { Session } from "../types";
import { useEffect, useState } from "react";
import { getUsernameFromToken, isTokenExpired } from "../utils/jwtUtils";
import { queryClient } from "../queryClient";
import Layout from "../components/Layout";

export default function HomePage() {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const name = getUsernameFromToken();
    if (name) {
      setUsername(name);
    }
  }, []);

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
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header with Quick Stats */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-10 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-3 tracking-tight">
                Welcome back, {username}!
              </h1>
              <p className="opacity-90 text-xl mb-6">
                Your learning journey continues
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{conductedPast.length}</div>
                  <div className="text-sm opacity-90">Sessions Taught</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{attendedPast.length}</div>
                  <div className="text-sm opacity-90">Sessions Attended</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{conductedUpcoming.length}</div>
                  <div className="text-sm opacity-90">Upcoming to Teach</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{attendedUpcoming.length}</div>
                  <div className="text-sm opacity-90">Upcoming to Attend</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/sessions/create"
              className="flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-6 rounded-xl shadow-md transition transform hover:-translate-y-1"
            >
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <div className="font-bold text-lg">Create Session</div>
                <div className="text-sm opacity-90">Start teaching</div>
              </div>
            </Link>
            <Link
              to="/sessions/search"
              className="flex items-center gap-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-6 rounded-xl shadow-md transition transform hover:-translate-y-1"
            >
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <div className="font-bold text-lg">Find Sessions</div>
                <div className="text-sm opacity-90">Discover and learn</div>
              </div>
            </Link>
            <Link
              to="/users/search"
              className="flex items-center gap-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-6 rounded-xl shadow-md transition transform hover:-translate-y-1"
            >
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div className="font-bold text-lg">Connect</div>
                <div className="text-sm opacity-90">Find mentors</div>
              </div>
            </Link>
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
    </Layout>
  );
}
