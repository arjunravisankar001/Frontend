import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllSessions, getSessionById } from "../api/sessionApi";
import type { Session } from "../types";
import { queryClient } from "../queryClient";
import Layout from "../components/Layout";

export default function AllSessions() {
  const { data: sessions = [], isLoading, isError } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: () => getAllSessions(),
  });

  const prefetchSession = (id: string) => {
    if (!queryClient.getQueryData(["session", id])) {
      const sessionFromList = sessions.find((s) => s.id === id);
      if (sessionFromList) {
        queryClient.setQueryData(["session", id], sessionFromList);
      } else {
        queryClient.prefetchQuery({
          queryKey: ["session", id],
          queryFn: () => getSessionById(id),
          staleTime: 1000 * 60 * 5,
        });
      }
    }
  };

  if (isLoading)
    return (
      <Layout>
        <div className="text-center text-gray-500 italic py-10">Loading sessions...</div>
      </Layout>
    );

  if (isError)
    return (
      <Layout>
        <div className="error text-center mx-auto max-w-md">
          Failed to load sessions. Please try again.
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center py-8 px-6">
          <h1 className="text-3xl font-semibold mb-2">All Sessions</h1>
          <p className="opacity-90 text-lg">Browse all scheduled sessions below</p>
        </div>

        <div className="p-6 md:p-10">
            <div className="flex justify-end mb-6 gap-3">
                {/* Create Session Button */}
                <Link
                    to="/sessions/create"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Create Session
                </Link>

                {/* Search Session Button */}
                <Link
                    to="/sessions/search"
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                    {/* Magnifying glass SVG */}
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                    />
                    </svg>
                    Search Sessions
                </Link>
            </div>

          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 italic">No sessions found.</div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <Link
                    to={`/sessions/${s.id}/view`}
                    onMouseEnter={() => prefetchSession(s.id)}
                    onFocus={() => prefetchSession(s.id)}
                    className="block"
                  >
                    <h2 className="text-xl font-semibold text-indigo-700 mb-1">{s.title}</h2>
                    <p className="text-sm text-gray-600 mb-2">By: {s.creatorId}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      Start: {new Date(s.start).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map((tag) => (
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
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};
