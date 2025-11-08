import { useLoaderData, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "../api/sessionApi";
import type { Session } from "../types";

export default function OneSession() {
  const loaderData = useLoaderData() as Session;

  const { data: session, isLoading, isError } = useQuery<Session>({
    queryKey: ["session", loaderData.id],
    queryFn: () => getSessionById(loaderData.id),
    initialData: loaderData,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading)
    return <div className="text-center text-gray-500 italic py-10">Loading session...</div>;

  if (isError || !session)
    return (
      <div className="error text-center mx-auto max-w-md">
        Failed to load session details. Please try again.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center p-10">
          <h1 className="text-3xl font-semibold mb-2">{session.title}</h1>
          <p className="opacity-90 text-lg">Created by {session.creatorId}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Session Details */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Session Details
            </h3>
            <p className="mb-2">
                <span className="font-semibold text-indigo-700">Start:</span>{" "}
                <span className="text-gray-900">{new Date(session.start).toLocaleString()}</span>
            </p>
                <p className="mb-2">
                <span className="font-semibold text-indigo-700">Duration:</span>{" "}
                <span className="text-gray-900">{session.duration} minutes</span>
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
                <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
                >
                    Join Meeting
                </a>
                <a
                    href={session.resourcesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-sm transition"
                >
                    Resources
                </a>

            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {session.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <Link
              to={`/sessions/update/${session.id}`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5"
            >
              Edit Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};