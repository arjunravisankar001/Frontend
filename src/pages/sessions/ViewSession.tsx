import { useNavigate, useLoaderData, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "../../api/sessionApi";
import {
  getStatsBySessionId,
  register,
  deleteRarf,
  getBySessionIdAndUserId,
} from "../../api/rarfApi";
import type { Session, Stats } from "../../types";
import { isTokenExpired, getUsernameFromToken } from "../../utils/jwtUtils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import { useState, useEffect } from "react";

export default function ViewSession() {
  const loaderData = useLoaderData() as Session;
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [canFillFeedback, setCanFillFeedback] = useState(false);

  const [userId, setUserId] = useState<string>('');
  const navigate = useNavigate();

    useEffect(() => {
      // Retrieve username from JWT when component mounts
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
  
      setUserId(name);
    }, [navigate]);
//   const userId = "arjun"; // TODO: integrate Users later

  // Fetch session info
  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useQuery<Session>({
    queryKey: ["session", loaderData.id],
    queryFn: () => getSessionById(loaderData.id),
    initialData: loaderData,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch session stats
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useQuery<Stats>({
    queryKey: ["stats", loaderData.id],
    queryFn: () => getStatsBySessionId(loaderData.id),
  });

  // Auto-check registration status
    useEffect(() => {
    const checkRegistrationAndFeedback = async () => {
        if (!session) return;

        try {
        // Check registration
        await getBySessionIdAndUserId(session.id, userId);
        setIsRegistered(true);
        console.log("User is registered for this session.");

        // Check if feedback can be filled
        const feedback = await getBySessionIdAndUserId(session.id, userId);
        const feedbackFilled = feedback.feedbackFilled;

        // canFillFeedback is true only if session is over and feedback is not yet filled
        const sessionEnded = new Date(session.start).getTime() + session.duration * 60000 < new Date().getTime();
        setCanFillFeedback(sessionEnded && !feedbackFilled);

        } catch (err: any) {
        if (err?.status === 404) {
            console.error("User is not registered for this session.");
            setIsRegistered(false);
            setCanFillFeedback(false);
        } else {
            console.error("Error checking registration/feedback:", err);
        }
        }
    };

    checkRegistrationAndFeedback();
    }, [session]);


  // Determine if session has already started
  const sessionStarted =
    session && new Date(session.start).getTime() <= new Date().getTime();

  // Handle registration logic
  const handleRegister = async () => {
    if (!session) return;
    setIsRegistering(true);
    try {
      await register({ sessionId: session.id, userId: userId });
      alert("Successfully registered for this session!");
      setIsRegistered(true);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (
        err?.response?.data?.message?.includes("Duplicate registration detected") ||
        err?.details?.includes("Duplicate registration detected")
      ) {
        alert("You are already registered for this session.");
        setIsRegistered(true);
      } else {
        alert("Registration failed.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle deregistration
  const handleDeregister = async () => {
    if (!session) return;
    setIsRegistering(true);
    try {
      await deleteRarf(session.id, userId);
      alert("You have been deregistered from this session.");
      setIsRegistered(false);
    } catch (err) {
      console.error("Failed to deregister:", err);
      alert("Deregistration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  const chartData =
    stats
      ? Object.entries(stats)
          .filter(([key]) => key !== "sessionId")
          .map(([key, value]: [string, any]) => ({
            metric: key.replace("Score", "").replace(/([A-Z])/g, " $1"),
            avg: value.avg,
            min: value.min,
            max: value.max,
            median: value.median,
            mode: value.mode,
          }))
      : [];

  if (isSessionLoading)
    return (
      <div className="text-center text-gray-500 italic py-10">
        Loading session...
      </div>
    );

  if (isSessionError || !session)
    return (
      <div className="error text-center mx-auto max-w-md">
        Failed to load session details. Please try again.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center p-10">
          <h1 className="text-3xl font-semibold mb-2">{session.title}</h1>
          <p className="opacity-90 text-lg">By {session.creatorId}</p>
        </div>

        <div className="p-8 space-y-10">
          {/* Session Details */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Session Details
            </h3>
            <p className="mb-2">
              <span className="font-semibold text-indigo-700">Start:</span>{" "}
              <span className="text-gray-900">
                {new Date(session.start).toLocaleString()}
              </span>
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
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Tags
            </h3>
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

          {/* Stats Section */}
          {/* (Your existing charts remain here, unchanged) */}
           <div>
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                Session Feedback Statistics
            </h3>

            {isStatsLoading ? (
                <div className="text-center text-gray-500 italic py-6">Loading stats...</div>
            ) : isStatsError || !stats ? (
                <div className="text-center text-gray-900 italic py-6">
                No statistics available.
                </div>
            ) : (
                <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200 shadow-inner space-y-10">

                {/* --- BAR CHARTS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* First Bar Chart */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 text-center">
                        Delivery & Engagement Metrics
                    </h4>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                        data={chartData.slice(0, Math.ceil(chartData.length / 2))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="metric"
                            tick={{ fill: "#374151", fontSize: 12 }}
                            angle={-17}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis domain={[0, 5]} tick={{ fill: "#374151" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avg" fill="#6366F1" name="Average" />
                        <Bar dataKey="min" fill="#A5B4FC" name="Min" />
                        <Bar dataKey="max" fill="#4C1D95" name="Max" />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>

                    {/* Second Bar Chart */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 text-center">
                        Organization & Relevance Metrics
                    </h4>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                        data={chartData.slice(Math.ceil(chartData.length / 2))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="metric"
                            tick={{ fill: "#374151", fontSize: 12 }}
                            angle={-17}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis domain={[0, 5]} tick={{ fill: "#374151" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avg" fill="#6366F1" name="Average" />
                        <Bar dataKey="min" fill="#A5B4FC" name="Min" />
                        <Bar dataKey="max" fill="#4C1D95" name="Max" />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                {/* --- PIE & RADAR CHARTS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Median Pie Chart */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100 flex flex-col items-center">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 text-center">
                        Median Scores Overview
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                        <Pie
                            data={Object.entries(stats)
                            .filter(([key]) => key !== "sessionId")
                            .map(([key, value]: [string, any]) => ({
                                name: key.replace("Score", "").replace(/([A-Z])/g, " $1"),
                                value: value.median,
                            }))}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            fill="#6366F1"
                            label
                        />
                        <Tooltip formatter={(value) => `${(value as number).toFixed(2)} / 5`} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>

                    {/* Mode Pie Chart */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100 flex flex-col items-center">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 text-center">
                        Most Frequent (Mode) Scores
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                        <Pie
                            data={Object.entries(stats)
                            .filter(([key]) => key !== "sessionId")
                            .map(([key, value]: [string, any]) => ({
                                name: key.replace("Score", "").replace(/([A-Z])/g, " $1"),
                                value: value.mode,
                            }))}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            fill="#8B5CF6"
                            label
                        />
                        <Tooltip formatter={(value) => `${(value as number).toFixed(2)} / 5`} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>

                    {/* Radar Chart for Overall Balance */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100 flex flex-col items-center">
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 text-center">
                        Balance Across Metrics (Average)
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart outerRadius={100} data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar
                            name="Average"
                            dataKey="avg"
                            stroke="#6366F1"
                            fill="#6366F1"
                            fillOpacity={0.5}
                        />
                        <Tooltip formatter={(value) => `${(value as number).toFixed(2)} / 5`} />
                        </RadarChart>
                    </ResponsiveContainer>
                    </div>
                </div>
                </div>
            )}
            </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            {/* Only show Register/Deregister if session hasn't started */}
            {!sessionStarted &&
            session.creatorId !== userId &&
             (
              <button
                onClick={isRegistered ? handleDeregister : handleRegister}
                disabled={isRegistering}
                className={`font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5 ${
                  isRegistering
                    ? "bg-gray-400 text-white"
                    : isRegistered
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isRegistering
                  ? isRegistered
                    ? "Deregistering..."
                    : "Registering..."
                  : isRegistered
                  ? "Deregister"
                  : "Register"}
              </button>
            )}

            {/* Only show Edit if current user is creator */}
            {session.creatorId === userId && (
              <Link
                to={`/sessions/update/${session.id}`}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5"
              >
                Edit Session
              </Link>
            )}
            {/* View Reviews Button (always visible) */}
            <Link
                to={`/feedback/${session.id}/view`}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5"
            >
                View Reviews
            </Link>

            {/* Fill Feedback Button (only if eligible) */}
            {isRegistered && canFillFeedback && (
                <Link
                to={`/feedback/${session.id}/fill`}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5"
                >
                Fill Feedback
                </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};